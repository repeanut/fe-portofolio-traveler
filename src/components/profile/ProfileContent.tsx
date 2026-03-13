import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Eye, EyeOff, Hash, Mail, User } from 'lucide-react';
import type { ShopItem } from '../ui/shopCards';
import type { OrderPackage } from '../order/sidebarOrder';

type OrderStatus = 'process' | 'success' | 'cancel';

type UserProfile = {
    name: string;
    email: string;
    password: string;
    avatarUrl: string;
};

type UserOrder = {
    id: string;
    status: OrderStatus;
    createdAtLabel: string;
    estimateCompleteLabel: string;
    paymentMethod: string;
    item: ShopItem;
    orderPackage: OrderPackage;
    quantity: number;
    totalAmount: number;
};

type Transaction = {
    _id?: string; // MongoDB ID (optional)
    id?: number; // MySQL ID (optional)
    transactionId: string;
    type: string;
    serviceName: string;
    description: string;
    amount: number;
    currency: string;
    finalAmount: number;
    paymentMethod: string;
    paymentStatus: string;
    status: string;
    createdAt: string;
    paymentDate?: string;
    serviceDetails?: string | any; // Can be string (MySQL) or object (MongoDB)
};

export type ProfileContentProps = {
    activeTab: 'general' | 'orders';
    onTabChange: (tab: 'general' | 'orders') => void;
    profile: UserProfile;
    onProfileChange: (next: UserProfile) => void;
    orders: UserOrder[];
    transactions?: Transaction[];
    loadingTransactions?: boolean;
};

const ProfileContent: React.FC<ProfileContentProps> = ({ 
    activeTab, 
    onTabChange, 
    profile, 
    onProfileChange, 
    orders, 
    transactions = [], 
    loadingTransactions = false 
}) => {
    const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | OrderStatus>('all');
    const [orderStatusOpen, setOrderStatusOpen] = useState(false);
    const orderStatusRef = useRef<HTMLDivElement | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const filteredOrders = useMemo(() => {
        if (orderStatusFilter === 'all') return orders;
        return orders.filter((o) => o.status === orderStatusFilter);
    }, [orders, orderStatusFilter]);

    const statusBadge = (status: OrderStatus) => {
        if (status === 'success') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (status === 'process') return 'bg-amber-50 text-amber-700 border-amber-200';
        return 'bg-rose-50 text-rose-700 border-rose-200';
    };

    const statusLabel = (status: OrderStatus) => {
        if (status === 'success') return 'Success';
        if (status === 'process') return 'Process';
        return 'Cancel';
    };

    const orderStatusFilterLabel = useMemo(() => {
        if (orderStatusFilter === 'all') return 'All';
        return statusLabel(orderStatusFilter);
    }, [orderStatusFilter]);

    useEffect(() => {
        const onMouseDown = (e: MouseEvent) => {
            const target = e.target as Node;
            if (!orderStatusRef.current) return;
            if (!orderStatusRef.current.contains(target)) {
                setOrderStatusOpen(false);
            }
        };

        document.addEventListener('mousedown', onMouseDown);
        return () => document.removeEventListener('mousedown', onMouseDown);
    }, []);

    return (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col lg:h-full lg:col-start-3">
            <div className="grid grid-cols-2 border-b border-slate-200 flex-shrink-0">
                <button
                    type="button"
                    onClick={() => onTabChange('general')}
                    className={`py-4 text-sm font-medium transition-colors border-b-2 ${
                        activeTab === 'general'
                            ? 'border-sky-500 text-slate-900'
                            : 'border-transparent text-slate-400 hover:text-slate-700'
                    }`}
                >
                    General Information
                </button>
                <button
                    type="button"
                    onClick={() => onTabChange('orders')}
                    className={`py-4 text-sm font-medium transition-colors border-b-2 ${
                        activeTab === 'orders'
                            ? 'border-sky-500 text-slate-900'
                            : 'border-transparent text-slate-400 hover:text-slate-700'
                    }`}
                >
                    Order History
                </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
                {activeTab === 'general' ? (
                    <div className="p-7">
                        <p className="text-sm font-semibold text-slate-900">General Information</p>
                        <p className="mt-1 text-xs text-slate-500">
                            Click any field to edit your biodata. Updates will reflect on your profile card.
                        </p>

                        <div className="mt-6 grid gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-700">Name</label>
                                <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
                                    <User className="h-4 w-4 text-slate-400" />
                                    <input
                                        value={profile.name}
                                        onChange={(e) => onProfileChange({ ...profile, name: e.target.value })}
                                        className="w-full text-sm text-slate-800 outline-none"
                                        placeholder="Your name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-700">Email</label>
                                <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                    <Mail className="h-4 w-4 text-slate-400" />
                                    <input
                                        value={profile.email}
                                        disabled
                                        className="w-full text-sm text-slate-500 outline-none bg-transparent"
                                        placeholder="Your email"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-700">Password</label>
                                <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
                                    <Hash className="h-4 w-4 text-slate-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={profile.password}
                                        onChange={(e) => onProfileChange({ ...profile, password: e.target.value })}
                                        className="w-full text-sm text-slate-800 outline-none"
                                        placeholder="Password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                ) : (
                    <div className="p-7">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-900">Order History</p>
                                <p className="mt-1 text-xs text-slate-500">
                                    Review your past orders and filter them by status.
                                </p>
                            </div>

                            <div ref={orderStatusRef} className="relative">
                                <button
                                    type="button"
                                    onClick={() => setOrderStatusOpen((v) => !v)}
                                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-2"
                                >
                                    <span className="whitespace-nowrap">{orderStatusFilterLabel}</span>
                                    <ChevronDown className="h-4 w-4 text-slate-500" />
                                </button>

                                {orderStatusOpen && (
                                    <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-slate-200 bg-white shadow-lg p-2 z-30">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setOrderStatusFilter('all');
                                                setOrderStatusOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                                                orderStatusFilter === 'all'
                                                    ? 'bg-sky-50 text-sky-700'
                                                    : 'text-slate-700 hover:bg-slate-50'
                                            }`}
                                        >
                                            All
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setOrderStatusFilter('process');
                                                setOrderStatusOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                                                orderStatusFilter === 'process'
                                                    ? 'bg-sky-50 text-sky-700'
                                                    : 'text-slate-700 hover:bg-slate-50'
                                            }`}
                                        >
                                            Process
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setOrderStatusFilter('success');
                                                setOrderStatusOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                                                orderStatusFilter === 'success'
                                                    ? 'bg-sky-50 text-sky-700'
                                                    : 'text-slate-700 hover:bg-slate-50'
                                            }`}
                                        >
                                            Success
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setOrderStatusFilter('cancel');
                                                setOrderStatusOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                                                orderStatusFilter === 'cancel'
                                                    ? 'bg-sky-50 text-sky-700'
                                                    : 'text-slate-700 hover:bg-slate-50'
                                            }`}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 space-y-4">
                            {filteredOrders.map((order) => (
                                <div key={order.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-sm font-semibold text-slate-900">Order #{order.id}</p>
                                                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadge(order.status)}`}>
                                                    {statusLabel(order.status)}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs text-slate-500">
                                                Ordered: {order.createdAtLabel} · Estimate complete: {order.estimateCompleteLabel}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-xs text-slate-500">Total</p>
                                            <p className="text-sm font-semibold text-slate-900">${order.totalAmount}</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid gap-4 md:grid-cols-[72px_1fr]">
                                        <div className="h-16 w-16 rounded-xl overflow-hidden bg-slate-100">
                                            <img src={order.item.imageSrc} alt={order.item.title} className="h-full w-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">{order.item.title}</p>
                                            <p className="mt-1 text-xs text-slate-500">{order.orderPackage.title} · Qty {order.quantity} · {order.paymentMethod}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Show transactions */}
                        {transactions && transactions.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-sm font-semibold text-slate-900 mb-4">Transaction History</h3>
                                <div className="space-y-4">
                                    {transactions.map((transaction) => (
                                        <div key={transaction.transactionId} className="rounded-2xl border border-slate-200 bg-white p-5">
                                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="text-sm font-semibold text-slate-900">Transaction #{transaction.transactionId}</p>
                                                        <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200">
                                                            {transaction.type.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        Created: {new Date(transaction.createdAt).toLocaleDateString()}
                                                        {transaction.paymentDate && ` · Paid: ${new Date(transaction.paymentDate).toLocaleDateString()}`}
                                                    </p>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-xs text-slate-500">Total</p>
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {transaction.currency === 'IDR' ? 'Rp ' : '$'}
                                                        {transaction.finalAmount.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <p className="text-sm font-medium text-slate-900">{transaction.serviceName}</p>
                                                <p className="text-xs text-slate-500">{transaction.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Show empty state */}
                        {!loadingTransactions && filteredOrders.length === 0 && (!transactions || transactions.length === 0) && (
                            <div className="text-center py-12">
                                <div className="inline-flex flex-col items-center gap-3">
                                    <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
                                        <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2v2a2 2 0 01-2 2H9a2 2 0 00-2-2V7a2 2 0 012-2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">No orders or transactions found</p>
                                        <p className="text-xs text-slate-500">Your order and transaction history will appear here</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default ProfileContent;
