import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { ShopCard } from '../ui/shopCards';
import type { ShopItem } from '../ui/shopCards';

const ShopSection: React.FC = () => {
    const navigate = useNavigate();
    const sectionRef = useRef<HTMLElement | null>(null);
    const [inView, setInView] = useState(false);
    const [shopItems, setShopItems] = useState<ShopItem[]>([]);

    // Load products from API
    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/shop-products');
            const result = await response.json();
            
            if (result.success) {
                const products = result.data.products.slice(0, 6).map((product: any) => ({
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
        }
    };

    useEffect(() => {
        const node = sectionRef.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setInView(true);
                        observer.disconnect();
                    }
                });
            },
            { threshold: 0.2 },
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, []);
    return (
        <section ref={sectionRef} className="w-full py-16 md:py-20">
            <div className={`mx-auto max-w-6xl fade-up ${inView ? 'in-view' : ''}`}>
                <div className="grid gap-12 md:grid-cols-3">
                    {shopItems.map((item) => (
                        <ShopCard key={item.id} item={item} />
                    ))}
                </div>

                <div className="mt-10 flex justify-center">
                    <Button
                        variant="outline"
                        className="rounded-xl border-slate-300 text-slate-900 hover:bg-slate-50 px-6 py-3 text-xs md:text-sm flex items-center gap-2"
                        onClick={() => navigate('/work/shop')}
                    >
                        <span>Show more shop</span>
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default ShopSection;

