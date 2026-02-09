import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarShop from '../ui/navbarShop';
import { Button } from '../ui/button';

type HeroSectionProps = {
    shouldAnimateCounts?: boolean;
    onSignUpClick?: () => void;
};

const HeroSection: React.FC<HeroSectionProps> = ({ shouldAnimateCounts = true, onSignUpClick }) => {
    const navigate = useNavigate();
    const [brandsCount, setBrandsCount] = useState(0);
    const [productsCount, setProductsCount] = useState(0);
    const [customersCount, setCustomersCount] = useState(0);
    const hasAnimatedCountsRef = useRef(false);

    useEffect(() => {
        if (!shouldAnimateCounts || hasAnimatedCountsRef.current) return;

        const duration = 1200;

        const animate = (target: number, setter: (value: number) => void) => {
            const start = performance.now();

            const step = (now: number) => {
                const elapsed = now - start;
                const progress = Math.min(1, elapsed / duration);

                // ease-out
                const eased = 1 - Math.pow(1 - progress, 3);
                const value = Math.floor(target * eased);
                setter(value);
                if (progress < 1) {
                    requestAnimationFrame(step);
                }
            };

            requestAnimationFrame(step);
        };

        animate(200, setBrandsCount);
        animate(2000, setProductsCount);
        animate(30000, setCustomersCount);
        hasAnimatedCountsRef.current = true;
    }, [shouldAnimateCounts]);

    const heroRef = useRef<HTMLDivElement | null>(null);
    const heroBgRef = useRef<HTMLDivElement | null>(null);
    const [heroInView, setHeroInView] = useState(false);
    const [cursorActive, setCursorActive] = useState(false);

    useEffect(() => {
        const node = heroRef.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setHeroInView(true);
                        observer.disconnect();
                    }
                });
            },
            { threshold: 0.2 },
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const node = heroBgRef.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        node.style.setProperty('--cursor-x', `${x}%`);
        node.style.setProperty('--cursor-y', `${y}%`);
        setCursorActive(true);
    };

    const handleMouseLeave = () => {
        setCursorActive(false);
    };

    const brands = [
        '/Amazon-Logo 1.png',
        '/Hilton-Logo 1.png',
        '/Verizon-Logo 1.png',
        '/Williams-Sonoma-Logo 1.png',
        '/Dr-Bronners-Logo 1.png',
        '/Purina-Logo 1.png',
    ];

    const minVisibleItems = 14;
    const repeatCount = Math.max(1, Math.ceil(minVisibleItems / brands.length));
    const filledBrands = Array.from({ length: repeatCount }, () => brands).flat();
    const marqueeBrands = filledBrands.concat(filledBrands);

    return (
        <section className="w-full h-screen flex flex-col">
            <NavbarShop onSignUpClick={onSignUpClick} />

            <div
                ref={heroBgRef}
                className="relative w-full overflow-x-hidden flex-1"
                style={{
                    backgroundImage: "url('/bg-work.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <div className={`hero-cursor-gradient ${cursorActive ? 'active' : ''}`} />
                <div className="absolute inset-0 bg-gradient-to-r from-[#071a4f]/90 via-[#071a4f]/70 to-[#071a4f]/40" />

                <div className="absolute inset-0 opacity-40" style={{
                    backgroundImage:
                        'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)',
                    backgroundSize: '64px 64px',
                }} />

                <div className="absolute -left-14 top-24 h-36 w-36 rounded-[40px] bg-white/5 blur-0" />
                <div className="absolute left-14 bottom-20 h-24 w-24 rounded-[32px] bg-white/5" />
                <div className="absolute right-14 top-28 h-32 w-32 rounded-[40px] bg-white/5" />

                <div
                    ref={heroRef}
                    className={`relative mx-auto h-full fade-up ${heroInView ? 'in-view' : ''}`}
                >
                    <div className="grid h-full items-center gap-6 lg:gap-10 md:grid-cols-[1.5fr_1.4fr] pt-8 pb-20 md:pb-24">
                        <div className="text-white px-6 md:px-0 lg:pl-28 lg:pr-8">
                            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] text-white/80">
                                Premium SEO content and copywriting—delivered fast
                            </div>

                            <h1 className="mt-5 text-3xl font-semibold leading-[1.05] tracking-tight md:text-6xl bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                                SEO content that ranks and converts
                            </h1>

                            <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">
                                From blog posts and product descriptions to landing pages and ad copy—choose a package, place your order, and get polished writing that fits your brand voice.
                            </p>

                            <div className="mt-7 flex flex-wrap items-center gap-3">
                                <Button
                                    size="sm"
                                    className="h-10 px-5 bg-white text-[#081a4f] hover:bg-white/90"
                                >
                                    View Benefit
                                </Button>
                                <Button
                                    size="sm"
                                    className="h-10 px-5 bg-white/20 text-white hover:bg-white/30 ring-1 ring-white/15"
                                    onClick={() => navigate('/work/shop')}
                                >
                                    Explore all products
                                </Button>
                            </div>

                            <div className="mt-8 grid max-w-xl grid-cols-3 gap-6 md:gap-10">
                                <div>
                                    <div className="text-2xl md:text-3xl font-semibold">{brandsCount.toLocaleString()}+</div>
                                    <div className="mt-1 text-xs text-white/55">International Brands</div>
                                </div>
                                <div>
                                    <div className="text-2xl md:text-3xl font-semibold">{productsCount.toLocaleString()}+</div>
                                    <div className="mt-1 text-xs text-white/55">High-Quality Products</div>
                                </div>
                                <div>
                                    <div className="text-2xl md:text-3xl font-semibold">{customersCount.toLocaleString()}+</div>
                                    <div className="mt-1 text-xs text-white/55">Happy Customers</div>
                                </div>
                            </div>
                        </div>

                        <div className="relative hidden md:flex justify-end">
                            <div className="w-full max-h-[48vh] h-[220px] sm:h-[280px] md:h-[320px] lg:h-[380px] rounded-2xl bg-[#0b1224]/80 border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.5)] overflow-hidden md:rounded-r-none">
                                <img
                                    src="/image-work.png"
                                    alt="image-work"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="absolute inset-x-0 bottom-0">
                        <div className="bg-[#E7F1FD] h-16 md:h-20 shadow-xl overflow-hidden">
                            <div className="h-full overflow-hidden whitespace-nowrap flex items-center">
                                <div
                                    className="inline-flex min-w-max items-center gap-10 animate-marquee"
                                    style={{ animation: 'marquee 30s linear infinite' }}
                                >
                                    {marqueeBrands.map((src, idx) => (
                                        <img
                                            key={`${src}-${idx}`}
                                            src={src}
                                            alt="Featured brand logo"
                                            className="h-8 md:h-10 w-auto object-contain flex-shrink-0"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes marquee {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }
            `}</style>
        </section>
    );
};

export default HeroSection;

