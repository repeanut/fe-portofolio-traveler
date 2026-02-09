import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavbarShop from '../../components/ui/navbarShop';
import FooterSection from '../../components/ui/footer';
import { Clock, ArrowLeft } from 'lucide-react';

interface PaymentPendingState {
    subtotal: number;
    serviceFee: number;
    total: number;
    itemTitle: string;
    orderPackageTitle: string;
    deliveryLabel: string;
    quantity: number;
    paymentMethodLabel: string;
    paymentId?: string;
}

const PaymentPendingPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as PaymentPendingState;

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(amount);
    };

    if (!state) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Information Not Found</h1>
                    <button
                        onClick={() => navigate('/shop')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Back to Shop
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <NavbarShop />

            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                        {/* Pending Icon */}
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock className="w-8 h-8 text-yellow-600" />
                        </div>

                        {/* Status Message */}
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Payment Pending
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Your payment is being processed. Please complete the payment using your selected method.
                        </p>

                        {/* Payment Details */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                            <h3 className="font-semibold text-gray-900 mb-3">Order Details</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Item:</span>
                                    <span className="font-medium">{state.itemTitle}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Package:</span>
                                    <span className="font-medium">{state.orderPackageTitle}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Quantity:</span>
                                    <span className="font-medium">{state.quantity}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Delivery:</span>
                                    <span className="font-medium">{state.deliveryLabel}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Payment Method:</span>
                                    <span className="font-medium">{state.paymentMethodLabel}</span>
                                </div>
                                {state.paymentId && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Transaction ID:</span>
                                        <span className="font-medium text-xs">{state.paymentId}</span>
                                    </div>
                                )}
                                <div className="border-t pt-2 mt-2">
                                    <div className="flex justify-between font-semibold">
                                        <span>Total Amount:</span>
                                        <span className="text-blue-600">{formatRupiah(state.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <h4 className="font-semibold text-blue-900 mb-2">Next Steps:</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Complete payment using your selected method</li>
                                <li>• Payment confirmation will be sent to your email</li>
                                <li>• Order will be processed after payment is confirmed</li>
                                <li>• This page will update automatically</li>
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                Check Payment Status
                            </button>
                            <button
                                onClick={() => navigate('/shop')}
                                className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Back to Shop</span>
                            </button>
                        </div>

                        {/* Help Text */}
                        <p className="text-xs text-gray-500 mt-6">
                            If you have any questions about your payment, please contact our support team.
                        </p>
                    </div>
                </div>
            </main>

            <FooterSection />
        </div>
    );
};

export default PaymentPendingPage;
