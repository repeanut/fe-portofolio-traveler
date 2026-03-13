import { useState, useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Trash2, Plus } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import FAQOptions from './FAQOptions';

export interface Message {
    id: string;
    content: string;
    role: 'user' | 'admin' | 'ai';
    name: string;
    timestamp: string;
    messageType?: 'text' | 'image';
    imageUrl?: string;
}

export type ChatMode = 'idle' | 'ai' | 'cs';

export interface ChatContainerHandle {
    clearChat: () => void;
    newChat: () => void;
    getMessages: () => Message[];
    setMessages: (next: Message[]) => void;
    resetToGreeting: () => void;
}

interface ChatContainerProps {
    onClearChat?: () => void;
    showActions?: boolean;
    showHeader?: boolean;
    senderRole?: 'user' | 'admin';
    initialMessages?: Message[];
    chatMode?: ChatMode;
    onChatModeChange?: (mode: ChatMode) => void;
    theme?: 'light' | 'dark';
    onMessagesChange?: (messages: Message[]) => void;
    enableSocket?: boolean;
}

const faqOptions = [
    { id: '1', question: 'What services are available?' },
    { id: '2', question: 'How do I place an order?' },
    { id: '3', question: 'How much does it cost?' },
    { id: '4', question: 'How long does the process take?' },
];

const aiResponses: Record<string, string> = {
    'What services are available?':
        'I offer Copywriting, Content Strategy, Brand Messaging, Social Media Content, and Travel Writing. Each service is tailored to your needs.',
    'How do I place an order?':
        'It’s easy! You can contact me through the website contact form or chat here directly. We’ll discuss your project needs, then I’ll send you a proposal.',
    'How much does it cost?':
        'Pricing varies depending on the project complexity. The initial consultation is FREE! Contact me to get an offer that fits your needs.',
    'How long does the process take?':
        'The timeline depends on the type and complexity of the project. Simple copywriting takes 2–3 days, while larger projects can take 1–2 weeks. We’ll confirm the timeline together.',
};

