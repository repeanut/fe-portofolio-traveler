import React, { useState, useEffect } from 'react';
import { CreditCard, Smartphone, QrCode, Building, ChevronDown } from 'lucide-react';
import paymentService from '../../services/payment.service';

interface MidtransPaymentOptionsProps {
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
    onSuccess?: (response: any) => void;
    onError?: (error: Error) => void;
    onPending?: (response: any) => void;
    className?: string;
}

const MidtransPaymentOptions: React.FC<MidtransPaymentOptionsProps> = ({
    amount,
    customerDetails,
    itemDetails,
    onSuccess,
    onError,
    onPending,
    className = ''
}) => {
    const [selectedMethod, setSelectedMethod] = useState<string>('credit_card');
    const [isLoading, setIsLoading] = useState(false);
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);

    // Load Midtrans Snap script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', 'SB-Mid-client-hnw3QaclflueMkZ4z');
        script.async = true;
        script.onload = () => {
            console.log('Midtrans Snap script loaded successfully');
            setIsScriptLoaded(true);
        };
        script.onerror = () => {
            console.error('Failed to load Midtrans Snap script');
        };
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(amount);
    };

    const paymentMethods = [
        {
            id: 'credit_card',
            name: 'Credit Card',
            icon: CreditCard,
            description: 'Visa, Mastercard, JCB, Amex',
            color: 'text-blue-600'
        },
        {
            id: 'bank_transfer',
            name: 'Bank Transfer',
            icon: Building,
            description: 'BCA, BNI, BRI, Mandiri, Permata',
            color: 'text-green-600'
        },
        {
            id: 'ewallet',
            name: 'E-Wallet',
            icon: Smartphone,
            description: 'GoPay, OVO, DANA, ShopeePay',
            color: 'text-purple-600'
        },
        {
            id: 'qris',
            name: 'QRIS',
            icon: QrCode,
            description: 'Scan QR with any e-wallet',
            color: 'text-orange-600'
        }
    ];

    const handlePayment = async () => {
        console.log('Payment button clicked');
        console.log('Script loaded:', isScriptLoaded);
        console.log('Selected method:', selectedMethod);
        
        if (!isScriptLoaded) {
            alert('Payment gateway sedang dimuat. Silakan tunggu...');
            return;
        }

        setIsLoading(true);
        
        try {
            const orderId = `TRAVEL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            console.log('Generated order ID:', orderId);
            
            // Create payment data for Midtrans Snap
            const snapData = {
                transaction_details: {
                    order_id: orderId,
                    gross_amount: amount
                },
                customer_details: customerDetails,
                item_details: itemDetails,
                credit_card: {
                    secure: true,
                    bank: '',
                    installment: false
                },
                callbacks: {
                    finish: `${window.location.origin}/shop/payment/payment-success`,
                    error: `${window.location.origin}/shop/payment/error`,
                    pending: `${window.location.origin}/shop/payment/pending`
                }
            };
            
            console.log('Snap data:', snapData);

            // Use Midtrans Snap with all payment options
            if (typeof window !== 'undefined' && (window as any).snap) {
                console.log('Opening Midtrans Snap with all payment options');
                
                (window as any).snap.pay(snapData, {
                    onSuccess: (result: any) => {
                        console.log('Payment success:', result);
                        onSuccess?.(result);
                        setIsLoading(false);
                    },
                    onPending: (result: any) => {
                        console.log('Payment pending:', result);
                        onPending?.(result);
                        setIsLoading(false);
                    },
                    onError: (result: any) => {
                        console.error('Payment error:', result);
                        onError?.(new Error(result.message || 'Payment failed'));
                        setIsLoading(false);
                    },
                    onClose: () => {
                        console.log('Payment popup closed');
                        setIsLoading(false);
                    }
                });
            } else {
                console.error('Midtrans snap not available');
                onError?.(new Error('Midtrans snap not available'));
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Payment error:', error);
            onError?.(error as Error);
            setIsLoading(false);
        }
    };

    return (
        <div className={`midtrans-payment-options ${className}`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {/* Header */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Pilih Metode Pembayaran</h3>
                    <p className="text-sm text-gray-600">Total pembayaran: <span className="font-semibold text-blue-600">{formatRupiah(amount)}</span></p>
                </div>

                {/* Payment Methods */}
                <div className="space-y-3 mb-6">
                    {paymentMethods.map((method) => (
                        <div
                            key={method.id}
                            className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                                selectedMethod === method.id
                                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedMethod(method.id)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-lg ${method.color.replace('text', 'bg').replace('600', '100')}`}>
                                        <method.icon className={`h-5 w-5 ${method.color}`} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{method.name}</p>
                                        <p className="text-xs text-gray-500">{method.description}</p>
                                    </div>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                    selectedMethod === method.id
                                        ? 'border-blue-500 bg-blue-500'
                                        : 'border-gray-300 bg-white'
                                }`}>
                                    {selectedMethod === method.id && (
                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Action Button */}
                <button
                    onClick={handlePayment}
                    disabled={isLoading || !isScriptLoaded}
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                        isLoading || !isScriptLoaded
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl'
                    }`}
                >
                    {isLoading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Memproses pembayaran...</span>
                        </>
                    ) : (
                        <>
                            <span>Bayar dengan {paymentMethods.find(m => m.id === selectedMethod)?.name}</span>
                            <span className="text-sm opacity-90">{formatRupiah(amount)}</span>
                        </>
                    )}
                </button>

                {/* Security Note */}
                <div className="mt-4 text-center text-xs text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                        <span className="text-green-600">🔒</span>
                        <span>Pembayaran aman dan terenkripsi - Dilindungi oleh Midtrans</span>
                    </div>
                </div>

                {/* Terms */}
                <div className="mt-4 text-center">
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                        Dengan menekan tombol ini, Anda setuju dengan
                        <span className="text-blue-500 hover:text-blue-600 cursor-pointer"> Syarat & Ketentuan Layanan</span> dan
                        <span className="text-blue-500 hover:text-blue-600 cursor-pointer"> Ketentuan Pembayaran</span>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MidtransPaymentOptions;
