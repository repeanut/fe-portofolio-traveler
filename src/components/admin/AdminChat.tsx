import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { MessageCircle, Send, Users, MessageSquare, Check, CheckCheck } from 'lucide-react';

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

const AdminChat: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState<{ [key: string]: boolean }>({});
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Get current user from localStorage
    const userData = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    const userId = localStorage.getItem('userId') || 'admin_' + Date.now();
    
    if (userData && userEmail) {
      setCurrentUser({
        id: userId,
        name: userData,
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

    // Listen for typing indicators
    newSocket.on('user_typing', (data: { userName: string; userId?: string; isTyping: boolean }) => {
      if (data.userId) {
        setIsTyping(prev => ({ ...prev, [data.userId]: data.isTyping }));
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedUser && socket) {
      // Join user's room
      socket.emit('join_user_room', selectedUser.id);
      
      // Get chat history for this user
      socket.emit('get_chat_history', { userId: selectedUser.id });
      
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - User List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Chat Support
            </h2>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {isConnected ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          {unreadCount > 0 && (
            <div className="mt-2 bg-red-100 text-red-700 text-sm px-2 py-1 rounded">
              {unreadCount} unread messages
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-3">Active Users</h3>
            {users.length === 0 ? (
              <p className="text-gray-500 text-sm">No users online</p>
            ) : (
              <div className="space-y-2">
                {users.map(user => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedUser?.id === user.id 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                            user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          {user.lastMessage && (
                            <p className="text-sm text-gray-600 truncate">{user.lastMessage}</p>
                          )}
                        </div>
                      </div>
                      {user.unreadCount && user.unreadCount > 0 && (
                        <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {user.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      selectedUser.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{selectedUser.name}</p>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isTyping[selectedUser.id] && (
                    <span className="text-sm text-gray-500 italic">Typing...</span>
                  )}
                  <div className={`w-2 h-2 rounded-full ${
                    selectedUser.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.messageType === 'admin_to_user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                    message.messageType === 'admin_to_user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-800'
                  } rounded-lg p-3`}>
                    <p className="text-sm">{message.message}</p>
                    <div className={`flex items-center justify-between mt-1 ${
                      message.messageType === 'admin_to_user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      <span className="text-xs">{formatTime(message.created_at)}</span>
                      {message.messageType === 'admin_to_user' && getStatusIcon(message.status)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={handleTyping}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  📎
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!messageInput.trim()}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">Select a user to chat</h3>
              <p className="text-gray-600">Choose a user from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;
