// Main AI Chatbot components
export { default as AIAutoChatbot } from './AIAutoChatbot';
export { default as AIChatbotButton } from './AIChatbotButton';
export { AIChatbotProvider, useAIChatbot, useAIChatbotControls } from './AIChatbotProvider';

// Legacy components (if needed)
export { default as UserChat } from './UserChat';
export { default as ChatMessage } from './ChatMessage';
export { default as ChatContainer } from './ChatContainer';
export { default as ChatInput } from './ChatInput';
export { default as ChatHistory } from './ChatHistory';
export { default as FAQOptions } from './FAQOptions';

// Types
export type { AIMessage } from './AIAutoChatbot';
