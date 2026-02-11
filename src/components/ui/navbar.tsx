import React, { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { Button } from './button'
import { ChevronRight, Menu, X } from 'lucide-react'

const Navbar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleAIChatbotClick = () => {
    setIsMobileMenuOpen(false)
    navigate('/ai-chatbot')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 overflow-hidden rounded-full bg-gray-200">
            <img
              src="/rizwords-nomad.jpg"
              alt="Profile"
              className="h-full w-full object-cover"
            />
          </div>
          <span className="text-sm font-semibold text-gray-900">Rizqi Maulana</span>
        </div>

        <div className="flex items-center gap-2 md:gap-8">
          <div className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
            <a href="/" className="hover:text-gray-900">
              Home
            </a>
            <a href="#about" className="hover:text-gray-900">
              About
            </a>
            <Link
              to="/work"
              className="inline-flex items-center gap-1 hover:text-gray-900 transition-colors"
            >
              Shop
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              to="/blog?from=landing"
              className={`hover:text-gray-900 transition-colors ${location.pathname === '/blog' ? 'text-gray-900' : ''}`}
            >
              Blog
            </Link>
          </div>

          <Button
            onClick={handleAIChatbotClick}
            className="hidden md:inline-flex text-xs px-4 py-2 text-white"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            AI Chatbot
          </Button>

          <button
            type="button"
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((v) => !v)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <div
        className={
          isMobileMenuOpen
            ? 'md:hidden absolute left-0 right-0 top-full z-50 border-t border-gray-100 bg-white shadow-lg rounded-b-2xl'
            : 'hidden'
        }
      >
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-col gap-2 text-sm font-medium text-gray-700">
            <a href="/" className="rounded-lg px-3 py-2 hover:bg-gray-50 hover:text-gray-900" onClick={() => setIsMobileMenuOpen(false)}>
              Home
            </a>
            <a href="#about" className="rounded-lg px-3 py-2 hover:bg-gray-50 hover:text-gray-900" onClick={() => setIsMobileMenuOpen(false)}>
              About
            </a>
            <Link
              to="/work"
              className="rounded-lg px-3 py-2 inline-flex items-center justify-between hover:bg-gray-50 hover:text-gray-900 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span>Shop</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              to="/blog?from=landing"
              className={`rounded-lg px-3 py-2 hover:bg-gray-50 hover:text-gray-900 transition-colors ${location.pathname === '/blog' ? 'text-gray-900' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Blog
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar


