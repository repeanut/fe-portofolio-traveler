import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight, X, Heart, Send, MoreHorizontal } from 'lucide-react'

interface StoryItem {
    id: number
    type: 'image' | 'video'
    url: string
    duration?: number
}

interface Highlight {
    id: number
    label: string
    coverImage: string
    timestamp: string
    stories: StoryItem[]
    createdAt?: string
}

const StoriesSection: React.FC = () => {
    const scrollContainer = useRef<HTMLDivElement>(null)
    const [selectedHighlightIndex, setSelectedHighlightIndex] = useState<number | null>(null)
    const [highlights, setHighlights] = useState<Highlight[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch travel journals from API
    useEffect(() => {
        fetchTravelJournals();
        
        // Auto-refresh every minute to update timestamps
        const interval = setInterval(fetchTravelJournals, 60000);
        
        return () => clearInterval(interval);
    }, []);

    const fetchTravelJournals = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/travel-journal');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                // Transform API data to Highlight format
                const transformedHighlights: Highlight[] = result.data.journals.map((journal: any) => ({
                    id: journal.id,
                    label: journal.name,
                    coverImage: journal.cover,
                    timestamp: journal.timestamp || 'Just now',
                    stories: journal.images.map((img: string, idx: number) => ({
                        id: `${journal.id}_${idx}`,
                        type: 'image' as const,
                        url: img
                    })),
                    createdAt: journal.createdAt
                }));
                
                setHighlights(transformedHighlights);
                setError(null);
            } else {
                setError(result.message || 'Failed to fetch travel journals');
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Error connecting to backend API';
            setError(errorMessage);
            console.error('Error fetching travel journals:', err);
            
            // Fallback to hardcoded data if API fails
            setHighlights([
                {
                    id: 1,
                    label: 'Bali',
                    coverImage: '/foto 2.jpg',
                    timestamp: '54w',
                    stories: [
                        { id: 101, type: 'image', url: '/foto 2.jpg' },
                        { id: 102, type: 'image', url: '/foto 5.jpg' },
                        { id: 103, type: 'image', url: '/foto 7.jpg' }
                    ]
                },
                {
                    id: 2,
                    label: 'Tokyo',
                    coverImage: '/foto 1.jpg',
                    timestamp: '12w',
                    stories: [
                        { id: 201, type: 'image', url: '/foto 1.jpg' }
                    ]
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainer.current) {
            const scrollAmount = 300
            scrollContainer.current.scrollBy({
                left: direction === 'right' ? scrollAmount : -scrollAmount,
                behavior: 'smooth'
            })
        }
    };

    return (
        <section className="py-12 md:py-16 bg-gray-100 mt-10 md:mt-16" id="stories">
            {/* Viewer Modal */}
            {selectedHighlightIndex !== null && (
                <StoryViewer
                    highlights={highlights}
                    initialHighlightIndex={selectedHighlightIndex}
                    onClose={() => setSelectedHighlightIndex(null)}
                />
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 md:mb-12">
                    <h2 className="text-3xl md:text-4xl font-semibold text-slate-900">Travel Journal</h2>
                    <p className="text-slate-500 mt-2">Snippets from my global adventures.</p>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">Loading travel journals...</span>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-8">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && highlights.length === 0 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No travel journals yet</h3>
                        <p className="text-gray-600">Travel journals will appear here when added by admin.</p>
                    </div>
                )}

                {/* Content */}
                {!loading && !error && highlights.length > 0 && (
                    <div className="relative group flex items-center">
                        {/* Controls - Always visible */}
                        <button
                            onClick={() => scroll('left')}
                            className="hidden md:flex absolute left-0 z-10 h-12 w-12 lg:h-14 lg:w-14 -ml-4 bg-gray-100/80 backdrop-blur-sm rounded-full items-center justify-center text-slate-600 hover:bg-gray-200 transition-colors shadow-sm"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft className="h-6 w-6 text-gray-900" />
                        </button>

                        <button
                            onClick={() => scroll('right')}
                            className="hidden md:flex absolute right-0 z-10 h-12 w-12 lg:h-14 lg:w-14 -mr-4 bg-gray-100/80 backdrop-blur-sm rounded-full items-center justify-center text-slate-600 hover:bg-gray-200 transition-colors shadow-sm"
                            aria-label="Scroll right"
                        >
                            <ChevronRight className="h-6 w-6 text-gray-900" />
                        </button>

                        {/* Scroll Area */}
                        <div
                            ref={scrollContainer}
                            className="flex gap-4 sm:gap-6 md:gap-8 justify-start md:justify-center overflow-x-auto pb-4 pt-2 px-1 sm:px-8 w-full mx-auto scrollbar-hide scroll-smooth"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {highlights.map((highlight, index) => (
                                <div
                                    key={highlight.id}
                                    className="flex-none cursor-pointer group/story flex flex-col items-center gap-3"
                                    onClick={() => setSelectedHighlightIndex(index)}
                                >
                                    {/* Highlight Ring */}
                                    <div className="relative p-[3.5px] rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-pink-500 transition-transform duration-300 group-hover/story:scale-105">
                                        <div className="bg-white p-[5px] rounded-full">
                                            <div className="w-24 h-36 md:w-28 md:h-40 rounded-full overflow-hidden relative">
                                                <img
                                                    src={highlight.coverImage}
                                                    alt={highlight.label}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover/story:scale-110"
                                                    onError={(e) => {
                                                        e.currentTarget.src = '/placeholder.jpg';
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <span className="text-sm font-medium text-slate-700">{highlight.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

const StoryViewer: React.FC<{
    highlights: Highlight[]
    initialHighlightIndex: number
    onClose: () => void
}> = ({ highlights, initialHighlightIndex, onClose }) => {
    // State for which Highlight we are in
    const [currentHighlightIndex, setCurrentHighlightIndex] = useState(initialHighlightIndex)
    // State for which Story Item within the Highlight we are showing
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
    // Progress of the current story item
    const [progress, setProgress] = useState(0)

    const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null)

    const STORY_DURATION = 5000

    // Current Data context
    const currentHighlight = highlights[currentHighlightIndex]
    const currentStoryItem = currentHighlight?.stories?.[currentStoryIndex]

    // --- NAVIGATION LOGIC ---

    const handleNextStory = useCallback(() => {
        if (!currentHighlight?.stories) return;
        
        if (currentStoryIndex < currentHighlight.stories.length - 1) {
            setCurrentStoryIndex(prev => prev + 1)
            setProgress(0)
        } else {
            if (currentHighlightIndex < highlights.length - 1) {
                setCurrentHighlightIndex(prev => prev + 1)
                setCurrentStoryIndex(0)
                setProgress(0)
            } else {
                onClose()
            }
        }
    }, [currentHighlight, currentStoryIndex, currentHighlightIndex, highlights.length, onClose])

    const handlePrevStory = useCallback(() => {
        if (!currentHighlight?.stories) return;
        
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(prev => prev - 1)
            setProgress(0)
        } else {
            if (currentHighlightIndex > 0) {
                setCurrentHighlightIndex(prev => prev - 1)
                setCurrentStoryIndex(0)
                setProgress(0)
            }
        }
    }, [currentHighlight, currentStoryIndex, currentHighlightIndex])

    useEffect(() => {
        setProgress(0)
        progressInterval.current = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    handleNextStory()
                    return 0
                }
                return prev + (100 / (STORY_DURATION / 100))
            })
        }, 100)

        return () => {
            if (progressInterval.current) clearInterval(progressInterval.current)
        }
    }, [currentHighlightIndex, currentStoryIndex, handleNextStory])

    // --- PREVIEWS ---
    const prevHighlight = currentHighlightIndex > 0 ? highlights[currentHighlightIndex - 1] : null
    const nextHighlight = currentHighlightIndex < highlights.length - 1 ? highlights[currentHighlightIndex + 1] : null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1a1a]">
            {/* Top Controls */}
            <div className="absolute top-4 left-4 z-50">
                <img src="/logo-white.png" alt="" className="h-8 opacity-0" />
            </div>
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 p-2 text-white hover:scale-110 transition-transform"
            >
                <X size={28} />
            </button>

            {/* Main Layout: Prev Preview | Main Story | Next Preview */}
            <div className="relative flex items-center w-full max-w-6xl h-full p-4 gap-4 md:gap-12 justify-center">

                {/* Prev Highlight Preview / Button */}
                <div className="hidden md:flex flex-col items-center justify-center w-[200px] opacity-40 hover:opacity-100 transition-opacity cursor-pointer transform scale-75" onClick={() => {
                    if (currentHighlightIndex > 0) {
                        setCurrentHighlightIndex(prev => prev - 1);
                        setCurrentStoryIndex(0);
                        setProgress(0);
                    }
                }}>
                    {prevHighlight ? (
                        <div className="relative w-full aspect-[9/16] rounded-xl overflow-hidden bg-gray-800">
                            <img src={prevHighlight.coverImage} className="w-full h-full object-cover grayscale" alt="Prev" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                                    <ChevronLeft className="text-white" />
                                </div>
                            </div>
                            <div className="absolute bottom-4 left-0 right-0 text-center text-white font-medium">{prevHighlight.label}</div>
                        </div>
                    ) : (
                        <div className="w-full aspect-[9/16]" />
                    )}
                </div>

                {/* --- CENTRAL STORY --- */}
                <div className="relative w-full max-w-[400px] aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-2xl shrink-0">

                    {/* Header & Progress */}
                    <div className="absolute top-0 left-0 right-0 z-20 pt-3 px-3 bg-gradient-to-b from-black/60 to-transparent pb-12">
                        {/* Progress Bars */}
                        <div className="flex gap-1 mb-3">
                            {currentHighlight?.stories?.map((_, idx) => (
                                <div key={idx} className="h-[2px] flex-1 bg-white/30 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-white transition-all duration-100 ease-linear ${idx < currentStoryIndex ? 'w-full' : idx === currentStoryIndex ? '' : 'w-0'
                                            }`}
                                        style={{ width: idx === currentStoryIndex ? `${progress}%` : undefined }}
                                    />
                                </div>
                            )) || []}
                        </div>

                        {/* User Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
                                    <img src="/foto 6.jpg" alt="User" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-white text-sm font-semibold text-shadow-sm">Rizqi Maulana</span>
                                    <span className="text-white/60 text-xs font-medium">{currentHighlight?.timestamp || 'Just now'}</span>
                                </div>
                            </div>
                            <button className="text-white hover:opacity-80">
                                <MoreHorizontal size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    {currentStoryItem && (
                        <img
                            src={currentStoryItem.url}
                            alt={currentHighlight?.label || 'Story'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.src = '/placeholder.jpg';
                            }}
                        />
                    )}

                    {/* Touch Navigation Zones (Internal Story Nav) */}
                    <div className="absolute inset-y-0 left-0 w-1/4 z-10" onClick={handlePrevStory} />
                    <div className="absolute inset-y-0 right-0 w-1/4 z-10" onClick={handleNextStory} />

                    {/* Footer Interactive Area */}
                    <div className="absolute bottom-0 left-0 right-0 z-20 p-4 pb-6 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-3">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder={`Reply to Rizqi...`}
                                className="w-full bg-transparent border border-white/40 rounded-full py-2.5 px-4 text-white text-sm placeholder:text-white/70 focus:outline-none focus:border-white"
                            />
                        </div>
                        <button className="p-2 text-white hover:scale-110 transition-transform">
                            <Heart size={28} />
                        </button>
                        <button className="p-2 text-white hover:scale-110 transition-transform">
                            <Send size={26} className="-rotate-12 translate-y-[-2px]" />
                        </button>
                    </div>
                </div>

                {/* Next Highlight Preview / Button */}
                <div className="hidden md:flex flex-col items-center justify-center w-[200px] opacity-40 hover:opacity-100 transition-opacity cursor-pointer transform scale-75" onClick={() => {
                    if (currentHighlightIndex < highlights.length - 1) {
                        setCurrentHighlightIndex(prev => prev + 1);
                        setCurrentStoryIndex(0);
                        setProgress(0);
                    } else {
                        onClose();
                    }
                }}>
                    {nextHighlight ? (
                        <div className="relative w-full aspect-[9/16] rounded-xl overflow-hidden bg-gray-800">
                            <img src={nextHighlight.coverImage} className="w-full h-full object-cover grayscale" alt="Next" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                                    <ChevronRight className="text-white" />
                                </div>
                            </div>
                            <div className="absolute bottom-4 left-0 right-0 text-center text-white font-medium">{nextHighlight.label}</div>
                        </div>
                    ) : (
                        <div className="w-full aspect-[9/16] flex items-center justify-center">
                            <div onClick={onClose} className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors">
                                <X />
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Navigation Buttons */}
                <button onClick={handlePrevStory} className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 bg-white/10 p-2 rounded-full backdrop-blur-sm text-white z-20">
                    <ChevronLeft />
                </button>
                <button onClick={handleNextStory} className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 p-2 rounded-full backdrop-blur-sm text-white z-20">
                    <ChevronRight />
                </button>
            </div>
        </div>
    )
}

export default StoriesSection
