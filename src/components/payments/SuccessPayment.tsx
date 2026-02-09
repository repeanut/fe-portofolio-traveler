import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

type SuccessState = {
  subtotal: number;
  serviceFee: number;
  total: number;
  itemTitle: string;
  orderPackageTitle: string;
  deliveryLabel?: string;
  quantity: number;
  paymentMethodLabel: string | null;
} | null;

const formatCurrency = (value: number) => `Rp ${value.toFixed(2)}`;

const SuccessPayment: React.FC = () => {
  const location = useLocation() as Location & { state: SuccessState };
  const navigate = useNavigate();
  const state = location.state;

  const subtotal = state?.subtotal ?? 0;
  const serviceFee = state?.serviceFee ?? 0;
  const total = state?.total ?? 0;
  const itemTitle = state?.itemTitle ?? 'Selected package';
  const orderPackageTitle = state?.orderPackageTitle ?? '';
  const deliveryLabel = state?.deliveryLabel ?? '';
  const quantity = state?.quantity ?? 1;
  const paymentMethodLabel = state?.paymentMethodLabel ?? '-';

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        <div className="mb-6 text-center text-xs font-medium text-slate-500">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Payment processed successfully</span>
          </div>
        </div>

        <div className="rounded-3xl bg-white shadow-lg border border-slate-200 px-4 sm:px-6 py-7 sm:py-8 space-y-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900">Payment Successful</h2>
            <p className="text-xs text-slate-500 max-w-sm">
              We’ve received your payment. Your transaction summary is shown below.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 space-y-2 text-xs max-w-full overflow-hidden">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <span className="text-slate-500">Package</span>
              <span className="font-medium text-slate-900 truncate max-w-[60%]" title={itemTitle}>
                {itemTitle}
              </span>
            </div>
            <div className="flex min-w-0 items-center justify-between gap-3">
              <span className="text-slate-500">Details</span>
              <div className="flex flex-wrap justify-end gap-1 max-w-[60%]">
                {orderPackageTitle && (
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    {orderPackageTitle}
                  </span>
                )}
                {deliveryLabel && (
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    {deliveryLabel}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                  {quantity} {quantity === 1 ? 'order' : 'orders'}
                </span>
              </div>
            </div>
            <div className="flex min-w-0 items-center justify-between gap-3">
              <span className="text-slate-500">Payment method</span>
              <span className="font-medium text-slate-900 truncate max-w-[60%]">
                {paymentMethodLabel}
              </span>
            </div>
            <div className="pt-2 mt-1 border-t border-slate-200 space-y-1">
              <div className="flex min-w-0 items-center justify-between gap-3">
                <span className="text-slate-500">Selected package</span>
                <span className="font-medium text-slate-900 shrink-0">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex min-w-0 items-center justify-between gap-3">
                <span className="text-slate-500">Service fee</span>
                <span className="font-medium text-slate-900 shrink-0">{formatCurrency(serviceFee)}</span>
              </div>
              <div className="flex min-w-0 items-center justify-between gap-3">
                <span className="text-slate-500">Total paid</span>
                <span className="text-base font-semibold text-slate-900 shrink-0">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-xs text-slate-500">
            <p className="pt-1 text-[11px] text-slate-500">
              If you don’t receive an email within a few minutes, please check your spam folder or contact us.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              className="w-full rounded-full bg-slate-900 text-white text-xs font-semibold py-2.5 hover:bg-slate-950 transition-colors"
            >
              View order details
            </button>
            <button
              type="button"
              onClick={() => navigate('/work/shop')}
              className="w-full rounded-full border border-slate-300 text-slate-700 text-xs font-semibold py-2.5 hover:bg-slate-50 transition-colors"
            >
              Back to shop
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SuccessPayment;

