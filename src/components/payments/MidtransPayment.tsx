import React, { useEffect, useState } from 'react';
import { CreditCard, Smartphone, QrCode, Building, CheckCircle } from 'lucide-react';
import paymentService, { type MidtransPaymentRequest, type MidtransPaymentResponse } from '../../services/payment.service';

interface MidtransPaymentProps {
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
  onSuccess?: (response: MidtransPaymentResponse) => void;
  onError?: (error: Error) => void;
  onPending?: (response: MidtransPaymentResponse) => void;
  className?: string;
}

const MidtransPayment: React.FC<MidtransPaymentProps> = ({
  amount,
  customerDetails,
  itemDetails,
  onSuccess,
  onError,
  onPending,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    // Load Midtrans Snap script
    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-YOUR_CLIENT_KEY');
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Midtrans Snap script');
      onError?.(new Error('Failed to load payment gateway'));
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [onError]);

  const handlePayment = async () => {
    if (!isScriptLoaded) {
      onError?.(new Error('Payment gateway not ready'));
      return;
    }

    setIsLoading(true);

    try {
      const orderId = `TRAVEL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const paymentData: MidtransPaymentRequest = {
        amount,
        customerDetails,
        itemDetails,
        orderId,
        callbacks: {
          finish: `${window.location.origin}/payment/success`,
          error: `${window.location.origin}/payment/error`,
          pending: `${window.location.origin}/payment/pending`
        }
      };

      const response = await paymentService.createMidtransPayment(paymentData);
      
      if (response.token) {
        // Open Midtrans Snap popup
        (window as any).snap.pay(response.token, {
          onSuccess: (result: any) => {
            console.log('Payment success:', result);
            onSuccess?.({
              success: true,
              message: 'Payment successful',
              data: {
                token: response.token,
                redirect_url: response.redirect_url,
                transaction_id: response.transaction_id,
                order_id: response.order_id,
                status: response.status,
                amount: response.amount
              }
            });
          },
          onPending: (result: any) => {
            console.log('Payment pending:', result);
            onPending?.({
              success: true,
              message: 'Payment pending',
              data: {
                token: response.token,
                redirect_url: response.redirect_url,
                transaction_id: response.transaction_id,
                order_id: response.order_id,
                status: response.status,
                amount: response.amount
              }
            });
          },
          onError: (result: any) => {
            console.error('Payment error:', result);
            onError?.(new Error(result.message || 'Payment failed'));
          },
          onClose: () => {
            console.log('Payment popup closed');
            setIsLoading(false);
          }
        });
      } else {
        throw new Error('Failed to create payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  return (
    <div className={`midtrans-payment ${className}`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Total Payment Form */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total</h3>
            <p className="text-lg font-semibold text-gray-900">{formatRupiah(amount)}</p>
          </div>

          <button
            onClick={handlePayment}
            disabled={isLoading || !isScriptLoaded}
            className={`w-full rounded-full text-sm font-semibold py-2.5 shadow-sm transition-colors mb-4 ${
              isLoading || !isScriptLoaded
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-sky-500 hover:bg-sky-600 text-white'
            }`}
          >
            {isLoading ? 'Processing...' : 'Confirm & Pay'}
          </button>

          <p className="text-[11px] text-gray-500 leading-relaxed mb-3">
            By clicking the button, you agree to our
            <span className="text-sky-500"> Terms of Service</span> and
            <span className="text-sky-500"> Payment Terms</span>.
          </p>

          <div className="flex items-center gap-2 text-xs text-gray-700 border-t border-gray-200 pt-3 mb-3">
            <CheckCircle className="h-4 w-4 text-sky-500" />
            <span>Safe and secure payment</span>
          </div>

          <div className="border-t border-gray-200 pt-3 space-y-2 text-xs text-gray-600">
            <p className="font-semibold text-gray-900">Price summary</p>
            <div className="flex items-center justify-between">
              <span>Selected package</span>
              <span>{formatRupiah(amount - (amount * 0.15))}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Service fee</span>
              <span>{formatRupiah(Math.round(amount * 0.15))}</span>
            </div>
            <div className="mt-2 border-t border-gray-200 pt-2 flex items-center justify-between text-sm font-semibold text-gray-900">
              <span>Total</span>
              <span>{formatRupiah(amount)}</span>
            </div>
          </div>
        </div>

        
        {/* Customer Information */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Customer Information</h4>
          <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
            <div><span className="font-medium">Name:</span> {customerDetails.firstName} {customerDetails.lastName}</div>
            <div><span className="font-medium">Email:</span> {customerDetails.email}</div>
            {customerDetails.phone && <div><span className="font-medium">Phone:</span> {customerDetails.phone}</div>}
          </div>
        </div>

              </div>
    </div>
  );
};

export default MidtransPayment;
