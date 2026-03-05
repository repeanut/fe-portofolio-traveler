import React, { useState, useEffect } from 'react'

interface Experience {
    id: number
    logo: string
    logoAlt: string
    title: string
    company: string
    period: string
    duration: string
}

const experiences: Experience[] = [
    {
        id: 1,
        logo: '/welocalize_logo.jpeg',
        logoAlt: 'Welocalize',
        title: 'Ads Quality Rater',
        company: 'Welocalize',
        period: 'Mar 2023 to May 2025',
        duration: '2 yrs 3 mos'
    },
    {
        id: 2,
        logo: '/ginitalent.jpeg',
        logoAlt: 'Gini Talent',
        title: 'Search Quality Improvement Lead',
        company: 'Gini Talent',
        period: 'Jun 2025 to Present',
        duration: '8 mos'
    },
    {
        id: 3,
        logo: '/indpendent_logo.jpeg',
        logoAlt: 'Self Employed',
        title: 'Copywriter',
        company: 'Self Employed',
        period: 'Jan 2020 to Present',
        duration: '6 yrs 1 mo'
    }
]

const ExperienceSection: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)

    const handleCardClick = (experienceId: number) => {
        const index = experiences.findIndex(exp => exp.id === experienceId)
        if (!isAnimating && index !== activeIndex) {
            setIsAnimating(true)
            setActiveIndex(index)
            setTimeout(() => setIsAnimating(false), 500)
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            if (!isAnimating) {
                setIsAnimating(true)
                setActiveIndex((prev) => (prev + 1) % experiences.length)
                setTimeout(() => setIsAnimating(false), 500)
            }
        }, 8000)

        return () => clearInterval(interval)
    }, [isAnimating])

    const handleDotClick = (index: number) => {
        if (!isAnimating && index !== activeIndex) {
            setIsAnimating(true)
            setActiveIndex(index)
            setTimeout(() => setIsAnimating(false), 500)
        }
    }

    const getOffsetFromActive = (index: number) => {
        const total = experiences.length
        const raw = (index - activeIndex + total) % total
        const half = Math.floor(total / 2)
        return raw > half ? raw - total : raw
    }

    const getCardStyle = (offset: number): React.CSSProperties => {
        const abs = Math.abs(offset)
        const isVisible = abs <= 1
        const baseStyle: React.CSSProperties = {
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            willChange: 'transform, opacity',
        }

        const translateVw = offset * 30
        const scale = offset === 0 ? 1.18 : 0.84
        const opacity = isVisible ? 1 : 0
        const zIndex = offset === 0 ? 10 : 1

        return {
            ...baseStyle,
            transform: `translateX(calc(-50% + ${translateVw}vw)) scale(${scale})`,
            opacity,
            zIndex,
            pointerEvents: isVisible ? ('auto' as const) : ('none' as const),
        }
    }

    const renderCard = (experience: Experience, index: number) => {
        const offset = getOffsetFromActive(index)
        const isCenter = offset === 0

        return (
            <div
                key={experience.id}
                onClick={() => !isCenter && handleCardClick(experience.id)}
                className={`absolute left-1/2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-visible w-80 md:w-96 ${
                    isCenter ? '' : 'cursor-pointer hover:opacity-95'
                }`}
                style={{
                    ...getCardStyle(offset),
                }}
            >
                {/* Logo Circle - positioned above the card */}
                <div
                    className={`absolute left-1/2 -translate-x-1/2 rounded-full flex items-center justify-center shadow-md
                        ${isCenter ? 'w-20 h-20 -top-10' : 'w-16 h-16 -top-8'}
                    `}
                >
                    <img
                        src={experience.logo}
                        alt={experience.logoAlt}
                        className={`object-contain ${isCenter ? 'w-20 h-20 rounded-full' : 'w-16 h-16 rounded-full'}`}
                    />
                </div>

                {/* Card Content */}
                <div className={`pt-14 pb-6 px-6 ${isCenter ? 'pt-16 pb-8' : ''}`}>
                    <h3 className={`font-semibold text-slate-800 text-center mb-2 ${isCenter ? 'text-lg' : 'text-sm'}`}>
                        {experience.title}
                    </h3>
                    <p className={`text-gray-400 text-center mb-6 ${isCenter ? 'text-sm' : 'text-xs'}`}>
                        {experience.period} · {experience.duration}
                    </p>
                    <button
                        className={`w-full py-3 rounded-full text-white font-semibold bg-sky-500 hover:bg-sky-600 transition-colors
                            ${isCenter ? 'text-sm' : 'text-xs py-2.5'}
                        `}
                    >
                        {experience.company}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <section className="py-14 md:py-20 bg-white" id="experience">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-24 md:mb-12">
                    <h2 className="text-3xl md:text-4xl font-semibold text-slate-800 mb-4">
                        My Experience
                    </h2>
                    <p className="text-gray-500 text-lg">
                        A snapshot of roles and projects that shaped my skills in content, strategy, and quality.
                    </p>
                </div>

                {/* Mobile: Carousel card */}
                <div className="md:hidden ">
                    <div className="mx-auto max-w-sm rounded-2xl bg-white shadow-lg border border-gray-100 overflow-visible relative">
                        <div className="absolute left-1/2 -translate-x-1/2 -top-10 w-20 h-20 rounded-full flex items-center justify-center shadow-md bg-white">
                            <img
                                src={experiences[activeIndex].logo}
                                alt={experiences[activeIndex].logoAlt}
                                className="w-20 h-20 rounded-full object-contain"
                            />
                        </div>

                        <div className="pt-16 pb-6 px-6">
                            <h3 className="font-semibold text-slate-800 text-center mb-2 text-lg">
                                {experiences[activeIndex].title}
                            </h3>
                            <p className="text-gray-400 text-center mb-6 text-sm">
                                {experiences[activeIndex].period} · {experiences[activeIndex].duration}
                            </p>
                            <button className="w-full py-3 rounded-full text-white font-semibold bg-sky-500 hover:bg-sky-600 transition-colors text-sm">
                                {experiences[activeIndex].company}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Desktop: Carousel Container */}
                <div className="hidden md:flex relative h-80 md:h-96 items-center justify-center overflow-hidden">
                    {/* Cards */}
                    <div className="relative w-full h-full flex items-center justify-center">
                        {experiences.map((experience, index) => renderCard(experience, index))}
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
