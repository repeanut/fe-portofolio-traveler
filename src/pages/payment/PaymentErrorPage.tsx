import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { XCircle, RefreshCw, ArrowLeft, HeadphonesIcon } from 'lucide-react';
import paymentService from '../../services/payment.service';

interface PaymentError {
  order_id: string;
  status: string;
  error_message?: string;
}

const PaymentErrorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentError, setPaymentError] = useState<PaymentError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const orderId = searchParams.get('order_id');
  const errorMessage = searchParams.get('error');

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      if (!orderId) {
        setIsLoading(false);
        return;
      }

      try {
        const status = await paymentService.checkMidtransPaymentStatus(orderId);
        setPaymentError({
          order_id: orderId,
          status: status.status,
          error_message: errorMessage || undefined
        });
      } catch (err) {
        console.error('Payment status check error:', err);
        setPaymentError({
          order_id: orderId,
          status: 'unknown',
          error_message: errorMessage || 'Failed to check payment status'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentStatus();
  }, [orderId, errorMessage]);

  const handleRetryPayment = async () => {
    if (!orderId) return;

    setIsLoading(true);
    setRetryCount(prev => prev + 1);

    try {
      // Check if payment is still pending
      const status = await paymentService.checkMidtransPaymentStatus(orderId);
      
      if (status.status === 'pending') {
        // Navigate back to payment page with retry
        navigate(`/shop/payment?order_id=${orderId}&retry=true`);
      } else if (status.status === 'settlement') {
        // Payment actually succeeded, redirect to success page
        navigate(`/payment/success?order_id=${orderId}`);
      } else {
        // Payment failed or expired
        setPaymentError({
          order_id: orderId,
          status: status.status,
          error_message: `Payment ${status.status}. Please try again.`
        });
      }
    } catch (err) {
      console.error('Retry payment error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactSupport = () => {
    // Implement contact support functionality
    const subject = encodeURIComponent(`Payment Issue - Order ${orderId}`);
    const body = encodeURIComponent(`I'm having trouble with my payment for order ${orderId}. Please assist me.`);
    window.open(`mailto:support@travello.com?subject=${subject}&body=${body}`);
  };

  const getErrorMessage = () => {
    if (errorMessage) return decodeURIComponent(errorMessage);
    if (paymentError?.error_message) return paymentError.error_message;
    
    switch (paymentError?.status) {
      case 'deny':
        return 'Payment was denied by the bank or payment provider';
      case 'expire':
        return 'Payment has expired. Please try again.';
      case 'cancel':
        return 'Payment was cancelled.';
      case 'unknown':
        return 'Unable to determine payment status. Please contact support.';
      default:
        return 'Payment failed. Please try again or contact support.';
    }
  };

  const getErrorIcon = () => {
    switch (paymentError?.status) {
      case 'expire':
        return <XCircle className="h-16 w-16 text-orange-600" />;
      case 'cancel':
        return <XCircle className="h-16 w-16 text-gray-600" />;
      default:
        return <XCircle className="h-16 w-16 text-red-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking payment status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Error Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
              {getErrorIcon()}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
            <p className="text-gray-600">We couldn't process your payment</p>
          </div>

          {/* Error Details */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="space-y-2">
              {orderId && (
                <div>
                  <p className="text-sm text-red-600 font-medium">Order ID</p>
                  <p className="font-mono text-sm text-gray-800">{orderId}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-red-600 font-medium">Error Message</p>
                <p className="text-gray-800">{getErrorMessage()}</p>
              </div>
              {paymentError?.status && (
                <div>
                  <p className="text-sm text-red-600 font-medium">Payment Status</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {paymentError.status}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {paymentError?.status === 'pending' && retryCount < 3 && (
              <button
                onClick={handleRetryPayment}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Retry Payment</span>
              </button>
            )}

            <button
              onClick={handleContactSupport}
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <HeadphonesIcon className="h-4 w-4" />
              <span>Contact Support</span>
            </button>

            <button
              onClick={() => navigate('/shop')}
              className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Shop</span>
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">What You Can Do</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Check if your payment method has sufficient funds</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Ensure your internet connection is stable</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Try a different payment method</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Contact our support team if the problem persists</span>
            </li>
          </ul>
        </div>

        {/* Common Issues */}
        <div className="bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Common Payment Issues</h3>
          <div className="space-y-3 text-sm">
            <div className="bg-white rounded p-3">
              <h4 className="font-medium text-gray-800 mb-1">Insufficient Funds</h4>
              <p className="text-gray-600">Check your account balance or credit limit</p>
            </div>
            <div className="bg-white rounded p-3">
              <h4 className="font-medium text-gray-800 mb-1">Card Declined</h4>
              <p className="text-gray-600">Contact your bank or try a different card</p>
            </div>
            <div className="bg-white rounded p-3">
              <h4 className="font-medium text-gray-800 mb-1">Network Timeout</h4>
              <p className="text-gray-600">Check your connection and try again</p>
            </div>
            <div className="bg-white rounded p-3">
              <h4 className="font-medium text-gray-800 mb-1">Payment Expired</h4>
              <p className="text-gray-600">Start a new payment transaction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentErrorPage;
