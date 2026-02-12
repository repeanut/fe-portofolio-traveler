import React from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { useAIChatbotControls } from './AIChatbotProvider';

interface AIChatbotButtonProps {
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'prominent';
  label?: string;
  showUnreadBadge?: boolean;
  className?: string;
}

const AIChatbotButton: React.FC<AIChatbotButtonProps> = ({
  theme = 'light',
  size = 'md',
  variant = 'default',
  label,
  showUnreadBadge = true,
  className = ''
}) => {
  const { openChat, unreadCount } = useAIChatbotControls();

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-2';
      case 'lg':
        return 'p-4';
      default:
        return 'p-3';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'minimal':
        return theme === 'dark' 
          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200';
      case 'prominent':
        return 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105';
      default:
        return 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md hover:shadow-lg hover:scale-105';
    }
  };

  const baseClasses = `
    relative rounded-full transition-all duration-300 flex items-center space-x-2
    ${getSizeClasses()}
    ${getVariantClasses()}
    ${className}
  `;

  return (
    <button
      onClick={openChat}
      className={baseClasses}
      title="AI Assistant - Copywriter & Travel Expert"
    >
      {variant === 'prominent' && (
        <Sparkles className={`${getIconSize()} animate-pulse`} />
      )}
      <Bot className={getIconSize()} />
      {label && (
        <span className="text-sm font-medium">{label}</span>
      )}
      {showUnreadBadge && unreadCount > 0 && (
        <>
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-ping"></span>
        </>
      )}
      
      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        AI Assistant - Ready to help!
      </span>
    </button>
  );
};

export default AIChatbotButton;
