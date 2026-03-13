import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavbarShop from '../../components/ui/navbarShop';
import FooterSection from '../../components/ui/footer';
import { XCircle, ArrowLeft, RefreshCw, MessageCircle, AlertTriangle } from 'lucide-react';

interface PaymentFailedState {
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

const PaymentFailedPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as PaymentFailedState;

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

    const handleRetryPayment = () => {
        // Navigate back to payment page to retry
        navigate(-1);
    };

    const getErrorMessage = () => {
        if (transactionResult?.status_message) {
            return transactionResult.status_message;
        }
        
        if (transactionResult?.error_messages) {
            return Array.isArray(transactionResult.error_messages) 
                ? transactionResult.error_messages.join(', ')
                : transactionResult.error_messages;
        }
        
        return 'The payment could not be processed. Please try again or use a different payment method.';
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <NavbarShop />

            <main className="flex-1">
                <section className="mx-auto w-full max-w-2xl px-4 md:px-0 py-8 md:py-10">
                    {/* Failed Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                            <XCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
                        <p className="text-gray-600">We couldn't process your payment. Please try again.</p>
                    </div>

                    {/* Error Details Card */}
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h2 className="text-lg font-semibold text-red-900 mb-2">Payment Error</h2>
                                <p className="text-red-800 text-sm">
                                    {getErrorMessage()}
                                </p>
                                
                                {transactionResult?.order_id && (
                                    <p className="text-red-700 text-sm mt-2">
                                        Order ID: {transactionResult.order_id}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Order Details Card */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
                        
                        <div className="space-y-4">
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
                                    <span className="text-gray-600">Attempt Time:</span>
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

                    {/* Troubleshooting Tips */}
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
                        <h2 className="text-lg font-semibold text-blue-900 mb-3">Troubleshooting Tips</h2>
                        <div className="space-y-3 text-blue-800">
                            <div className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-200 text-blue-900 rounded-full flex items-center justify-center text-sm font-semibold">1</span>
                                <div>
                                    <p className="font-medium">Check your payment details</p>
                                    <p className="text-sm">Ensure your card details, e-wallet balance, or bank account are valid.</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-200 text-blue-900 rounded-full flex items-center justify-center text-sm font-semibold">2</span>
                                <div>
                                    <p className="font-medium">Try a different payment method</p>
                                    <p className="text-sm">If one payment method fails, try another available option.</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-200 text-blue-900 rounded-full flex items-center justify-center text-sm font-semibold">3</span>
                                <div>
                                    <p className="font-medium">Check your internet connection</p>
                                    <p className="text-sm">A stable internet connection is required for payment processing.</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-200 text-blue-900 rounded-full flex items-center justify-center text-sm font-semibold">4</span>
                                <div>
                                    <p className="font-medium">Contact your bank</p>
                                    <p className="text-sm">Some banks may block transactions for security reasons.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={handleRetryPayment}
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Try Again
                        </button>
                        
                        <button
                            onClick={() => navigate('/ai-chatbot')}
                            className="flex-1 flex items-center justify-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-700 transition-colors"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Contact Support
                        </button>
                        
                        <button
                            onClick={() => navigate('/shop')}
                            className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back to Shop
                        </button>
                    </div>
                </section>
            </main>

            <FooterSection />
        </div>
    );
};

export default PaymentFailedPage;
