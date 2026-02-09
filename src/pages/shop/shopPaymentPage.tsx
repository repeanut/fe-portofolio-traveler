import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavbarShop from '../../components/ui/navbarShop';
import FooterSection from '../../components/ui/footer';
import type { ShopItem } from '../../components/ui/shopCards';
import type { OrderPackage } from '../../components/order/sidebarOrder';
import OrderDetails from '../../components/payments/OrderDetails';
<<<<<<< Updated upstream
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
import MidtransPaymentOptions from '../../components/payments/MidtransPaymentOptions';
import InitialShimmer from '../../components/ui/InitialShimmer';
import { ShopPaymentPageSkeleton } from '../../components/ui/skeletons';
import paymentService from '../../services/payment.service';

interface PaymentLocationState {
    item?: ShopItem;
    orderPackage?: OrderPackage;
    quantity?: number;
}

const ShopPaymentPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);

    // Load Midtrans Snap script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-YOUR_CLIENT_KEY');
        script.async = true;
        script.onload = () => setIsScriptLoaded(true);
        script.onerror = () => {
            console.error('Failed to load Midtrans Snap script');
        };
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

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

    const handleMidtransSuccess = (response: any) => {
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
    };

    const handleMidtransError = (error: any) => {
        console.error('Midtrans payment error:', error);
        navigate('/shop/payment/payment-failed', {
            state: {
                subtotal,
                serviceFee,
                total,
                itemTitle: item.title,
                orderPackageTitle: orderPackage.title,
                deliveryLabel: orderPackage.deliveryLabel,
                quantity,
                paymentMethodLabel: 'Midtrans',
                paymentStatus: 'failed',
                error: error?.message || 'Payment failed'
            },
        });
    };

    const handleMidtransPending = (response: any) => {
        navigate('/shop/payment/payment-pending', {
            state: {
                subtotal,
                serviceFee,
                total,
                itemTitle: item.title,
                orderPackageTitle: orderPackage.title,
                deliveryLabel: orderPackage.deliveryLabel,
                quantity,
                paymentMethodLabel: 'Midtrans',
                paymentStatus: 'pending',
                transactionId: response.transaction_id,
                paymentId: response.data?.transaction_id
            },
        });
    };

    return (
        <InitialShimmer delayMs={850} skeleton={<ShopPaymentPageSkeleton />}>
            <div className="min-h-screen flex flex-col bg-white overflow-x-clip">
                <NavbarShop />

                <main className="flex-1">
                    <section className="mx-auto w-full max-w-6xl px-4 md:px-0 py-8 md:py-10">

<div className="flex flex-col lg:flex-row gap-5">
                            {/* Left Column: Order Details */}
                            <div className="w-full lg:w-1/2">
                                <OrderDetails
                                    item={item}
                                    orderPackage={orderPackage}
                                    quantity={quantity}
                                    subtotal={subtotal}
                                />
                            </div>

                            {/* Right Column: Midtrans Payment Options */}
                            <div className="w-full lg:w-1/2">
                                <MidtransPaymentOptions
                                    amount={total}
                                    customerDetails={{
                                        firstName: 'User',
                                        lastName: 'Name',
                                        email: 'user@example.com',
                                        phone: '+628123456789'
                                    }}
                                    itemDetails={[
                                        {
                                            id: String(item.id || 'item-1'),
                                            price: unitPrice,
                                            quantity: quantity,
                                            name: `${item.title} - ${orderPackage.title}`,
                                            category: 'travel-package'
                                        }
                                    ]}
                                    onSuccess={handleMidtransSuccess}
                                    onError={handleMidtransError}
                                    onPending={handleMidtransPending}
                                />
                            </div>
                        </div>
                    </section>
                </main>

                <FooterSection />
            </div>
        </InitialShimmer>
    );
};

export default ShopPaymentPage;
