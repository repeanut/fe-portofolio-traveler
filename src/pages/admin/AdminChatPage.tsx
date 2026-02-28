import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Send } from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import type { AdminSidebarItemKey } from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import ChatMessage from "../../components/AIchatbot/ChatMessage";
import chatService, { type UserInfo, type ConversationInfo } from "../../services/chatService";
import chatApi from "../../services/chatApi";

const AdminChatPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("chat");
  const [activeUser, setActiveUser] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationInfo[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [newMessageNotification, setNewMessageNotification] = useState<string | null>(null);
  const [currentUser] = useState<UserInfo>({
    id: "admin-1",
    name: "Travello Admin",
    email: "admin@travello.com",
    role: "admin"
  });

  const navigate = useNavigate();

  // Initialize socket connection
  useEffect(() => {
    if (!chatService.isSocketConnected()) {
      chatService.connect();
    }

    // Update connection status
    const updateConnectionStatus = () => {
      setIsConnected(chatService.isSocketConnected());
    };

    // Check connection status periodically
    const interval = setInterval(updateConnectionStatus, 1000);

    // Join admin chat
    if (chatService.isSocketConnected()) {
      chatService.joinChat(currentUser);
    }

    // Handle socket events
    const handleReceiveMessage = (message: any) => {
      console.log('📨 Admin received message:', message);
      
      // Find the conversation that matches this message
      const matchingConversation = conversations.find(c => 
        c.user_email === message.senderId || c.user_id === message.senderId
      );
      
      // Add to messages if this is from the active user (match by email or ID)
      if (activeUser && (matchingConversation?.user_id === activeUser || 
                         message.senderId === activeUser || 
                         message.roomId === `user_${activeUser}_admin` ||
                         message.roomId === `user_${matchingConversation?.user_email}_admin`)) {
        setMessages(prev => {
          const exists = prev.some(m => m.id === message.id);
          if (exists) return prev;
          return [...prev, message];
        });
        console.log('✅ Message added to active chat');
      } else {
        console.log('⏸️ Message not for active user, updating conversations only');
      }
      
      // Always update conversations list when new message arrives
      loadConversations();
      
      // Show notification for new message from different user
      if (!activeUser || message.senderId !== activeUser) {
        console.log(`🔔 New message from ${message.senderName} (${message.senderId})`);
        setNewMessageNotification(`New message from ${message.senderName}`);
        
        // Clear notification after 3 seconds
        setTimeout(() => {
          setNewMessageNotification(null);
        }, 3000);
      }
    };

    const handleMessageSent = (message: any) => {
      setMessages(prev => {
        const exists = prev.some(m => m.id === message.id);
        if (exists) return prev;
        return [...prev, message];
      });

      // Update conversations list
      loadConversations();
    };

    const handleChatHistory = (data: { messages: any[] }) => {
      console.log('📚 Admin received chat history:', data.messages.length, 'messages');
      setMessages(data.messages);
    };

    const handleUserUpdate = (userInfo: ConversationInfo) => {
      console.log('👥 Admin received user update:', userInfo);
      
      setConversations(prev => {
        const existing = prev.find(c => c.user_id === userInfo.user_id);
        if (existing) {
          // Update existing conversation
          return prev.map(c => c.user_id === userInfo.user_id ? { ...c, ...userInfo } : c);
        } else {
          // Add new conversation at the top
          console.log('➕ Adding new conversation:', userInfo);
          return [userInfo, ...prev];
        }
      });
    };

    const handleUnreadCount = (data: { count: number }) => {
      setUnreadCount(data.count);
    };

    const handleUserTyping = (data: { userName: string; userId?: string; isTyping: boolean }) => {
      if (data.isTyping) {
        setTypingUser(data.userName);
      } else {
        setTypingUser(null);
      }
    };

    chatService.onReceiveMessage(handleReceiveMessage);
    chatService.onMessageSent(handleMessageSent);
    chatService.onChatHistory(handleChatHistory);
    chatService.onUserUpdate(handleUserUpdate);
    chatService.onUnreadCount(handleUnreadCount);
    chatService.onUserTyping(handleUserTyping);

    return () => {
      clearInterval(interval);
      chatService.offReceiveMessage(handleReceiveMessage);
      chatService.offMessageSent(handleMessageSent);
      chatService.offChatHistory(handleChatHistory);
      chatService.offUserUpdate(handleUserUpdate);
      chatService.offUnreadCount(handleUnreadCount);
      chatService.offUserTyping(handleUserTyping);
    };
  }, [currentUser]);

  // Load conversations
  const loadConversations = async () => {
    try {
      const convs = await chatApi.getConversations();
      setConversations(convs);
      console.log('📚 Loaded conversations:', convs.length);
    } catch (error) {
      console.error('❌ Error loading conversations:', error);
    }
  };

  // Auto-refresh conversations every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        loadConversations();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isConnected]);

  useEffect(() => {
    loadConversations();
  }, []);

  // Load chat history when active user changes
  useEffect(() => {
    if (activeUser) {
      // Find the conversation data to get the correct user identifier
      const activeUserData = conversations.find(c => c.user_id === activeUser);
      const userIdentifier = activeUserData?.user_email || activeUser; // Use email as identifier
      
      console.log('🔄 Loading chat history for user:', activeUser, 'using identifier:', userIdentifier);
      
      chatService.joinUserRoom(userIdentifier);
      chatService.getChatHistory(userIdentifier);
    }
  }, [activeUser, conversations]);

  const handleSendMessage = () => {
    const trimmed = newMessage.trim();
    if (!trimmed || !activeUser) return;

    const activeUserData = conversations.find(c => c.user_id === activeUser);
    const userIdentifier = activeUserData?.user_email || activeUser; // Use email as identifier
    
    console.log('📤 Admin sending message to:', userIdentifier);
    
    chatService.sendMessage({
      message: trimmed,
      receiverId: userIdentifier,
      receiverName: activeUserData?.user_name || 'User',
      messageType: 'admin_to_user'
    });
    
    setNewMessage("");
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar
        active={activeMenu}
        landingActiveKey={activeMenu === "landing" ? "hero" : undefined}
        onNavigate={(key) => {
          setActiveMenu(key);
          if (key === "chat") {
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
      <div className="flex flex-1 flex-col px-8 py-6 overflow-hidden">
        {/* Header */}
        <AdminHeader title="Chat" />

        {/* Connection Status */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-sm text-slate-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {newMessageNotification && (
              <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs animate-pulse">
                🔔 {newMessageNotification}
              </span>
            )}
            {unreadCount > 0 && (
              <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                {unreadCount} unread messages
              </span>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="mb-5 max-auto w-full">
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border border-slate-100">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Main chat card */}
        <div className="flex flex-1 min-h-0 gap-4">
          {/* Recent messages */}
          <div className="flex w-72 flex-col rounded-3xl bg-white shadow-lg border border-slate-100 h-full">
            <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800">
                Recent Message
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                {conversations.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto py-1">
              {conversations
                .filter((item) => {
                  const query = searchQuery.trim().toLowerCase();
                  if (!query) return true;

                  const nameMatch = item.user_name.toLowerCase().includes(query);
                  const textMatch = item.last_message_preview.toLowerCase().includes(query);

                  return nameMatch || textMatch;
                })
                .map((item) => {
                const isActive = item.user_id === activeUser;

                return (
                  <button
                    key={item.user_id}
                    type="button"
                    onClick={() => setActiveUser(item.user_id)}
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
                        <div className="h-full w-full bg-slate-200 flex items-center justify-center">
                          <span className="text-slate-500 text-sm font-medium">
                            {item.user_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-white ${
                          isActive ? "bg-emerald-400" : "bg-slate-300"
                        }`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-medium">
                          {item.user_name}
                        </span>
                        {item.last_message_at && !isActive && (
                          <span className="text-[10px] text-slate-400 group-hover:text-slate-500">
                            {new Date(item.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <div
                        className={`truncate text-[11px] mt-0.5 ${
                          isActive ? "text-blue-50" : "text-slate-400"
                        }`}
                      >
                        {item.last_message_preview}
                      </div>
                      {item.unread_count_for_admin > 0 && (
                        <div className="mt-1">
                          <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-[10px]">
                            {item.unread_count_for_admin} unread
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 rounded-3xl bg-white shadow-lg border border-slate-100 flex flex-col min-w-0 min-h-0">
            {/* Chat header */}
            <div className="border-b border-slate-100 px-6 py-4 text-sm font-semibold text-slate-800 flex items-center justify-between">
              <span>
                {conversations.find(c => c.user_id === activeUser)?.user_name ?? "Select a user"}
              </span>
              {unreadCount > 0 && (
                <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 min-h-0 space-y-3 overflow-y-auto px-6 py-4 text-sm">
              {messages.length === 0 && activeUser ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No messages yet</p>
                  <p className="text-sm mt-2">Start a conversation with {conversations.find(c => c.user_id === activeUser)?.user_name}</p>
                </div>
              ) : !activeUser ? (
                <div className="text-center text-gray-500 py-8">
                  <p>Select a user to start chatting</p>
                </div>
              ) : (
                messages.map((msg: any) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg.message}
                    role={msg.messageType === 'admin_to_user' ? 'admin' : 'user'}
                    name={msg.senderName}
                    timestamp={new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    avatar={msg.messageType === 'admin_to_user' ? "/rizwords-nomad.jpg" : undefined}
                    align={msg.messageType === 'admin_to_user' ? 'right' : 'left'}
                    theme="light"
                  />
                ))
              )}
              
              {typingUser && (
                <div className="text-sm text-gray-500 italic">
                  {typingUser} is typing...
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="border-t border-slate-100 px-4 py-3">
              <div className="flex items-center rounded-full bg-slate-50 px-4 py-2">
                <input
                  type="text"
                  placeholder="Type here..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSendMessage}
                  className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
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
