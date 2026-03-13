import React, { useEffect, useState } from 'react'
import { StarIcon } from 'lucide-react'

type ServiceData = {
    title: string;
    description: string;
    icon: string;
    isActive: boolean;
}

const ServicesSection: React.FC = () => {
    const [servicesData, setServicesData] = useState<ServiceData[]>([])
    const [loading, setLoading] = useState(true)

    // Fetch services data from backend
    useEffect(() => {
        const fetchServicesData = async () => {
            try {
                const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://localhost:55435'
                const response = await fetch(`${API_BASE}/api/landing-page`)
                const result = await response.json()
                
                const services = result?.data?.services
                if (result.success && Array.isArray(services)) {
                    setServicesData(
                        services
                            .filter((s: any) => s?.isActive !== false)
                            .map((s: any, idx: number) => ({
                                title: String(s.name ?? ''),
                                description: 'Service offering',
                                icon: idx % 2 === 0 ? 'fas fa-suitcase' : 'fas fa-map',
                                isActive: true
                            }))
                    )
                }
            } catch (error) {
                console.error('Error fetching services data:', error)
                // Fallback to default services
                setServicesData([
                    { title: 'Tour Packages', description: 'Complete travel packages', icon: 'fas fa-suitcase', isActive: true },
                    { title: 'Travel Planning', description: 'Custom travel itineraries', icon: 'fas fa-map', isActive: true },
                    { title: 'Hotel Booking', description: 'Best hotel deals', icon: 'fas fa-bed', isActive: true },
                    { title: 'Transportation', description: 'Airport transfers & more', icon: 'fas fa-car', isActive: true },
                    { title: 'Travel Insurance', description: 'Comprehensive coverage', icon: 'fas fa-shield-alt', isActive: true },
                    { title: 'Guided Tours', description: 'Expert local guides', icon: 'fas fa-user-guide', isActive: true }
                ])
            } finally {
                setLoading(false)
            }
        }

        fetchServicesData()
    }, [])

    // Default services for marquee if no data
    const defaultServices = [
        'Tour Packages',
        'Custom Copywriting',
        'Brand Storytelling',
        'Travel Planning',
        'Content Marketing',
        'Hotel Booking',
        'Product Description',
        'Transportation',
        'Ads Copy',
        'Travel Insurance'
    ]

    const services = servicesData.length > 0 
        ? servicesData.map(s => s.title)
        : defaultServices

    // Duplicate services for marquee effect
    const duplicatedServices = [...services, ...services, ...services]

    if (loading) {
        return (
            <section className="relative py-12 md:py-14 overflow-hidden bg-white" id="services">
                <div className="relative mx-auto w-full">
                    <div className="relative h-24 sm:h-28 md:h-32 bg-sky-500 rounded-none md:rounded-4xl overflow-hidden animate-pulse"></div>
                </div>
                <div className="mt-8 space-y-4">
                    <div className="h-20 bg-gray-200 rounded animate-pulse mx-4"></div>
                    <div className="h-20 bg-gray-200 rounded animate-pulse mx-4"></div>
                </div>
            </section>
        )
    }

    return (
        <section className="relative py-12 md:py-14 overflow-hidden bg-white" id="services">
            {/* Blue Rectangle Background */}
            <div className="relative mx-auto w-full">
                <div className="relative h-24 sm:h-28 md:h-32 bg-sky-500 rounded-none md:rounded-4xl overflow-hidden">
                </div>
            </div>

            {/* Diagonal White Banner with Scrolling Text */}
            <div
                className="absolute left-0 right-0 top-1/2 -translate-y-1/2 bg-white py-6 shadow-xl mt-8"
                style={{
                    transform: 'translateY(-50%) rotate(-4deg)',
                    width: '120%',
                    marginLeft: '-10%'
                }}
            >
                {/* Marquee Container */}
                <div className="overflow-hidden whitespace-nowrap">
                    <div
                        className="inline-flex animate-marquee"
                        style={{
                            animation: 'marquee 30s linear infinite'
                        }}
                    >
                        {duplicatedServices.map((service, index) => (
                            <div
                                key={index}
                                className="inline-flex items-center mx-6"
                            >
                                <StarIcon className="w-4 h-4 text-yellow-500 mr-2" />
                                <span className="text-sm sm:text-base font-medium text-slate-700">
                                    {service}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Services Grid */}
            <div className="relative z-10 mt-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12">
                        Our <span className="text-sky-500">Services</span>
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {servicesData.map((service, index) => (
                            <div
                                key={index}
                                className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 hover:shadow-xl transition-shadow duration-300"
                            >
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center mr-4">
                                        <i className={`${service.icon} text-sky-600 text-xl`}></i>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900">
                                        {service.title}
                                    </h3>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    {service.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </section>
    )
}

export default ServicesSection
