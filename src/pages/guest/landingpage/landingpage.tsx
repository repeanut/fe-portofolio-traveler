
import React from 'react'
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
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <StoriesSection />
      <AboutSection />
      <PortfolioSection />
      <CertificationsSection />
      <ServicesSection />
      <ExperienceSection />
      <FAQSection />
      <FooterSection />
    </div>
  )
}

export default LandingPage

