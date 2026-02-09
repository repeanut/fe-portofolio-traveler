import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Send, MessageCircle, Users, MessageSquare, Check, CheckCheck } from "lucide-react";
import { io, Socket } from "socket.io-client";
import AdminSidebar from "../../components/admin/AdminSidebar";
import type { AdminSidebarItemKey } from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import ChatMessage from "../../components/AIchatbot/ChatMessage";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  receiverId?: string;
  receiverName?: string;
  message: string;
  messageType: 'user_to_admin' | 'admin_to_user' | 'system';
  isRead: boolean;
  roomId: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'file' | 'video';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  created_at: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  status: 'online' | 'offline';
  lastMessage?: string;
  unreadCount?: number;
}

interface ChatThreadMessage {
  id: number;
  role: "user" | "admin";
  content: string;
  timestamp?: string;
}

type MessagesByUserId = Record<number, ChatThreadMessage[]>;

const dummyRecentMessages: MessagePreview[] = [
  {
    id: 1,
    name: "Faris Meika Adz-daky",
    lastMessage: "cur iki yopo cur",
    avatarUrl:
      "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    id: 2,
    name: "M Rasya Zildan",
    lastMessage: "wuhuhuhu",
    avatarUrl:
      "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    id: 3,
    name: "Fawwaz",
    lastMessage: "😂😂😂😂😂😂",
    avatarUrl:
      "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    id: 4,
    name: "Revina Okta",
    lastMessage: "Please check the landing page menu—there is an issue with the color palette usage.",
    avatarUrl:
      "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
];

const dummyThreadMessages: ChatThreadMessage[] = [
  {
    id: 1,
    role: "user",
    content: "Hi, I want to ask about the holiday packages in Bali.",
    timestamp: "10:21",
  },
  {
    id: 2,
    role: "admin",
    content: "Hi, good afternoon! Which Bali package are you referring to?",
    timestamp: "10:22",
  },
  {
    id: 3,
    role: "user",
    content: "The 3 days 2 nights package, the one that includes Ubud and Nusa Penida.",
    timestamp: "10:23",
  },
  {
    id: 4,
    role: "admin",
    content: "Sure, I’ll send the itinerary details and pricing here.",
    timestamp: "10:24",
  },
];

const initialMessagesByUser: MessagesByUserId = {
  1: [
    {
      id: 1,
      role: "user",
      content: "cur iki yopo cur",
      timestamp: "09:50",
    },
    {
      id: 2,
      role: "admin",
      content: "Hi, could you share a bit more detail?",
      timestamp: "09:51",
    },
  ],
  2: dummyThreadMessages,
  3: [
    {
      id: 1,
      role: "user",
      content: "😂😂😂😂😂😂",
      timestamp: "11:05",
    },
  ],
  4: [
    {
      id: 1,
      role: "user",
      content: "Please check the landing page menu—there is an issue with the color palette usage.",
      timestamp: "08:30",
    },
    {
      id: 2,
      role: "admin",
      content: "Sure, I’ll review the landing page section again.",
      timestamp: "08:32",
    },
  ],
};

const AdminChatPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("chat");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState<{ [key: string]: boolean }>({});
  const [currentUser, setCurrentUserData] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  const navigate = useNavigate();

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const apply = () => {
      const nextMobile = mql.matches;
      setIsMobile(nextMobile);
      setMobileView(nextMobile ? "list" : "chat");
    };

    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);

  const activeUserData = dummyRecentMessages.find((u) => u.id === activeUser);

  useEffect(() => {
    // Get current user from localStorage
    const userData = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    const userId = localStorage.getItem('userId') || 'admin_' + Date.now();
    
    if (userData && userEmail) {
      setCurrentUserData({
        id: userId,
        name: userData || 'Admin',
        email: userEmail,
        role: 'admin'
      });
    }

    // Initialize Socket.IO connection
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
      setIsConnected(true);
      setConnectionError(null);
      
      // Join admin room
      newSocket.emit('join_chat', {
        userId: userId,
        userName: userData || 'Admin',
        userEmail: userEmail,
        role: 'admin'
      });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from chat server');
      setIsConnected(false);
      setConnectionError('Connection lost');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    // Listen for chat history
    newSocket.on('chat_history', (data: { messages: Message[] }) => {
      if (selectedUser) {
        setMessages(data.messages);
      }
    });

    // Listen for new messages
    newSocket.on('receive_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
      
      // Update user's last message
      if (message.messageType === 'user_to_admin') {
        setUsers(prev => prev.map(user => 
          user.id === message.senderId 
            ? { ...user, lastMessage: message.message, unreadCount: (user.unreadCount || 0) + 1 }
            : user
        ));
      }
    });

    // Listen for unread count
    newSocket.on('unread_count', (data: { count: number }) => {
      setUnreadCount(data.count);
    });

    // Listen for user status updates
    newSocket.on('user_status', (data: { userId: string; userName: string; status: 'online' | 'offline'; role: string }) => {
      if (data.role !== 'admin') {
        setUsers(prev => prev.map(user => 
          user.id === data.userId 
            ? { ...user, status: data.status }
            : user
        ));
      }
    });

    // Listen for user joined
    newSocket.on('user_joined', (data: { userId: string; userName: string; userEmail: string; status: string }) => {
      setUsers(prev => {
        const existingUser = prev.find(u => u.id === data.userId);
        if (existingUser) {
          return prev.map(user => 
            user.id === data.userId 
              ? { ...user, status: 'online' }
              : user
          );
        } else {
          return [...prev, {
            id: data.userId,
            name: data.userName,
            email: data.userEmail,
            status: 'online',
            unreadCount: 0
          }];
        }
      });
    });

    // Listen for user left
    newSocket.on('user_left', (data: { userId: string; userName: string }) => {
      setUsers(prev => prev.map(user => 
        user.id === data.userId 
          ? { ...user, status: 'offline' }
          : user
      ));
    });

    // Listen for user updates
    newSocket.on('user_update', (userInfo: any) => {
      setUsers(prev => {
        const existingUser = prev.find(u => u.id === userInfo.id);
        if (existingUser) {
          return prev.map(user => 
            user.id === userInfo.id 
              ? { ...user, ...userInfo }
              : user
          );
        } else {
          return [...prev, userInfo];
        }
      });
    });

    // Listen for typing indicators
    newSocket.on('user_typing', (data: { userName: string; userId?: string; isTyping: boolean }) => {
      if (data.userId) {
        setIsTyping(prev => ({ ...prev, [data.userId]: data.isTyping }));
      }
    });

    // Listen for errors
    newSocket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error);
      // Show error notification to user
      alert(`Chat error: ${error.message}`);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    // Load all users who have sent messages when admin connects
    if (socket && isConnected) {
      // Get all users from database
      fetch('http://localhost:5000/api/chat/history?limit=100')
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            // Extract unique users from messages
            const uniqueUsers = new Map();
            data.data.messages.forEach((msg: Message) => {
              if (msg.messageType === 'user_to_admin' && msg.senderId) {
                if (!uniqueUsers.has(msg.senderId)) {
                  uniqueUsers.set(msg.senderId, {
                    id: msg.senderId,
                    name: msg.senderName,
                    email: msg.senderEmail,
                    status: 'offline',
                    lastMessage: msg.message,
                    unreadCount: msg.isRead ? 0 : 1
                  });
                } else {
                  const user = uniqueUsers.get(msg.senderId);
                  if (!msg.isRead) {
                    user.unreadCount = (user.unreadCount || 0) + 1;
                  }
                  user.lastMessage = msg.message;
                }
              }
            });
            
            setUsers(Array.from(uniqueUsers.values()));
          }
        })
        .catch(error => {
          console.error('Error loading users:', error);
        });
    }
  }, [socket, isConnected]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedUser && socket) {
      // Join user's room
      socket.emit('join_user_room', selectedUser.id);
      
      // Get chat history for this user from database
      socket.emit('get_chat_history', { userId: selectedUser.id });
      
      // Also fetch from REST API as backup
      fetch(`http://localhost:5000/api/chat/history?userId=${selectedUser.id}`)
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            setMessages(data.data.messages.reverse()); // Reverse to show oldest first
          }
        })
        .catch(error => {
          console.error('Error fetching chat history:', error);
        });
      
      // Mark messages as read
      const unreadMessageIds = messages
        .filter(msg => !msg.isRead && msg.senderId === selectedUser.id)
        .map(msg => msg.id);
      
      if (unreadMessageIds.length > 0) {
        socket.emit('mark_read', unreadMessageIds);
      }
    }
  }, [selectedUser, socket]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = () => {
    if (messageInput.trim() && selectedUser && socket) {
      const messageData = {
        message: messageInput.trim(),
        receiverId: selectedUser.id,
        receiverName: selectedUser.name,
        messageType: 'admin_to_user'
      };

      socket.emit('send_message', messageData);
      setMessageInput('');
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    
    if (socket && selectedUser) {
      socket.emit('typing_start', { receiverId: selectedUser.id });
      
      // Stop typing indicator after 1 second
      setTimeout(() => {
        socket.emit('typing_stop', { receiverId: selectedUser.id });
      }, 1000);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check className="w-4 h-4 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const filteredUsers = users.filter(user => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
  });

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
          {/* Recent messages */}
          <div
            className={`flex flex-col rounded-3xl bg-white shadow-lg border border-slate-100 h-full min-w-0 ${
              isMobile ? "w-full" : "w-72"
            } ${isMobile && mobileView === "chat" ? "hidden" : "flex"}`}
          >
            <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Active Users
              </span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs text-slate-500">
                  {isConnected ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            {unreadCount > 0 && (
              <div className="mx-5 mb-2 bg-red-100 text-red-700 text-xs px-2 py-1 rounded">
                {unreadCount} unread messages
              </div>
            )}
            <div className="flex-1 overflow-y-auto py-1">
{dummyRecentMessages
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
                      setActiveUser(item.id);
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
                          <div className="h-full w-full bg-slate-200" />
                        )}
                      </div>
                    </button>
                  ))}
                      </div>
                    </button>
                  ))}
                </div>
            </div>
          </div>

          {/* Chat area */}
          <div
            className={`flex-1 rounded-3xl bg-white shadow-lg border border-slate-100 flex flex-col min-w-0 min-h-0 ${
              isMobile && mobileView === "list" ? "hidden" : "flex"
            }`}
          >
            {selectedUser ? (
              <>
                {/* Chat header */}
                <div className="border-b border-slate-100 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {selectedUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          selectedUser.status === 'online' ? 'bg-green-500' : 'bg-slate-400'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{selectedUser.name}</p>
                        <p className="text-xs text-slate-500">{selectedUser.email}</p>
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      selectedUser.status === 'online' ? 'bg-green-500' : 'bg-slate-400'
                    }`} />
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${message.messageType === 'admin_to_user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                        message.messageType === 'admin_to_user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-slate-200 text-slate-800'
                      } rounded-lg p-3`}>
                        <p className="text-sm">{message.message}</p>
                        <div className={`flex items-center justify-between mt-1 ${
                          message.messageType === 'admin_to_user' ? 'text-blue-100' : 'text-slate-500'
                        }`}>
                          <span className="text-xs">{formatTime(message.created_at)}</span>
                          {message.messageType === 'admin_to_user' && getStatusIcon(message.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message input */}
                <div className="border-t border-slate-100 p-4">
                  <div className="flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={handleTyping}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      📎
                    </button>
                    <button
                      onClick={sendMessage}
                      disabled={!messageInput.trim()}
                      className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-800 mb-2">Select a user to chat</h3>
                  <p className="text-slate-600 text-sm">Choose a user from the sidebar to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChatPage;
