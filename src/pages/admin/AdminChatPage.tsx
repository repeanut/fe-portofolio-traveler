import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Send, MessageCircle, MessageSquare, Check, CheckCheck } from "lucide-react";
import { io, Socket } from "socket.io-client";
import AdminSidebar from "../../components/admin/AdminSidebar";
import type { AdminSidebarItemKey } from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";

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

const AdminChatPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("chat");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [isTyping, setIsTyping] = useState<{ [key: string]: boolean }>({});
  const [currentUser, setCurrentUserData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
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

    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
      setIsConnected(true);
      setConnectionError(null);
      
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

    newSocket.on('chat_history', (data: { messages: Message[] }) => {
      if (selectedUser) {
        setMessages(data.messages);
      }
    });

    newSocket.on('receive_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
      
      if (message.messageType === 'user_to_admin') {
        setUsers(prev => prev.map(user => 
          user.id === message.senderId 
            ? { ...user, lastMessage: message.message, unreadCount: (user.unreadCount || 0) + 1 }
            : user
        ));
      }
    });

    newSocket.on('unread_count', (data: { count: number }) => {
      setUnreadCount(data.count);
    });

    newSocket.on('user_status', (data: { userId: string; userName: string; status: 'online' | 'offline'; role: string }) => {
      if (data.role !== 'admin') {
        setUsers(prev => prev.map(user => 
          user.id === data.userId 
            ? { ...user, status: data.status }
            : user
        ));
      }
    });

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

    newSocket.on('user_left', (data: { userId: string; userName: string }) => {
      setUsers(prev => prev.map(user => 
        user.id === data.userId 
          ? { ...user, status: 'offline' }
          : user
      ));
    });

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

    newSocket.on('user_typing', (data: { userName: string; userId?: string; isTyping: boolean }) => {
      if (data.userId) {
        setIsTyping(prev => ({ ...prev, [data.userId!]: data.isTyping }));
      }
    });

    newSocket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error);
      alert(`Chat error: ${error.message}`);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (socket && isConnected) {
      fetch('http://localhost:5000/api/chat/history?limit=100')
        .then(response => response.json())
        .then(data => {
          if (data.success) {
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
      socket.emit('join_user_room', selectedUser.id);
      socket.emit('get_chat_history', { userId: selectedUser.id });
      
      fetch(`http://localhost:5000/api/chat/history?userId=${selectedUser.id}`)
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            setMessages(data.data.messages.reverse());
          }
        })
        .catch(error => {
          console.error('Error fetching chat history:', error);
        });
      
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

      <div className="flex min-w-0 flex-1 flex-col px-4 py-4 md:px-8 md:py-6 overflow-hidden">
        <AdminHeader title="Chat" />

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

        <div className="flex flex-1 min-h-0 gap-4">
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
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const isActive = selectedUser?.id === user.id;
                    
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          setSelectedUser(user);
                          if (isMobile) setMobileView("chat");
                        }}
                        className={`group flex w-full items-center px-4 py-2.5 text-left text-xs transition-colors ${
                          isActive
                            ? "bg-blue-500 text-white"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="relative mr-3 h-9 w-9 flex-shrink-0">
                          <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                            user.status === 'online' ? 'bg-green-500' : 'bg-slate-400'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`font-medium truncate ${
                              isActive ? "text-white" : "text-slate-800"
                            }`}>
                              {user.name}
                            </p>
                            {user.unreadCount && user.unreadCount > 0 && (
                              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                isActive ? "bg-white text-blue-500" : "bg-red-500 text-white"
                              }`}>
                                {user.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className={`text-xs truncate mt-1 ${
                            isActive ? "text-blue-100" : "text-slate-500"
                          }`}>
                            {user.lastMessage || 'No messages yet'}
                          </p>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500 text-sm">No users found</p>
                  </div>
                )}
              </div>
          </div>

          <div
            className={`flex-1 rounded-3xl bg-white shadow-lg border border-slate-100 flex flex-col min-w-0 min-h-0 ${
              isMobile && mobileView === "list" ? "hidden" : "flex"
            }`}
          >
            {selectedUser ? (
              <>
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
