import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from './button'

const Navbar: React.FC = () => {
  const navigate = useNavigate()

  const handleAIChatbotClick = () => {
    navigate('/ai-chatbot')
  }

  return (
    <header className="w-full border-b border-gray-100 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 overflow-hidden rounded-full bg-gray-200">
            {/* Ganti src ini dengan foto profilmu */}
            <img
              src="https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=300"
              alt="Profile"
              className="h-full w-full object-cover"
            />
          </div>
          <span className="text-sm font-semibold text-gray-900">Rizqi Maulana</span>
        </div>

        <div className="flex items-center gap-8">
          <div className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
            <a href="#home" className="hover:text-gray-900">
              Home
            </a>
            <a href="#about" className="hover:text-gray-900">
              About
            </a>
            <a href="#blog" className="hover:text-gray-900">
              Blog
            </a>
            <a href="#work" className="hover:text-gray-900">
              Work
            </a>
            <a href="#process" className="hover:text-gray-900">
              Process
            </a>
            <a href="#contact" className="hover:text-gray-900">
              Contact
            </a>
          </div>

          <Button
            onClick={handleAIChatbotClick}
            className="text-xs px-4 py-2 text-white"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            AI Chatbot
          </Button>
        </div>
      </nav>
    </header>
  )
}

export default Navbar


