import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Navbar from '../../components/ui/navbar';
import FooterSection from '../../components/ui/footer';
import type { ShopItem } from '../../components/ui/shopCards';
import type { OrderPackage } from '../../components/order/sidebarOrder';
import EditAvatarModal from '../../components/profile/EditAvatarModal';
import ProfileSidebar from '../../components/profile/ProfileSidebar';
import ProfileContent from '../../components/profile/ProfileContent';
import InitialShimmer from '../../components/ui/InitialShimmer';
import { UserProfilePageSkeleton } from '../../components/ui/skeletons';

type OrderStatus = 'process' | 'success' | 'cancel';

type UserProfile = {
    name: string;
    email: string;
    password: string;
    avatarUrl: string;
};

const DEFAULT_AVATAR_URL = 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=300';

const readStorageValue = (key: string) => {
    if (typeof window === 'undefined') return null;
    const v = localStorage.getItem(key);
    if (!v) return null;
    const trimmed = v.trim();
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return null;
    return trimmed;
};

type UserTransaction = {
    _id?: string; // MongoDB ID (optional)
    id?: number; // MySQL ID (optional)
    transactionId: string;
    type: string;
    serviceName: string;
    description: string;
    amount: number;
    currency: string;
    discount: number;
    tax: number;
    finalAmount: number;
    paymentMethod: string;
    paymentStatus: string;
    paymentDate?: string;
    status: string;
    confirmedAt?: string;
    startedAt?: string;
    completedAt?: string;
    cancelledAt?: string;
    notes?: string;
    adminNotes?: string;
    serviceDetails?: string | any; // Can be string (MySQL) or object (MongoDB)
    createdAt: string;
    updatedAt: string;
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

const UserProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'general' | 'orders'>('general');
    const [cropOpen, setCropOpen] = useState(false);
    const [pendingAvatarSrc, setPendingAvatarSrc] = useState<string | null>(null);
    const [transactions, setTransactions] = useState<UserTransaction[]>([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('userAvatarUrl');
        localStorage.removeItem('authToken');
        localStorage.removeItem('authProvider');
        window.dispatchEvent(new Event('auth:changed'));
        navigate('/work', { replace: true });
    };

    const [profile, setProfile] = useState<UserProfile>(() => {
        const fallback: UserProfile = {
            name: 'Rose Seravina Alveric',
            email: 'roseseravina@gmail.com',
            password: 'password',
            avatarUrl: DEFAULT_AVATAR_URL,
        };

        if (typeof window === 'undefined') return fallback;

        const savedAvatar = readStorageValue('userAvatarUrl');
        const savedEmail = readStorageValue('userEmail');
        const savedName = readStorageValue('userName');
        
        return {
            ...fallback,
            avatarUrl: savedAvatar || fallback.avatarUrl,
            email: savedEmail || fallback.email,
            name: savedName || fallback.name,
        };
    });

    const handlePickAvatar = (imageSrc: string) => {
        setPendingAvatarSrc(imageSrc);
        setCropOpen(true);
    };

    const handleCloseAvatarModal = () => {
        setCropOpen(false);
        setPendingAvatarSrc(null);
    };

    const handleSaveAvatar = (avatarDataUrl: string) => {
        localStorage.setItem('userAvatarUrl', avatarDataUrl);
        window.dispatchEvent(new Event('auth:changed'));
        setProfile((prev) => ({ ...prev, avatarUrl: avatarDataUrl }));
        handleCloseAvatarModal();
    };

    // Listen for auth changes and update profile
    useEffect(() => {
        const handleAuthChange = () => {
            const savedName = readStorageValue('userName');
            const savedEmail = readStorageValue('userEmail');
            const savedAvatar = readStorageValue('userAvatarUrl');
            
            setProfile(prev => ({
                ...prev,
                name: savedName || prev.name,
                email: savedEmail || prev.email,
                avatarUrl: savedAvatar || prev.avatarUrl || DEFAULT_AVATAR_URL,
            }));
        };

        window.addEventListener('auth:changed', handleAuthChange);
        return () => window.removeEventListener('auth:changed', handleAuthChange);
    }, []);

    // Fetch user transactions
    const fetchTransactions = async () => {
        setLoadingTransactions(true);
        try {
            const userEmail = readStorageValue('userEmail');
            const authToken = readStorageValue('authToken');
            
            if (!userEmail) {
                setLoadingTransactions(false);
                return;
            }

            const response = await fetch(`http://localhost:55435/api/payment/my-transactions?email=${encodeURIComponent(userEmail)}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setTransactions(data.data.transactions);
                }
            }
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setLoadingTransactions(false);
        }
    };

    // Fetch transactions when component mounts or user changes
    useEffect(() => {
        const userEmail = readStorageValue('userEmail');
        if (userEmail) {
            fetchTransactions();
        }
    }, [profile.email]);

    // Transform transactions to UserOrder format
    const orders: UserOrder[] = useMemo(() => {
        return transactions.map((transaction, index) => {
            // Handle serviceDetails from MySQL (string) or MongoDB (object)
            let serviceDetails = null;
            if (transaction.serviceDetails) {
                serviceDetails = typeof transaction.serviceDetails === 'string' 
                    ? JSON.parse(transaction.serviceDetails) 
                    : transaction.serviceDetails;
            }

            return {
                id: transaction.transactionId || `TXN-${index + 1}`,
                status: mapTransactionStatusToOrderStatus(transaction.status),
                createdAtLabel: formatDate(transaction.createdAt),
                estimateCompleteLabel: getEstimateCompleteDate(transaction.createdAt, transaction.status),
                paymentMethod: mapPaymentMethodToLabel(transaction.paymentMethod),
                item: {
                    _id: String(transaction.id || transaction._id || `item-${index + 1}`),
                    id: String(transaction.id || transaction._id || `item-${index + 1}`),
                    title: transaction.serviceName || 'Service',
                    imageSrc: '/bg-shopCards.jpg',
                    price: transaction.currency === 'IDR' ? `Rp ${transaction.finalAmount.toLocaleString()}` : `$${transaction.finalAmount}`,
                    deliveryTime: getDeliveryTime(serviceDetails?.copywriterPackage),
                    serviceCategory: getServiceCategory(transaction.type)
                },
                orderPackage: {
                    id: serviceDetails?.copywriterPackage || 'standard',
                    title: getPackageTitle(serviceDetails?.copywriterPackage),
                    price: transaction.finalAmount,
                    shortDescription: transaction.description || 'Service package',
                    packageLabel: getPackageTitle(serviceDetails?.copywriterPackage),
                    deliveryLabel: getDeliveryTime(serviceDetails?.copywriterPackage)
                },
                quantity: serviceDetails?.quantity || 1,
                totalAmount: transaction.finalAmount
            };
        });
    }, [transactions]);

    // Helper functions to transform transaction data to order format
    const mapTransactionStatusToOrderStatus = (status: string): OrderStatus => {
        switch (status) {
            case 'completed':
            case 'paid':
                return 'success';
            case 'pending':
            case 'confirmed':
            case 'in_progress':
                return 'process';
            case 'cancelled':
            case 'refunded':
            case 'failed':
                return 'cancel';
            default:
                return 'process';
        }
    };

    const mapPaymentMethodToLabel = (method: string): string => {
        const methodMap: Record<string, string> = {
            'midtrans': 'Midtrans',
            'credit_card': 'Credit Card',
            'bank_transfer': 'Bank Transfer',
            'ewallet': 'E-Wallet',
            'qris': 'QRIS',
            'paypal': 'PayPal'
        };
        return methodMap[method] || method;
    };

    const getDeliveryTime = (packageType?: string): string => {
        const deliveryMap: Record<string, string> = {
            'basic': '1 Day Delivery',
            'standard': '2 Days Delivery',
            'premium': '3 Days Delivery'
        };
        return deliveryMap[packageType || 'standard'] || '2 Days Delivery';
    };

    const getPackageTitle = (packageType?: string): string => {
        const titleMap: Record<string, string> = {
            'basic': 'Basic',
            'standard': 'Standard',
            'premium': 'Premium'
        };
        return titleMap[packageType || 'standard'] || 'Standard';
    };

    const getServiceCategory = (type: string): string => {
        const categoryMap: Record<string, string> = {
            'copywriter_service': 'SEO Content',
            'travel_package': 'Travel Package',
            'consultation': 'Consultation',
            'other': 'Other'
        };
        return categoryMap[type] || 'Service';
    };

    const formatDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return 'Unknown';
        }
    };

    const getEstimateCompleteDate = (createdAt: string, status: string): string => {
        if (status === 'completed' || status === 'paid') {
            return formatDate(createdAt);
        }
        
        try {
            const date = new Date(createdAt);
            const daysToAdd = status === 'process' ? 3 : 7; // 3 days for processing, 7 for pending
            date.setDate(date.getDate() + daysToAdd);
            return formatDate(date.toISOString());
        } catch {
            return '—';
        }
    };

    return (
        <InitialShimmer delayMs={850} skeleton={<UserProfilePageSkeleton />}>
            <div className="min-h-screen flex flex-col bg-white">
                <Navbar />

                <EditAvatarModal
                    open={cropOpen}
                    imageSrc={pendingAvatarSrc}
                    onClose={handleCloseAvatarModal}
                    onSave={handleSaveAvatar}
                />

                <main className="flex-1">
                    <section className="mx-auto max-w-7xl px-4 md:px-0 py-10">
                        <div className="grid gap-6 lg:grid-cols-[56px_360px_1fr] items-start lg:items-stretch lg:h-[calc(100vh-220px)]">
                            <div className="lg:col-start-1 lg:flex lg:justify-center">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-2 lg:w-10 lg:px-0 lg:justify-center"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    <span className="lg:hidden">Back</span>
                                </button>
                            </div>

                            <ProfileSidebar profile={profile} onPickAvatar={handlePickAvatar} onLogout={handleLogout} />
                            <ProfileContent
                                activeTab={activeTab}
                                onTabChange={setActiveTab}
                                profile={profile}
                                onProfileChange={setProfile}
                                orders={orders}
                                transactions={transactions}
                                loadingTransactions={loadingTransactions}
                            />
                        </div>
                    </section>
                </main>

                <FooterSection />
            </div>
        </InitialShimmer>
    );
};

export default UserProfilePage;
