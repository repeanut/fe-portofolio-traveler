
import React, { useEffect, useRef, useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '../../ui/button'

interface HeroData {
  title: string;
  subtitle: string;
  backgroundImage: string;
  ctaText: string;
  isActive: boolean;
  badgeText?: string;
  brands?: string[];
}

const HERO_TITLE = 'Crafting narratives that move the world'

const HeroSection: React.FC = () => {
  const mobileCarouselRef = useRef<HTMLDivElement | null>(null)
  const autoScrollPausedRef = useRef(false)
  const resumeTimeoutRef = useRef<number | null>(null)
  const [heroData, setHeroData] = useState<HeroData | null>(null)
  const [loading, setLoading] = useState(true)

  const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://localhost:55435'

  const resolveBackendUrl = (url: string) => {
    if (!url) return url
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url
    if (url.startsWith('/api/') || url.startsWith('/images/') || url.startsWith('/uploads/')) {
      return `${API_BASE}${url}`
    }
    return url
  }

  // Fetch hero data from backend
  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        console.log('Fetching hero data from:', `${API_BASE}/api/landing-page`)
        const response = await fetch(`${API_BASE}/api/landing-page`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch hero data. Status: ${response.status}`)
        }
        
        const result = await response.json()
        console.log('Hero data result:', result)
        
        const hero = result?.data?.hero
        const heroImages = Array.isArray(result?.data?.heroImages) ? result.data.heroImages : []

        if (result.success && hero) {
          const backgroundImage =
            heroImages.find((x: any) => x?.isActive !== false)?.imageUrl ||
            '/images/hero-bg.jpg'

          setHeroData({
            title: HERO_TITLE,
            subtitle: hero.description || 'Discover amazing places around the world',
            backgroundImage,
            ctaText: 'Explore Now',
            isActive: hero.isActive !== false,
            badgeText: String(hero.badge ?? ''),
            brands: Array.isArray(hero.brands) ? (hero.brands as string[]) : [],
          })
        } else {
          console.log('No hero data found, using fallback')
        }
      } catch (error) {
        console.error('Error fetching hero data:', error)
        // Use fallback data
        setHeroData({
          title: HERO_TITLE,
          subtitle: 'Discover amazing places around the world',
          backgroundImage: '/images/hero-bg.jpg',
          ctaText: 'Explore Now',
          isActive: true,
          badgeText: 'TRAVELLO',
          brands: []
        })
      } finally {
        setLoading(false)
      }
    }

    fetchHeroData()
  }, [])

  const pauseAutoScroll = () => {
    autoScrollPausedRef.current = true
    if (resumeTimeoutRef.current) {
      window.clearTimeout(resumeTimeoutRef.current)
      resumeTimeoutRef.current = null
    }
    resumeTimeoutRef.current = window.setTimeout(() => {
      autoScrollPausedRef.current = false
    }, 2200)
  }

  useEffect(() => {
    const el = mobileCarouselRef.current
    if (!el) return

    const intervalId = window.setInterval(() => {
      if (autoScrollPausedRef.current) return
      if (!mobileCarouselRef.current) return

      const container = mobileCarouselRef.current
      const nextLeft = container.scrollLeft + Math.min(container.clientWidth * 0.8, 240)

      if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 8) {
        container.scrollTo({ left: 0, behavior: 'smooth' })
        return
      }

      container.scrollTo({ left: nextLeft, behavior: 'smooth' })
    }, 2600)

    return () => {
      window.clearInterval(intervalId)
      if (resumeTimeoutRef.current) {
        window.clearTimeout(resumeTimeoutRef.current)
        resumeTimeoutRef.current = null
      }
    }
  }, [])

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-7xl flex flex-col md:flex-row items-center md:items-start md:justify-between gap-10 px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex-1 space-y-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded-full w-3/4"></div>
          <div className="h-12 bg-gray-200 rounded w-full"></div>
          <div className="h-12 bg-gray-200 rounded w-5/6"></div>
          <div className="h-20 bg-gray-200 rounded w-full"></div>
        </div>
        <div className="flex-1 space-y-4 animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </main>
    )
  }

  return (
    <main 
      className="mx-auto w-full max-w-7xl flex flex-col md:flex-row items-center md:items-start md:justify-between gap-10 px-4 sm:px-6 lg:px-8 py-12 md:py-16"
      style={{
        backgroundImage: heroData?.backgroundImage ? `url(${heroData.backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: heroData?.backgroundImage ? 'transparent' : '#f8fafc'
      }}
    >
      {/* Left Content */}
      <section className="flex-1 space-y-6 text-center md:text-left bg-white/90 backdrop-blur-sm p-6 rounded-lg" id="home">
        <div className="inline-flex items-center gap-3 rounded-full bg-sky-50 px-3 py-2 text-[11px] font-medium text-sky-600 mx-auto md:mx-0">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-white">
            <Star className="h-3.5 w-3.5" />
          </span>
          <span className="tracking-wide uppercase text-gray-400">{heroData?.badgeText || 'TRAVELLO'}</span>
        </div>

        <h1 className="text-[32px] md:text-[54px] font-semibold leading-tight text-slate-900 tracking-tight">
          {heroData?.title || 'Crafting narratives that move the world'}
        </h1>

        <p className="max-w-xl text-sm sm:text-[15px] leading-relaxed text-slate-500 mx-auto md:mx-0">
          {heroData?.subtitle || 'Discover amazing places around the world'}
        </p>

        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
          <Button
            size="lg"
            className=" hover:opacity-90 text-white"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {heroData?.ctaText || 'Explore Now'}
          </Button>
          <Button
            size="lg"
            className="inline-flex items-center gap-2 rounded-full border-2 border-gray-200 bg-transparent text-gray-900 hover:bg-slate-100"
            onClick={() => {
              const target = document.getElementById('stories')
              if (target) {
                const yOffset = -140
                const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset
                window.scrollTo({ top: y, behavior: 'smooth' })
              }
            }}
          >
            <span>Explore Stories</span>
            <span className="text-lg">→</span>
          </Button>
        </div>

        {/* Featured brands */}
        {(() => {
          const brands = (heroData?.brands && heroData.brands.length > 0
            ? heroData.brands
            : [
                '/Amazon-Logo 1.png',
                '/Hilton-Logo 1.png',
                '/Verizon-Logo 1.png',
                '/Williams-Sonoma-Logo 1.png',
                '/Dr-Bronners-Logo 1.png',
                '/Purina-Logo 1.png',
              ]
          ).map((src, idx) => ({
            src: resolveBackendUrl(String(src)),
            alt: `Brand ${idx + 1}`,
          }))
          const MAX_VISIBLE = 11
          const visibleBrands = brands.slice(0, MAX_VISIBLE)
          const remainingCount = brands.length - MAX_VISIBLE

          return (
            <div className="mt-10 md:mt-30 space-y-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6">
                {visibleBrands.map((brand, index) => (
                  <img
                    key={index}
                    src={brand.src}
                    alt={brand.alt}
                    className="h-9 sm:h-10 md:h-12 object-contain grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer"
                  />
                ))}
                {remainingCount > 0 && (
                  <div className="h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-semibold text-xs sm:text-sm">
                    +{remainingCount}
                  </div>
                )}
              </div>
            </div>
          )
        })()}
      </section>

      <section className="w-full md:hidden">
        <div className="relative">
          <div
            ref={mobileCarouselRef}
            className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide px-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onScroll={pauseAutoScroll}
            onTouchStart={pauseAutoScroll}
            onMouseDown={pauseAutoScroll}
          >
            <div className="snap-center shrink-0 w-[210px] sm:w-[230px]">
              <div className="aspect-[3/4] w-full overflow-hidden rounded-3xl bg-slate-100 shadow-sm ring-1 ring-black/5">
                <img src="/foto 2.jpg" alt="Hero 1" className="h-full w-full object-cover" />
              </div>
            </div>
            <div className="snap-center shrink-0 w-[210px] sm:w-[230px]">
              <div className="aspect-[3/4] w-full overflow-hidden rounded-3xl bg-slate-100 shadow-sm ring-1 ring-black/5">
                <img src="/foto 4.jpg" alt="Hero 2" className="h-full w-full object-cover" />
              </div>
            </div>
            <div className="snap-center shrink-0 w-[210px] sm:w-[230px]">
              <div className="aspect-[3/4] w-full overflow-hidden rounded-3xl bg-slate-100 shadow-sm ring-1 ring-black/5">
                <img src="/foto 6.jpg" alt="Hero 3" className="h-full w-full object-cover" />
              </div>
            </div>
            <div className="snap-center shrink-0 w-[210px] sm:w-[230px]">
              <div className="aspect-[3/4] w-full overflow-hidden rounded-3xl bg-slate-100 shadow-sm ring-1 ring-black/5">
                <img src="/foto 7.jpg" alt="Hero 4" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right Image Grid */}
      <section className="relative flex-1 hidden md:block">
        <div className="relative mx-auto w-full max-w-[600px]">

          <div className="flex gap-4 items-end justify-center">
            {/* Column 1 */}
            <div className="flex flex-col gap-4 w-[180px]">
              {/* Image 1 */}
              <div className="h-[230px] rounded-tl-[100px] overflow-hidden">
                <img src="/foto 2.jpg" alt="Gallery 1" className="w-full h-full object-cover" />
              </div>
              {/* Image 2 */}
              <div className="h-[170px] rounded-br-[100px] overflow-hidden">
                <img src="/foto 1.jpg" alt="Gallery 2" className="w-full h-full object-cover" />
              </div>
              {/* Image 3 */}
              <div className="h-[190px] rounded-tr-[100px] overflow-hidden">
                <img src="/foto 3.jpg" alt="Gallery 3" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-4 w-[180px]">
              {/* Image 1 */}
              <div className="h-[250px] rounded-t-[30px] rounded-br-[100px] overflow-hidden">
                <img src="/foto 4.jpg" alt="Gallery 4" className="w-full h-full object-cover" />
              </div>
              {/* Image 2 */}
              <div className="h-[250px] rounded-tl-[100px] rounded-br-[100px] overflow-hidden">
                <img src="/foto 5.jpg" alt="Gallery 5" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Column 3 */}
            <div className="flex flex-col gap-4 w-[180px]">
              {/* Image 1 */}
              <div className="h-[210px] rounded-l-[100px] rounded-br-[100px] overflow-hidden">
                <img src="/foto 6.jpg" alt="Gallery 6" className="w-full h-full object-cover" />
              </div>
              {/* Image 2 */}
              <div className="h-[220px] rounded-tl-[100px] rounded-bl-[30px] overflow-hidden">
                <img src="/foto 7.jpg" alt="Gallery 7" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default HeroSection

