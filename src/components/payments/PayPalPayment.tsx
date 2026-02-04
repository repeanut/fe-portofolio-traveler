import React, { useEffect, useRef, useState } from 'react';

interface PayPalPaymentProps {
    amount: number;
    description: string;
    onSuccess: (paymentId: string) => void;
    onError: (error: string) => void;
    onCancel: () => void;
}

declare global {
    interface Window {
        paypal: any;
    }
}

const PayPalPayment: React.FC<PayPalPaymentProps> = ({
    amount,
    description,
    onSuccess,
    onError,
    onCancel
}) => {
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const [isPayPalReady, setIsPayPalReady] = useState(false);
    const paypalContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Check if PayPal script is already loaded
        if (window.paypal) {
            setIsScriptLoaded(true);
            setIsPayPalReady(true);
            renderPayPalButtons();
        } else {
            // Wait for PayPal script to load
            const checkPayPal = setInterval(() => {
                if (window.paypal) {
                    setIsScriptLoaded(true);
                    setIsPayPalReady(true);
                    renderPayPalButtons();
                    clearInterval(checkPayPal);
                }
            }, 100);

            // Timeout after 10 seconds
            setTimeout(() => {
                clearInterval(checkPayPal);
                if (!window.paypal) {
                    onError('PayPal SDK failed to load. Please refresh the page.');
                }
            }, 10000);

            return () => clearInterval(checkPayPal);
        }
    }, [amount]);

    const renderPayPalButtons = () => {
        if (!window.paypal || !paypalContainerRef.current) return;

        // Clear any existing buttons
        paypalContainerRef.current.innerHTML = '';

        window.paypal.Buttons({
            // Style configuration
            style: {
                layout: 'vertical',
                color: 'gold',
                shape: 'rect',
                label: 'paypal'
            },

            // Create order
            createOrder: (data: any, actions: any) => {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: amount.toFixed(2),
                            currency_code: 'USD'
                        },
                        description: description
                    }]
                });
            },

            // Approve order
            onApprove: async (data: any, actions: any) => {
                try {
                    const order = await actions.order.capture();
                    
                    // Extract payment ID from the order
                    const paymentId = order.id || data.orderID;
                    
                    // Call success callback
                    onSuccess(paymentId);
                } catch (error) {
                    console.error('PayPal approval error:', error);
                    onError('Payment approval failed. Please try again.');
                }
            },

            // Handle errors
            onError: (err: any) => {
                console.error('PayPal error:', err);
                onError('PayPal payment failed. Please try again.');
            },

            // Handle cancellation
            onCancel: () => {
                onCancel();
            }
        }).render(paypalContainerRef.current);
    };

    if (!isScriptLoaded) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-sm text-gray-600">Loading PayPal...</span>
            </div>
        );
    }

    if (!isPayPalReady) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-sm text-red-600">
                    PayPal is not available. Please try another payment method.
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                    Pay with PayPal - Secure and fast payment
                </p>
            </div>
            <div 
                ref={paypalContainerRef}
                className="paypal-buttons-container"
                style={{ minHeight: '45px' }}
            />
            <div className="text-xs text-gray-500 text-center">
                By clicking PayPal buttons, you agree to PayPal's terms and conditions
            </div>
        </div>
    );
};

export default PayPalPayment;
