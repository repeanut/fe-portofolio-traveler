import { io, Socket } from 'socket.io-client';

class SocketService {
    private socket: Socket | null = null;
    private readonly SERVER_URL = 'http://localhost:5000';

    connect(): Socket {
        if (!this.socket) {
            console.log('🔌 Creating new Socket.IO connection...');
            this.socket = io(this.SERVER_URL, {
                withCredentials: true,
                transports: ['websocket', 'polling']
            });

            this.socket.on('connect', () => {
                console.log('✅ Connected to Socket.IO server:', this.socket?.id);
            });

            this.socket.on('disconnect', () => {
                console.log('❌ Disconnected from Socket.IO server');
            });

            this.socket.on('connect_error', (error: Error) => {
                console.error('❌ Socket.IO connection error:', error);
            });
        } else {
            console.log('🔄 Using existing Socket.IO connection:', this.socket.id);
        }

        return this.socket;
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    getSocket(): Socket | null {
        return this.socket;
    }

    // Customer methods
    joinCustomerRoom(customerName: string): void {
        console.log(`🏠 Customer joining room: customer-${customerName}`);
        this.socket?.emit('join-customer-room', customerName);
    }

    sendCustomerMessage(data: {
        id: number;
        customerName: string;
        email: string;
        message: string;
        productId?: number;
        productTitle?: string;
    }): void {
        console.log('📤 Customer sending message:', data);
        this.socket?.emit('customer-message', data);
    }

    sendCustomerTyping(customerName: string, isTyping: boolean): void {
        console.log('⌨️ Customer typing:', { customerName, isTyping });
        this.socket?.emit('customer-typing', { customerName, isTyping });
    }

    // Admin methods
    joinAdminRoom(): void {
        console.log('👨‍💼 Admin joining admin room');
        this.socket?.emit('join-admin-room');
    }

    sendAdminReply(data: {
        id: number;
        customerName: string;
        message: string;
        adminName: string;
    }): void {
        console.log('📤 Admin sending reply:', data);
        this.socket?.emit('admin-reply', data);
    }

    sendAdminTyping(customerName: string, isTyping: boolean): void {
        console.log('⌨️ Admin typing:', { customerName, isTyping });
        this.socket?.emit('admin-typing', { customerName, isTyping });
    }

    // Event listeners
    onAdminMessage(callback: (data: { id: number; message: string; adminName: string; timestamp: string }) => void): void {
        console.log('👂 Listening for admin-message events');
        this.socket?.on('admin-message', callback);
    }

    onNewCustomerMessage(callback: (data: {
        id: number;
        name: string;
        email: string;
        message: string;
        productId?: number;
        productTitle?: string;
        timestamp: string;
    }) => void): void {
        console.log('👂 Listening for new-customer-message events');
        this.socket?.on('new-customer-message', callback);
    }

    onCustomerTyping(callback: (data: { customerName: string; isTyping: boolean }) => void): void {
        console.log('👂 Listening for customer-typing events');
        this.socket?.on('customer-typing', callback);
    }

    onAdminTyping(callback: (data: { isTyping: boolean }) => void): void {
        console.log('👂 Listening for admin-typing events');
        this.socket?.on('admin-typing', callback);
    }

    onAdminReplySent(callback: (data: {
        customerName: string;
        message: string;
        adminName: string;
        timestamp: string;
    }) => void): void {
        console.log('👂 Listening for admin-reply-sent events');
        this.socket?.on('admin-reply-sent', callback);
    }

    // Remove event listeners
    off(event: string, callback?: (...args: any[]) => void): void {
        if (callback) {
            this.socket?.off(event, callback);
        } else {
            this.socket?.off(event);
        }
    }
}

export const socketService = new SocketService();
