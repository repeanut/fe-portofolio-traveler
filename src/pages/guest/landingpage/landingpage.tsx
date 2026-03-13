
import React from 'react'
import ErrorBoundary from '../../../components/ui/ErrorBoundary'
import Navbar from '../../../components/ui/navbar'
import HeroSection from '../../../components/guest/landingpage/heroSection'
import StoriesSection from '../../../components/guest/landingpage/storiesSection'
import AboutSection from '../../../components/guest/landingpage/aboutSection'
import PortfolioSection from '../../../components/guest/landingpage/portfolioSection'
import CertificationsSection from '../../../components/guest/landingpage/certificationsSection'
import ServicesSection from '../../../components/guest/landingpage/servicesSection'
import ExperienceSection from '../../../components/guest/landingpage/experienceSection'
import FAQSection from '../../../components/guest/landingpage/faqSections'
import FooterSection from '../../../components/ui/footer'

const LandingPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <div id="home" className="min-h-screen bg-white">
        <ErrorBoundary>
          <Navbar />
        </ErrorBoundary>
        <ErrorBoundary>
          <HeroSection />
        </ErrorBoundary>
        <ErrorBoundary>
          <StoriesSection />
        </ErrorBoundary>
        <ErrorBoundary>
          <AboutSection />
        </ErrorBoundary>
        <ErrorBoundary>
          <PortfolioSection />
        </ErrorBoundary>
        <ErrorBoundary>
          <CertificationsSection />
        </ErrorBoundary>
        <ErrorBoundary>
          <ServicesSection />
        </ErrorBoundary>
        <ErrorBoundary>
          <ExperienceSection />
        </ErrorBoundary>
        <ErrorBoundary>
          <FAQSection />
        </ErrorBoundary>
        <ErrorBoundary>
          <FooterSection />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  )
}

export default LandingPage

