import { useState, useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import FAQOptions from './FAQOptions';
import LanguageSelector from './LanguageSelector';
import { chatHistoryService, type ChatMessageDB } from '../../services/chatHistoryService';

export interface Message {
    id: string;
    content: string;
    role: 'user' | 'admin' | 'ai';
    name: string;
    timestamp: string;
    messageType?: 'text' | 'image' | 'typing';
    imageUrl?: string;
    suggestions?: string[];
    followUpQuestions?: string[];
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
    selectedLanguage?: string;
    onLanguageChange?: (language: string) => void;
}

const faqOptionsByLanguage = {
    en: [
        { id: '1', question: 'What are the top 5 destinations in Indonesia?' },
        { id: '2', question: 'How to travel Indonesia on a budget?' },
        { id: '3', question: 'Best hotels and resorts in Bali?' },
        { id: '4', question: 'Must-try Indonesian foods?' },
        { id: '5', question: 'When is the best time to visit Indonesia?' },
        { id: '6', question: 'Do I need a visa for Indonesia?' },
        { id: '7', question: 'Transportation options in Indonesia?' },
        { id: '8', question: 'Cultural etiquette for tourists?' },
    ],
    id: [
        { id: '1', question: 'Apa saja 5 destinasi terbaik di Indonesia?' },
        { id: '2', question: 'Bagaimana cara traveling Indonesia hemat?' },
        { id: '3', question: 'Hotel dan resort terbaik di Bali?' },
        { id: '4', question: 'Makanan khas Indonesia wajib coba?' },
        { id: '5', question: 'Kapan waktu terbaik ke Indonesia?' },
        { id: '6', question: 'Apakah butuh visa ke Indonesia?' },
        { id: '7', question: 'Opsi transportasi di Indonesia?' },
        { id: '8', question: 'Etika budaya untuk wisatawan?' },
    ],
    ms: [
        { id: '1', question: 'Apakah 5 destinasi teratas di Indonesia?' },
        { id: '2', question: 'Cara melancong Indonesia dengan bajet rendah?' },
        { id: '3', question: 'Hotel dan resort terbaik di Bali?' },
        { id: '4', question: 'Makanan tempatan Indonesia wajib cuba?' },
        { id: '5', question: 'Bila masa terbaik ke Indonesia?' },
        { id: '6', question: 'Perlukan visa ke Indonesia?' },
        { id: '7', question: 'Pilihan pengangkutan di Indonesia?' },
        { id: '8', question: 'Etika budaya untuk pelancong?' },
    ],
    hi: [
        { id: '1', question: 'इंडोनेशिया में टॉप 5 गंतव्य क्या हैं?' },
        { id: '2', question: 'इंडोनेशिया की यात्रा कम बजट में कैसे करें?' },
        { id: '3', question: 'बाली में सर्वश्रेष्ठ होटल और रिसॉर्ट?' },
        { id: '4', question: 'इंडोनेशियाई व्यंजन जो जरूर आज़माएं?' },
        { id: '5', question: 'इंडोनेशिया जाने का सबसे अच्छा समय कब है?' },
        { id: '6', question: 'क्या मुझे इंडोनेशिया के लिए वीज़ा की आवश्यकता है?' },
        { id: '7', question: 'इंडोनेशिया में परिवहन विकल्प?' },
        { id: '8', question: 'पर्यटकों के लिए सांस्कृतिक शिष्टाचार?' },
    ],
    th: [
        { id: '1', question: '5 อันดับแรกของจุดหมายปลายทางในอินโดนีเซียคืออะไร?' },
        { id: '2', question: 'เที่ยวอินโดนีเซียด้วยงบประมาณต่ำอย่างไร?' },
        { id: '3', question: 'โรงแรมและรีสอร์ทที่ดีที่สุดในบาหลี?' },
        { id: '4', question: 'อาหารอินโดนีเซียที่ต้องลอง?' },
        { id: '5', question: 'ช่วงเวลาที่ดีที่สุดไปอินโดนีเซียคือเมื่อไหร่?' },
        { id: '6', question: 'ต้องการวีซ่าสำหรับอินโดนีเซียหรือไม่?' },
        { id: '7', question: 'ตัวเลือกการเดินทางในอินโดนีเซีย?' },
        { id: '8', question: 'มารยาททางวัฒนธรรมสำหรับนักท่องเที่ยว?' },
    ],
    zh: [
        { id: '1', question: '印度尼西亚前5大目的地是什么？' },
        { id: '2', question: '如何预算旅行印度尼西亚？' },
        { id: '3', question: '巴厘岛最佳酒店和度假村？' },
        { id: '4', question: '必尝的印度尼西亚美食？' },
        { id: '5', question: '访问印度尼西亚的最佳时间？' },
        { id: '6', question: '去印度尼西亚需要签证吗？' },
        { id: '7', question: '印度尼西亚的交通选择？' },
        { id: '8', question: '游客的文化礼仪？' },
    ],
    ja: [
        { id: '1', question: 'インドネシアのトップ5の目的地は？' },
        { id: '2', question: 'インドネシアを予算で旅行する方法？' },
        { id: '3', question: 'バリ島の最高のホテルとリゾート？' },
        { id: '4', question: '必食のインドネシア料理？' },
        { id: '5', question: 'インドネシアを訪れるベストタイムは？' },
        { id: '6', question: 'インドネシアにはビザが必要ですか？' },
        { id: '7', question: 'インドネシアの交通手段？' },
        { id: '8', question: '観光客のための文化的エチケット？' },
    ],
    ko: [
        { id: '1', question: '인도네시아 상위 5개 목적지는?' },
        { id: '2', question: '예산으로 인도네시아 여행하는 방법?' },
        { id: '3', question: '발리 최고의 호텔과 리조트?' },
        { id: '4', question: '꼭 먹어봐야 할 인도네시아 음식?' },
        { id: '5', question: '인도네시아 방문 최적 시기는?' },
        { id: '6', question: '인도네시아에 비자가 필요한가요?' },
        { id: '7', question: '인도네시아의 교통 옵션?' },
        { id: '8', question: '관광객을 위한 문화 예절?' },
    ],
    ar: [
        { id: '1', question: 'ما هي أفضل 5 وجهات في إندونيسيا؟' },
        { id: '2', question: 'كيف أسافر إلى إندونيسيا بميزانية منخفضة؟' },
        { id: '3', question: 'أفضل الفنادق والمنتجعات في بالي؟' },
        { id: '4', question: 'أطباق إندونيسية يجب تجربتها؟' },
        { id: '5', question: 'متى أفضل وقت لزيارة إندونيسيا؟' },
        { id: '6', question: 'هل أحتاج تأشيرة لإندونيسيا؟' },
        { id: '7', question: 'خيارات النقل في إندونيسيا؟' },
        { id: '8', question: 'آداب ثقافية للسياح؟' },
    ],
    ru: [
        { id: '1', question: 'Какие 5 лучших направлений в Индонезии?' },
        { id: '2', question: 'Как путешествовать по Индонезии с ограниченным бюджетом?' },
        { id: '3', question: 'Лучшие отели и курорты на Бали?' },
        { id: '4', question: 'Обязательные индонезийские блюда?' },
        { id: '5', question: 'Когда лучшее время для посещения Индонезии?' },
        { id: '6', question: 'Нужна ли виза для Индонезии?' },
        { id: '7', question: 'Варианты транспорта в Индонезии?' },
        { id: '8', question: 'Культурный этикет для туристов?' },
    ],
    fr: [
        { id: '1', question: 'Quelles sont les 5 meilleures destinations en Indonésie?' },
        { id: '2', question: 'Comment voyager en Indonésie avec un budget limité?' },
        { id: '3', question: 'Meilleurs hôtels et resorts à Bali?' },
        { id: '4', question: 'Plats indonésiens incontournables?' },
        { id: '5', question: 'Quand est la meilleure période pour visiter l\'Indonésie?' },
        { id: '6', question: 'Ai-je besoin d\'un visa pour l\'Indonésie?' },
        { id: '7', question: 'Options de transport en Indonésie?' },
        { id: '8', question: 'Étiquette culturelle pour les touristes?' },
    ],
    de: [
        { id: '1', question: 'Was sind die Top 5 Reiseziele in Indonesien?' },
        { id: '2', question: 'Wie reist man mit kleinem Budget durch Indonesien?' },
        { id: '3', question: 'Beste Hotels und Resorts auf Bali?' },
        { id: '4', question: 'Indonesische Gerichte, die man probieren muss?' },
        { id: '5', question: 'Wann ist die beste Zeit für Indonesien?' },
        { id: '6', question: 'Brauche ich ein Visum für Indonesien?' },
        { id: '7', question: 'Transportmöglichkeiten in Indonesien?' },
        { id: '8', question: 'Kulturelle Etikette für Touristen?' },
    ],
    la: [
        { id: '1', question: 'Quae sunt 5 optimae destinationes in Indonesia?' },
        { id: '2', question: 'Quomodo Indonesia cum parco budget itinerari?' },
        { id: '3', question: 'Optima deversoria et thermae in Bali?' },
        { id: '4', question: 'Cibi Indonesici probandi?' },
        { id: '5', question: 'Quando est optimum tempus ad Indonesiam visitandam?' },
        { id: '6', question: 'Visum ad Indonesia necesse est?' },
        { id: '7', question: 'Optiones transporti in Indonesia?' },
        { id: '8', question: 'Culturae mos per viatores?' },
    ],
    es: [
        { id: '1', question: '¿Cuáles son las 5 mejores destinations en Indonesia?' },
        { id: '2', question: '¿Cómo viajar a Indonesia con presupuesto limitado?' },
        { id: '3', question: '¿Mejores hoteles y resorts en Bali?' },
        { id: '4', question: '¿Platos indonesios imprescindibles?' },
        { id: '5', question: '¿Cuándo es la mejor época para visitar Indonesia?' },
        { id: '6', question: '¿Necesito visa para Indonesia?' },
        { id: '7', question: '¿Opciones de transporte en Indonesia?' },
        { id: '8', question: '¿Etiqueta cultural para turistas?' },
    ],
    it: [
        { id: '1', question: 'Quali sono le 5 migliori destinazioni in Indonesia?' },
        { id: '2', question: 'Come viaggiare in Indonesia con un budget limitato?' },
        { id: '3', question: 'Migliori hotel e resort a Bali?' },
        { id: '4', question: 'Piatti indonesiani da provare assolutamente?' },
        { id: '5', question: 'Quando è il periodo migliore per visitare l\'Indonesia?' },
        { id: '6', question: 'Ho bisogno di un visto per l\'Indonesia?' },
        { id: '7', question: 'Opzioni di trasporto in Indonesia?' },
        { id: '8', question: 'Etichetta culturale per i turisti?' },
    ],
    hb: [
        { id: '1', question: 'מהם 5 היעדים המובילים באינדונזיה?' },
        { id: '2', question: 'איך לטייל באינדונזיה עם תקציב נמוך?' },
        { id: '3', question: 'בתי מלון ואתרי נופש הטובים ביותר בבאלי?' },
        { id: '4', question: 'מנות אינדונזיות שחובה לנסות?' },
        { id: '5', question: 'מתי הזמן הטוב ביותר לבקר באינדונזיה?' },
        { id: '6', question: 'האם אני צריך ויזה לאינדונזיה?' },
        { id: '7', question: 'אפשרויות תחבורה באינדונזיה?' },
        { id: '8', question: 'נימוס תרבותי לתיירים?' },
    ],
    jp: [
        { id: '1', question: 'インドネシアのトップ5の目的地は？' },
        { id: '2', question: 'インドネシアを予算で旅行する方法？' },
        { id: '3', question: 'バリ島の最高のホテルとリゾート？' },
        { id: '4', question: '必食のインドネシア料理？' },
        { id: '5', question: 'インドネシアを訪れるベストタイムは？' },
        { id: '6', question: 'インドネシアにはビザが必要ですか？' },
        { id: '7', question: 'インドネシアの交通手段？' },
        { id: '8', question: '観光客のための文化的エチケット？' },
    ],
    ch: [
        { id: '1', question: '印度尼西亚前5大目的地是什么？' },
        { id: '2', question: '如何预算旅行印度尼西亚？' },
        { id: '3', question: '巴厘岛最佳酒店和度假村？' },
        { id: '4', question: '必尝的印度尼西亚美食？' },
        { id: '5', question: '访问印度尼西亚的最佳时间？' },
        { id: '6', question: '去印度尼西亚需要签证吗？' },
        { id: '7', question: '印度尼西亚的交通选择？' },
        { id: '8', question: '游客的文化礼仪？' },
    ],
    kr: [
        { id: '1', question: '인도네시아 상위 5개 목적지는?' },
        { id: '2', question: '예산으로 인도네시아 여행하는 방법?' },
        { id: '3', question: '발리 최고의 호텔과 리조트?' },
        { id: '4', question: '꼭 먹어봐야 할 인도네시아 음식?' },
        { id: '5', question: '인도네시아 방문 최적 시기는?' },
        { id: '6', question: '인도네시아에 비자가 필요한가요?' },
        { id: '7', question: '인도네시아의 교통 옵션?' },
        { id: '8', question: '관광객을 위한 문화 예절?' },
    ],
    he: [
        { id: '1', question: 'מהם 5 היעדים המובילים באינדונזיה?' },
        { id: '2', question: 'איך לטייל באינדונזיה עם תקציב נמוך?' },
        { id: '3', question: 'בתי מלון ואתרי נופש הטובים ביותר בבאלי?' },
        { id: '4', question: 'מנות אינדונזיות שחובה לנסות?' },
        { id: '5', question: 'מתי הזמן הטוב ביותר לבקר באינדונזיה?' },
        { id: '6', question: 'האם אני צריך ויזה לאינדונזיה?' },
        { id: '7', question: 'אפשרויות תחבורה באינדונזיה?' },
        { id: '8', question: 'נימוס תרבותי לתיירים?' },
    ]
};

const ChatContainer = forwardRef<ChatContainerHandle, ChatContainerProps>(({ 
    onClearChat, 
    showActions = true, 
    showHeader = true, 
    senderRole = 'user', 
    initialMessages, 
    chatMode: chatModeProp, 
    onChatModeChange, 
    theme = 'light', 
    onMessagesChange,
    selectedLanguage = 'en',
    onLanguageChange 
}, ref) => {
    const isDark = theme === 'dark';
    const onMessagesChangeRef = useRef<ChatContainerProps['onMessagesChange']>(onMessagesChange);
    const [currentLanguage, setCurrentLanguage] = useState(selectedLanguage);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [adminOnline, setAdminOnline] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [sessionId, setSessionId] = useState<string>(() => chatHistoryService.generateSessionId());
    
    // Sync language when prop changes
    useEffect(() => {
        setCurrentLanguage(selectedLanguage);
    }, [selectedLanguage]);
    
    // Initialize user info for chat history service
    useEffect(() => {
        const userName = getUserName();
        const userId = localStorage.getItem('userId') || chatHistoryService.getUserInfo().userId;
        const userEmail = localStorage.getItem('userEmail') || 'traveler@example.com';
        
        chatHistoryService.updateUserInfo(userId, userName, userEmail);
    }, []);
    
    const getCurrentTime = useCallback(() => {
        return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }, []);

    const getUserName = useCallback(() => {
        if (typeof window !== 'undefined') {
            const storedName = localStorage.getItem('userName');
            return storedName || 'Traveler';
        }
        return 'Traveler';
    }, []);

    const createGreeting = useCallback((): Message[] => {
        const currentMode = chatModeProp || 'idle';
        
        if (currentMode === 'cs') {
            return [{
                id: `ai-greeting-${Date.now()}`,
                content: 'Hello! I\'m here to help you with your travel needs. How can I assist you today?',
                role: 'ai',
                name: 'Customer Service',
                timestamp: getCurrentTime(),
                suggestions: []
            }];
        }

        if (currentMode === 'ai' || currentMode === 'idle') {
            return [{
                id: `ai-greeting-${Date.now()}`,
                content: '👋 Welcome to Travello Assistant! I\'m here to help with your Indonesia travel needs. Ask me anything about destinations, budget, accommodations, food, or cultural tips!',
                role: 'ai',
                name: 'Travello Assistant',
                timestamp: getCurrentTime(),
                suggestions: [
                    'What are the top destinations in Indonesia?',
                    'How can I travel on a budget?',
                    'What are the best accommodations in Bali?'
                ]
            }];
        }

        return [];
    }, [chatModeProp, getCurrentTime]);

    const [messages, setMessages] = useState<Message[]>(() => initialMessages && initialMessages.length > 0 ? initialMessages : createGreeting());
    const [chatModeInternal, setChatModeInternal] = useState<ChatMode>(chatModeProp || 'idle');
    const effectiveChatMode = chatModeProp ?? chatModeInternal;
    const [showFAQ, setShowFAQ] = useState(effectiveChatMode === 'idle');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize Socket.IO connection for real-time admin chat
    useEffect(() => {
        if (effectiveChatMode === 'cs') {
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

                try {
                    // Initialize Socket.IO connection
                    const newSocket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:55435', {
                        transports: ['websocket', 'polling'],
                        timeout: 10000,
                        reconnection: true,
                        reconnectionAttempts: 5,
                        reconnectionDelay: 1000,
                        withCredentials: true
                    });

                    newSocket.on('connect', () => {
                        console.log('Connected to chat server');
                        setIsConnected(true);
                        
                        // Join user room
                        newSocket.emit('join_chat', {
                            userId: userId,
                            userName: userData,
                            userEmail: userEmail,
                            role: 'user'
                        });
                        
                        // Join specific admin room for this user
                        newSocket.emit('join_user_room', userId);
                    });

                    newSocket.on('disconnect', () => {
                        console.log('Disconnected from chat server');
                        setIsConnected(false);
                        setAdminOnline(false);
                    });

                    newSocket.on('connect_error', (error) => {
                        console.error('Socket connection error:', error);
                        setIsConnected(false);
                        setAdminOnline(false);
                        
                        // Show error message to user
                        const errorMessage: Message = {
                            id: `connection-error-${Date.now()}`,
                            content: 'Unable to connect to customer service. Please try again later.',
                            role: 'ai',
                            name: 'System',
                            timestamp: getCurrentTime(),
                        };
                        setMessages(prev => [...prev, errorMessage]);
                    });

                    // Listen for new messages from admin
                    newSocket.on('receive_message', (message: any) => {
                        const adminMessage: Message = {
                            id: message.id || `admin-${Date.now()}`,
                            content: message.message || message.content,
                            role: 'admin',
                            name: message.senderName || 'Admin',
                            timestamp: getCurrentTime(),
                        };
                        setMessages(prev => [...prev, adminMessage]);
                    });

                    // Listen for admin status
                    newSocket.on('user_status', (data: { userId: string; userName: string; status: 'online' | 'offline'; role: string }) => {
                        if (data.role === 'admin') {
                            setAdminOnline(data.status === 'online');
                        }
                    });

                    setSocket(newSocket);

                    return () => {
                        newSocket.close();
                    };
                } catch (error) {
                    console.error('Failed to initialize socket:', error);
                    setIsConnected(false);
                    
                    // Show error message
                    const errorMessage: Message = {
                        id: `socket-init-error-${Date.now()}`,
                        content: 'Failed to initialize chat connection. Please refresh the page.',
                        role: 'ai',
                        name: 'System',
                        timestamp: getCurrentTime(),
                    };
                    setMessages(prev => [...prev, errorMessage]);
                }
            } else {
                // Show error if user data is missing
                const errorMessage: Message = {
                    id: `missing-user-data-${Date.now()}`,
                    content: 'Please login to use customer service chat.',
                    role: 'ai',
                    name: 'System',
                    timestamp: getCurrentTime(),
                };
                setMessages(prev => [...prev, errorMessage]);
            }
        } else {
            // Clean up socket when not in CS mode
            if (socket) {
                socket.close();
                setSocket(null);
                setIsConnected(false);
                setAdminOnline(false);
            }
        }
    }, [effectiveChatMode]);

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

    const addAIResponse = async (userQuestion: string, customResponse?: string) => {
        // Show realistic typing indicator with animation
        const typingMessage: Message = {
            id: `ai-typing-${Date.now()}`,
            content: '🤖 Thinking...',
            role: 'ai',
            name: 'Travello Assistant',
            timestamp: getCurrentTime(),
            messageType: 'typing'
        };
        setMessages(prev => [...prev, typingMessage]);

        // Simulate realistic typing delay based on message length
        const typingDelay = Math.min(1500, Math.max(500, userQuestion.length * 20));
        await new Promise(resolve => setTimeout(resolve, typingDelay));

        try {
            // Call backend AI API with language support
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL || 'http://localhost:55435'}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || 'guest-token'}`
                },
                body: JSON.stringify({
                    message: userQuestion,
                    sessionId: `session_${Date.now()}`,
                    language: currentLanguage // Send language preference to backend
                }),
            });

            const data = await response.json();

            // Debug: Log the response data
            console.log('Backend Response:', data);

            // Remove typing indicator
            setMessages(prev => prev.filter(m => m.id !== typingMessage.id));

            // Enhanced AI message with suggestions and follow-up
            const aiMessage: Message = {
                id: `ai-${Date.now()}`,
                content: data.data?.response || data.response || data.message || data.answer || 'Sorry, I encountered an error. Please try again.',
                role: 'ai',
                name: 'Travello Assistant',
                timestamp: getCurrentTime(),
                suggestions: data.data?.suggestions || data.suggestions || [],
                followUpQuestions: data.data?.followUpQuestions || data.followUpQuestions || []
            };
            setMessages(prev => [...prev, aiMessage]);

            // Save AI message to database
            await saveMessageToDatabase(aiMessage);

            // Auto-trigger follow-up suggestions after a delay
            if ((data.data?.followUpQuestions || data.followUpQuestions) && (data.data?.followUpQuestions || data.followUpQuestions).length > 0) {
                setTimeout(() => {
                    console.log('Follow-up questions available:', data.data?.followUpQuestions || data.followUpQuestions);
                }, 1000);
            }

        } catch (error) {
            console.error('AI Chat Error:', error);
            // Remove typing indicator
            setMessages(prev => prev.filter(m => m.id !== typingMessage.id));

            // Use fallback response with error message
            const errorMessage: Message = {
                id: `ai-${Date.now()}`,
                content: customResponse || 'Sorry, I encountered an error. Please try again.',
                role: 'ai',
                name: 'Travello Assistant',
                timestamp: getCurrentTime(),
                suggestions: []
            };
            setMessages(prev => [...prev, errorMessage]);

            // Save error message to database
            await saveMessageToDatabase(errorMessage);
        }
    };

    // Save message to database
    const saveMessageToDatabase = async (message: Message) => {
        // Don't save typing indicators to database
        if (message.messageType === 'typing') {
            return;
        }

        try {
            const messageData: ChatMessageDB = {
                message_id: message.id,
                session_id: sessionId,
                user_id: chatHistoryService.getUserInfo().userId,
                content: message.content,
                role: message.role,
                name: message.name,
                timestamp: message.timestamp,
                message_type: message.messageType || 'text',
                image_url: message.imageUrl,
                suggestions: message.suggestions,
                follow_up_questions: message.followUpQuestions,
                language: currentLanguage
            };

            const result = await chatHistoryService.saveMessage(messageData);
            if (!result.success) {
                console.warn('Failed to save message to database:', result.message);
            }
        } catch (error) {
            console.error('Error saving message to database:', error);
        }
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
        
        // Save user message to database
        saveMessageToDatabase(userMessage);
        
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
        // If user was idle and starts typing, auto-connect to AI with enhanced greeting
        if (effectiveChatMode === 'idle') {
            setChatModeInternal('ai');
            onChatModeChange?.('ai');
            setShowFAQ(false);
            
            // Add enhanced greeting before user message
            const greetingMessage: Message = {
                id: `ai-greeting-${Date.now()}`,
                content: '👋 Welcome to Travello Assistant! I\'m here to help with your Indonesia travel needs. Ask me anything about destinations, budget, accommodations, food, or cultural tips!',
                role: 'ai',
                name: 'Travello Assistant',
                timestamp: getCurrentTime(),
                suggestions: [
                    'What are the top destinations in Indonesia?',
                    'How can I travel on a budget?',
                    'What are the best accommodations in Bali?'
                ]
            };
            setMessages(prev => [...prev, greetingMessage]);
        }

        const outgoingMessage: Message = {
            id: `${senderRole}-${Date.now()}`,
            content: message,
            role: senderRole,
            name: senderRole === 'admin' ? 'Rizwords' : getUserName(),
            timestamp: getCurrentTime(),
        };
        setMessages(prev => [...prev, outgoingMessage]);

        // Save user message to database
        if (senderRole === 'user') {
            saveMessageToDatabase(outgoingMessage);
        }

        if (senderRole === 'admin') {
            return;
        }

        if (effectiveChatMode !== 'cs') {
            addAIResponse(message);
            return;
        }

        // In CS mode, send message via Socket.IO to admin
        if (socket && isConnected) {
            socket.emit('send_message', {
                message: message,
                messageType: 'user_to_admin'
            });
        } else {
            // Fallback if socket is not connected
            console.log('Socket not connected, message not sent:', message);
            
            // Show error message to user
            const errorMessage: Message = {
                id: `error-${Date.now()}`,
                content: 'Connection error. Please try again or refresh the page.',
                role: 'ai',
                name: 'System',
                timestamp: getCurrentTime(),
            };
            setMessages(prev => [...prev, errorMessage]);
        }
    };

    const handleClearChat = useCallback(() => {
        // End current session in database
        chatHistoryService.endSession(sessionId);
        
        // Generate new session ID
        const newSessionId = chatHistoryService.generateSessionId();
        setSessionId(newSessionId);
        
        setMessages(initialMessages && initialMessages.length > 0 ? initialMessages : createGreeting());
        setChatModeInternal(chatModeProp || 'idle');
        setShowFAQ((chatModeProp || 'idle') === 'idle');
        onClearChat?.();
    }, [chatModeProp, createGreeting, initialMessages, onClearChat, sessionId]);

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
                    <div className="flex flex-col gap-3 mb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
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
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <LanguageSelector 
                                        selectedLanguage={currentLanguage} 
                                        onLanguageChange={(language) => {
                                            setCurrentLanguage(language);
                                            onLanguageChange?.(language);
                                        }} 
                                        theme={theme} 
                                    />
                                </div>
                                {effectiveChatMode === 'cs' && (
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <span className="text-xs text-gray-500">
                                            {isConnected ? 'Connected' : 'Disconnected'}
                                        </span>
                                        {adminOnline && (
                                            <span className="text-xs text-green-600">
                                                • Admin Online
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
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
                            suggestions={msg.suggestions}
                            followUpQuestions={msg.followUpQuestions}
                            onSuggestionClick={handleSelectFAQ}
                        />
                    ))}

                    {/* FAQ Options - shown only when idle */}
                    {senderRole !== 'admin' && showFAQ && effectiveChatMode === 'idle' && (
                        <FAQOptions
                            options={faqOptionsByLanguage[currentLanguage as keyof typeof faqOptionsByLanguage] || faqOptionsByLanguage.en}
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
