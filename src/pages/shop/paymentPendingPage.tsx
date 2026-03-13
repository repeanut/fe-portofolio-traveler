import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavbarShop from '../../components/ui/navbarShop';
import FooterSection from '../../components/ui/footer';
import { Clock, ArrowLeft, RefreshCw, MessageCircle } from 'lucide-react';

interface PaymentPendingState {
    subtotal: number;
    serviceFee: number;
    total: number;
    itemTitle: string;
    orderPackageTitle: string;
    deliveryLabel: string;
    quantity: number;
    paymentMethodLabel: string;
    transactionResult?: any;
}

const PaymentPendingPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as PaymentPendingState;

    if (!state) {
        return (
            <div className="min-h-screen flex flex-col bg-white">
                <NavbarShop />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
                        <button
                            onClick={() => navigate('/shop')}
                            className="text-blue-600 hover:text-blue-800 underline"
                        >
                            Return to Shop
                        </button>
                    </div>
                </main>
                <FooterSection />
            </div>
        );
    }

    const {
        subtotal,
        serviceFee,
        total,
        itemTitle,
        orderPackageTitle,
        deliveryLabel,
        quantity,
        paymentMethodLabel,
        transactionResult
    } = state;

    const handleCheckStatus = async () => {
        if (transactionResult?.order_id) {
            // In a real implementation, you would check the payment status
            // For now, we'll just navigate to a success page after a delay
            setTimeout(() => {
                navigate('/shop/payment/payment-success', {
                    state: {
                        ...state,
                        transactionResult: {
                            ...transactionResult,
                            transaction_status: 'capture',
                            settlement_time: new Date().toISOString()
                        }
                    }
                });
            }, 2000);
        }
    };

    const handleRetryPayment = () => {
        // Navigate back to payment page to retry
        navigate(-1);
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <NavbarShop />

            <main className="flex-1">
                <section className="mx-auto w-full max-w-2xl px-4 md:px-0 py-8 md:py-10">
                    {/* Pending Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                            <Clock className="w-8 h-8 text-yellow-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Pending</h1>
                        <p className="text-gray-600">Your payment is being processed. This may take a few minutes.</p>
                    </div>

                    {/* Order Details Card */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Order ID:</span>
                                <span className="font-medium text-gray-900">
                                    {transactionResult?.order_id || 'N/A'}
                                </span>
                            </div>
                            
                            <div className="flex justify-between">
                                <span className="text-gray-600">Status:</span>
                                <span className="font-medium text-yellow-600">Pending</span>
                            </div>
                            
                            <div className="border-t pt-4">
                                <h3 className="font-medium text-gray-900 mb-2">Service Details</h3>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="font-medium text-gray-900">{itemTitle}</p>
                                    <p className="text-sm text-gray-600">{orderPackageTitle}</p>
                                    <p className="text-sm text-gray-600">Quantity: {quantity}</p>
                                    <p className="text-sm text-gray-600">Delivery: {deliveryLabel}</p>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="font-medium text-gray-900 mb-2">Payment Summary</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Service Fee:</span>
                                        <span className="text-gray-900">${serviceFee.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-semibold pt-2 border-t">
                                        <span className="text-gray-900">Total Amount:</span>
                                        <span className="text-gray-900">${total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Payment Method:</span>
                                    <span className="text-gray-900">{paymentMethodLabel}</span>
                                </div>
                                <div className="flex justify-between text-sm mt-1">
                                    <span className="text-gray-600">Transaction Time:</span>
                                    <span className="text-gray-900">
                                        {transactionResult?.transaction_time 
                                            ? new Date(transactionResult.transaction_time).toLocaleString()
                                            : new Date().toLocaleString()
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Instructions */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-6">
                        <h2 className="text-lg font-semibold text-yellow-900 mb-3">Payment Instructions</h2>
                        <div className="space-y-3 text-yellow-800">
                            {paymentMethodLabel.toLowerCase().includes('bank') && (
                                <div>
                                    <p className="font-medium mb-2">For Bank Transfer:</p>
                                    <ol className="space-y-1 text-sm">
                                        <li>• Complete the transfer using the virtual account number provided</li>
                                        <li>• Keep your payment confirmation receipt</li>
                                        <li>• Payment will be automatically confirmed within 1-2 hours</li>
                                    </ol>
                                </div>
                            )}
                            
                            {paymentMethodLabel.toLowerCase().includes('ewallet') && (
                                <div>
                                    <p className="font-medium mb-2">For E-Wallet Payment:</p>
                                    <ol className="space-y-1 text-sm">
                                        <li>• Open your e-wallet app (GoPay, ShopeePay, etc.)</li>
                                        <li>• Scan the QR code or click the payment link</li>
                                        <li>• Complete the payment in your e-wallet app</li>
                                        <li>• Payment will be confirmed instantly</li>
                                    </ol>
                                </div>
                            )}
                            
                            {paymentMethodLabel.toLowerCase().includes('retail') && (
                                <div>
                                    <p className="font-medium mb-2">For Retail Payment:</p>
                                    <ol className="space-y-1 text-sm">
                                        <li>• Visit the nearest store (Indomaret/Alfamart)</li>
                                        <li>• Show the payment code to the cashier</li>
                                        <li>• Pay with cash or other available methods</li>
                                        <li>• Keep your payment receipt</li>
                                    </ol>
                                </div>
                            )}
                            
                            <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                                <p className="text-sm font-medium">
                                    ⏱️ Payment will be automatically verified. You can also check the status manually.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={handleCheckStatus}
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Check Payment Status
                        </button>
                        
                        <button
                            onClick={() => navigate('/ai-chatbot')}
                            className="flex-1 flex items-center justify-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-700 transition-colors"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Contact Support
                        </button>
                        
                        <button
                            onClick={handleRetryPayment}
                            className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Retry Payment
                        </button>
                    </div>
                </section>
            </main>

            <FooterSection />
        </div>
    );
};

export default PaymentPendingPage;
