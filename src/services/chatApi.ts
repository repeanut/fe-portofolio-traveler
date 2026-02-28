import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:55435';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
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

export interface SendMessageRequest {
  senderId: string;
  senderName: string;
  senderEmail: string;
  receiverId?: string;
  receiverName?: string;
  message: string;
  messageType?: 'user_to_admin' | 'admin_to_user';
  roomId?: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'file' | 'video';
}

// Chat API endpoints
export const chatApi = {
  // Get all conversations for admin
  getConversations: async (): Promise<ConversationInfo[]> => {
    const response = await api.get('/api/user-admin-chat/conversations');
    return response.data.data;
  },

  // Get messages for a specific room
  getRoomMessages: async (roomId: string, limit = 50): Promise<ChatMessage[]> => {
    const response = await api.get(`/api/user-admin-chat/room/${roomId}/messages`, {
      params: { limit }
    });
    return response.data.data.messages;
  },

  // Get messages for a specific user
  getUserMessages: async (userId: string, limit = 50): Promise<ChatMessage[]> => {
    const response = await api.get(`/api/user-admin-chat/user/${userId}/messages`, {
      params: { limit }
    });
    return response.data.data.messages;
  },

  // Send message (REST API fallback)
  sendMessage: async (messageData: SendMessageRequest): Promise<ChatMessage> => {
    const response = await api.post('/api/user-admin-chat/send', messageData);
    return response.data.data;
  },

  // Mark messages as read
  markMessagesRead: async (messageIds: string[]): Promise<void> => {
    await api.put('/api/user-admin-chat/mark-read', { messageIds });
  },

  // Get unread messages count
  getUnreadCount: async (userId?: string, role?: string): Promise<number> => {
    const params: any = {};
    if (userId) params.userId = userId;
    if (role) params.role = role;

    const response = await api.get('/api/user-admin-chat/unread-count', { params });
    return response.data.data.count;
  },

  // Get unread messages (admin only)
  getUnreadMessages: async (): Promise<ChatMessage[]> => {
    const response = await api.get('/api/user-admin-chat/unread-messages', {
      params: { role: 'admin' }
    });
    return response.data.data.messages;
  },

  // Get latest message for room
  getLatestMessage: async (roomId: string): Promise<ChatMessage | null> => {
    const response = await api.get(`/api/user-admin-chat/room/${roomId}/latest`);
    return response.data.data.latestMessage;
  },
};

export default chatApi;
