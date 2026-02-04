import React, { useState } from 'react';
import { CreditCard, Smartphone, QrCode, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import PayPalPayment from './PayPalPayment';
import QRCodeDisplay from './QRCodeDisplay';

interface PaymentMethodsProps {
	onPaymentMethodChange?: (methodLabel: string | null) => void;
	onPaymentDataChange?: (paymentData: any) => void;
	onPayPalPayment?: (paymentId: string) => void;
	amount?: number;
	description?: string;
}

interface CardDetails {
	cardNumber: string;
	expiryDate: string;
	securityCode: string;
	cardholderName: string;
	nameOnCard: string;
	saveCard: boolean;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({ 
    onPaymentMethodChange, 
    onPaymentDataChange,
    onPayPalPayment,
    amount = 0,
    description = ''
}) => {
    const [activeMethod, setActiveMethod] = useState<'card' | 'ewallet' | 'paypal'>('paypal');
    const [selectedCard, setSelectedCard] = useState<'bri' | 'bca' | null>(null);
    const [selectedWallet, setSelectedWallet] = useState<'gopay' | 'qris' | null>(null);
    const [cardDetails, setCardDetails] = useState<CardDetails>({
        cardNumber: '',
        expiryDate: '',
        securityCode: '',
        cardholderName: '',
        nameOnCard: '',
        saveCard: false
    });

    const handlePayPalSuccess = (paymentId: string) => {
        if (onPayPalPayment) {
            onPayPalPayment(paymentId);
        }
    };

    const handlePayPalError = (error: string) => {
        alert('PayPal payment error: ' + error);
    };

    const handlePayPalCancel = () => {
        // Handle PayPal cancellation if needed
        console.log('PayPal payment cancelled');
    };

    const validateCardDetails = () => {
        if (!selectedCard) return false;
        if (!cardDetails.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) return false;
        if (!cardDetails.expiryDate.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) return false;
        if (!cardDetails.securityCode.match(/^\d{3,4}$/)) return false;
        if (!cardDetails.cardholderName.trim()) return false;
        if (!cardDetails.nameOnCard.trim()) return false;
        return true;
    };

    const handleCardDetailChange = (field: keyof CardDetails, value: string | boolean) => {
        const updatedDetails = { ...cardDetails, [field]: value };
        setCardDetails(updatedDetails);
        
        if (onPaymentDataChange) {
            onPaymentDataChange({
                method: selectedCard,
                cardDetails: updatedDetails,
                isValid: validateCardDetails()
            });
        }
    };

    return (
        <section>
            <div className="mb-4">
                <h2 className="mb-2 text-lg font-semibold text-gray-900">Payment methods</h2>
                <p className="text-sm text-gray-600">Choose your preferred payment method</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                    {/* Payment Method Tabs */}
                    <div className="flex lg:flex-col border-b lg:border-b-0 lg:border-r border-gray-200">
                        <button
                            type="button"
                            onClick={() => {
                                setActiveMethod('paypal');
                                setSelectedCard(null);
                                setSelectedWallet(null);
                                onPaymentMethodChange?.('PayPal');
                                if (onPaymentDataChange) {
                                    onPaymentDataChange({
                                        method: 'paypal',
                                        isValid: true
                                    });
                                }
                            }}
                            className={`flex items-center gap-3 px-6 py-4 text-left transition-colors border-b border-gray-100 ${
                                activeMethod === 'paypal' 
                                    ? 'bg-blue-50 text-blue-700 border-l-4 border-l-blue-600' 
                                    : 'hover:bg-gray-50 text-gray-700'
                            }`}
                        >
                            <div className={`p-2 rounded-lg ${
                                activeMethod === 'paypal' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                            }`}>
                                <Shield className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold">PayPal</div>
                                <div className="text-xs opacity-75">Fast & secure</div>
                            </div>
                            {activeMethod === 'paypal' && (
                                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                            )}
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => {
                                setActiveMethod('card');
                                setSelectedWallet(null);
                            }}
                            className={`flex items-center gap-3 px-6 py-4 text-left transition-colors border-b border-gray-100 ${
                                activeMethod === 'card' 
                                    ? 'bg-blue-50 text-blue-700 border-l-4 border-l-blue-600' 
                                    : 'hover:bg-gray-50 text-gray-700'
                            }`}
                        >
                            <div className={`p-2 rounded-lg ${
                                activeMethod === 'card' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                            }`}>
                                <CreditCard className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold">Credit & Debit Cards</div>
                                <div className="text-xs opacity-75">Visa, Mastercard, JCB</div>
                            </div>
                            {activeMethod === 'card' && (
                                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                            )}
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => {
                                setActiveMethod('ewallet');
                                setSelectedCard(null);
                                onPaymentMethodChange?.(null);
                            }}
                            className={`flex items-center gap-3 px-6 py-4 text-left transition-colors ${
                                activeMethod === 'ewallet' 
                                    ? 'bg-blue-50 text-blue-700 border-l-4 border-l-blue-600' 
                                    : 'hover:bg-gray-50 text-gray-700'
                            }`}
                        >
                            <div className={`p-2 rounded-lg ${
                                activeMethod === 'ewallet' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                            }`}>
                                <Smartphone className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold">E-Wallet & QRIS</div>
                                <div className="text-xs opacity-75">GoPay, OVO, Dana</div>
                            </div>
                            {activeMethod === 'ewallet' && (
                                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                            )}
                        </button>
                    </div>
                    
                    {/* Payment Content */}
                    <div className="flex-1 p-6">

                        {activeMethod === 'paypal' ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <Shield className="h-6 w-6 text-blue-600" />
                                    <div>
                                        <h3 className="font-semibold text-blue-900">PayPal Protection</h3>
                                        <p className="text-sm text-blue-700">Buy with confidence - PayPal protects your purchase</p>
                                    </div>
                                </div>
                                <PayPalPayment
                                    amount={amount}
                                    description={description}
                                    onSuccess={handlePayPalSuccess}
                                    onError={handlePayPalError}
                                    onCancel={handlePayPalCancel}
                                />
                            </div>
                        ) : activeMethod === 'card' ? (
                        <>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="mb-3 text-base font-semibold text-gray-900">Select Card Type</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {[{ id: 'bri', label: 'Bank BRI', helper: 'Kartu kredit / debit', logo: null },
                                        { id: 'bca', label: 'Bank BCA', helper: 'Kartu kredit / debit', logo: null },
                                        ].map((card) => (
                                            <button
                                                key={card.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedCard(card.id as 'bri' | 'bca');
                                                    setSelectedWallet(null);
                                                    onPaymentMethodChange?.(card.label);
                                                    handleCardDetailChange('cardNumber', cardDetails.cardNumber);
                                                }}
                                                className={`relative h-20 rounded-xl border-2 px-4 py-3 text-left transition-all ${
                                                    selectedCard === card.id
                                                        ? 'border-blue-500 bg-blue-50 shadow-md'
                                                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <div>
                                                        <div className="font-semibold text-sm text-gray-900">{card.label}</div>
                                                        <div className="text-xs text-gray-500">{card.helper}</div>
                                                    </div>
                                                    {card.logo && <img src={card.logo} alt={card.label} className="h-6" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {selectedCard ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                            <AlertCircle className="h-4 w-4 text-amber-600" />
                                            <p className="text-sm text-amber-800">Enter your card details securely</p>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700">Card Number</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                        <CreditCard className="h-5 w-5" />
                                                    </span>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        placeholder="1234 5678 9012 3456"
                                                        value={cardDetails.cardNumber}
                                                        onChange={(e) => {
                                                            let value = e.target.value.replace(/\s/g, '');
                                                            if (value.length <= 16) {
                                                                value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                                                                handleCardDetailChange('cardNumber', value);
                                                            }
                                                        }}
                                                        className={`w-full rounded-lg border bg-white pl-12 pr-3 py-3 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                            cardDetails.cardNumber && !cardDetails.cardNumber.replace(/\s/g, '').match(/^\d{16}$/) ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-gray-700">Expiration Date</label>
                                                    <input
                                                        type="text"
                                                        placeholder="MM/YY"
                                                        value={cardDetails.expiryDate}
                                                        onChange={(e) => {
                                                            let value = e.target.value.replace(/\D/g, '');
                                                            if (value.length >= 2) {
                                                                value = value.slice(0, 2) + '/' + value.slice(2, 4);
                                                            }
                                                            handleCardDetailChange('expiryDate', value);
                                                        }}
                                                        className={`w-full rounded-lg border bg-white px-3 py-3 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                            cardDetails.expiryDate && !cardDetails.expiryDate.match(/^(0[1-9]|1[0-2])\/\d{2}$/) ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-gray-700">Security Code</label>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        placeholder="123"
                                                        value={cardDetails.securityCode}
                                                        onChange={(e) => {
                                                            const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                                            handleCardDetailChange('securityCode', value);
                                                        }}
                                                        className={`w-full rounded-lg border bg-white px-3 py-3 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                            cardDetails.securityCode && !cardDetails.securityCode.match(/^\d{3,4}$/) ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700">Cardholder Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="Your full name as it appears on the card"
                                                    value={cardDetails.cardholderName}
                                                    onChange={(e) => handleCardDetailChange('cardholderName', e.target.value)}
                                                    className={`w-full rounded-lg border bg-white px-3 py-3 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                        cardDetails.cardholderName && !cardDetails.cardholderName.trim() ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                />
                                            </div>

                                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                                <input
                                                    type="checkbox"
                                                    checked={cardDetails.saveCard}
                                                    onChange={(e) => handleCardDetailChange('saveCard', e.target.checked)}
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <div>
                                                    <span className="text-sm font-medium text-gray-700">Save this card for future payments</span>
                                                    <p className="text-xs text-gray-500">Your card information will be encrypted and stored securely</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">Select a card type to continue with payment</p>
                                    </div>
                                )}
                            </div>
                        </>
                        ) : activeMethod === 'ewallet' ? (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="mb-3 text-base font-semibold text-gray-900">Select E-Wallet</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[{ id: 'gopay', label: 'GoPay', icon: <Smartphone className="h-6 w-6" /> },
                                        { id: 'qris', label: 'QRIS', icon: <QrCode className="h-6 w-6" /> },
                                        ].map((wallet) => (
                                            <button
                                                key={wallet.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedWallet(wallet.id as 'gopay' | 'qris');
                                                    setSelectedCard(null);
                                                    onPaymentMethodChange?.(wallet.label);
                                                    if (onPaymentDataChange) {
                                                        onPaymentDataChange({
                                                            method: wallet.id,
                                                            isValid: true
                                                        });
                                                    }
                                                }}
                                                className={`h-20 rounded-xl border-2 px-4 py-3 text-left transition-all flex flex-col items-center justify-center gap-2 ${
                                                    selectedWallet === wallet.id
                                                        ? 'border-green-500 bg-green-50 shadow-md'
                                                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                                }`}
                                            >
                                                <div className={`p-2 rounded-lg ${
                                                    selectedWallet === wallet.id ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {wallet.icon}
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900">{wallet.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {selectedWallet && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                            <p className="text-sm text-green-800">Scan the QR code with your {selectedWallet === 'gopay' ? 'GoPay' : 'QRIS'} app</p>
                                        </div>
                                        
                                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                                            {selectedWallet === 'gopay' ? (
                                                <>
                                                    <QRCodeDisplay 
                                                        value={`gopay://payment?phone=+6285791158503&amount=${amount}`} 
                                                        size={192}
                                                        className="mx-auto"
                                                    />
                                                    <div className="text-center mt-4">
                                                        <p className="text-sm text-gray-600 font-medium">+62 857-9115-8503</p>
                                                        <p className="text-xs text-gray-500 mt-1">Scan dengan aplikasi GoPay</p>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="mx-auto w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                                                        <QrCode className="h-24 w-24 text-gray-400" />
                                                    </div>
                                                    <p className="text-center mt-4 text-sm text-gray-600">NMID: IDXXXXXXXXXX</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PaymentMethods;
