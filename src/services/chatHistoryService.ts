import axios from 'axios';

export interface ChatMessageDB {
  message_id?: string;
  session_id: string;
  user_id: string;
  content: string;
  role: 'user' | 'admin' | 'ai';
  name: string;
  timestamp: string;
  message_type?: 'text' | 'image';
  image_url?: string;
  suggestions?: string[];
  follow_up_questions?: string[];
  language?: string;
}

export interface ChatSession {
  session_id: string;
  user_id: string;
  language?: string;
  chat_mode?: 'idle' | 'ai' | 'cs';
  started_at?: string;
  ended_at?: string;
  is_active?: boolean;
}

export interface AIAnalytics {
  session_id: string;
  user_id: string;
  message_category?: string;
  language_used?: string;
  response_time_ms?: number;
  user_satisfaction?: 'positive' | 'negative' | 'neutral';
  feedback_text?: string;
}

export interface ChatHistoryResponse {
  success: boolean;
  message: string;
  data?: any;
}

class ChatHistoryService {
  private apiBaseUrl: string;
  private userId: string;
  private userName: string;
  private userEmail: string;

  constructor() {
    // Update this with your actual API URL
    this.apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost/travello/api';
    
    // Get user info from localStorage
    this.userId = this.getUserId();
    this.userName = this.getUserName();
    this.userEmail = this.getUserEmail();
  }

  private getUserId(): string {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userId') || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getUserName(): string {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userName') || 'Anonymous User';
    }
    return 'Anonymous User';
  }

  private getUserEmail(): string {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userEmail') || 'anonymous@example.com';
    }
    return 'anonymous@example.com';
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-User-ID': this.userId,
      'X-User-Name': this.userName,
      'X-User-Email': this.userEmail,
    };
  }

  // Save a single chat message
  async saveMessage(message: ChatMessageDB): Promise<ChatHistoryResponse> {
    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/chat_history.php`,
        {
          action: 'save_message',
          ...message,
          user_id: this.userId,
          user_name: this.userName,
          user_email: this.userEmail
        },
        { headers: this.getHeaders() }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error saving chat message:', error);
      return {
        success: false,
        message: 'Failed to save message to database',
        data: error
      };
    }
  }

  // End a chat session
  async endSession(sessionId: string): Promise<ChatHistoryResponse> {
    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/chat_history.php`,
        {
          action: 'end_session',
          session_id: sessionId,
          user_id: this.userId
        },
        { headers: this.getHeaders() }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error ending session:', error);
      return {
        success: false,
        message: 'Failed to end session',
        data: error
      };
    }
  }

  // Save AI analytics
  async saveAnalytics(analytics: AIAnalytics): Promise<ChatHistoryResponse> {
    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/chat_history.php`,
        {
          action: 'save_analytics',
          ...analytics,
          user_id: this.userId
        },
        { headers: this.getHeaders() }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error saving analytics:', error);
      return {
        success: false,
        message: 'Failed to save analytics',
        data: error
      };
    }
  }

  // Get chat sessions for current user
  async getSessions(limit: number = 10, offset: number = 0): Promise<ChatHistoryResponse> {
    try {
      const response = await axios.get(
        `${this.apiBaseUrl}/chat_history.php?action=get_sessions&limit=${limit}&offset=${offset}`,
        { headers: this.getHeaders() }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error getting sessions:', error);
      return {
        success: false,
        message: 'Failed to get sessions',
        data: error
      };
    }
  }

  // Get messages for a specific session
  async getMessages(sessionId: string): Promise<ChatHistoryResponse> {
    try {
      const response = await axios.get(
        `${this.apiBaseUrl}/chat_history.php?action=get_messages&session_id=${sessionId}`,
        { headers: this.getHeaders() }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error getting messages:', error);
      return {
        success: false,
        message: 'Failed to get messages',
        data: error
      };
    }
  }

  // Get analytics for current user
  async getAnalytics(limit: number = 50, offset: number = 0): Promise<ChatHistoryResponse> {
    try {
      const response = await axios.get(
        `${this.apiBaseUrl}/chat_history.php?action=get_analytics&limit=${limit}&offset=${offset}`,
        { headers: this.getHeaders() }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error getting analytics:', error);
      return {
        success: false,
        message: 'Failed to get analytics',
        data: error
      };
    }
  }

  // Generate unique session ID
  generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate unique message ID
  generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get current user info
  getUserInfo() {
    return {
      userId: this.userId,
      userName: this.userName,
      userEmail: this.userEmail
    };
  }

  // Update user info (call this when user logs in)
  updateUserInfo(userId?: string, userName?: string, userEmail?: string) {
    if (userId && typeof window !== 'undefined') {
      localStorage.setItem('userId', userId);
      this.userId = userId;
    }
    if (userName && typeof window !== 'undefined') {
      localStorage.setItem('userName', userName);
      this.userName = userName;
    }
    if (userEmail && typeof window !== 'undefined') {
      localStorage.setItem('userEmail', userEmail);
      this.userEmail = userEmail;
    }
  }
}

export const chatHistoryService = new ChatHistoryService();
export default chatHistoryService;
