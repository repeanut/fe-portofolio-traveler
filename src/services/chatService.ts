import { io, Socket } from 'socket.io-client';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  receiverId?: string;
  receiverName?: string;
  message: string;
  messageType: 'user_to_admin' | 'admin_to_user' | 'system';
  roomId: string;
  isRead: boolean;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'file' | 'video';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface ConversationInfo {
  user_id: string;
  user_name: string;
  user_email: string;
  last_message_at: string;
  last_message_preview: string;
  unread_count_for_admin: number;
  unread_count_for_user: number;
  room_id: string;
}

class ChatService {
  private socket: Socket | null = null;
  private isConnected = false;
  private currentUser: UserInfo | null = null;

  constructor() {
    this.connect();
  }

  connect() {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:55435', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('🔗 Connected to chat server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from chat server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      this.isConnected = false;
    });
  }

  joinChat(userInfo: UserInfo) {
    if (!this.socket || !this.isConnected) {
      console.error('❌ Socket not connected');
      return;
    }

    this.currentUser = userInfo;
    
    // Transform field names to match backend expectations
    const transformedUserInfo = {
      userId: userInfo.id,
      userName: userInfo.name,
      userEmail: userInfo.email,
      role: userInfo.role
    };
    
    console.log('🔗 Joining chat with transformed data:', transformedUserInfo);
    this.socket.emit('join_chat', transformedUserInfo);
  }

  sendMessage(messageData: {
    message: string;
    receiverId?: string;
    receiverName?: string;
    messageType?: 'user_to_admin' | 'admin_to_user';
    attachmentUrl?: string;
    attachmentType?: 'image' | 'file' | 'video';
  }) {
    if (!this.socket || !this.isConnected) {
      console.error('❌ Socket not connected');
      return;
    }

    this.socket.emit('send_message', messageData);
  }

  markMessagesAsRead(messageIds: string[]) {
    if (!this.socket || !this.isConnected) {
      console.error('❌ Socket not connected');
      return;
    }

    this.socket.emit('mark_read', messageIds);
  }

  getUnreadMessages() {
    if (!this.socket || !this.isConnected) {
      console.error('❌ Socket not connected');
      return;
    }

    this.socket.emit('get_unread_messages');
  }

  getOnlineUsers() {
    if (!this.socket || !this.isConnected) {
      console.error('❌ Socket not connected');
      return;
    }

    this.socket.emit('get_online_users');
  }

  joinUserRoom(userId: string) {
    if (!this.socket || !this.isConnected) {
      console.error('❌ Socket not connected');
      return;
    }

    this.socket.emit('join_user_room', userId);
  }

  leaveUserRoom(userId: string) {
    if (!this.socket || !this.isConnected) {
      console.error('❌ Socket not connected');
      return;
    }

    this.socket.emit('leave_user_room', userId);
  }

  getChatHistory(userId: string) {
    if (!this.socket || !this.isConnected) {
      console.error('❌ Socket not connected');
      return;
    }

    this.socket.emit('get_chat_history', { userId });
  }

  startTyping(receiverId?: string) {
    if (!this.socket || !this.isConnected) {
      return;
    }

    this.socket.emit('typing_start', { receiverId });
  }

  stopTyping(receiverId?: string) {
    if (!this.socket || !this.isConnected) {
      return;
    }

    this.socket.emit('typing_stop', { receiverId });
  }

  // Event listeners
  onChatHistory(callback: (data: { messages: ChatMessage[] }) => void) {
    this.socket?.on('chat_history', callback);
  }

  onReceiveMessage(callback: (message: ChatMessage) => void) {
    this.socket?.on('receive_message', callback);
  }

  onMessageSent(callback: (message: ChatMessage) => void) {
    this.socket?.on('message_sent', callback);
  }

  onMessagesMarkedRead(callback: (data: { messageIds: string[] }) => void) {
    this.socket?.on('messages_marked_read', callback);
  }

  onUnreadCount(callback: (data: { count: number }) => void) {
    this.socket?.on('unread_count', callback);
  }

  onUnreadMessages(callback: (data: { messages: ChatMessage[] }) => void) {
    this.socket?.on('unread_messages', callback);
  }

  onOnlineUsers(callback: (data: { users: any[] }) => void) {
    this.socket?.on('online_users', callback);
  }

  onUserUpdate(callback: (userInfo: ConversationInfo) => void) {
    this.socket?.on('user_update', callback);
  }

  onUserStatus(callback: (data: { userId: string; userName: string; status: 'online' | 'offline'; role: string }) => void) {
    this.socket?.on('user_status', callback);
  }

  onUserLeft(callback: (data: { userId: string; userName: string }) => void) {
    this.socket?.on('user_left', callback);
  }

  onUserTyping(callback: (data: { userName: string; userId?: string; isTyping: boolean }) => void) {
    this.socket?.on('user_typing', callback);
  }

  onError(callback: (error: { message: string }) => void) {
    this.socket?.on('error', callback);
  }

  // Remove event listeners
  offChatHistory(callback: (data: { messages: ChatMessage[] }) => void) {
    this.socket?.off('chat_history', callback);
  }

  offReceiveMessage(callback: (message: ChatMessage) => void) {
    this.socket?.off('receive_message', callback);
  }

  offMessageSent(callback: (message: ChatMessage) => void) {
    this.socket?.off('message_sent', callback);
  }

  offMessagesMarkedRead(callback: (data: { messageIds: string[] }) => void) {
    this.socket?.off('messages_marked_read', callback);
  }

  offUnreadCount(callback: (data: { count: number }) => void) {
    this.socket?.off('unread_count', callback);
  }

  offUnreadMessages(callback: (data: { messages: ChatMessage[] }) => void) {
    this.socket?.off('unread_messages', callback);
  }

  offOnlineUsers(callback: (data: { users: any[] }) => void) {
    this.socket?.off('online_users', callback);
  }

  offUserUpdate(callback: (userInfo: ConversationInfo) => void) {
    this.socket?.off('user_update', callback);
  }

  offUserStatus(callback: (data: { userId: string; userName: string; status: 'online' | 'offline'; role: string }) => void) {
    this.socket?.off('user_status', callback);
  }

  offUserLeft(callback: (data: { userId: string; userName: string }) => void) {
    this.socket?.off('user_left', callback);
  }

  offUserTyping(callback: (data: { userName: string; userId?: string; isTyping: boolean }) => void) {
    this.socket?.off('user_typing', callback);
  }

  offError(callback: (error: { message: string }) => void) {
    this.socket?.off('error', callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentUser = null;
    }
  }

  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  getCurrentUser(): UserInfo | null {
    return this.currentUser;
  }
}

export const chatService = new ChatService();
export default chatService;
