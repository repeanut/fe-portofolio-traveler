import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavbarShop from '../../components/ui/navbarShop';
import FooterSection from '../../components/ui/footer';
import { CheckCircle, ArrowLeft, Download, MessageCircle } from 'lucide-react';

interface PaymentSuccessState {
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

const PaymentSuccessPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as PaymentSuccessState;

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

    const handleDownloadInvoice = () => {
        // Generate invoice download
        const invoiceData = {
            orderId: transactionResult?.order_id || 'N/A',
            itemTitle,
            orderPackageTitle,
            quantity,
            unitPrice: subtotal / quantity,
            subtotal,
            serviceFee,
            total,
            paymentMethod: paymentMethodLabel,
            transactionTime: transactionResult?.transaction_time || new Date().toISOString(),
            status: 'SUCCESS'
        };

        const invoiceContent = `
ORDER INVOICE
================

Order ID: ${invoiceData.orderId}
Date: ${new Date(invoiceData.transactionTime).toLocaleString()}
Status: ${invoiceData.status}

ITEM DETAILS:
${invoiceData.itemTitle} - ${invoiceData.orderPackageTitle}
Quantity: ${invoiceData.quantity}
Unit Price: $${invoiceData.unitPrice.toFixed(2)}
Delivery: ${deliveryLabel}

PAYMENT SUMMARY:
Subtotal: $${invoiceData.subtotal.toFixed(2)}
Service Fee: $${invoiceData.serviceFee.toFixed(2)}
Total: $${invoiceData.total.toFixed(2)}
Payment Method: ${invoiceData.paymentMethod}

Thank you for your purchase!
        `.trim();

        const blob = new Blob([invoiceContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoiceData.orderId}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <NavbarShop />

            <main className="flex-1">
                <section className="mx-auto w-full max-w-2xl px-4 md:px-0 py-8 md:py-10">
                    {/* Success Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                        <p className="text-gray-600">Your order has been confirmed and payment received.</p>
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
                                        <span className="text-gray-900">Total Paid:</span>
                                        <span className="text-green-600">${total.toFixed(2)}</span>
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

                    {/* Next Steps */}
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
                        <h2 className="text-lg font-semibold text-blue-900 mb-3">What happens next?</h2>
                        <ol className="space-y-3 text-blue-800">
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-200 text-blue-900 rounded-full flex items-center justify-center text-sm font-semibold">1</span>
                                <span>You'll receive a confirmation email with your order details.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-200 text-blue-900 rounded-full flex items-center justify-center text-sm font-semibold">2</span>
                                <span>The service provider will contact you within 24 hours.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-200 text-blue-900 rounded-full flex items-center justify-center text-sm font-semibold">3</span>
                                <span>Your service will be delivered according to the specified timeframe.</span>
                            </li>
                        </ol>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={handleDownloadInvoice}
                            className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
                        >
                            <Download className="w-5 h-5" />
                            Download Invoice
                        </button>
                        
                        <button
                            onClick={() => navigate('/ai-chatbot')}
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
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

export default PaymentSuccessPage;
