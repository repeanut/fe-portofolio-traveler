import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip } from 'lucide-react';
import chatService, { type ChatMessage, type UserInfo } from '../../services/chatService';
import ChatMessageComponent from './ChatMessage';

interface UserAdminChatProps {
  currentUser: UserInfo;
  activeUser?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  theme?: 'light' | 'dark';
}

  const UserAdminChat: React.FC<UserAdminChatProps> = ({
  currentUser,
  activeUser,
  theme = 'light'
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<any>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Initialize socket connection and update connection status
  useEffect(() => {
    console.log('🔧 Initializing chat service...');
    if (!chatService.isSocketConnected()) {
      console.log('📞 Connecting to chat server...');
      chatService.connect();
    }

    // Update connection status based on socket connection
    const updateConnectionStatus = () => {
      setIsConnected(chatService.isSocketConnected());
    };

    // Check connection status periodically
    const interval = setInterval(updateConnectionStatus, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Join chat when current user is available
  useEffect(() => {
    if (currentUser && chatService.isSocketConnected()) {
      console.log('👤 Joining chat as:', currentUser);
      chatService.joinChat(currentUser);
    }
  }, [currentUser, isConnected]);

  // Handle receiving messages
  useEffect(() => {
    const handleReceiveMessage = (message: ChatMessage) => {
      console.log('📨 User received message:', message);
      
      // Check if this message is for the current user (match by email or ID)
      const isForCurrentUser = message.receiverId === currentUser.email || 
                              message.receiverId === currentUser.id ||
                              message.messageType === 'admin_to_user';
      
      if (isForCurrentUser) {
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some(m => m.id === message.id);
          if (exists) return prev;
          return [...prev, message];
        });
        
        console.log('✅ Message added to user chat');
        
        // Mark messages as read if they're for current user
        if (message.messageType === 'admin_to_user') {
          chatService.markMessagesAsRead([message.id]);
        }
      } else {
        console.log('⏸️ Message not for current user:', message.receiverId, 'currentUser:', currentUser.email);
      }
    };

    const handleMessageSent = (message: ChatMessage) => {
      console.log('📤 Message sent:', message);
      setMessages(prev => {
        const exists = prev.some(m => m.id === message.id);
        if (exists) return prev;
        return [...prev, message];
      });
    };

    const handleChatHistory = (data: { messages: ChatMessage[] }) => {
      console.log('📚 User received chat history:', data.messages.length, 'messages');
      setMessages(data.messages);
    };

    const handleUserTyping = (data: { userName: string; userId?: string; isTyping: boolean }) => {
      if (data.isTyping) {
        setTypingUser(data.userName);
      } else {
        setTypingUser(null);
      }
    };

    const handleUnreadCount = (data: { count: number }) => {
      setUnreadCount(data.count);
    };

    chatService.onReceiveMessage(handleReceiveMessage);
    chatService.onMessageSent(handleMessageSent);
    chatService.onChatHistory(handleChatHistory);
    chatService.onUserTyping(handleUserTyping);
    chatService.onUnreadCount(handleUnreadCount);

    return () => {
      chatService.offReceiveMessage(handleReceiveMessage);
      chatService.offMessageSent(handleMessageSent);
      chatService.offChatHistory(handleChatHistory);
      chatService.offUserTyping(handleUserTyping);
      chatService.offUnreadCount(handleUnreadCount);
    };
  }, [currentUser]);

  // Remove unused conversations loading
  // useEffect(() => {
  //   if (currentUser.role === 'admin') {
  //     loadConversations();
  //   }
  // }, [currentUser]);

  // Remove unused onUserSelect parameter
  // onUserSelect is not used in this component

  // Load chat history when user connects and is ready
  useEffect(() => {
    if (currentUser && isConnected) {
      console.log('🔄 Loading chat history for user:', currentUser.email);
      loadChatHistory(currentUser.email); // Use email as identifier
    }
  }, [currentUser, isConnected]);

  // Auto scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Remove unused functions and variables for user side
  // const loadConversations = async () => { ... };
  // const [conversations, setConversations] = useState<any[]>([]);

  const loadChatHistory = async (userId: string) => {
    try {
      // For user side, use email as identifier to match room_id in database
      const userIdentifier = currentUser.email || userId;
      
      console.log('🔄 User loading chat history with identifier:', userIdentifier);
      
      // Join the user's room
      chatService.joinUserRoom(userIdentifier);
      
      // Get chat history via socket
      chatService.getChatHistory(userIdentifier);
    } catch (error) {
      console.error('❌ Error loading chat history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    const trimmed = newMessage.trim();
    if (!trimmed || !isConnected) return;

    const messageData = {
      message: trimmed,
      receiverId: currentUser.role === 'admin' ? activeUser?.id : undefined,
      receiverName: currentUser.role === 'admin' ? activeUser?.name : undefined,
      messageType: (currentUser.role === 'admin' ? 'admin_to_user' : 'user_to_admin') as 'admin_to_user' | 'user_to_admin'
    };

    console.log('📤 Sending message:', messageData);
    chatService.sendMessage(messageData);
    setNewMessage('');
    stopTyping();
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      chatService.startTyping(currentUser.role === 'admin' ? activeUser?.id : undefined);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 1000);
  };

  const stopTyping = () => {
    setIsTyping(false);
    chatService.stopTyping(currentUser.role === 'admin' ? activeUser?.id : undefined);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isDark = theme === 'dark';

  return (
    <div className={`flex flex-col h-full ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
      {/* Connection status */}
      <div className={`px-4 py-2 text-xs border-b ${isDark ? 'border-slate-800' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>
            {isConnected ? (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Connected
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Disconnected
              </span>
            )}
          </span>
          {currentUser.role === 'admin' && unreadCount > 0 && (
            <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
              {unreadCount} unread
            </span>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((message) => (
          <ChatMessageComponent
            key={message.id}
            message={message.message}
            role={message.messageType === 'admin_to_user' ? 'admin' : 'user'}
            name={message.senderName}
            timestamp={formatTimestamp(message.created_at)}
            avatar={message.messageType === 'admin_to_user' ? '/rizwords-nomad.jpg' : undefined}
            align={message.messageType === 'admin_to_user' ? 'right' : 'left'}
            theme={theme}
          />
        ))}
        
        {typingUser && (
          <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'} italic`}>
            {typingUser} is typing...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className={`border-t px-4 py-3 ${isDark ? 'border-slate-800' : 'border-gray-200'}`}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? 'hover:bg-slate-800 text-slate-400' 
                : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            onBlur={stopTyping}
            placeholder="Type a message..."
            className={`flex-1 px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-400'
                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
            }`}
            disabled={!isConnected}
          />
          
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !isConnected}
            className={`p-2 rounded-full transition-colors ${
              newMessage.trim() && isConnected
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : isDark
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserAdminChat;
