import React, { useState, useEffect, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'

interface ExperienceData {
    _id: string
    title: string
    company: string
    position: string
    description: string
    image: string
    startDate: string
    endDate: string | null
    currentJob: boolean
    location: string
    type: string
    department: string
    achievements: string[]
    technologies: string[]
    responsibilities: string[]
    skills: string[]
    featured: boolean
    isActive: boolean
    order: number
    tags: string[]
    createdAt: string
    updatedAt: string
}

interface Experience {
    id: number
    logo: string
    logoAlt: string
    title: string
    company: string
    period: string
    duration: string
    fullData: ExperienceData
}

const ExperienceSection: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)
    const [experiences, setExperiences] = useState<Experience[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [refreshing, setRefreshing] = useState(false)

    // Fetch experiences from backend
    const fetchExperiences = async () => {
        try {
            if (!refreshing) setLoading(true)
            const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://localhost:55435'
            console.log('Fetching experiences from:', `${API_BASE}/api/experience/active?featured=true&limit=10`)
            const response = await fetch(`${API_BASE}/api/experience/active?featured=true&limit=10`)
            
            console.log('Response status:', response.status)
            console.log('Response ok:', response.ok)
            
            if (!response.ok) {
                throw new Error(`Failed to fetch experiences. Status: ${response.status}`)
            }
            
            const data = await response.json()
            console.log('Experiences data:', data)
            
            if (data.success && data.data) {
                // Transform experience data to match the interface
                const transformedExperiences: Experience[] = data.data.map((exp: ExperienceData, index: number) => ({
                    id: index + 1,
                    logo: exp.image || '/welocalize_logo.jpeg', // Use existing logo as fallback
                    logoAlt: exp.company,
                    title: exp.position,
                    company: exp.company,
                    period: formatPeriod(exp.startDate, exp.endDate, exp.currentJob),
                    duration: calculateDuration(exp.startDate, exp.endDate, exp.currentJob),
                    fullData: exp
                }))
                
                setExperiences(transformedExperiences)
                console.log('Experiences loaded:', transformedExperiences)
                setError(null)
            } else {
                throw new Error(data.message || 'No data received')
            }
        } catch (err) {
            console.error('Error fetching experiences:', err)
            const error = err as Error
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            })
            setError(error.message || 'Failed to load experiences')
            
            // Fallback to default data if API fails
            setExperiences([
                {
                    id: 1,
                    logo: '/welocalize_logo.jpeg',
                    logoAlt: 'Welocalize',
                    title: 'Ads Quality Rater',
                    company: 'Welocalize',
                    period: 'Mar 2023 to May 2025',
                    duration: '2 yrs 3 mos',
                    fullData: {} as ExperienceData
                },
                {
                    id: 2,
                    logo: '/ginitalent.jpeg',
                    logoAlt: 'Gini Talent',
                    title: 'Search Quality Improvement Lead',
                    company: 'Gini Talent',
                    period: 'Jun 2025 to Present',
                    duration: '8 mos',
                    fullData: {} as ExperienceData
                },
                {
                    id: 3,
                    logo: '/indpendent_logo.jpeg',
                    logoAlt: 'Self Employed',
                    title: 'Copywriter',
                    company: 'Self Employed',
                    period: 'Jan 2020 to Present',
                    duration: '6 yrs 1 mo',
                    fullData: {} as ExperienceData
                }
            ])
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    // Manual refresh function
    const handleRefresh = () => {
        setRefreshing(true)
        fetchExperiences()
    }

    // Format period string
    const formatPeriod = (startDate: string, endDate: string | null, isCurrentJob: boolean): string => {
        const start = new Date(startDate)
        const end = endDate ? new Date(endDate) : null
        
        const startStr = start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        const endStr = isCurrentJob ? 'Present' : (end ? end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '')
        
        return `${startStr} to ${endStr}`
    }

    // Calculate duration
    const calculateDuration = (startDate: string, endDate: string | null, isCurrentJob: boolean): string => {
        const start = new Date(startDate)
        const end = isCurrentJob ? new Date() : (endDate ? new Date(endDate) : new Date())
        
        const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
        const years = Math.floor(months / 12)
        const remainingMonths = months % 12
        
        if (years > 0 && remainingMonths > 0) {
            return `${years} yrs ${remainingMonths} mos`
        } else if (years > 0) {
            return `${years} yrs`
        } else {
            return `${remainingMonths} mos`
        }
    }

    // Initialize data on mount and set up polling
    useEffect(() => {
        fetchExperiences()
        
        // Set up polling to check for new data every 30 seconds
        const interval = setInterval(fetchExperiences, 30000)
        
        return () => clearInterval(interval)
    }, [])

    const getVisibleCards = useCallback(() => {
        const total = experiences.length
        if (total === 0) return { prev: 0, active: 0, next: 0 }
        const prev = (activeIndex - 1 + total) % total
        const next = (activeIndex + 1) % total
        return { prev, active: activeIndex, next }
    }, [activeIndex, experiences.length])

    const handleCardClick = (experienceId: number) => {
        const index = experiences.findIndex(exp => exp.id === experienceId)
        if (!isAnimating && index !== activeIndex) {
            setIsAnimating(true)
            setActiveIndex(index)
            setTimeout(() => setIsAnimating(false), 500)
        }
    }

    useEffect(() => {
        if (experiences.length === 0) return
        
        const interval = setInterval(() => {
            if (!isAnimating) {
                setIsAnimating(true)
                setActiveIndex((prev) => (prev + 1) % experiences.length)
                setTimeout(() => setIsAnimating(false), 500)
            }
        }, 8000)

        return () => clearInterval(interval)
    }, [isAnimating, experiences.length])

    const handleDotClick = (index: number) => {
        if (!isAnimating && index !== activeIndex) {
            setIsAnimating(true)
            setActiveIndex(index)
            setTimeout(() => setIsAnimating(false), 500)
        }
    }

    // Handle preview button click
    const handlePreviewClick = async (experienceId: number) => {
        const experience = experiences.find(exp => exp.id === experienceId)
        if (experience && experience.fullData._id) {
            try {
                const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://localhost:55435'
                const response = await fetch(`${API_BASE}/api/experience/${experience.fullData._id}`)
                const data = await response.json()
                
                if (data.success) {
                    console.log('Experience detail data:', data.data)
                    // For now, just activate the card
                    const index = experiences.findIndex(h => h.id === experienceId)
                    if (index !== -1 && index !== activeIndex) {
                        handleCardClick(experienceId)
                    }
                }
            } catch (err) {
                console.error('Error fetching experience detail:', err)
                // Fallback to regular card click
                handleCardClick(experienceId)
            }
        }
    }

    if (loading) {
        return (
            <section className="py-14 md:py-20 bg-white" id="experience">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="text-slate-500 mt-4">Loading experiences...</p>
                    </div>
                </div>
            </section>
        )
    }

    if (error) {
        return (
            <section className="py-14 md:py-20 bg-white" id="experience">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <p className="text-red-500">Error: {error}</p>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </section>
        )
    }

    if (experiences.length === 0) {
        return (
            <section className="py-14 md:py-20 bg-white" id="experience">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <p className="text-slate-500">No experiences available at the moment.</p>
                    </div>
                </div>
            </section>
        )
    }

    const { prev, active, next } = getVisibleCards()

    const getCardStyle = (position: 'left' | 'center' | 'right') => {
        const baseStyle = {
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }

        switch (position) {
            case 'left':
                return {
                    ...baseStyle,
                    transform: 'translateX(-10%) scale(0.90)',
                    opacity: 1,
                    zIndex: 1,
                }
            case 'center':
                return {
                    ...baseStyle,
                    transform: 'translateX(0) scale(1.2)',
                    opacity: 1,
                    zIndex: 10,
                }
            case 'right':
                return {
                    ...baseStyle,
                    transform: 'translateX(10%) scale(0.90)',
                    opacity: 1,
                    zIndex: 1,
                }
        }
    }

    const renderCard = (experience: Experience, position: 'left' | 'center' | 'right') => {
        const isCenter = position === 'center'

        return (
            <div
                key={`${experience.id}-${position}`}
                onClick={() => !isCenter && handlePreviewClick(experience.id)}
                className={`absolute bg-white rounded-2xl shadow-lg border border-gray-100 overflow-visible
                    ${isCenter ? 'w-80 md:w-96' : 'w-64 md:w-72 cursor-pointer hover:opacity-90'}
                `}
                style={{
                    ...getCardStyle(position),
                    left: position === 'left' ? '5%' : position === 'center' ? '50%' : 'auto',
                    right: position === 'right' ? '5%' : 'auto',
                    marginLeft: position === 'center' ? '-12rem' : 0,
                }}
            >
                {/* Logo Circle - positioned above the card */}
                <div
                    className={`absolute left-1/2 -translate-x-1/2 rounded-full flex items-center justify-center shadow-md
                        ${isCenter ? 'w-20 h-20 -top-10' : 'w-16 h-16 -top-8'}
                    `}
                >
                    <img
                        src={experience?.logo || '/welocalize_logo.jpeg'}
                        alt={experience?.logoAlt || 'Company Logo'}
                        className={`object-contain ${isCenter ? 'w-20 h-20 rounded-full' : 'w-16 h-16 rounded-full'}`}
                    />
                </div>

                {/* Card Content */}
                <div className={`pt-14 pb-6 px-6 ${isCenter ? 'pt-16 pb-8' : ''}`}>
                    <h3 className={`font-semibold text-slate-800 text-center mb-2 ${isCenter ? 'text-lg' : 'text-sm'}`}>
                        {experience?.title || 'Experience Title'}
                    </h3>
                    <p className={`text-gray-400 text-center mb-6 ${isCenter ? 'text-sm' : 'text-xs'}`}>
                        {experience?.period || 'Period'} · {experience?.duration || 'Duration'}
                    </p>
                    <button
                        className={`w-full py-3 rounded-full text-white font-semibold bg-sky-500 hover:bg-sky-600 transition-colors
                            ${isCenter ? 'text-sm' : 'text-xs py-2.5'}
                        `}
                    >
                        {experience?.company || 'Company'}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <section className="py-14 md:py-20 bg-white" id="experience">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="mb-24 md:mb-12 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-semibold text-slate-800 mb-4">
                            My Experience
                        </h2>
                        <p className="text-gray-500 text-lg">
                            Professional journey and expertise
                        </p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>

                {/* Mobile: Carousel card */}
                <div className="md:hidden ">
                    {experiences.length > 0 && experiences[activeIndex] && (
                        <div className="mx-auto max-w-sm rounded-2xl bg-white shadow-lg border border-gray-100 overflow-visible relative">
                            <div className="absolute left-1/2 -translate-x-1/2 -top-10 w-20 h-20 rounded-full flex items-center justify-center shadow-md bg-white">
                                <img
                                    src={experiences[activeIndex].logo || '/welocalize_logo.jpeg'}
                                    alt={experiences[activeIndex].logoAlt || 'Company Logo'}
                                    className="w-20 h-20 rounded-full object-contain"
                                />
                            </div>

                            <div className="pt-16 pb-6 px-6">
                                <h3 className="font-semibold text-slate-800 text-center mb-2 text-lg">
                                    {experiences[activeIndex].title || 'Experience Title'}
                                </h3>
                                <p className="text-gray-400 text-center mb-6 text-sm">
                                    {experiences[activeIndex].period || 'Period'} · {experiences[activeIndex].duration || 'Duration'}
                                </p>
                                <button className="w-full py-3 rounded-full text-white font-semibold bg-sky-500 hover:bg-sky-600 transition-colors text-sm">
                                    {experiences[activeIndex].company || 'Company'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Desktop: Carousel Container */}
                <div className="hidden md:flex relative h-80 md:h-96 items-center justify-center overflow-hidden">
                    {/* Cards */}
                    <div className="relative w-full h-full flex items-center justify-center">
                        {experiences.length > 0 && experiences[prev] && renderCard(experiences[prev], 'left')}
                        {experiences.length > 0 && experiences[active] && renderCard(experiences[active], 'center')}
                        {experiences.length > 0 && experiences[next] && renderCard(experiences[next], 'right')}
                    </div>
                </div>

                {/* Pagination Dots */}
                <div className="flex justify-center items-center gap-1.5 mt-8">
                    {experiences.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => handleDotClick(index)}
                            className="rounded-full transition-all duration-300 focus:outline-none p-0 border-none"
                            style={{
                                width: index === activeIndex ? '12px' : '10px',
                                height: index === activeIndex ? '12px' : '10px',
                                padding: 0,
                                border: 'none',
                                backgroundColor: index === activeIndex ? '#22252aff' : '#d4d4d8',
                                opacity: index === activeIndex ? 0.9 : 0.7,
                            }}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            {/* CSS for smooth animations */}
            <style>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </section>
    )
}

export default ExperienceSection
