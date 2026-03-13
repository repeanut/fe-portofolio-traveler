import React, { useMemo, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Package, TrendingUp, Star, ShoppingCart } from 'lucide-react';
import NavbarShop from '../../components/ui/navbarShop';
import FooterSection from '../../components/ui/footer';
import SignUpNotification from '../../components/ui/signUpNotification';
import { ShopCard } from '../../components/ui/shopCards';
import Pagination from '../../components/ui/pagination';
import ShopFilters, { type BudgetState } from '../../components/shop/shopFilters';
import { shopService, type ShopItem } from '../../services/shopService';

const ShopPage: React.FC = () => {
    const location = useLocation();
    const initialServiceFromState = (location.state as { initialService?: string } | null)?.initialService;

    const [currentPage, setCurrentPage] = useState(1);
    const [serviceFilter, setServiceFilter] = useState<string | null>(
        initialServiceFromState && initialServiceFromState !== 'Service Options'
            ? initialServiceFromState
            : null,
    );
    const [deliveryFilter, setDeliveryFilter] = useState<string | null>(null);
    const [budgetFilter, setBudgetFilter] = useState<BudgetState>({ type: 'any' });
    const [shopItems, setShopItems] = useState<ShopItem[]>([]);
    const [loading, setLoading] = useState(true);
    const pageSize = 12;

    // Calculate stats
    const stats = useMemo(() => {
        const totalItems = shopItems.length;
        const activeItems = shopItems.filter(item => item.status === 'active').length;
        const totalValue = shopItems.reduce((sum, item) => {
            const price = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
            return sum + price;
        }, 0);
        const avgRating = 4.5; // Mock rating

        return {
            totalItems,
            activeItems,
            totalValue,
            avgRating
        };
    }, [shopItems]);

    // Load shop items from API
    useEffect(() => {
        const loadShopItems = async () => {
            try {
                setLoading(true);
                console.log('🔄 Loading user shop items...');
                const result = await shopService.getShopItems({ status: 'active' }); // Only get active items for public
                console.log('📦 User shop items loaded:', result.data);
                console.log('📊 User shop items count:', result.data?.length || 0);
                console.log('📋 User shop items sample:', result.data?.[0]);
                setShopItems(result.data || []);
            } catch (error) {
                console.error('❌ Error loading shop items:', error);
            } finally {
                setLoading(false);
            }
        };

        loadShopItems();
    }, []);

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

    // Debug logging for filtered items
    useEffect(() => {
        console.log('🔍 ShopPage - filteredItems:', filteredItems.length, 'items');
        console.log('📋 ShopPage - filteredItems data:', filteredItems);
    }, [filteredItems]);

    // Debug logging for paginated items
    useEffect(() => {
        console.log('📄 ShopPage - paginatedItems:', paginatedItems.length, 'items');
        console.log('📋 ShopPage - paginatedItems data:', paginatedItems);
        console.log('🎯 ShopPage - About to render grid with:', paginatedItems.length, 'items');
    }, [paginatedItems]);

    return (
        loading ? (
            <div className="min-h-screen flex flex-col bg-white">
                <SignUpNotification onCtaClick={() => { }} />
                <NavbarShop />

                <main className="flex-1">
                    <section className="mx-auto max-w-7xl py-10 px-4 md:px-0">
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                <p className="text-black text-lg">Loading amazing shop items...</p>
                            </div>
                        </div>
                    </section>
                </main>
                <FooterSection />
            </div>
        ) : (
            <div className="min-h-screen flex flex-col bg-white">
                <SignUpNotification onCtaClick={() => { }} />
                <NavbarShop />

                <main className="flex-1">
                    <section className="mx-auto max-w-7xl py-16 px-4 md:px-0">
                        {/* Hero Section */}
                        <div className="text-center mb-16">
                            <h1 className="text-5xl md:text-6xl font-bold text-black mb-6">
                                Discover Amazing Products
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                                Find perfect services for your travel and content needs
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <div className="bg-gray-100 rounded-lg px-6 py-3 border border-gray-300">
                                    <span className="text-black font-medium">{stats.totalItems} Products</span>
                                </div>
                                <div className="bg-gray-100 rounded-lg px-6 py-3 border border-gray-300">
                                    <span className="text-black font-medium">{stats.activeItems} Available</span>
                                </div>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            <div className="bg-gray-100 rounded-xl p-6 border border-gray-300 hover:bg-gray-200 transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-blue-500/20 rounded-lg">
                                        <Package className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <span className="text-3xl font-bold text-black">{stats.totalItems}</span>
                                </div>
                                <p className="text-gray-600">Total Products</p>
                            </div>

                            <div className="bg-gray-100 rounded-xl p-6 border border-gray-300 hover:bg-gray-200 transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-green-500/20 rounded-lg">
                                        <TrendingUp className="w-6 h-6 text-green-600" />
                                    </div>
                                    <span className="text-3xl font-bold text-black">{stats.activeItems}</span>
                                </div>
                                <p className="text-gray-600">Available Now</p>
                            </div>

                            <div className="bg-gray-100 rounded-xl p-6 border border-gray-300 hover:bg-gray-200 transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-yellow-500/20 rounded-lg">
                                        <Star className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <span className="text-3xl font-bold text-black">{stats.avgRating}</span>
                                </div>
                                <p className="text-gray-600">Avg Rating</p>
                            </div>

                            <div className="bg-gray-100 rounded-xl p-6 border border-gray-300 hover:bg-gray-200 transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-blue-500/20 rounded-lg">
                                        <ShoppingCart className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <span className="text-3xl font-bold text-black">${stats.totalValue.toFixed(0)}</span>
                                </div>
                                <p className="text-gray-600">Total Value</p>
                            </div>
                        </div>

                        {/* Breadcrumb */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 mb-8">
                            <Link to="/" className="hover:text-black transition-colors">
                                <Home className="w-4 h-4" />
                            </Link>
                            <span>/</span>
                            <Link to="/work/shop" className="text-black">Shop</Link>
                        </div>

                        {/* Filter bar */}
                        <div className="mb-8">
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
                        <div className="grid gap-8 items-stretch grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {paginatedItems.length > 0 ? (
                                paginatedItems.map((item) => (
                                    <div key={item._id} className="h-full">
                                        <ShopCard item={item} />
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12">
                                    <p className="text-black text-lg">No products found</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        <div className="mt-12 flex justify-center">
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
        )
    );
};

export default ShopPage;
