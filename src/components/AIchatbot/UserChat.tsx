import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, MessageCircle, User, Check, CheckCheck, Paperclip, X, Upload } from 'lucide-react';
import ChatMessage from './ChatMessage';

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

interface UserChatProps {
  theme?: 'light' | 'dark';
  onMessagesChange?: (messages: Message[]) => void;
  initialMessages?: Message[];
}

const UserChat: React.FC<UserChatProps> = ({ 
  theme = 'light', 
  onMessagesChange,
  initialMessages = [] 
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [messageInput, setMessageInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [adminOnline, setAdminOnline] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Get current user from localStorage
    const userData = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    const userId = localStorage.getItem('userId') || 'user_' + Date.now();
    
    if (userData && userEmail) {
      setCurrentUser({
        id: userId,
        name: userData,
        email: userEmail,
        role: 'user'
      });
    }

    // Initialize Socket.IO connection
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
      setIsConnected(true);
      setConnectionStatus('connected');
      
      // Join user room
      newSocket.emit('join_chat', {
        userId: userId,
        userName: userData || 'User',
        userEmail: userEmail,
        role: 'user'
      });
      
      // Join specific admin room for this user
      const userAdminRoom = `user_${userId}_admin`;
      newSocket.emit('join_user_room', userId);
      console.log(`Joining specific room: ${userAdminRoom}`);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from chat server');
      setIsConnected(false);
      setConnectionStatus('disconnected');
      setAdminOnline(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnectionStatus('disconnected');
    });

    // Listen for chat history
    newSocket.on('chat_history', (data: { messages: Message[] }) => {
      setMessages(data.messages);
    });

    // Listen for new messages
    newSocket.on('receive_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
      
      // Show notification for admin messages
      if (message.messageType === 'admin_to_user') {
        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('New message from admin', {
            body: message.message,
            icon: '/favicon.ico'
          });
        }
      }
      
      // Notify parent component
      if (onMessagesChange) {
        onMessagesChange([...messages, message]);
      }
    });

    // Listen for message sent confirmation
    newSocket.on('message_sent', (message: Message) => {
      setMessages(prev => [...prev, message]);
      
      // Notify parent component
      if (onMessagesChange) {
        onMessagesChange([...messages, message]);
      }
    });

    // Listen for typing indicators
    newSocket.on('user_typing', (data: { userName: string; isTyping: boolean }) => {
      if (data.userName !== userData) {
        setIsTyping(data.isTyping);
      }
    });

    // Listen for admin status
    newSocket.on('user_status', (data: { userId: string; userName: string; status: 'online' | 'offline'; role: string }) => {
      if (data.role === 'admin') {
        setAdminOnline(data.status === 'online');
      }
    });

    // Listen for errors
    newSocket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error);
      // Show error notification to user
      alert(`Chat error: ${error.message}`);
    });

    setSocket(newSocket);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      newSocket.close();
    };
  }, [onMessagesChange]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = () => {
    if (messageInput.trim() && socket && currentUser) {
      const messageData = {
        message: messageInput.trim(),
        messageType: 'user_to_admin'
      };

      socket.emit('send_message', messageData);
      setMessageInput('');
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !socket || !currentUser) return;

    setUploadingFile(true);
    
    try {
      // Create file URL (in production, upload to server first)
      const fileUrl = URL.createObjectURL(file);
      const fileType = file.type.startsWith('image/') ? 'image' : 'file';
      
      const fileData = {
        fileUrl,
        fileType,
        fileName: file.name,
        messageType: 'user_to_admin'
      };

      socket.emit('send_file', fileData);
      
      // Add local message immediately
      const localMessage: Message = {
        id: `local_${Date.now()}`,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderEmail: currentUser.email,
        message: `📎 ${file.name}`,
        messageType: 'user_to_admin',
        isRead: false,
        roomId: `user_${currentUser.id}`,
        attachmentUrl: fileUrl,
        attachmentType: fileType,
        status: 'sent',
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, localMessage]);
      
    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to send file. Please try again.');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    
    if (socket) {
      socket.emit('typing_start');
      
      // Stop typing indicator after 1 second
      setTimeout(() => {
        socket.emit('typing_stop');
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
        return <Check className="w-3 h-3 opacity-60" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 opacity-60" />;
      case 'read':
        return <CheckCheck className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-800';
  const inputBg = isDark ? 'bg-gray-800' : 'bg-gray-100';
  const messageBg = isDark ? 'bg-gray-800' : 'bg-blue-500';
  const adminMessageBg = isDark ? 'bg-gray-700' : 'bg-gray-200';

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connecting':
        return 'bg-yellow-500';
      case 'connected':
        return 'bg-green-500';
      case 'disconnected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className={`flex flex-col h-full ${bgColor}`}>
      {/* Header */}
      <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
            <div>
              <h3 className={`font-semibold ${textColor}`}>Customer Support</h3>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {connectionStatus === 'connecting' ? 'Connecting...' : 
                   connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
                </span>
                {adminOnline && (
                  <span className={`text-xs ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    • Admin Online
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <User className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {currentUser?.name || 'Guest'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {connectionStatus === 'connecting' ? 
                'Connecting to support team...' : 
                'Start a conversation with our support team'
              }
            </p>
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.messageType === 'user_to_admin' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                message.messageType === 'user_to_admin' 
                  ? `${messageBg} text-white` 
                  : `${adminMessageBg} ${isDark ? 'text-gray-200' : 'text-gray-800'}`
              } rounded-lg p-3`}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm flex-1">{message.message}</p>
                  {message.messageType === 'user_to_admin' && getStatusIcon(message.status)}
                </div>
                
                {/* Show attachment if exists */}
                {message.attachmentUrl && (
                  <div className="mt-2">
                    {message.attachmentType === 'image' ? (
                      <img 
                        src={message.attachmentUrl} 
                        alt="Attachment" 
                        className="max-w-xs rounded cursor-pointer hover:opacity-80"
                        onClick={() => window.open(message.attachmentUrl, '_blank')}
                      />
                    ) : (
                      <div className={`flex items-center gap-2 p-2 rounded ${isDark ? 'bg-gray-600' : 'bg-gray-100'}`}>
                        <Paperclip className="w-4 h-4" />
                        <span className="text-sm">{message.message}</span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className={`flex items-center justify-between mt-1 text-xs ${
                  message.messageType === 'user_to_admin' 
                    ? 'text-blue-100' 
                    : isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <span>{formatTime(message.created_at)}</span>
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className={`${adminMessageBg} ${isDark ? 'text-gray-200' : 'text-gray-800'} rounded-lg p-3`}>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className={`flex items-center gap-2 rounded-full ${inputBg} px-4 py-2`}>
          <input
            type="text"
            value={messageInput}
            onChange={handleTyping}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            disabled={!isConnected || uploadingFile}
            className={`flex-1 bg-transparent text-sm ${textColor} placeholder:${isDark ? 'text-gray-500' : 'text-gray-400'} focus:outline-none disabled:opacity-50`}
          />
          
          {/* File input */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.txt"
            className="hidden"
            disabled={!isConnected || uploadingFile}
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`p-2 ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
            disabled={!isConnected || uploadingFile}
            title="Attach file"
          >
            {uploadingFile ? (
              <Upload className="w-4 h-4 animate-spin" />
            ) : (
              <Paperclip className="w-4 h-4" />
            )}
          </button>
          
          <button
            onClick={sendMessage}
            disabled={!messageInput.trim() || !isConnected || uploadingFile}
            className={`p-2 ${messageBg} text-white rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserChat;
