import React from 'react';

interface ChatMessageProps {
    message: string;
    messageType?: 'text' | 'image' | 'typing';
    imageUrl?: string;
    role: 'user' | 'admin' | 'ai';
    name: string;
    avatar?: string;
    timestamp?: string;
    theme?: 'light' | 'dark';
    align?: 'left' | 'right';
    suggestions?: string[];
    followUpQuestions?: string[];
    onSuggestionClick?: (suggestion: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
    message,
    messageType = 'text',
    imageUrl,
    role,
    name,
    avatar,
    timestamp,
    theme = 'light',
    align,
    suggestions,
    followUpQuestions,
    onSuggestionClick,
}) => {
    const isDark = theme === 'dark';
    const isUser = role === 'user';
    const isAdmin = role === 'admin';
    const isAI = role === 'ai';

    const isRightAligned = align
        ? align === 'right'
        : isUser;

    const defaultUserAvatar = 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=300';
    const defaultAdminAvatar = '/rizwords-nomad.jpg';
    const defaultAIAvatar = '/rizwords-nomad.jpg';

    const computedAvatar = avatar || (isUser ? defaultUserAvatar : isAdmin ? defaultAdminAvatar : defaultAIAvatar);

    return (
        <div className={`flex items-start gap-3 mb-4 ${isRightAligned ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-9 h-9 rounded-full overflow-hidden flex-shrink-0 shadow-sm border ${isDark ? 'border-slate-800 bg-slate-900' : 'border-gray-100 bg-white'}`}>
                <img
                    src={computedAvatar}
                    alt={name}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className={`min-w-0 ${isRightAligned ? 'flex flex-col items-end' : 'flex flex-col items-start'} max-w-[82%] sm:max-w-[78%]`}>
                <div className={`flex items-center gap-2 mb-1 ${isRightAligned ? 'justify-end' : 'justify-start'}`}>
                    <span className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-gray-800'}`}>{name}</span>
                    {isAdmin && (
                        <span className={`text-[10px] leading-none px-2 py-1 rounded-full ${isDark ? 'bg-sky-500/15 text-sky-300' : 'bg-sky-100 text-sky-700'}`}>
                            Admin
                        </span>
                    )}
                    {timestamp && (
                        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>{timestamp}</span>
                    )}
                </div>

                <div
                    className={
                        `inline-block max-w-full rounded-2xl px-4 py-3 shadow-sm border transition-all duration-200 hover:shadow-md ` +
                        (isDark
                            ? (isUser
                                ? 'bg-slate-900/70 border-slate-800 text-slate-100 rounded-tr-md hover:bg-slate-900/80'
                                : isAI
                                    ? 'bg-slate-900/40 border-slate-800 text-slate-100 hover:bg-slate-900/50'
                                    : 'bg-slate-900/60 border-slate-800 text-slate-100 hover:bg-slate-900/70')
                            : (isUser
                                ? 'bg-white border-gray-200 rounded-tr-md hover:bg-gray-50 hover:border-gray-300'
                                : isAI
                                    ? 'bg-gray-50 border-gray-100 hover:bg-gray-100 hover:border-gray-200'
                                    : 'bg-white border-gray-100 hover:bg-gray-50'))
                    }
                >
                    {messageType === 'typing' ? (
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></div>
                            <span className={`text-sm italic ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{message}</span>
                        </div>
                    ) : messageType === 'image' && imageUrl ? (
                        <div className="w-full">
                            <img
                                src={imageUrl}
                                alt={message}
                                className="w-full max-w-full sm:max-w-[360px] rounded-2xl object-cover"
                            />
                        </div>
                    ) : (
                        <p className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>{message}</p>
                    )}
                </div>

                {/* AI Suggestions */}
                {isAI && suggestions && suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => onSuggestionClick?.(suggestion)}
                                className={`text-xs px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                                    isDark
                                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                                }`}
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}

                {/* AI Follow-up Questions */}
                {isAI && followUpQuestions && followUpQuestions.length > 0 && (
                    <div className="mt-3 p-3 rounded-lg border border-sky-200 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/20">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`text-sm font-semibold ${isDark ? 'text-sky-300' : 'text-sky-700'}`}>
                                💭 Follow-up Questions:
                            </span>
                        </div>
                        <div className="space-y-1">
                            {followUpQuestions.map((question, index) => (
                                <button
                                    key={index}
                                    onClick={() => onSuggestionClick?.(question)}
                                    className={`text-left w-full text-xs px-3 py-2 rounded-md transition-colors cursor-pointer ${
                                        isDark
                                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                                            : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="text-sky-500">•</span>
                                        {question}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatMessage;
