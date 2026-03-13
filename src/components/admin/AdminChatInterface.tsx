import React, { useState, useRef, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { MessageCircle, Users, X, Minimize2, Maximize2, UserCheck, Clock, AlertCircle } from 'lucide-react';

export interface AdminChatSession {
    sessionId: string;
    userInfo: {
        name: string;
        email: string;
        isGuest: boolean;
    };
    status: 'active' | 'waiting' | 'closed';
    lastMessage: {
        message: string;
        sender: string;
        timestamp: Date;
    };
    unreadCount: number;
    assignedAdmin?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    createdAt: Date;
    lastActivityAt: Date;
}

interface AdminChatInterfaceProps {
    isOpen: boolean;
    onClose: () => void;
    adminInfo?: {
        id: string;
        name: string;
        email: string;
    };
}

const AdminChatInterface: React.FC<AdminChatInterfaceProps> = ({ 
    isOpen, 
    onClose, 
    adminInfo
}) => {
    const [currentAdminInfo, setCurrentAdminInfo] = useState(adminInfo || {
        id: 'admin-1',
        name: 'Admin',
        email: 'admin@travello.com'
    });
    const [sessions, setSessions] = useState<AdminChatSession[]>([]);
    const [selectedSession, setSelectedSession] = useState<AdminChatSession | null>(null);
    const [isMinimized, setIsMinimized] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
    const [stats, setStats] = useState({
        connectedUsers: 0,
        connectedAdmins: 0,
        totalUserSockets: 0,
        totalAdminSockets: 0
    });
    const [sessionMessages, setSessionMessages] = useState<{ [key: string]: any[] }>({});
    const [messageInput, setMessageInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            initializeSocket();
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [isOpen]);

    useEffect(() => {
        if (selectedSession && sessionMessages[selectedSession.sessionId]) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [sessionMessages, selectedSession]);

    const initializeSocket = () => {
        const socket = io('http://localhost:55435', {
            transports: ['websocket', 'polling'],
            withCredentials: true
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('👨‍💼 Admin connected to Socket.IO');
            setConnectionStatus('connected');
            
            socket.emit('admin:join', {
                adminInfo: currentAdminInfo,
                adminId: currentAdminInfo.id
            });
        });

        socket.on('disconnect', () => {
            console.log('🔌 Admin disconnected from Socket.IO');
            setConnectionStatus('disconnected');
        });

        socket.on('admin:active_chats', (data) => {
            console.log('📋 Received active chats:', data);
            setSessions(data.chats || []);
        });

        socket.on('admin:user_joined', (data) => {
            console.log('👤 User joined:', data);
            
            setSessions(prev => {
                const existing = prev.find(s => s.sessionId === data.sessionId);
                if (existing) {
                    return prev.map(s => 
                        s.sessionId === data.sessionId 
                            ? { ...s, status: 'waiting', lastActivityAt: new Date() }
                            : s
                    );
                } else {
                    const newSession: AdminChatSession = {
                        sessionId: data.sessionId,
                        userInfo: data.userInfo,
                        status: 'waiting',
                        lastMessage: {
                            message: 'User joined the chat',
                            sender: 'system',
                            timestamp: new Date()
                        },
                        unreadCount: 0,
                        priority: 'medium',
                        createdAt: new Date(),
                        lastActivityAt: new Date()
                    };
                    return [newSession, ...prev];
                }
            });
        });

        socket.on('message:new', (data: any) => {
            console.log('💬 New message received:', data);
            
            setSessions(prev => prev.map(session => {
                if (session.sessionId === data.sessionId) {
                    return {
                        ...session,
                        lastMessage: data.message,
                        lastActivityAt: new Date(data.message.timestamp),
                        unreadCount: session.sessionId === selectedSession?.sessionId ? 0 : session.unreadCount + 1
                    };
                }
                return session;
            }));

            setSessionMessages(prev => {
                const currentMessages = prev[data.sessionId] || [];
                const updatedMessages = [...currentMessages, data.message];
                return {
                    ...prev,
                    [data.sessionId]: updatedMessages
                };
            });
        });

        socket.on('connection_stats', (data) => {
            setStats(data);
        });

        socket.on('typing:start', (data) => {
            if (data.sessionId === selectedSession?.sessionId) {
                console.log('👤 User is typing...', data);
            }
        });

        socket.on('typing:stop', (data) => {
            if (data.sessionId === selectedSession?.sessionId) {
                console.log('👤 User stopped typing', data);
            }
        });

        socket.on('error', (error) => {
            console.error('❌ Socket error:', error);
        });
    };

    const handleSelectSession = (session: AdminChatSession) => {
        setSelectedSession(session);
        
        if (socketRef.current) {
            socketRef.current.emit('message:read', {
                sessionId: session.sessionId,
                reader: 'admin'
            });
        }
        
        setSessions(prev => prev.map(s => 
            s.sessionId === session.sessionId 
                ? { ...s, unreadCount: 0 }
                : s
        ));

        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSendMessage = () => {
        if (!messageInput.trim() || !selectedSession || !socketRef.current) return;

        const messageText = messageInput.trim();
        const sessionId = selectedSession.sessionId;

        console.log('📤 Admin sending message:', { messageText, sessionId });

        const messageData = {
            message: messageText,
            sessionId: sessionId,
            adminInfo: currentAdminInfo
        };

        socketRef.current.emit('admin:message:send', messageData);

        const adminMessage = {
            sender: 'admin',
            senderName: currentAdminInfo.name,
            message: messageText,
            timestamp: new Date()
        };

        setSessionMessages(prev => ({
            ...prev,
            [sessionId]: [...(prev[sessionId] || []), adminMessage]
        }));

        setSessions(prev => prev.map(session => 
            session.sessionId === sessionId 
                ? { 
                    ...session, 
                    lastMessage: {
                        message: messageText,
                        sender: 'admin',
                        timestamp: new Date()
                    },
                    lastActivityAt: new Date()
                  }
                : session
        ));

        setMessageInput('');
        setIsTyping(false);

        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const updateAdminInfo = (newName?: string, newEmail?: string) => {
        const updatedInfo = {
            ...currentAdminInfo,
            name: newName || currentAdminInfo.name,
            email: newEmail || currentAdminInfo.email
        };
        setCurrentAdminInfo(updatedInfo);
        console.log('👤 Admin info updated:', updatedInfo);
        
        localStorage.setItem('adminProfile', JSON.stringify(updatedInfo));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setMessageInput(value);
        
        if (selectedSession && socketRef.current) {
            if (value.trim() && !isTyping) {
                setIsTyping(true);
                socketRef.current.emit('typing:start', {
                    sessionId: selectedSession.sessionId,
                    sender: 'admin'
                });
            } else if (!value.trim() && isTyping) {
                setIsTyping(false);
                socketRef.current.emit('typing:stop', {
                    sessionId: selectedSession.sessionId,
                    sender: 'admin'
                });
            }
        }
    };

    const getStatusColor = (status: AdminChatSession['status']) => {
        switch (status) {
            case 'active': return 'text-green-600 bg-green-100';
            case 'waiting': return 'text-yellow-600 bg-yellow-100';
            case 'closed': return 'text-gray-600 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getPriorityColor = (priority: AdminChatSession['priority']) => {
        switch (priority) {
            case 'urgent': return 'text-red-600 bg-red-100';
            case 'high': return 'text-orange-600 bg-orange-100';
            case 'medium': return 'text-blue-600 bg-blue-100';
            case 'low': return 'text-gray-600 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const formatTime = (date: Date | string) => {
        const d = new Date(date);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/20">
            <div className={`absolute inset-4 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col ${isMinimized ? 'h-auto' : ''}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-sky-500 to-blue-600 text-white">
                    <div className="flex items-center gap-3">
                        <MessageCircle className="w-5 h-5" />
                        <div>
                            <h3 className="font-semibold">Admin Chat Dashboard</h3>
                            <p className="text-xs opacity-90">
                                {connectionStatus === 'connected' ? (
                                    <span className="flex items-center gap-1">
                                        <UserCheck className="w-3 h-3" />
                                        {stats.connectedUsers} users, {stats.connectedAdmins} admins
                                    </span>
                                ) : connectionStatus === 'connecting' ? (
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3 animate-spin" />
                                        Connecting...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        Disconnected
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                        >
                            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => {
                                const newName = prompt('Enter your name:', currentAdminInfo.name) || undefined;
                                const newEmail = prompt('Enter your email:', currentAdminInfo.email) || undefined;
                                if (newName || newEmail) {
                                    updateAdminInfo(newName, newEmail);
                                }
                            }}
                            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                            title="Change Identity"
                        >
                            <Users className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {isMinimized ? null : (
                    <div className="flex-1 flex">
                        {/* Sessions List */}
                        <div className="w-80 border-r border-gray-200 flex flex-col">
                            <div className="p-4 border-b border-gray-200 bg-gray-50">
                                <h4 className="font-semibold text-gray-900">Active Sessions</h4>
                                <p className="text-sm text-gray-500 mt-1">{sessions.length} active chat{sessions.length !== 1 ? 's' : ''}</p>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {sessions.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500">
                                        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No active chats</p>
                                    </div>
                                ) : (
                                    sessions.map((session) => (
                                        <div
                                            key={session.sessionId}
                                            onClick={() => handleSelectSession(session)}
                                            className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                                                selectedSession?.sessionId === session.sessionId ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                            }`}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 truncate">{session.userInfo.name}</p>
                                                    <p className="text-sm text-gray-500 truncate">{session.userInfo.email}</p>
                                                </div>
                                                <div className="flex flex-col items-end gap-1 ml-2">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(session.status)}`}>
                                                        {session.status}
                                                    </span>
                                                    {session.unreadCount > 0 && (
                                                        <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                            {session.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-gray-600 truncate flex-1">
                                                    {session.lastMessage.sender === 'user' && '👤 '}
                                                    {session.lastMessage.sender === 'admin' && '👨‍💼 '}
                                                    {session.lastMessage.message}
                                                </p>
                                                <span className={`text-xs px-1.5 py-0.5 rounded ${getPriorityColor(session.priority)} ml-2`}>
                                                    {session.priority}
                                                </span>
                                            </div>
                                            
                                            <p className="text-xs text-gray-400 mt-1">
                                                {formatTime(session.lastActivityAt)}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 flex flex-col">
                            {selectedSession ? (
                                <>
                                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{selectedSession.userInfo.name}</h4>
                                                <p className="text-sm text-gray-500">{selectedSession.userInfo.email}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(selectedSession.status)}`}>
                                                    {selectedSession.status}
                                                </span>
                                                <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(selectedSession.priority)}`}>
                                                    {selectedSession.priority}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 flex flex-col">
                                        {/* Messages Area */}
                                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                            {sessionMessages[selectedSession?.sessionId]?.map((message, index) => (
                                                <div
                                                    key={index}
                                                    className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'} mb-4`}
                                                >
                                                    <div
                                                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                                                            message.sender === 'admin'
                                                                ? 'bg-blue-500 text-white'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                    >
                                                        <p className="text-xs font-semibold mb-1">
                                                            {message.senderName}
                                                        </p>
                                                        <p className="text-sm">
                                                            {message.message}
                                                        </p>
                                                        <p className="text-xs opacity-70 mt-2">
                                                            {new Date(message.timestamp).toLocaleTimeString('en-US', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </div>

                                        {/* Input Area */}
                                        <div className="border-t border-gray-200 p-4">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={messageInput}
                                                    onChange={handleInputChange}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleSendMessage();
                                                        }
                                                    }}
                                                    placeholder="Type your message..."
                                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    disabled={!selectedSession}
                                                />
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={handleSendMessage}
                                                        disabled={!selectedSession || !messageInput.trim()}
                                                        className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        Send
                                                    </button>
                                                    {isTyping && (
                                                        <span className="text-xs text-gray-500 italic">Admin is typing...</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-gray-500">
                                    <div className="text-center">
                                        <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p className="text-lg font-medium">Select a conversation</p>
                                        <p className="text-sm">Choose a chat from the list to start messaging</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminChatInterface;
