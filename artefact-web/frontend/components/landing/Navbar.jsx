'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

/**
 * Navbar del Landing Page
 *
 * DATOS HARDCODEADOS (por ahora):
 * - Logo y nombre de la feria
 * - Enlaces de navegación
 *
 * BASE DE DATOS FUTURA:
 * - Tabla: configuracion_sitio
 *   - logo_url VARCHAR(500)
 *   - nombre_sitio VARCHAR(255)
 *   - telefono VARCHAR(20)
 *   - email VARCHAR(255)
 */

const navLinks = [
  { name: 'Inicio', href: '#hero' },
  { name: 'Acerca de', href: '#about' },
  { name: 'Convocatoria', href: '#convocatoria' },
  { name: 'Calendario', href: '#calendario' },
  { name: 'Contacto', href: '#contacto' },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (e, href) => {
    e.preventDefault()
    const targetId = href.replace('#', '')
    const element = document.getElementById(targetId)

    if (element) {
      const offset = 80 // Altura del navbar
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }

    setIsMobileMenuOpen(false)
  }

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white shadow-md py-4'
          : 'bg-transparent py-6'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span
              className={cn(
                'text-2xl font-bold transition-colors',
                isScrolled ? 'text-gray-900' : 'text-white'
              )}
            >
              ARTEFACT
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className={cn(
                  'font-medium transition-colors hover:text-red-600',
                  isScrolled ? 'text-gray-700' : 'text-white'
                )}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2"
          >
            <div className="space-y-1.5">
              <span
                className={cn(
                  'block w-6 h-0.5 transition-colors',
                  isScrolled ? 'bg-gray-900' : 'bg-white'
                )}
              />
              <span
                className={cn(
                  'block w-6 h-0.5 transition-colors',
                  isScrolled ? 'bg-gray-900' : 'bg-white'
                )}
              />
              <span
                className={cn(
                  'block w-6 h-0.5 transition-colors',
                  isScrolled ? 'bg-gray-900' : 'bg-white'
                )}
              />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 bg-white rounded-lg shadow-lg">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className="block px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
