import React, { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, X, MoreHorizontal, RefreshCw } from 'lucide-react'

interface TravelJournal {
    _id: string
    name: string
    cover: string
    travelImage: string
    description: string
    location: string
    date: string
    category: string
    tags: string[]
    isActive: boolean
    featured: boolean
    views: number
    likes: number
    author: string
    createdAt: string
    updatedAt: string
}

interface StoryItem {
    id: number
    type: 'image' | 'video'
    url: string
    duration?: number
}

interface Highlight {
    id: string
    label: string
    coverImage: string
    timestamp: string
    stories: StoryItem[]
    journalData: TravelJournal
}

const StoriesSection: React.FC = () => {
    const scrollContainer = useRef<HTMLDivElement>(null)
    const [selectedHighlightIndex, setSelectedHighlightIndex] = useState<number | null>(null)
    const [highlights, setHighlights] = useState<Highlight[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [refreshing, setRefreshing] = useState(false)
    const [sectionDescription, setSectionDescription] = useState('Snippets from our global adventures.')

    // Fetch travel journals from backend
    const fetchTravelJournals = async () => {
        try {
            if (!refreshing) setLoading(true)
            const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://localhost:55435'

            try {
                const resp = await fetch(`${API_BASE}/api/landing-page`)
                const json = await resp.json().catch(() => null)
                const desc = json?.data?.homePage?.storiesDescription
                if (typeof desc === 'string' && desc.trim()) {
                    setSectionDescription(desc)
                }
            } catch {
                // ignore
            }

            console.log('Fetching travel journals from:', `${API_BASE}/api/travel-journal/active`)
            const response = await fetch(`${API_BASE}/api/travel-journal/active`)
            
            console.log('Response status:', response.status)
            console.log('Response ok:', response.ok)
            
            if (!response.ok) {
                throw new Error(`Failed to fetch travel journals. Status: ${response.status}`)
            }
            
            const data = await response.json()
            console.log('Travel journals data:', data)
            
            if (data.success && data.data) {
                // Transform travel journal data to highlights format
                const transformedHighlights: Highlight[] = data.data.map((journal: TravelJournal) => ({
                    id: journal._id,
                    label: journal.name,
                    coverImage: journal.cover,
                    timestamp: formatTimestamp(journal.createdAt),
                    stories: [
                        { 
                            id: 1, 
                            type: 'image' as const, 
                            url: journal.travelImage 
                        }
                    ],
                    journalData: journal
                }))
                
                setHighlights(transformedHighlights)
                console.log('Travel journals loaded:', transformedHighlights)
                setError(null) // Clear any previous errors
            } else {
                throw new Error(data.message || 'No data received')
            }
        } catch (err) {
            console.error('Error fetching travel journals:', err)
            const error = err as Error
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            })
            setError(error.message || 'Failed to load travel journals')
            
            // Fallback to default data if API fails
            setHighlights([
                {
                    id: '1',
                    label: 'Bali',
                    coverImage: '/foto 2.jpg',
                    timestamp: '54w',
                    stories: [
                        { id: 101, type: 'image', url: '/foto 2.jpg' },
                        { id: 102, type: 'image', url: '/foto 5.jpg' },
                        { id: 103, type: 'image', url: '/foto 7.jpg' }
                    ],
                    journalData: {} as TravelJournal
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
        fetchTravelJournals()
    }

    // Initialize data on mount and set up polling
    useEffect(() => {
        fetchTravelJournals()
        
        // Set up polling to check for new data every 30 seconds
        const interval = setInterval(fetchTravelJournals, 30000)
        
        return () => clearInterval(interval)
    }, [])

    // Format timestamp to relative time
    const formatTimestamp = (dateString: string): string => {
        const date = new Date(dateString)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - date.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays < 7) {
            return `${diffDays}d`
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7)
            return `${weeks}w`
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30)
            return `${months}m`
        } else {
            const years = Math.floor(diffDays / 365)
            return `${years}y`
        }
    }

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainer.current) {
            const scrollAmount = 300
            scrollContainer.current.scrollBy({
                left: direction === 'right' ? scrollAmount : -scrollAmount,
                behavior: 'smooth'
            })
        }
    }

    // Handle preview button click
    const handlePreviewClick = async (journalId: string) => {
        try {
            const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://localhost:55435'
            const response = await fetch(`${API_BASE}/api/travel-journal/${journalId}/preview-data`)
            const data = await response.json()
            
            if (data.success) {
                // You can open a modal with the detailed journal data
                console.log('Journal preview data:', data.data)
                // For now, just open the story viewer
                const index = highlights.findIndex(h => h.id === journalId)
                if (index !== -1) {
                    setSelectedHighlightIndex(index)
                }
            }
        } catch (err) {
            console.error('Error fetching journal preview:', err)
            // Fallback to regular story viewer
            const index = highlights.findIndex(h => h.id === journalId)
            if (index !== -1) {
                setSelectedHighlightIndex(index)
            }
        }
    }

    if (loading) {
        return (
            <section className="py-12 md:py-16 bg-gray-100 mt-10 md:mt-16" id="stories">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="text-slate-500 mt-4">Loading travel journals...</p>
                    </div>
                </div>
            </section>
        )
    }

    if (error) {
        return (
            <section className="py-12 md:py-16 bg-gray-100 mt-10 md:mt-16" id="stories">
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
                <div className="mb-8 md:mb-12 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-semibold text-slate-900">Travel Journal</h2>
                        <p className="text-slate-500 mt-2">{sectionDescription}</p>
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

                {/* Carousel Container */}
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
                        {highlights.map((highlight) => (
                            <div
                                key={highlight.id}
                                className="flex-none cursor-pointer group/story flex flex-col items-center gap-3"
                                onClick={() => handlePreviewClick(highlight.id)}
                            >
                                {/* Highlight Ring */}
                                <div className="relative p-[3.5px] rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-pink-500 transition-transform duration-300 group-hover/story:scale-105">
                                    <div className="bg-white p-[5px] rounded-full">
                                        <div className="w-24 h-36 md:w-28 md:h-40 rounded-full overflow-hidden relative">
                                            <img
                                                src={highlight.coverImage}
                                                alt={highlight.label}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover/story:scale-110"
                                            />
                                            {/* Featured Badge */}
                                            {highlight.journalData?.featured && (
                                                <div className="absolute top-2 right-2 bg-yellow-400 text-xs px-2 py-1 rounded-full text-gray-800 font-semibold">
                                                    Featured
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <span className="text-sm font-medium text-slate-700 block">{highlight.label}</span>
                                    <span className="text-xs text-slate-500">{highlight.timestamp}</span>
                                    {/* Location */}
                                    {highlight.journalData?.location && (
                                        <span className="text-xs text-slate-400 block">{highlight.journalData.location}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
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
    const currentStoryItem = currentHighlight.stories[currentStoryIndex]

    // --- NAVIGATION LOGIC ---

    const handleNextStory = () => {
        if (currentStoryIndex < currentHighlight.stories.length - 1) {
            setCurrentStoryIndex(prev => prev + 1)
            setProgress(0)
        } else {
            handleNextHighlight()
        }
    }

    const handlePrevStory = () => {
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(prev => prev - 1)
            setProgress(0)
        } else {
            handlePrevHighlight()
        }
    }

    const handleNextHighlight = () => {
        if (currentHighlightIndex < highlights.length - 1) {
            setCurrentHighlightIndex(prev => prev + 1)
            setCurrentStoryIndex(0)
            setProgress(0)
        } else {
            onClose()
        }
    }

    const handlePrevHighlight = () => {
        if (currentHighlightIndex > 0) {
            setCurrentHighlightIndex(prev => prev - 1)
            setCurrentStoryIndex(0)
            setProgress(0)
        }
    }

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentHighlightIndex, currentStoryIndex])

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
                <div className="hidden md:flex flex-col items-center justify-center w-[200px] opacity-40 hover:opacity-100 transition-opacity cursor-pointer transform scale-75" onClick={handlePrevHighlight}>
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
                            {currentHighlight.stories.map((_, idx) => (
                                <div key={idx} className="h-[2px] flex-1 bg-white/30 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-white transition-all duration-100 ease-linear ${idx < currentStoryIndex ? 'w-full' : idx === currentStoryIndex ? '' : 'w-0'
                                            }`}
                                        style={{ width: idx === currentStoryIndex ? `${progress}%` : undefined }}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* User Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
                                    <img src="/foto 6.jpg" alt="User" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-white text-sm font-semibold text-shadow-sm">Rizqi Maulana</span>
                                    <span className="text-white/60 text-xs font-medium">{currentHighlight.timestamp}</span>
                                </div>
                            </div>
                            <button className="text-white hover:opacity-80">
                                <MoreHorizontal size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <img
                        src={currentStoryItem.url}
                        alt={currentHighlight.label}
                        className="w-full h-full object-cover"
                    />

                    {/* Touch Navigation Zones (Internal Story Nav) */}
                    <div className="absolute inset-y-0 left-0 w-1/4 z-10" onClick={handlePrevStory} />
                    <div className="absolute inset-y-0 right-0 w-1/4 z-10" onClick={handleNextStory} />

                </div>

                {/* Next Highlight Preview / Button */}
                <div className="hidden md:flex flex-col items-center justify-center w-[200px] opacity-40 hover:opacity-100 transition-opacity cursor-pointer transform scale-75" onClick={handleNextHighlight}>
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
