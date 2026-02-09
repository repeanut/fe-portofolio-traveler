import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Clock, RefreshCw, ArrowLeft } from 'lucide-react';
import paymentService from '../../services/payment.service';

interface PaymentDetails {
  order_id: string;
  transaction_id: string;
  status: string;
  amount: number;
  payment_type: string;
  va_number?: string;
  bill_key?: string;
  biller_code?: string;
  qr_code?: string;
  transaction_time: string;
  expiry_time?: string;
}

const PaymentPendingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>('');

  const orderId = searchParams.get('order_id');

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!orderId) {
        setIsLoading(false);
        return;
      }

      try {
        const details = await paymentService.checkMidtransPaymentStatus(orderId);
        if (details.status === 'pending' || details.status === 'authorize') {
          setPaymentDetails(details.payment as PaymentDetails);
        } else if (details.status === 'settlement') {
          // Payment completed, redirect to success page
          navigate(`/payment/success?order_id=${orderId}`);
        } else {
          // Payment failed, redirect to error page
          navigate(`/payment/error?order_id=${orderId}`);
        }
      } catch (err) {
        console.error('Payment details error:', err);
        setIsLoading(false);
      }
    };

    fetchPaymentDetails();

    // Set up polling to check payment status
    const interval = setInterval(async () => {
      try {
        const details = await paymentService.checkMidtransPaymentStatus(orderId!);
        if (details.status === 'settlement') {
          clearInterval(interval);
          navigate(`/payment/success?order_id=${orderId}`);
        } else if (details.status === 'deny' || details.status === 'expire' || details.status === 'cancel') {
          clearInterval(interval);
          navigate(`/payment/error?order_id=${orderId}`);
        }
      } catch (err) {
        console.error('Payment status check error:', err);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [orderId, navigate]);

  useEffect(() => {
    if (!paymentDetails?.expiry_time) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const expiry = new Date(paymentDetails.expiry_time!).getTime();
      const difference = expiry - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft('Expired');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [paymentDetails]);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRefreshStatus = async () => {
    if (!orderId) return;

    try {
      const details = await paymentService.checkMidtransPaymentStatus(orderId);
      if (details.status === 'settlement') {
        navigate(`/payment/success?order_id=${orderId}`);
      } else if (details.status === 'deny' || details.status === 'expire' || details.status === 'cancel') {
        navigate(`/payment/error?order_id=${orderId}`);
      } else {
        setPaymentDetails(details.payment as PaymentDetails);
      }
    } catch (err) {
      console.error('Refresh status error:', err);
    }
  };

  const getPaymentInstructions = () => {
    if (!paymentDetails) return null;

    const paymentType = paymentDetails.payment_type.toLowerCase();

    switch (paymentType) {
      case 'bank_transfer':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Bank Transfer Instructions</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="font-medium text-blue-800">Virtual Account Number:</p>
                  <p className="font-mono text-lg font-bold text-blue-900">{paymentDetails.va_number}</p>
                </div>
                <div>
                  <p className="font-medium text-blue-800">Amount:</p>
                  <p className="font-mono text-lg font-bold text-blue-900">{formatRupiah(paymentDetails.amount)}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-800 mb-2">How to Pay:</h5>
              <ol className="space-y-1 text-sm text-gray-600 list-decimal list-inside">
                <li>Open your banking app or visit nearest ATM</li>
                <li>Select transfer to virtual account</li>
                <li>Enter the virtual account number above</li>
                <li>Enter the exact amount shown</li>
                <li>Complete the transfer</li>
                <li>Keep the payment receipt for your records</li>
              </ol>
            </div>
          </div>
        );

      case 'echannel':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">BCA KlikPay Instructions</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="font-medium text-blue-800">Bill Key:</p>
                  <p className="font-mono text-lg font-bold text-blue-900">{paymentDetails.bill_key}</p>
                </div>
                <div>
                  <p className="font-medium text-blue-800">Biller Code:</p>
                  <p className="font-mono text-lg font-bold text-blue-900">{paymentDetails.biller_code}</p>
                </div>
                <div>
                  <p className="font-medium text-blue-800">Amount:</p>
                  <p className="font-mono text-lg font-bold text-blue-900">{formatRupiah(paymentDetails.amount)}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-800 mb-2">How to Pay:</h5>
              <ol className="space-y-1 text-sm text-gray-600 list-decimal list-inside">
                <li>Login to BCA internet banking</li>
                <li>Select "KlikPay" from the menu</li>
                <li>Enter Bill Key and Biller Code</li>
                <li>Confirm payment details</li>
                <li>Complete the payment</li>
              </ol>
            </div>
          </div>
        );

      case 'gopay':
      case 'shopeepay':
      case 'dana':
      case 'ovo':
        return (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">E-Wallet Instructions</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="font-medium text-green-800">Payment Method:</p>
                  <p className="font-bold text-green-900 capitalize">{paymentDetails.payment_type}</p>
                </div>
                <div>
                  <p className="font-medium text-green-800">Amount:</p>
                  <p className="font-mono text-lg font-bold text-green-900">{formatRupiah(paymentDetails.amount)}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-800 mb-2">How to Pay:</h5>
              <ol className="space-y-1 text-sm text-gray-600 list-decimal list-inside">
                <li>Open your {paymentDetails.payment_type.toUpperCase()} app</li>
                <li>Look for "Pay" or "Scan QR" option</li>
                <li>Scan the QR code or enter payment code</li>
                <li>Confirm payment details</li>
                <li>Enter your PIN to complete payment</li>
              </ol>
            </div>
          </div>
        );

      case 'qris':
        return (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">QRIS Payment Instructions</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="font-medium text-purple-800">Amount:</p>
                  <p className="font-mono text-lg font-bold text-purple-900">{formatRupiah(paymentDetails.amount)}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-800 mb-2">How to Pay:</h5>
              <ol className="space-y-1 text-sm text-gray-600 list-decimal list-inside">
                <li>Open any e-wallet app (GoPay, OVO, DANA, etc.)</li>
                <li>Select "Scan QR" option</li>
                <li>Scan the QR code shown</li>
                <li>Confirm payment details</li>
                <li>Complete the payment</li>
              </ol>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Payment Instructions</h4>
            <p className="text-gray-600">Please complete your payment using the selected payment method.</p>
            <p className="text-gray-600">We will automatically detect your payment and update the status.</p>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!paymentDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Details Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find your payment details.</p>
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
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Pending Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Pending</h1>
            <p className="text-gray-600">Complete your payment to confirm your booking</p>
          </div>

          {/* Payment Details */}
          <div className="border-t pt-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Order ID</p>
                <p className="font-mono text-sm font-medium">{paymentDetails.order_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
                <p className="font-mono text-sm font-medium">{paymentDetails.transaction_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Amount</p>
                <p className="text-lg font-semibold text-blue-600">{formatRupiah(paymentDetails.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                <p className="font-medium capitalize">{paymentDetails.payment_type?.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Transaction Time</p>
                <p className="font-medium">{formatDate(paymentDetails.transaction_time)}</p>
              </div>
              {timeLeft && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Time Remaining</p>
                  <p className="font-medium text-orange-600">{timeLeft}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Instructions */}
          {getPaymentInstructions()}

          {/* Action Buttons */}
          <div className="space-y-3 pt-6 border-t">
            <button
              onClick={handleRefreshStatus}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Check Payment Status</span>
            </button>

            <button
              onClick={() => navigate('/shop')}
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Shop</span>
            </button>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">Important Notes</h3>
          <ul className="space-y-2 text-yellow-800">
            <li className="flex items-start">
              <span className="text-yellow-600 mr-2">•</span>
              <span>Payment will be automatically detected within 5-10 minutes</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-600 mr-2">•</span>
              <span>Make sure to pay the exact amount to avoid payment issues</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-600 mr-2">•</span>
              <span>Keep your payment receipt for future reference</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-600 mr-2">•</span>
              <span>This page will automatically refresh to check payment status</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentPendingPage;
