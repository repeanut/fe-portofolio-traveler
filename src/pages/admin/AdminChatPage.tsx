import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Send } from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import type { AdminSidebarItemKey } from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import ChatMessage from "../../components/AIchatbot/ChatMessage";

interface MessagePreview {
  id: number;
  name: string;
  lastMessage: string;
  avatarUrl?: string;
  isActive?: boolean;
}

interface ChatThreadMessage {
  id: number;
  role: "user" | "admin";
  content: string;
  timestamp?: string;
}

type MessagesByUserId = Record<number, ChatThreadMessage[]>;

const AdminChatPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("chat");
  const [activeUser, setActiveUser] = useState<number | null>(null);
  const [messagesByUser, setMessagesByUser] = useState<MessagesByUserId>({});
  const [newMessage, setNewMessage] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  type NotificationPermission = 'default' | 'granted' | 'denied' | 'unsupported';

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState<any>(null);

  const navigate = useNavigate();

  // Convert users to message preview format
  const userMessages: MessagePreview[] = users.map((user) => ({
    id: user.id,
    name: user.name || user.displayName || `User ${user.id}`,
    lastMessage: messagesByUser[user.id]?.length > 0
      ? messagesByUser[user.id][messagesByUser[user.id].length - 1].content
      : "No messages yet",
    avatarUrl: user.avatarUrl || user.profilePicture,
    isActive: user.isActive !== false,
  }));

  // Add temporary users from messages that aren't in the main users list
  const messageUserIds = Object.keys(messagesByUser).filter(id => !users.some(u => u.id === parseInt(id)));
  const tempUsers: MessagePreview[] = messageUserIds.map(userId => ({
    id: parseInt(userId),
    name: `Guest User ${userId}`,
    lastMessage: messagesByUser[parseInt(userId)]?.length > 0
      ? messagesByUser[parseInt(userId)][messagesByUser[parseInt(userId)].length - 1].content
      : "No messages yet",
    avatarUrl: undefined,
    isActive: true,
  }));

  // Combine real users and temporary users
  const allUserMessages = [...userMessages, ...tempUsers];

  const activeUserData = allUserMessages.find((u) => u.id === activeUser);
  const currentThread = activeUser ? (messagesByUser[activeUser] ?? []) : [];

  // Fetch active chat sessions from API
  useEffect(() => {
    const fetchChatSessions = async () => {
      try {
        const response = await fetch('/api/admin/chat-sessions');
        const data = await response.json();
        
        if (data.success) {
          // Convert chat sessions to user format
          const chatUsers = data.data.chats.map((chat: any) => ({
            id: parseInt(chat.sessionId.replace('CHAT', '').replace(/[^0-9]/g, '')) || Date.now(),
            name: chat.userName || chat.userInfo?.name || `User ${chat.sessionId}`,
            email: chat.userEmail || chat.userInfo?.email || '',
            displayName: chat.userName || chat.userInfo?.name || `User ${chat.sessionId}`,
            avatarUrl: chat.userInfo?.avatarUrl || chat.userInfo?.profilePicture,
            isActive: chat.status === 'active',
            sessionId: chat.sessionId,
            lastMessage: chat.lastMessage,
            unreadCount: chat.unreadCount_admin || 0,
            status: chat.status,
            priority: chat.priority,
            assignedAdmin: chat.assignedAdmin,
            createdAt: chat.createdAt,
            lastActivityAt: chat.lastActivityAt
          }));
          
          setUsers(chatUsers);
          
          // Initialize messages for each chat session
          const initialMessages: MessagesByUserId = {};
          chatUsers.forEach((user: any) => {
            initialMessages[user.id] = [];
          });
          setMessagesByUser(initialMessages);
        }
      } catch (error) {
        console.error('Failed to fetch chat sessions:', error);
        // Fallback to empty state if API fails
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChatSessions();
  }, []);

  // Socket.IO connection for real-time admin chat
  useEffect(() => {
    // Dynamically import socket.io-client to avoid SSR issues
    const initSocket = async () => {
      try {
        const { io } = await import('socket.io-client');
        const socketInstance = io('http://localhost:55435', {
          transports: ['websocket', 'polling'],
          withCredentials: true
        });

        socketInstance.on('connect', () => {
          console.log('🔗 Admin connected to Socket.IO');
          
          // Join as admin
          socketInstance.emit('admin:join', {
            adminInfo: {
              name: 'Admin',
              email: 'admin@travello.com',
              id: 'admin-1'
            },
            adminId: 'admin-1'
          });
        });

        socketInstance.on('disconnect', () => {
          console.log('🔌 Admin disconnected from Socket.IO');
        });

        // Listen for user messages
        socketInstance.on('message:new', (data) => {
          console.log('💬 Received user message:', data);
          
          // Update unread count
          setUnreadCount(prev => prev + 1);
          
          // Show browser notification
          if (notificationPermission === 'granted') {
            new Notification('👋 New Message from User', {
              body: `${data.message.senderName}: ${data.message.message}`,
              icon: '/images/default-avatar.png',
              tag: 'admin-chat'
            });
          }
          
          // Add user message to chat
          const userMessage: ChatThreadMessage = {
            id: Date.now(),
            content: data.message.message,
            role: 'user',
            timestamp: new Date().toLocaleTimeString(),
          };
          
          // Use sessionId or create a unique ID from session/user info
          const userId = data.sessionId ? parseInt(data.sessionId.replace('CHAT', '').replace(/[^0-9]/g, '')) || Date.now() : Date.now();
          
          setMessagesByUser(prev => ({
            ...prev,
            [userId]: [...(prev[userId] || []), userMessage]
          }));
          
          // Auto-select user if no user is selected
          if (!activeUser) {
            setActiveUser(userId);
          }
        });

        socketInstance.on('admin:user_joined', (data) => {
          console.log('👤 User joined:', data.userInfo.name);
        });

        socketInstance.on('error', (error) => {
          console.error('❌ Socket.IO error:', error);
        });

        setSocket(socketInstance);
      } catch (error) {
        console.error('❌ Failed to initialize Socket.IO:', error);
      }
    };

    initSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const requestPermission = () => {
          Notification.requestPermission().then(permission => {
              setNotificationPermission(permission as NotificationPermission);
          });
          
          // Fallback for browsers that don't support Notification API
          if (!('Notification' in window)) {
              setNotificationPermission('unsupported');
          }
      };

      // Check existing permission
      if (Notification.permission === 'default') {
          requestPermission();
      } else if (Notification.permission === 'granted') {
          setNotificationPermission('granted');
      }
    }
  }, []);

  // Listen for messages from other windows (from user chat)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('📨 Received postMessage:', event.data);
      
      const data = event.data;
      
      if (data.type === 'NEW_USER_MESSAGE') {
        console.log('✅ Processing NEW_USER_MESSAGE:', data);
        
        // Update unread count
        setUnreadCount(prev => prev + 1);
        
        // Show browser notification
        if (notificationPermission === 'granted') {
          new Notification('👋 New Message from User', {
            body: `${data.userName}: ${data.message}`,
            icon: '/images/default-avatar.png',
            tag: 'admin-chat'
          });
        }
        
        // Add user message to chat
        const userMessage: ChatThreadMessage = {
          id: Date.now(),
          content: data.message,
          role: 'user',
          timestamp: new Date().toLocaleTimeString(),
        };
        
        console.log('💬 Adding user message to chat:', userMessage);
        
        setMessagesByUser(prev => {
          const updated = {
            ...prev,
            [data.userId]: [...(prev[data.userId] || []), userMessage]
          };
          console.log('📝 Updated messagesByUser:', updated);
          return updated;
        });
        
        // Auto-select user if no user is selected
        if (!activeUser) {
          console.log('🔄 Auto-selecting user:', data.userId);
          setActiveUser(data.userId);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [activeUser, notificationPermission]);

  // Update document title with unread count
  useEffect(() => {
    const originalTitle = document.title;
    
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) ${originalTitle}`;
    } else {
      document.title = originalTitle;
    }
  }, [unreadCount]);

  // Mobile responsive effect
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const apply = () => {
      setIsMobile(mql.matches);
      setMobileView(mql.matches ? "list" : "chat");
    };

    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);

  const handleSendMessage = () => {
    const trimmed = newMessage.trim();
    if (!trimmed || !activeUser) return;

    // Reset unread count when admin sends message
    setUnreadCount(0);

    // Add message to local state first
    setMessagesByUser((prev) => {
      const prevThread = prev[activeUser] ?? [];
      const nextMessage: ChatThreadMessage = {
        id: prevThread.length ? prevThread[prevThread.length - 1].id + 1 : 1,
        role: "admin",
        content: trimmed,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      return {
        ...prev,
        [activeUser]: [...prevThread, nextMessage],
      };
    });

    // Send via Socket.IO if connected
    if (socket) {
      // Find the user to get their sessionId
      const user = users.find(u => u.id === activeUser);
      const sessionId = user?.sessionId || `CHAT${activeUser}`;
      
      socket.emit('admin:message:send', {
        message: trimmed,
        sessionId: sessionId,
        adminInfo: {
          name: 'Admin',
          email: 'admin@travello.com',
          id: 'admin-1'
        }
      });
      console.log('📤 Admin message sent via Socket.IO to session:', sessionId);
    } else {
      console.log('⚠️ Socket.IO not connected, message only stored locally');
    }

    setNewMessage("");
  };

  const handleUserSelect = (userId: number) => {
    setActiveUser(userId);
    // Reset unread count when switching to user
    setUnreadCount(0);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden overflow-x-hidden">
      {/* Sidebar */}
      <AdminSidebar
        active={activeMenu}
        landingActiveKey={activeMenu === "landing" ? "hero" : undefined}
        onNavigate={(key) => {
          setActiveMenu(key);
          if (key === "dashboard") {
            navigate("/admin/dashboard");
          } else if (key === "chat") {
            navigate("/admin/chat");
          } else if (key === "landing") {
            navigate("/admin/landing/hero");
          } else if (key === "users") {
            navigate("/admin/users");
          } else if (key === "shop") {
            navigate("/admin/shop");
          } else if (key === "blog") {
            navigate("/admin/blog");
          } else if (key === "transactions") {
            navigate("/admin/transactions");
          }
        }}
        onNavigateLandingSub={(subKey) => {
          if (subKey === "hero") {
            setActiveMenu("landing");
            navigate("/admin/landing/hero");
          }
        }}
      />

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col px-4 py-4 md:px-8 md:py-6 overflow-hidden">
        {/* Header */}
        <AdminHeader title="Chat" />

        {/* Unread count indicator */}
        {unreadCount > 0 && (
          <div className="mb-5 flex items-center justify-center">
            <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
              🔔 {unreadCount} new message{unreadCount > 1 ? 's' : ''}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-5 max-auto w-full">
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border border-slate-100">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Main chat card */}
        <div className="flex flex-1 min-h-0 gap-4">
          {/* Users list */}
          <div
            className={`flex flex-col rounded-3xl bg-white shadow-lg border border-slate-100 h-full min-w-0 ${
              isMobile ? "w-full" : "w-72"
            } ${isMobile && mobileView === "chat" ? "hidden" : "flex"}`}
          >
            <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800">
                All Users ({allUserMessages.length})
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                {allUserMessages.filter(u => u.isActive).length} active
              </span>
            </div>
            <div className="flex-1 overflow-y-auto py-1">
              {allUserMessages.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                  <p className="text-sm">No users found</p>
                </div>
              ) : (
                allUserMessages
                  .filter((item) => {
                    const query = searchQuery.trim().toLowerCase();
                    if (!query) return true;

                    const nameMatch = item.name.toLowerCase().includes(query);
                    const thread = messagesByUser[item.id] ?? [];
                    const textMatch = thread.some((msg) =>
                      msg.content.toLowerCase().includes(query)
                    );

                    return nameMatch || textMatch;
                  })
                  .map((item) => {
                    const isActive = item.id === activeUser;
                    const thread = messagesByUser[item.id] ?? [];
                    const last = thread[thread.length - 1];

                    const lastText = last?.content ?? item.lastMessage;
                    const lastTime = last?.timestamp ?? "";

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          handleUserSelect(item.id);
                          if (isMobile) setMobileView("chat");
                        }}
                        className={`group flex w-full items-center px-4 py-2.5 text-left text-xs transition-colors ${
                          isActive
                            ? "bg-blue-500 text-white"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="relative mr-3 h-9 w-9 flex-shrink-0">
                          <div
                            className={`h-9 w-9 rounded-full border shadow-sm overflow-hidden ${
                              isActive
                                ? "border-blue-200 bg-blue-50"
                                : "border-slate-100 bg-slate-200"
                            }`}
                          >
                            {item.avatarUrl ? (
                              <img
                                src={item.avatarUrl}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-medium">
                                {item.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-white ${
                              item.isActive ? "bg-emerald-400" : "bg-slate-300"
                            }`}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate font-medium">
                              {item.name}
                            </span>
                            {lastTime && !isActive && (
                              <span className="text-[10px] text-slate-400 group-hover:text-slate-500">
                                {lastTime}
                              </span>
                            )}
                          </div>
                          <div
                            className={`truncate text-[11px] mt-0.5 ${
                              isActive ? "text-blue-50" : "text-slate-400"
                            }`}
                          >
                            {lastText}
                          </div>
                        </div>
                      </button>
                    );
                  })
              )}
            </div>
          </div>

          {/* Chat area */}
          <div
            className={`flex-1 rounded-3xl bg-white shadow-lg border border-slate-100 flex flex-col min-w-0 min-h-0 ${
              isMobile && mobileView === "list" ? "hidden" : "flex"
            }`}
          >
            {/* Chat header */}
            <div className="border-b border-slate-100 px-4 sm:px-6 py-4 text-sm font-semibold text-slate-800 flex items-center gap-3 min-w-0">
              {isMobile ? (
                <button
                  type="button"
                  onClick={() => setMobileView("list")}
                  className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Back
                </button>
              ) : null}
              <span className="min-w-0 flex-1 truncate">
                {activeUserData?.name ?? "Select a user to start chatting"}
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 min-h-0 space-y-3 overflow-y-auto px-4 sm:px-6 py-4 text-sm">
              {currentThread.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  <p className="text-sm">No messages yet. Start a conversation!</p>
                </div>
              ) : (
                currentThread.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg.content}
                    role={msg.role}
                    name={msg.role === "user" ? activeUserData?.name ?? "User" : "Admin"}
                    timestamp={msg.timestamp}
                    avatar={
                      msg.role === "user"
                        ? activeUserData?.avatarUrl
                        : "/rizwords-nomad.jpg"
                    }
                    align={msg.role === "admin" ? "right" : "left"}
                    theme="light"
                  />
                ))
              )}
            </div>

            {/* Input area */}
            <div className="border-t border-slate-100 px-4 py-3">
              <div className="flex items-center rounded-full bg-slate-50 px-4 py-2">
                <input
                  type="text"
                  placeholder={activeUser ? "Type your message..." : "Select a user to start chatting"}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={!activeUser}
                  className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!activeUser || !newMessage.trim()}
                  className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChatPage;
