import React, { useMemo, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';
import NavbarShop from '../../components/ui/navbarShop';
import FooterSection from '../../components/ui/footer';
import SignUpNotification from '../../components/ui/signUpNotification';
import AuthModal from '../../components/auth/AuthModal';
import { ShopCard, type ShopItem } from '../../components/ui/shopCards';
import Pagination from '../../components/ui/pagination';
import ShopFilters, { type BudgetState } from '../../components/shop/shopFilters';
import InitialShimmer from '../../components/ui/InitialShimmer';
import { ShopPageSkeleton } from '../../components/ui/skeletons';

const ShopPage: React.FC = () => {
    const location = useLocation();
    const initialServiceFromState = (location.state as { initialService?: string } | null)?.initialService;

    const [shopItems, setShopItems] = useState<ShopItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Load products from API
    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/shop-products');
            const result = await response.json();
            
            if (result.success) {
                const products = result.data.products.map((product: any) => ({
                    id: product.id,
                    title: product.title,
                    imageSrc: product.imageSrc,
                    price: typeof product.price === 'number' ? `$${product.price}` : product.price,
                    deliveryTime: product.deliveryTime,
                    serviceCategory: product.serviceCategory,
                }));
                setShopItems(products);
            } else {
                console.error('Failed to load products:', result.message);
            }
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    const [currentPage, setCurrentPage] = useState(1);
    const [serviceFilter, setServiceFilter] = useState<string | null>(
        initialServiceFromState && initialServiceFromState !== 'Service Options'
            ? initialServiceFromState
            : null,
    );
    const [deliveryFilter, setDeliveryFilter] = useState<string | null>(null);
    const [budgetFilter, setBudgetFilter] = useState<BudgetState>({ type: 'any' });
    const pageSize = 12;

    const filteredItems = useMemo(() => {
        const parsePrice = (price: string): number => {
            const numeric = Number(price.replace(/[^0-9.]/g, ''));
            return Number.isNaN(numeric) ? 0 : numeric;
        };

        const getFromPrice = (item: ShopItem): number => {
            const basePrice = parsePrice(item.price);
            if (!basePrice) return 0;
            // Match ShopPackageCard: basePrice is for 1000 words, Basic is 500 words
            return Math.max(1, Math.round((basePrice / 1000) * 500));
        };

        const parseDeliveryToDays = (value?: string): number | null => {
            if (!value) return null;
            const match = value.match(/(\d+)/);
            if (!match) return null;
            const num = Number(match[1]);
            if (value.toLowerCase().includes('hour')) {
                return 1; // treat hours as 1 day max
            }
            return Number.isNaN(num) ? null : num;
        };

        const maxDaysFromFilter = (label: string | null): number | null => {
            if (!label || label === 'Delivery Time') return null;
            const match = label.match(/(\d+)/);
            if (!match) return null;
            const num = Number(match[1]);
            if (label.toLowerCase().includes('hour')) {
                return 1;
            }
            return Number.isNaN(num) ? null : num;
        };

        const maxDays = maxDaysFromFilter(deliveryFilter);

        return shopItems.filter((item) => {
            // service filter (exact match on serviceCategory)
            if (serviceFilter && serviceFilter !== 'Service Options') {
                if (!item.serviceCategory || item.serviceCategory !== serviceFilter) {
                    return false;
                }
            }

            // delivery filter (item delivery <= selected max days)
            if (maxDays !== null) {
                const itemDays = parseDeliveryToDays(item.deliveryTime);
                if (itemDays === null || itemDays > maxDays) {
                    return false;
                }
            }

            // budget filter
            const price = getFromPrice(item);
            const b = budgetFilter;
            if (b.type === 'under') {
                if (!(price < b.value)) return false;
            } else if (b.type === 'range') {
                if (price < b.min || price > b.max) return false;
            } else if (b.type === 'upTo') {
                if (b.value !== '' && price > b.value) return false;
            }

            return true;
        });
    }, [serviceFilter, deliveryFilter, budgetFilter]);

    const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const startIndex = (currentPage - 1) * pageSize;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + pageSize);

    const [authOpen, setAuthOpen] = useState(false);

    return (
        <InitialShimmer delayMs={850} skeleton={<ShopPageSkeleton />}>
            <div className="min-h-screen flex flex-col bg-white">
                <SignUpNotification onCtaClick={() => setAuthOpen(true)} />
                <NavbarShop />

                <AuthModal
                    open={authOpen}
                    mode="signup"
                    closable
                    onClose={() => setAuthOpen(false)}
                    onSuccess={() => setAuthOpen(false)}
                />

                <main className="flex-1">
                    <section className="mx-auto max-w-7xl py-10">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Link to="/" className="hover:text-slate-800 transition-colors">
                                <Home className="w-4 h-4" />
                            </Link>
                            <span>/</span>
                            <Link to="/work/shop" className="text-slate-800">Shop</Link>
                        </div>

                        {/* Filter bar */}
                        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <p className="text-xl md:text-2xl font-semibold text-slate-900">
                                All product for you!
                            </p>

                            <ShopFilters
                                initialServiceLabel={serviceFilter || 'Service Options'}
                                onServiceChange={(value) => {
                                    setServiceFilter(value === 'Service Options' ? null : value);
                                    setCurrentPage(1);
                                }}
                                onDeliveryChange={(value) => {
                                    setDeliveryFilter(value === 'Delivery Time' ? null : value);
                                    setCurrentPage(1);
                                }}
                                onBudgetApply={(value) => {
                                    setBudgetFilter(value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        {/* Grid products */}
                        <div className="mt-8 grid gap-6 md:grid-cols-4">
                            {paginatedItems.map((item) => (
                                <ShopCard key={item.id} item={item} />
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="mt-10 flex justify-center">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </section>
                </main>

                <FooterSection />
            </div>
        </InitialShimmer>
    );
};

export default ShopPage;