const ChatContainer = forwardRef<ChatContainerHandle, ChatContainerProps>(({ onClearChat, showActions = true, showHeader = true, senderRole = 'user', initialMessages, chatMode: chatModeProp, onChatModeChange, theme = 'light', onMessagesChange, enableSocket = false }, ref) => {
    const isDark = theme === 'dark';
    const onMessagesChangeRef = useRef<ChatContainerProps['onMessagesChange']>(onMessagesChange);
    const getCurrentTime = useCallback(() => {
        return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }, []);

    const getUserName = useCallback(() => {
        if (typeof window !== 'undefined') {
            const storedName = localStorage.getItem('userName');
            return storedName || 'Farras';
        }
        return 'Farras';
    }, []);

    const getUserEmail = useCallback(() => {
        if (typeof window !== 'undefined') {
            const storedEmail = localStorage.getItem('userEmail');
            return storedEmail || 'farras@example.com';
        }
        return 'farras@example.com';
    }, []);

    const createGreeting = useCallback((): Message[] => {
        if (chatModeProp === 'cs') {
            return [{
                id: 'greeting-admin',
                content: '👋 Connecting you to our admin team. Please wait for an admin to respond...',
                role: 'ai',
                name: 'System',
                timestamp: getCurrentTime(),
            }];
        }
        return [{
            id: 'greeting',
            content: '👋 Halo! Saya adalah AI Chatbot TRAVELLO. Kami fokus pada layanan Copywriter dan Travel. Ada yang bisa saya bantu?',
            role: 'ai',
            name: 'AI Chatbot TRAVELLO',
            timestamp: getCurrentTime(),
        }];
    }, [chatModeProp, getCurrentTime]);

    const [messages, setMessages] = useState<Message[]>(() => initialMessages && initialMessages.length > 0 ? initialMessages : createGreeting());
    const [chatModeInternal, setChatModeInternal] = useState<ChatMode>(chatModeProp || 'idle');
    const effectiveChatMode = chatModeProp ?? chatModeInternal;
    const [showFAQ, setShowFAQ] = useState(effectiveChatMode === 'idle');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<any>(null);
    const sessionIdRef = useRef<string | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        onMessagesChangeRef.current = onMessagesChange;
    }, [onMessagesChange]);

    useEffect(() => {
        onMessagesChangeRef.current?.(messages);
    }, [messages]);

    // Initialize Socket.IO connection if enabled
    useEffect(() => {
        if (enableSocket) {
            const initializeSocket = async () => {
                try {
                    const { io } = await import('socket.io-client');
                    const socket = io('http://localhost:55435', {
                        transports: ['websocket', 'polling'],
                        withCredentials: true
                    });
                    
                    socketRef.current = socket;

                    socket.on('connect', () => {
                        console.log('🔗 Connected to Socket.IO server');
                        
                        // Request notification permission
                        if (typeof window !== 'undefined' && 'Notification' in window) {
                            Notification.requestPermission().then(permission => {
                                console.log('Notification permission:', permission);
                            });
                        }
                        
                        // Join as user
                        const userInfo = {
                            name: getUserName(),
                            email: getUserEmail(),
                            isGuest: !localStorage.getItem('token')
                        };
                        
                        socket.emit('user:join', {
                            userInfo,
                            userId: null
                        });
                    });

                    socket.on('chat:status', (data) => {
                        console.log('Chat status updated:', data);
                        if (data.sessionId) {
                            sessionIdRef.current = data.sessionId;
                            
                            // Join the specific chat session room to receive admin responses
                            socket.emit('join', {
                                room: `chat_${data.sessionId}`
                            });
                            
                            // Also join user-specific room for direct messaging
                            socket.emit('join', {
                                room: `user_${getUserEmail()}`
                            });
                            
                            console.log('🔗 Joined rooms:', [`chat_${data.sessionId}`, `user_${getUserEmail()}`]);
                        }
                    });

                    socket.on('message:new', (data) => {
                        console.log('New message received:', data);
                        
                        // Handle admin messages
                        if (data.message.sender === 'admin') {
                            const adminMessage: Message = {
                                id: `admin-${Date.now()}`,
                                content: data.message.message,
                                role: 'admin',
                                name: data.message.senderName,
                                timestamp: new Date(data.message.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                            };
                            setMessages(prev => [...prev, adminMessage]);
                            console.log('💬 Admin response received:', data.message.message);
                            
                            // Show notification for admin response
                            if (typeof window !== 'undefined' && 'Notification' in window) {
                                new Notification('💬 New Admin Response', {
                                    body: `${data.message.senderName}: ${data.message.message}`,
                                    icon: '/images/default-avatar.png',
                                    tag: 'admin-response'
                                });
                            }
                        }
                    });

                    socket.on('disconnect', () => {
                        console.log('🔌 Disconnected from Socket.IO server');
                    });

                } catch (error) {
                    console.error('❌ Failed to initialize Socket.IO:', error);
                }
            };

            initializeSocket();
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [enableSocket, getUserName, getUserEmail]);

    const addAIResponse = (userQuestion: string, customResponse?: string) => {
        setTimeout(() => {
            const response = customResponse || aiResponses[userQuestion] ||
                'Thanks for your question! I’m happy to help. For more detailed information, please contact us via the contact form or choose the "Chat with Customer Service" option.';

            const aiMessage: Message = {
                id: `ai-${Date.now()}`,
                content: response,
                role: 'ai',
                name: 'AI Chatbot',
                timestamp: getCurrentTime(),
            };
            setMessages(prev => [...prev, aiMessage]);
        }, 1000);
    };

    const handleSelectFAQ = (question: string) => {
        setChatModeInternal('ai');
        onChatModeChange?.('ai');
        setShowFAQ(false);

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            content: question,
            role: 'user',
            name: getUserName(),
            timestamp: getCurrentTime(),
        };
        setMessages(prev => [...prev, userMessage]);
        addAIResponse(question);
    };

    const handleSelectCS = () => {
        setChatModeInternal('cs');
        onChatModeChange?.('cs');
        setShowFAQ(false);

        const systemMessage: Message = {
            id: `system-${Date.now()}`,
            content: 'You are now connected to Customer Service. Please wait for an Admin to respond to your message. You can also contact us directly via WhatsApp using the button on the Contact page.',
            role: 'ai',
            name: 'AI Chatbot',
            timestamp: getCurrentTime(),
        };
        setMessages(prev => [...prev, systemMessage]);
    };

    const handleSendMessage = (message: string) => {
        // If user was idle and starts typing, auto-connect to AI
        if (effectiveChatMode === 'idle') {
            setChatModeInternal('ai');
            onChatModeChange?.('ai');
            setShowFAQ(false);
        }

        const outgoingMessage: Message = {
            id: `${senderRole}-${Date.now()}`,
            content: message,
            role: senderRole,
            name: senderRole === 'admin' ? 'Rizwords' : getUserName(),
            timestamp: getCurrentTime(),
        };
        setMessages(prev => [...prev, outgoingMessage]);

        // Send user message to admin chat (both AI and CS modes)
        if (senderRole !== 'admin' && enableSocket && socketRef.current) {
            // Generate or use existing sessionId
            if (!sessionIdRef.current) {
                sessionIdRef.current = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            }
            
            const userInfo = {
                name: getUserName(),
                email: getUserEmail(),
                isGuest: !localStorage.getItem('token')
            };
            
            socketRef.current.emit('message:send', {
                message: message,
                sessionId: sessionIdRef.current,
                userInfo: userInfo
            });
            
            // Ensure user is in the correct rooms to receive admin responses
            socketRef.current.emit('join', {
                room: `chat_${sessionIdRef.current}`
            });
            
            socketRef.current.emit('join', {
                room: `user_${getUserEmail()}`
            });
            
            console.log('📤 User message sent to admin chat:', message);
            console.log('🔗 User joined rooms for session:', sessionIdRef.current);
        }

        if (senderRole === 'admin') {
            return;
        }

        if (effectiveChatMode !== 'cs') {
            addAIResponse(message);
            return;
        }

        // CS mode - wait for admin response (no auto-answer)
        // User message is already sent via Socket.IO above
        return;
    };

    const handleClearChat = useCallback(() => {
        setMessages(initialMessages && initialMessages.length > 0 ? initialMessages : createGreeting());
        setChatModeInternal(chatModeProp || 'idle');
        setShowFAQ((chatModeProp || 'idle') === 'idle');
        onClearChat?.();
    }, [chatModeProp, createGreeting, initialMessages, onClearChat]);

    const handleSetMessages = useCallback((next: Message[]) => {
        setMessages(next);
    }, []);

    const handleResetToGreeting = useCallback(() => {
        setMessages(createGreeting());
    }, [createGreeting]);

    useImperativeHandle(ref, () => ({
        clearChat: () => handleClearChat(),
        newChat: () => handleClearChat(),
        getMessages: () => messages,
        setMessages: (next: Message[]) => handleSetMessages(next),
        resetToGreeting: () => handleResetToGreeting(),
    }), [handleClearChat, handleResetToGreeting, handleSetMessages, messages]);

    return (
        <div className={`h-full min-w-0 max-w-full flex flex-col md:flex-row overflow-hidden overflow-x-hidden ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
            {/* Left Side - Floating Action Buttons */}
            {showActions && (
            <div className="hidden md:flex md:flex-col items-start gap-3 md:pr-4 md:pt-16 md:pb-0">
                {/* Clear Chat Button */}
                <button
                    onClick={handleClearChat}
                    className="group flex items-center gap-2 p-2.5 bg-sky-100 text-sky-600 rounded-full hover:bg-sky-200 hover:pr-4 transition-all duration-300 text-sm font-medium shadow-sm overflow-hidden"
                >
                    <Trash2 className="w-5 h-5 flex-shrink-0" />
                    <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[100px] transition-all duration-300">
                        Clear Chat
                    </span>
                </button>
                {/* New Chat Button */}
                <button
                    onClick={() => {
                        handleClearChat();
                    }}
                    className="group flex items-center gap-2 p-2.5 bg-sky-500 text-white rounded-full hover:bg-sky-600 hover:pr-4 transition-all duration-300 shadow-md overflow-hidden"
                >
                    <Plus className="w-5 h-5 flex-shrink-0" />
                    <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[100px] transition-all duration-300 text-sm font-medium">
                        New Chat
                    </span>
                </button>
            </div>
            )}

            {/* Main Chat Container */}
            <div className={`flex-1 min-w-0 flex flex-col overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
                {/* Header */}
                {showHeader && (
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">AI ChatBot</h2>
                        <div className="flex items-center gap-2">
                            {effectiveChatMode !== 'idle' && (
                                <span className={`text-xs px-3 py-1 rounded-full ${effectiveChatMode === 'ai'
                                    ? 'bg-sky-100 text-sky-600'
                                    : 'bg-emerald-100 text-emerald-600'
                                    }`}>
                                    {effectiveChatMode === 'ai' ? 'AI Mode' : 'CS Mode'}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Messages Area */}
                <div className={`flex-1 overflow-y-auto px-4 sm:px-6 py-5 ${isDark ? 'bg-slate-950 chat-scroll-dark' : 'bg-white chat-scroll-light'}`}>
                    {messages.map((msg) => (
                        <ChatMessage
                            key={msg.id}
                            message={msg.content}
                            role={msg.role}
                            name={msg.name}
                            timestamp={msg.timestamp}
                            messageType={msg.messageType}
                            imageUrl={msg.imageUrl}
                            theme={theme}
                        />
                    ))}

                    {/* FAQ Options - shown only when idle */}
                    {senderRole !== 'admin' && showFAQ && effectiveChatMode === 'idle' && (
                        <FAQOptions
                            options={faqOptions}
                            onSelectFAQ={handleSelectFAQ}
                            onSelectCS={handleSelectCS}
                        />
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <ChatInput
                    onSendMessage={handleSendMessage}
                    placeholder={senderRole === 'admin' ? 'Message...' : 'What would you like to know?'}
                    theme={theme}
                />
            </div>
        </div>
    );
});

export default ChatContainer;
