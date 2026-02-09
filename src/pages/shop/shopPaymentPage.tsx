import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavbarShop from '../../components/ui/navbarShop';
import FooterSection from '../../components/ui/footer';
import type { ShopItem } from '../../components/ui/shopCards';
import type { OrderPackage } from '../../components/order/sidebarOrder';
import OrderDetails from '../../components/payments/OrderDetails';
import TotalPayment from '../../components/payments/TotalPayment';
import InitialShimmer from '../../components/ui/InitialShimmer';
import { ShopPaymentPageSkeleton } from '../../components/ui/skeletons';
import paymentService from '../../services/payment.service';
import type { PaymentRequest } from '../../services/payment.service';

declare global {
    interface Window {
        snap?: {
            pay: (
                token: string,
                options?: {
                    onSuccess?: (result: unknown) => void;
                    onPending?: (result: unknown) => void;
                    onError?: (result: unknown) => void;
                    onClose?: () => void;
                },
            ) => void;
        };
    }
}

interface PaymentLocationState {
    item?: ShopItem;
    orderPackage?: OrderPackage;
    quantity?: number;
}

const ShopPaymentPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = (location.state as PaymentLocationState | null) ?? null;

    const fallbackItem: ShopItem = {
        id: state?.item?.id ?? 0,
        title:
            state?.item?.title ?? 'I will be SEO content writer for article writing or blog writing',
        imageSrc: state?.item?.imageSrc ?? '/bg-shopCards.jpg',
        price: state?.item?.price ?? '$20',
        deliveryTime: state?.item?.deliveryTime ?? '1-day delivery',
    };

    const fallbackPackage: OrderPackage = {
        id: state?.orderPackage?.id ?? 'standard',
        title: state?.orderPackage?.title ?? 'Standard',
        price: state?.orderPackage?.price ?? 20,
        shortDescription:
            state?.orderPackage?.shortDescription ??
            'SEO-friendly content package for your article or blog writing needs.',
        packageLabel: state?.orderPackage?.packageLabel ?? 'Standard package',
        deliveryLabel: state?.orderPackage?.deliveryLabel ?? fallbackItem.deliveryTime,
    };

    const item = state?.item ?? fallbackItem;
    const orderPackage = state?.orderPackage ?? fallbackPackage;
    const [quantity] = useState<number>(state?.quantity && state.quantity > 0 ? state.quantity : 1);
    const [isProcessing, setIsProcessing] = useState(false);

    const unitPrice = orderPackage.price;
    const subtotal = useMemo(() => unitPrice * quantity, [unitPrice, quantity]);

    const serviceFee = useMemo(() => {
        if (!subtotal) return 0;
        return Math.max(3.25, Math.round(subtotal * 0.15 * 100) / 100);
    }, [subtotal]);

    const total = subtotal + serviceFee;

    const handlePayment = async () => {
        setIsProcessing(true);
        try {
            const paymentRequest: PaymentRequest = {
                method: 'midtrans',
                amount: total,
                currency: 'USD',
                description: `${item.title} - ${orderPackage.title}`,
                customerInfo: {
                    email: 'user@example.com',
                },
            };

            const response = await paymentService.processPayment(paymentRequest);

            if (!response.success) {
                alert('Payment failed: ' + response.message);
                return;
            }

            const maybeGateway = response.data?.gatewayResponse as
                | { token?: unknown; snapToken?: unknown }
                | undefined;

            const snapTokenRaw = maybeGateway?.snapToken ?? maybeGateway?.token;
            const snapToken = typeof snapTokenRaw === 'string' ? snapTokenRaw : null;

            if (!snapToken || typeof window === 'undefined' || !window.snap?.pay) {
                alert('Midtrans is not ready yet. Please try again later.');
                return;
            }

            window.snap.pay(snapToken, {
                onSuccess: () => {
                    navigate('/shop/payment/payment-success', {
                        state: {
                            subtotal,
                            serviceFee,
                            total,
                            itemTitle: item.title,
                            orderPackageTitle: orderPackage.title,
                            deliveryLabel: orderPackage.deliveryLabel,
                            quantity,
                            paymentMethodLabel: 'Midtrans',
                        },
                    });
                },
                onPending: () => {
                    // Pending state handled by Midtrans UI.
                },
                onError: () => {
                    alert('Payment failed. Please try again.');
                },
                onClose: () => {
                    // User closed the popup.
                },
            });
        } catch (error: unknown) {
            console.error('Payment error:', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            alert('An error occurred while processing the payment: ' + message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <InitialShimmer delayMs={850} skeleton={<ShopPaymentPageSkeleton />}>
            <div className="min-h-screen flex flex-col bg-white overflow-x-clip">
                <NavbarShop />

                <main className="flex-1">
                    <section className="mx-auto w-full max-w-6xl px-4 md:px-0 py-8 md:py-10">

                        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start max-w-full">
                            <div className="space-y-6 min-w-0 w-full">
                                <OrderDetails
                                    item={item}
                                    orderPackage={orderPackage}
                                    quantity={quantity}
                                    subtotal={subtotal}
                                />

                                <section className="rounded-3xl border border-gray-200 bg-white shadow-sm p-4 sm:p-5">
                                    <h2 className="text-sm font-semibold text-gray-900">What happens next</h2>
                                    <ol className="mt-3 space-y-2 text-xs text-gray-600">
                                        <li className="flex gap-2">
                                            <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-50 text-sky-700 text-[11px] font-semibold">1</span>
                                            <span>Click <span className="font-semibold text-gray-900">Confirm & Pay</span> to open the Midtrans popup.</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-50 text-sky-700 text-[11px] font-semibold">2</span>
                                            <span>Choose your payment method inside Midtrans and complete the payment.</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-50 text-sky-700 text-[11px] font-semibold">3</span>
                                            <span>After success, you’ll see the payment success page and your order is confirmed.</span>
                                        </li>
                                    </ol>
                                </section>

                                <section className="rounded-3xl border border-gray-200 bg-white shadow-sm p-4 sm:p-5">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                        <div className="min-w-0">
                                            <h2 className="text-sm font-semibold text-gray-900">Need help?</h2>
                                            <p className="mt-1 text-xs text-gray-600">
                                                If you have questions about your order or payment, chat with our admin.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => navigate('/ai-chatbot')}
                                            className="w-full sm:w-auto shrink-0 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Chat admin
                                        </button>
                                    </div>
                                    <div className="mt-3 rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3 text-[11px] text-gray-600">
                                        Payment updates will also appear in your notifications.
                                    </div>
                                </section>
                            </div>

                            <aside className="space-y-4 lg:sticky lg:top-24 min-w-0 w-full">
                                <TotalPayment
                                    subtotal={subtotal}
                                    serviceFee={serviceFee}
                                    total={total}
                                    itemTitle={item.title}
                                    orderPackageTitle={orderPackage.title}
                                    deliveryLabel={orderPackage.deliveryLabel}
                                    quantity={quantity}
                                    paymentMethodLabel={'Midtrans'}
                                    onPayment={handlePayment}
                                    isProcessing={isProcessing}
                                    canPay
                                />
                            </aside>
                        </div>
                    </section>
                </main>

                <FooterSection />
            </div>
        </InitialShimmer>
    );
};

export default ShopPaymentPage;
