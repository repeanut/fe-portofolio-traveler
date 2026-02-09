import React, { createContext, useContext, useState, type ReactNode } from 'react';
import AIAutoChatbot from './AIAutoChatbot';

interface AIMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
  sessionId: string;
}

interface AIChatbotContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  messages: AIMessage[];
  sendMessage: (message: string) => void;
  clearMessages: () => void;
  unreadCount: number;
}

const AIChatbotContext = createContext<AIChatbotContextType | undefined>(undefined);

interface AIChatbotProviderProps {
  children: ReactNode;
  theme?: 'light' | 'dark';
  position?: 'bottom-right' | 'bottom-left' | 'center';
  autoOpen?: boolean;
  showWelcome?: boolean;
}

export const AIChatbotProvider: React.FC<AIChatbotProviderProps> = ({
  children,
  theme = 'light',
  position = 'bottom-right',
  autoOpen = false,
  showWelcome = true
}) => {
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const sendMessage = (message: string) => {
    // This will be handled by the AIAutoChatbot component
    console.log('Sending message:', message);
  };

  const clearMessages = () => {
    setMessages([]);
    setUnreadCount(0);
  };

  const handleMessageSent = (message: string) => {
    console.log('Message sent:', message);
  };

  const handleMessageReceived = (message: AIMessage) => {
    setMessages(prev => [...prev, message]);
    if (!isOpen) {
      setUnreadCount(prev => prev + 1);
    }
  };

  const handleOpenChat = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  return (
    <AIChatbotContext.Provider
      value={{
        isOpen,
        setIsOpen: handleOpenChat,
        messages,
        sendMessage,
        clearMessages,
        unreadCount
      }}
    >
      {children}
      <AIAutoChatbot
        theme={theme}
        position={position}
        initialOpen={autoOpen}
        onMessageSent={handleMessageSent}
        onMessageReceived={handleMessageReceived}
      />
    </AIChatbotContext.Provider>
  );
};

export const useAIChatbot = () => {
  const context = useContext(AIChatbotContext);
  if (context === undefined) {
    throw new Error('useAIChatbot must be used within an AIChatbotProvider');
  }
  return context;
};

// Hook for easy access to chatbot controls
export const useAIChatbotControls = () => {
  const { isOpen, setIsOpen, unreadCount } = useAIChatbot();
  
  return {
    openChat: () => setIsOpen(true),
    closeChat: () => setIsOpen(false),
    toggleChat: () => setIsOpen(!isOpen),
    isOpen,
    unreadCount
  };
};
