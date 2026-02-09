import React, { useState, useEffect } from 'react';
import { CreditCard, Smartphone, QrCode, ChevronDown } from 'lucide-react';

interface SimpleMidtransPaymentProps {
    amount: number;
    onSuccess?: (response: unknown) => void;
    onError?: (error: Error) => void;
    className?: string;
}

const SimpleMidtransPayment: React.FC<SimpleMidtransPaymentProps> = ({
    amount,
    onSuccess,
    onError,
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
        script.onload = () => setIsScriptLoaded(true);
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
            
            // Mock Midtrans popup behavior
            if (typeof window !== 'undefined' && (window as any).snap) {
                // Simulate payment success for testing
                setTimeout(() => {
                    const mockResult = {
                        transaction_id: `TX-${Date.now()}`,
                        order_id: orderId,
                        status_code: '200',
                        transaction_status: 'settlement',
                        gross_amount: amount.toString(),
                        payment_type: selectedMethod
                    };
                    
                    console.log('Mock payment success:', mockResult);
                    onSuccess?.(mockResult);
                    setIsLoading(false);
                }, 2000);
                
                // In real implementation, you would use:
                // (window as any).snap.pay(realToken, { ... });
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
        <div className={`simple-midtrans-payment ${className}`}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {/* Header */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Pilih Metode Pembayaran</h3>
                    <p className="text-sm text-gray-600">Total pembayaran: {formatRupiah(amount)}</p>
                </div>

                {/* Payment Methods */}
                <div className="space-y-3 mb-6">
                    {paymentMethods.map((method) => (
                        <div
                            key={method.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                selectedMethod === method.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedMethod(method.id)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <method.icon className={`h-5 w-5 ${method.color}`} />
                                    <div>
                                        <p className="font-medium text-gray-900">{method.name}</p>
                                        <p className="text-xs text-gray-500">{method.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className={`w-4 h-4 rounded-full border-2 ${
                                        selectedMethod === method.id
                                            ? 'border-blue-500 bg-blue-500'
                                            : 'border-gray-300 bg-white'
                                    }`}>
                                        {selectedMethod === method.id && (
                                            <div className="w-2 h-2 rounded-full bg-white"></div>
                                        )}
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Action Button */}
                <button
                    onClick={handlePayment}
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                    {isLoading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Memproses...</span>
                        </>
                    ) : (
                        <>
                            <span>Bayar dengan {paymentMethods.find(m => m.id === selectedMethod)?.name}</span>
                            <span className="text-sm">{formatRupiah(amount)}</span>
                        </>
                    )}
                </button>

                {/* Security Note */}
                <div className="mt-4 text-center text-xs text-gray-500">
                    <p>🔒 Pembayaran aman dan terenkripsi - Dilindungi oleh Midtrans</p>
                    <p className="mt-1 text-orange-600">🧪 Mode Testing - Pembayaran tidak nyata</p>
                </div>

                {/* Terms */}
                <div className="mt-4 text-center">
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                        Dengan menekan tombol ini, Anda setuju dengan
                        <span className="text-blue-500"> Syarat & Ketentuan Layanan</span> dan
                        <span className="text-blue-500"> Ketentuan Pembayaran</span>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SimpleMidtransPayment;
