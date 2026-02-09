import { useState, useEffect, useCallback } from 'react';

interface AIMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
  sessionId: string;
}

interface AIChatbotState {
  messages: AIMessage[];
  isLoading: boolean;
  isConnected: boolean;
  sessionId: string;
  unreadCount: number;
}

interface AIChatbotOptions {
  apiUrl?: string;
  authToken?: string;
  autoConnect?: boolean;
  theme?: 'light' | 'dark';
}

export const useAIChatbot = (options: AIChatbotOptions = {}) => {
  const [state, setState] = useState<AIChatbotState>({
    messages: [],
    isLoading: false,
    isConnected: false,
    sessionId: '',
    unreadCount: 0
  });

  const {
    apiUrl = 'http://localhost:5000/api/ai-chatbot',
    authToken,
    autoConnect = true,
    theme = 'light'
  } = options;

  // Initialize connection
  useEffect(() => {
    if (autoConnect) {
      initializeConnection();
    }
  }, [autoConnect]);

  const initializeConnection = useCallback(async () => {
    try {
      // Test health endpoint
      const response = await fetch(`${apiUrl}/health`);
      
      if (response.ok) {
        setState(prev => ({ ...prev, isConnected: true }));
        
        // Generate session ID
        const newSessionId = `ai_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setState(prev => ({ ...prev, sessionId: newSessionId }));
        
        // Load suggestions
        loadSuggestions();
      } else {
        setState(prev => ({ ...prev, isConnected: false }));
      }
    } catch (error) {
      console.error('Failed to initialize AI chatbot:', error);
      setState(prev => ({ ...prev, isConnected: false }));
    }
  }, [apiUrl, loadSuggestions]);

  const loadSuggestions = useCallback(async () => {
    try {
      const token = authToken || localStorage.getItem('authToken') || 'mock_jwt_token_demo_123';
      
      const response = await fetch(`${apiUrl}/suggestions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Suggestions loaded:', data.data.suggestions);
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  }, [apiUrl, authToken]);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || state.isLoading || !state.isConnected) {
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    // Add user message
    const userMessage: AIMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      sessionId: state.sessionId
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage]
    }));

    try {
      const token = authToken || localStorage.getItem('authToken') || 'mock_jwt_token_demo_123';
      
      const response = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message,
          sessionId: state.sessionId
        })
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: AIMessage = {
          id: `ai_${Date.now()}`,
          role: 'ai',
          content: data.data.response,
          timestamp: new Date().toISOString(),
          sessionId: state.sessionId
        };

        setState(prev => ({
          ...prev,
          messages: [...prev.messages, aiMessage],
          isLoading: false
        }));

        return {
          success: true,
          message: aiMessage,
          suggestions: data.data.suggestions
        };
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
        sessionId: state.sessionId
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isLoading: false
      }));

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, [state.isLoading, state.isConnected, state.sessionId, apiUrl, authToken]);

  const clearMessages = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [],
      unreadCount: 0
    }));
  }, []);

  const markAsRead = useCallback(() => {
    setState(prev => ({ ...prev, unreadCount: 0 }));
  }, []);

  const reconnect = useCallback(() => {
    initializeConnection();
  }, [initializeConnection]);

  return {
    // State
    ...state,
    
    // Actions
    sendMessage,
    clearMessages,
    markAsRead,
    reconnect,
    initializeConnection,
    
    // Computed
    hasMessages: state.messages.length > 0,
    lastMessage: state.messages[state.messages.length - 1],
    
    // Theme
    theme
  };
};
