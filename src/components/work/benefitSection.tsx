import { Check, CheckIcon, Mail } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

const benefits = [
    'Clear briefs and friendly onboarding',
    'SEO-focused writing with natural readability',
    'Brand voice consistency across every piece',
    'Fast turnaround with transparent revisions',
    'Ready-to-publish formatting and structure',
];

const BenefitSection: React.FC = () => {
    const sectionRef = useRef<HTMLElement | null>(null);
    const [leftInView, setLeftInView] = useState(false);
    const [rightInView, setRightInView] = useState(false);

    useEffect(() => {
        const node = sectionRef.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setLeftInView(true);
                        setRightInView(true);
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
        <section ref={sectionRef} className="w-full py-12 md:py-16">
            <div className="mx-auto max-w-6xl px-6 lg:px-8 grid gap-12 md:grid-cols-[1.1fr_1.1fr] items-center">
                {/* Left: Benefit text list */}
                <div className={`fade-up ${leftInView ? 'in-view' : ''}`}>
                    <h2 className="text-3xl md:text-4xl font-semibold leading-tight text-slate-900 text-center md:text-start">
                        What You Get
                        <br />
                        With Every Order
                    </h2>

                    <div className="mt-8 md:mt-12 space-y-4">
                        {benefits.map((benefit) => (
                            <div key={benefit} className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white" />
                                </div>
                                <p className="text-lg md:text-xl text-slate-800">
                                    {benefit}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Visual card stack */}
                <div className={`relative flex justify-center md:justify-end fade-up ${rightInView ? 'in-view' : ''}`}>
                    {/* Floating blue icon on the left */}
                    <div className="hidden md:block absolute left-28 top-56 z-20 -rotate-12 float-soft">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500 text-white text-lg shadow-lg">
                            <Mail className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="relative w-full max-w-md md:max-w-xs aspect-[1.8/2] rounded-3xl overflow-hidden md:right-12">
                        <img
                            src="/bg-benefit.png"
                            alt="Benefit visual"
                            className="w-full h-full object-cover z-0"
                        />
                    </div>

                    {/* Amanda Young card */}
                    <div className="absolute top-12 left-4 sm:left-10 md:left-12 rounded-2xl bg-white shadow-lg px-4 py-3 flex items-center gap-3 z-10 float-soft-delayed-1">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-200">
                            <img
                                src="/rizwords-nomad.jpg"
                                alt="Rizqi Maulana"
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-900">Rizqi Maulana</p>
                            <p className="text-[11px] text-slate-500">SEO Content Specialist</p>
                        </div>
                        <div className="ml-2 flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-white text-xs">
                            ?
                        </div>
                    </div>

                    {/* Delivery time card */}
                    <div className="absolute top-28 left-4 sm:left-auto rounded-2xl bg-white shadow-lg px-4 py-3 z-10 float-soft-delayed-2">
                        <p className="text-[11px] text-slate-500">Delivery time</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">24–72 hours</p>
                    </div>

                    {/* Draft delivered card */}
                    <div className="absolute -bottom-6 left-4 sm:left-14 md:left-16 rounded-2xl bg-white shadow-lg px-4 py-3 flex items-center gap-3 z-10 float-soft-delayed-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-sky-500 text-sky-500 text-xs">
                            <CheckIcon className="w-4 h-4" />
                        </div>
                        <p className="text-xs md:text-sm font-medium text-slate-900 whitespace-nowrap">
                            Draft delivered successfully
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BenefitSection;
