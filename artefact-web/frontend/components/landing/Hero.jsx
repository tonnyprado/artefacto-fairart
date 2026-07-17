'use client'

import Link from 'next/link'
import Button from '@/components/ui/Button'

/**
 * Hero Section del Landing Page
 *
 * DATOS HARDCODEADOS (por ahora):
 * - Título principal
 * - Subtítulo/descripción
 * - Imagen de fondo
 * - Fecha del evento
 * - CTAs (Call to Actions)
 *
 * BASE DE DATOS FUTURA:
 * - Tabla: contenido
 *   WHERE tipo = 'hero'
 *   - titulo VARCHAR(255)
 *   - subtitulo TEXT
 *   - imagen VARCHAR(500)
 *   - cta_principal_texto VARCHAR(100)
 *   - cta_principal_url VARCHAR(255)
 *   - cta_secundario_texto VARCHAR(100)
 *   - cta_secundario_url VARCHAR(255)
 *
 * - Tabla: eventos
 *   WHERE activo = true AND tipo = 'feria_principal'
 *   - fecha_inicio TIMESTAMP
 *   - fecha_fin TIMESTAMP
 *   - nombre VARCHAR(255)
 */

export default function Hero() {
  // HARDCODED: En producción, estos datos vendrán de la BDD
  const heroData = {
    title: 'ARTEFACT 2027',
    subtitle: 'Feria de Arte Contemporáneo',
    description: 'Descubre el talento emergente de artistas locales. Una experiencia única donde el arte cobra vida.',
    eventDate: 'Febrero 2027',
    eventLocation: 'Ciudad de México',
    cta: {
      primary: {
        text: 'Registrarse como Artista',
        href: '/registro'
      },
      secondary: {
        text: 'Ver Convocatoria',
        href: '#convocatoria'
      }
    },
    // Placeholder image - en producción será una imagen real de Cloudinary
    backgroundImage: '/images/hero-bg.jpg'
  }

  const scrollToConvocatoria = (e) => {
    e.preventDefault()
    const element = document.getElementById('convocatoria')
    if (element) {
      const offset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image con Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-gray-900 to-black">
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-red-600/20 border border-red-500/30 rounded-full mb-8">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
            <span className="text-red-300 text-sm font-medium">
              {heroData.eventDate} • {heroData.eventLocation}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight">
            {heroData.title}
          </h1>

          {/* Subtitle */}
          <p className="text-2xl md:text-3xl text-red-300 font-light mb-6">
            {heroData.subtitle}
          </p>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            {heroData.description}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href={heroData.cta.primary.href}>
              <Button size="lg" className="w-full sm:w-auto">
                {heroData.cta.primary.text}
              </Button>
            </Link>
            <a href={heroData.cta.secondary.href} onClick={scrollToConvocatoria}>
              <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-white/10 border-white/30 text-white hover:bg-white/20">
                {heroData.cta.secondary.text}
              </Button>
            </a>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <div className="text-4xl font-bold text-white mb-2">3</div>
              <div className="text-gray-300 text-sm">Fases de Selección</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <div className="text-4xl font-bold text-white mb-2">20%</div>
              <div className="text-gray-300 text-sm">Artistas Seleccionados</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <div className="text-4xl font-bold text-white mb-2">2027</div>
              <div className="text-gray-300 text-sm">Próxima Edición</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="animate-bounce">
          <svg
            className="w-6 h-6 text-white/60"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>
    </section>
  )
}
