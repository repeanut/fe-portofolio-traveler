import React, { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { Button } from '../../ui/button'

interface HeroContent {
  id: number;
  title: string;
  subtitle: string;
  content: string;
  imageUrl: string;
  section: string;
}

const HeroSection: React.FC = () => {
  const [heroData, setHeroData] = useState<HeroContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHeroData();
  }, []);

  const fetchHeroData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/landing-pages/section/hero');
      const result = await response.json();
      
      if (result.success) {
        setHeroData(result.data || []);
      }
    } catch (err) {
      console.error('Error fetching hero data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const hero = heroData[0]; // Get first hero item

  if (isLoading) {
    return (
      <main className="max-w-7xl flex flex-col md:flex-row items-center md:items-start md:justify-between gap-8 px-4 mx-auto py-16">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-4"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl flex flex-col md:flex-row items-center md:items-start md:justify-between gap-8 px-4 mx-auto py-16">
      {/* Left Content */}
      <section className="flex-1 space-y-6" id="home">
        <div className="inline-flex items-center gap-3 rounded-full bg-sky-50 px-3 py-2 text-[11px] font-medium text-sky-600">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-white">
            <Star className="h-3.5 w-3.5" />
          </span>
          <span className="tracking-wide uppercase text-gray-400">
            {hero?.subtitle || 'Digital Nomad & Creative Strategist'}
          </span>
        </div>

        <h1 className="text-[40px] md:text-[54px] font-semibold leading-tight text-slate-900 tracking-tight">
          {hero?.title ? (
            hero.title.includes('\n') ? (
              hero.title.split('\n').map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  {index < hero.title.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))
            ) : (
              hero.title
            )
          ) : (
            <>
              Crafting narratives
              <br />
              that<span className="text-sky-500"> move the world.</span>
            </>
          )}
        </h1>

        <p className="max-w-xl text-[15px] leading-relaxed text-slate-500">
          {hero?.content || 'Bridging the gap between global marketing strategy and authentic storytelling. Based in Bali, working globally.'}
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Button
            size="lg"
            className=" hover:opacity-90 text-white"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            View Work
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
          const brands = [
            { src: '/Amazon-Logo 1.png', alt: 'Amazon logo' },
            { src: '/Hilton-Logo 1.png', alt: 'Hilton logo' },
            { src: '/Verizon-Logo 1.png', alt: 'Verizon logo' },
            { src: '/Williams-Sonoma-Logo 1.png', alt: 'Williams Sonoma logo' },
            { src: '/Dr-Bronners-Logo 1.png', alt: 'Dr. Bronners logo' },
            { src: '/Purina-Logo 1.png', alt: 'Purina logo' },
          ]
          const MAX_VISIBLE = 11
          const visibleBrands = brands.slice(0, MAX_VISIBLE)
          const remainingCount = brands.length - MAX_VISIBLE

          return (
            <div className="mt-30 space-y-1">
              <div className="flex flex-wrap items-center gap-4 md:gap-6">
                {visibleBrands.map((brand, index) => (
                  <img
                    key={index}
                    src={brand.src}
                    alt={brand.alt}
                    className="h-12 object-contain grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer"
                  />
                ))}
                {remainingCount > 0 && (
                  <div className="h-12 w-12 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-semibold text-sm">
                    +{remainingCount}
                  </div>
                )}
              </div>
            </div>
          )
        })()}
      </section>

      {/* Right Image */}
      <section className="flex-1 flex items-center justify-center">
        <div className="relative">
          <img
            src={hero?.imageUrl || "/rizwords-nomad.jpg"}
            alt="Profile"
            className="w-full max-w-md h-auto rounded-2xl object-cover shadow-2xl"
          />
        </div>
      </section>
    </main>
  );
};

export default HeroSection;
