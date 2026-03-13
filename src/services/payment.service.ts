import axios, { AxiosError } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:55435/api";

export interface MidtransPaymentRequest {
    itemTitle: string;
    packageTitle: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    serviceFee: number;
    total: number;
    customerInfo?: {
        name?: string;
        email?: string;
        phone?: string;
        address?: string;
        city?: string;
        postalCode?: string;
    };
}

export interface MidtransPaymentResponse {
    success: boolean;
    message: string;
    data?: {
        orderId: string;
        token: string;
        redirect_url: string;
        client_key: string;
        environment: string;
    };
}

export interface PaymentStatus {
    success: boolean;
    status: string;
    fraud_status?: string;
    payment_type?: string;
    transaction_time?: string;
    settlement_time?: string;
    gross_amount?: number;
    payment_codes?: any;
    bill_key?: string;
    biller_code?: string;
    va_numbers?: any[];
}

type ApiErrorPayload = {
    message?: string;
};

export interface PaymentMethod {
    id: string;
    name: string;
    description: string;
    icon: string;
    fees: number;
    available: boolean;
}

class PaymentService {
    private getAuthHeaders(): Record<string, string> {
        const token = localStorage.getItem("token");
        return {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    }

    private getErrorMessage(error: unknown, fallback: string): string {
        const axiosError = error as AxiosError<ApiErrorPayload>;
        return axiosError?.response?.data?.message || fallback;
    }

    /**
     * Create Midtrans payment transaction for shop order
     */
    async createShopPayment(paymentData: MidtransPaymentRequest): Promise<MidtransPaymentResponse> {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/payments/create`,
                paymentData,
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error: unknown) {
            throw new Error(this.getErrorMessage(error, "Failed to create payment transaction"));
        }
    }

    /**
     * Get payment status from Midtrans
     */
    async getPaymentStatus(orderId: string): Promise<PaymentStatus> {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/payments/status/${orderId}`,
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error: unknown) {
            throw new Error(this.getErrorMessage(error, "Failed to get payment status"));
        }
    }

    /**
     * Cancel payment transaction
     */
    async cancelPayment(orderId: string): Promise<unknown> {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/payments/cancel/${orderId}`,
                {},
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error: unknown) {
            throw new Error(this.getErrorMessage(error, "Failed to cancel payment"));
        }
    }

    /**
     * Get available payment methods
     */
    async getPaymentMethods(): Promise<PaymentMethod[]> {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/payments/methods`,
                { headers: this.getAuthHeaders() }
            );
            return (response.data as { data?: PaymentMethod[] }).data ?? [];
        } catch (error: unknown) {
            throw new Error(this.getErrorMessage(error, "Failed to get payment methods"));
        }
    }

    /**
     * Refund payment
     */
    async refundPayment(orderId: string, amount: number, reason?: string): Promise<unknown> {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/payments/refund/${orderId}`,
                { amount, reason },
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error: unknown) {
            throw new Error(this.getErrorMessage(error, "Failed to refund payment"));
        }
    }

    /**
     * Get Midtrans configuration from backend
     */
    async getMidtransConfig(): Promise<{ client_key: string; environment: string }> {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/payments/config`,
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.warn('Failed to get Midtrans config, using fallback');
            return {
                client_key: 'Mid-client-hnw3QaclfueMkZ4z',
                environment: 'sandbox'
            };
        }
    }

    /**
     * Load Midtrans Snap script
     */
    async loadMidtransScript(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            if (window.snap) {
                resolve();
                return;
            }

            try {
                // Get configuration from backend
                const config = await this.getMidtransConfig();
                const scriptUrl = config.environment === 'production' 
                    ? 'https://app.midtrans.com/snap/snap.js'
                    : 'https://app.sandbox.midtrans.com/snap/snap.js';
                
                const script = document.createElement('script');
                script.src = scriptUrl;
                script.setAttribute('data-client-key', config.client_key);
                script.onload = () => {
                    console.log('✅ Midtrans Snap script loaded successfully');
                    console.log(`🔧 Environment: ${config.environment}`);
                    resolve();
                };
                script.onerror = () => reject(new Error('Failed to load Midtrans Snap script'));
                document.head.appendChild(script);
            } catch (error) {
                // Fallback to hardcoded config
                const clientKey = 'Mid-client-hnw3QaclfueMkZ4z';
                const script = document.createElement('script');
                script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
                script.setAttribute('data-client-key', clientKey);
                script.onload = () => {
                    console.log('✅ Midtrans Snap script loaded (fallback mode)');
                    resolve();
                };
                script.onerror = () => reject(new Error('Failed to load Midtrans Snap script'));
                document.head.appendChild(script);
            }
        });
    }

    /**
     * Process payment with Midtrans Snap
     */
    async processMidtransPayment(token: string, options?: {
        onSuccess?: (result: any) => void;
        onPending?: (result: any) => void;
        onError?: (result: any) => void;
        onClose?: () => void;
    }): Promise<void> {
        try {
            // Check if this is test mode token
            if (token.includes('test-token-')) {
                console.log('🧪 TEST MODE: Simulating payment flow');
                
                // Simulate payment processing delay
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Simulate successful payment in test mode
                const mockResult = {
                    order_id: token.split('-')[2],
                    transaction_status: 'capture',
                    payment_type: 'test_payment',
                    transaction_time: new Date().toISOString(),
                    gross_amount: 0,
                    test_mode: true
                };
                
                if (options?.onSuccess) {
                    options.onSuccess(mockResult);
                } else {
                    console.log('Payment success:', mockResult);
                    window.location.href = '/shop/payment/payment-success';
                }
                return;
            }

            await this.loadMidtransScript();
            
            if (!window.snap) {
                throw new Error('Midtrans Snap is not loaded');
            }

            window.snap.pay(token, {
                onSuccess: options?.onSuccess || ((result: any) => {
                    console.log('Payment success:', result);
                    window.location.href = '/shop/payment/payment-success';
                }),
                onPending: options?.onPending || ((result: any) => {
                    console.log('Payment pending:', result);
                    window.location.href = '/shop/payment/payment-pending';
                }),
                onError: options?.onError || ((result: any) => {
                    console.log('Payment error:', result);
                    window.location.href = '/shop/payment/payment-failed';
                }),
                onClose: options?.onClose || (() => {
                    console.log('Payment popup closed');
                })
            });
        } catch (error) {
            throw new Error(`Failed to process Midtrans payment: ${error}`);
        }
    }

    // Legacy methods for backward compatibility
    async processPayment(paymentData: any): Promise<any> {
        return this.createShopPayment(paymentData);
    }

    async getPaymentHistory(page = 1, limit = 10, status?: string): Promise<unknown> {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(status && { status })
            });
            
            const response = await axios.get(
                `${API_BASE_URL}/payments/history?${params}`,
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error: unknown) {
            throw new Error(this.getErrorMessage(error, "Failed to get payment history"));
        }
    }

    async getPaymentDetails(paymentId: string): Promise<unknown> {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/payments/details/${paymentId}`,
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error: unknown) {
            throw new Error(this.getErrorMessage(error, "Failed to get payment details"));
        }
    }

    async verifyPayment(paymentId: string): Promise<unknown> {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/payments/verify/${paymentId}`,
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error: unknown) {
            throw new Error(this.getErrorMessage(error, "Failed to verify payment"));
        }
    }
}

export default new PaymentService();
