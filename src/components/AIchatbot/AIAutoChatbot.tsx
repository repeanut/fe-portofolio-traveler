import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Bot, User, X, Minimize2, Maximize2 } from 'lucide-react';

interface AIMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
  sessionId: string;
}

interface AISuggestion {
  id: string;
  text: string;
  category: 'copywriter' | 'travel' | 'general';
}

interface AIAutoChatbotProps {
  theme?: 'light' | 'dark';
  position?: 'bottom-right' | 'bottom-left' | 'center';
  initialOpen?: boolean;
  onMessageSent?: (message: string) => void;
  onMessageReceived?: (message: AIMessage) => void;
}

const AIAutoChatbot: React.FC<AIAutoChatbotProps> = ({
  theme = 'light',
  position = 'bottom-right',
  initialOpen = false,
  onMessageSent,
  onMessageReceived
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [sessionId, setSessionId] = useState<string>('');
  const [authToken, setAuthToken] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize session and auth
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Get auth token from localStorage
        const token = localStorage.getItem('authToken') || 
                     localStorage.getItem('token') || 
                     'mock_jwt_token_demo_123';
        setAuthToken(token);

        // Generate session ID
        const newSessionId = `ai_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setSessionId(newSessionId);

        // Test connection
        const response = await fetch('http://localhost:5000/api/ai-chatbot/health');
        if (response.ok) {
          setConnectionStatus('connected');
          loadSuggestions();
        } else {
          setConnectionStatus('error');
        }
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        setConnectionStatus('error');
      }
    };

    initializeChat();
  }, []);

  // Load suggestions
  const loadSuggestions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/ai-chatbot/suggestions', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const aiSuggestions: AISuggestion[] = data.data.suggestions.map((text: string, index: number) => ({
            id: `suggestion_${index}`,
            text,
            category: text.toLowerCase().includes('copywriter') ? 'copywriter' : 
                     text.toLowerCase().includes('travel') ? 'travel' : 'general'
          }));
          setSuggestions(aiSuggestions);
        }
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error);
      // Set default suggestions
      setSuggestions([
        { id: '1', text: 'Harga copywriter artikel', category: 'copywriter' },
        { id: '2', text: 'Rekomendasi destinasi Bali', category: 'travel' },
        { id: '3', text: 'Paket travel content', category: 'general' }
      ]);
    }
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add welcome message
  useEffect(() => {
    if (connectionStatus === 'connected' && messages.length === 0) {
      const welcomeMessage: AIMessage = {
        id: 'welcome_' + Date.now(),
        role: 'ai',
        content: `🤖 **Selamat datang di AI Assistant TRAVELLO!**\n\nSaya adalah asisten pintar yang siap membantu Anda dengan:\n\n📝 **Jasa Copywriter:**\n• Artikel blog & website content\n• Social media copywriting\n• Sales letter & marketing content\n• SEO writing & product descriptions\n\n🏝️ **Travel Consultation:**\n• Destinasi wisata terbaik\n• Paket tour & akomodasi\n• Tips traveling hemat\n• Itinerary planning\n\n💡 **Silakan ajukan pertanyaan Anda!**`,
        timestamp: new Date().toISOString(),
        sessionId: sessionId
      };
      setMessages([welcomeMessage]);
    }
  }, [connectionStatus, sessionId]);

  // Send message to AI
  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    setIsTyping(true);

    // Add user message
    const userMessage: AIMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      sessionId: sessionId
    };

    setMessages(prev => [...prev, userMessage]);
    setMessageInput('');
    onMessageSent?.(message);

    try {
      const response = await fetch('http://localhost:5000/api/ai-chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          message: message,
          sessionId: sessionId
        })
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: AIMessage = {
          id: `ai_${Date.now()}`,
          role: 'ai',
          content: data.data.response,
          timestamp: new Date().toISOString(),
          sessionId: sessionId
        };

        setMessages(prev => [...prev, aiMessage]);
        onMessageReceived?.(aiMessage);

        // Update suggestions
        if (data.data.suggestions) {
          const newSuggestions: AISuggestion[] = data.data.suggestions.map((text: string, index: number) => ({
            id: `suggestion_${Date.now()}_${index}`,
            text,
            category: text.toLowerCase().includes('copywriter') ? 'copywriter' : 
                     text.toLowerCase().includes('travel') ? 'travel' : 'general'
          }));
          setSuggestions(newSuggestions);
        }
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Send message error:', error);
      const errorMessage: AIMessage = {
        id: `error_${Date.now()}`,
        role: 'ai',
        content: '❌ Maaf, terjadi kesalahan. Silakan coba lagi atau hubungi admin.',
        timestamp: new Date().toISOString(),
        sessionId: sessionId
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: AISuggestion) => {
    sendMessage(suggestion.text);
  };

  // Format message content (markdown-like)
  const formatMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/📝|🏝️|💰|🎯|💡|🎁|📋|🔄|🌟|🏛️|🐉|🏖️|🎒|💬|👋|🤖|✅|❌/g, match => match)
      .replace(/\n/g, '<br>');
  };

  // Get position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      default:
        return 'bottom-4 right-4';
    }
  };

  // Get theme classes
  const getThemeClasses = () => {
    return theme === 'dark' 
      ? 'bg-gray-900 text-white border-gray-700' 
      : 'bg-white text-gray-900 border-gray-200';
  };

  if (!isOpen) {
    return (
      <div className={`fixed ${getPositionClasses()} z-50`}>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
        >
          <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            AI Assistant
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed ${getPositionClasses()} z-50 w-96 max-w-[90vw]`}>
      <div className={`rounded-lg shadow-2xl border ${getThemeClasses()} ${isMinimized ? 'h-14' : 'h-[600px]'} flex flex-col transition-all duration-300`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5" />
            <span className="font-semibold">AI Assistant</span>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-400' : 
                connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'
              }`}></div>
              <span className="text-xs opacity-75">
                {connectionStatus === 'connected' ? 'Online' : 
                 connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="hover:bg-white/20 p-1 rounded transition-colors"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    }`}>
                      {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`rounded-lg px-3 py-2 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
                    }`}>
                      <div 
                        className="text-sm"
                        dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                      />
                      <div className={`text-xs mt-1 opacity-75 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className={`rounded-lg px-3 py-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`text-xs px-2 py-1 rounded-full transition-colors ${
                        suggestion.category === 'copywriter' 
                          ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300'
                          : suggestion.category === 'travel'
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {suggestion.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage(messageInput)}
                  placeholder="Ketik pesan Anda..."
                  className={`flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    theme === 'dark' 
                      ? 'bg-gray-800 border-gray-700 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  disabled={isLoading}
                />
                <button
                  onClick={() => sendMessage(messageInput)}
                  disabled={isLoading || !messageInput.trim()}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-2 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIAutoChatbot;
export type { AIMessage, AISuggestion };
