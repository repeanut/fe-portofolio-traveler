import React, { useMemo, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type AboutContent = {
    title: string;
    description: string;
    image: string;
    features: Array<{ title: string; description: string }>;
    isActive: boolean;
}

const AboutSection: React.FC = () => {
    const navigate = useNavigate()
    const [aboutData, setAboutData] = useState<AboutContent | null>(null)
    const [loading, setLoading] = useState(true)

    // Fetch about data from backend
    useEffect(() => {
        const fetchAboutData = async () => {
            try {
                const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://localhost:55435'
                const response = await fetch(`${API_BASE}/api/landing-page`)
                const result = await response.json()
                
                const about = result?.data?.about
                if (result.success && about) {
                    const exp = Array.isArray(about.experience) ? about.experience : []
                    setAboutData({
                        title: 'About TRAVELLO',
                        description: String(about.description ?? ''),
                        image: String(about.image ?? '/images/about-image.jpg'),
                        features: exp.slice(0, 4).map((x: any, idx: number) => ({
                            title: String(x ?? ''),
                            description: idx === 0 ? 'Key highlight' : 'Experience'
                        })),
                        isActive: about.isActive !== false
                    })
                }
            } catch (error) {
                console.error('Error fetching about data:', error)
                // Fallback to default data
                setAboutData({
                    title: 'About TRAVELLO',
                    description: 'We are your trusted travel partner with years of experience in creating unforgettable journeys around the world.',
                    image: '/images/about-image.jpg',
                    features: [
                        { title: 'Expert Guides', description: 'Professional tour guides' },
                        { title: 'Best Price', description: 'Competitive pricing' },
                        { title: '24/7 Support', description: 'Round the clock assistance' },
                        { title: 'Safe Travel', description: 'Your safety is our priority' }
                    ],
                    isActive: true
                })
            } finally {
                setLoading(false)
            }
        }

        fetchAboutData()
    }, [])

    const about = useMemo<AboutContent>(() => {
        return aboutData || {
            title: 'About TRAVELLO',
            description: 'We are your trusted travel partner with years of experience in creating unforgettable journeys around the world.',
            image: '/images/about-image.jpg',
            features: [
                { title: 'Expert Guides', description: 'Professional tour guides' },
                { title: 'Best Price', description: 'Competitive pricing' },
                { title: '24/7 Support', description: 'Round the clock assistance' },
                { title: 'Safe Travel', description: 'Your safety is our priority' }
            ],
            isActive: true
        }
    }, [aboutData])

    if (loading) {
        return (
            <section id="about" className="py-14 md:py-20 bg-white overflow-hidden mt-10 md:mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                        <div className="w-full md:w-2/5 flex justify-center items-center">
                            <div className="w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] md:w-[350px] md:h-[350px] bg-gray-200 rounded-full animate-pulse"></div>
                        </div>
                        <div className="w-full md:w-3/5 space-y-4 animate-pulse">
                            <div className="h-12 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-24 bg-gray-200 rounded w-full"></div>
                            <div className="h-16 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section id="about" className="py-14 md:py-20 bg-white overflow-hidden mt-10 md:mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">

                    {/* Left Column */}
                    <div className="relative w-full md:w-2/5 flex justify-center items-center">
                        <div className="relative w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] md:w-[350px] md:h-[350px] z-0">

                            {/* Layer 1 */}
                            <div className="absolute top-0 right-[-10%] w-full h-full bg-[#E0F2FE] rounded-full z-0 pointer-events-none" />

                            {/* Layer 2 */}
                            <div className="absolute inset-0 m-auto w-full h-full rounded-full border border-cyan-400/80 scale-[1.03] z-10 pointer-events-none rotate-[-12deg] left-[-10%] -mt-4">
                                {/* Planet 1 */}
                                <div className="absolute top-[10%] right-[-4%] w-16 h-16 md:w-20 md:h-20 bg-cyan-400 rounded-full shadow-md" />

                                {/* Planet 2 */}
                                <div className="absolute top-[50%] -left-[3%] w-6 h-6 bg-cyan-400 rounded-full shadow-sm" />

                                {/* Planet 3 */}
                                <div className="absolute bottom-[23%] left-[0%] w-8 h-8 md:w-9 md:h-9 bg-cyan-300 rounded-full shadow-sm" />
                            </div>

                            {/* Layer 3 */}
                            <div className="relative w-full h-full rounded-full overflow-hidden z-10">
                                <img
                                    src={about.image || "/images/about-image.jpg"}
                                    alt="About TRAVELLO"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="w-full md:w-3/5 text-center md:text-left">
                        <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
                            {about.title || 'About TRAVELLO'}
                        </h2>

                        <p className="mt-6 text-slate-500 text-sm sm:text-base leading-relaxed mx-auto md:mx-0 max-w-2xl">
                            {about.description}
                        </p>

                        {/* Features Pills */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md mx-auto md:max-w-none md:mx-0">
                            {about.features?.slice(0, 4).map((feature, index) => (
                                <div key={index} className="bg-sky-50 px-4 py-3 rounded-full flex items-center gap-2">
                                    <span className="text-sky-500 text-lg">✓</span>
                                    <div>
                                        <span className="text-slate-700 font-medium text-sm">{feature.title}</span>
                                        <p className="text-slate-500 text-xs mt-1">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* CTA Button */}
                        <div className="mt-8 flex justify-center md:justify-start">
                            <button
                                onClick={() => navigate('/work/shop')}
                                className="px-8 py-3 rounded-full border-2 border-sky-500 text-sm text-sky-500 font-semibold hover:bg-sky-500 hover:text-white transition-colors duration-300"
                            >
                                Explore Our Services
                            </button>
                        </div>

                    </div>

                </div>
            </div>
        </section>
    )
}

export default AboutSection
