import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface MidtransPaymentRequest {
    amount: number;
    customerDetails: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
    };
    itemDetails: {
        id: string;
        price: number;
        quantity: number;
        name: string;
        category?: string;
    }[];
    orderId: string;
    callbacks?: {
        finish?: string;
        error?: string;
        pending?: string;
    };
}

export interface MidtransPaymentResponse {
    success: boolean;
    message: string;
    data?: {
        token: string;
        redirect_url: string;
        transaction_id: string;
        order_id: string;
        status: string;
        amount: number;
    };
}

export interface MidtransPaymentMethod {
    id: string;
    name: string;
    description: string;
    icon: string;
    type: 'credit_card' | 'bank_transfer' | 'ewallet' | 'qris' | 'cstore';
    available: boolean;
}

export interface MidtransPayment {
    id: string;
    transaction_id: string;
    order_id: string;
    status: 'pending' | 'settlement' | 'deny' | 'expire' | 'cancel';
    amount: number;
    payment_type: string;
    va_number?: string;
    bill_key?: string;
    biller_code?: string;
    qr_code?: string;
    created_at: string;
    updated_at?: string;
}


interface CreateMidtransPaymentResponse {
    token: string;
    redirect_url: string;
    transaction_id: string;
    order_id: string;
    status: string;
    amount: number;
}

interface GetPaymentHistoryResponse {
    payments: MidtransPayment[];
}

interface GetPaymentDetailsResponse {
    payment: MidtransPayment;
}


interface RefundPaymentResponse {
    success: boolean;
    payment?: MidtransPayment;
    error?: string;
}

class PaymentService {
    private getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
        };
    }

    async createMidtransPayment(paymentData: MidtransPaymentRequest): Promise<CreateMidtransPaymentResponse> {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/payments/create`,
                paymentData,
                { headers: this.getAuthHeaders() }
            );
            return response.data.data;
        } catch (error: unknown) {
            console.error('Create Midtrans payment error:', error);
            throw new Error((error as any).response?.data?.message || 'Failed to create Midtrans payment');
        }
    }

    async getMidtransPaymentMethods(): Promise<MidtransPaymentMethod[]> {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/payments/methods`,
                { headers: this.getAuthHeaders() }
            );
            return response.data.data;
        } catch (error: unknown) {
            console.error('Get Midtrans payment methods error:', error);
            throw new Error((error as any).response?.data?.message || 'Failed to get Midtrans payment methods');
        }
    }

    async checkMidtransPaymentStatus(orderId: string): Promise<{ status: string; payment?: MidtransPayment }> {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/payments/status/${orderId}`,
                { headers: this.getAuthHeaders() }
            );
            return response.data.data;
        } catch (error: unknown) {
            console.error('Check Midtrans payment status error:', error);
            throw new Error((error as any).response?.data?.message || 'Failed to check payment status');
        }
    }

    async getPaymentHistory(): Promise<GetPaymentHistoryResponse> {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/payments/history`,
                { headers: this.getAuthHeaders() }
            );
            return response.data.data;
        } catch (error: unknown) {
            console.error('Get payment history error:', error);
            throw new Error((error as any).response?.data?.message || 'Failed to get payment history');
        }
    }

    async getPaymentDetails(paymentId: string): Promise<GetPaymentDetailsResponse> {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/payments/details/${paymentId}`,
                { headers: this.getAuthHeaders() }
            );
            return response.data.data;
        } catch (error: unknown) {
            console.error('Get payment details error:', error);
            throw new Error((error as any).response?.data?.message || 'Failed to get payment details');
        }
    }


    async refundPayment(paymentId: string, reason?: string): Promise<RefundPaymentResponse> {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/payments/refund/${paymentId}`,
                { reason },
                { headers: this.getAuthHeaders() }
            );
            return response.data.data;
        } catch (error: unknown) {
            console.error('Refund payment error:', error);
            throw new Error((error as any).response?.data?.message || 'Failed to refund payment');
        }
    }
}

export default new PaymentService();
