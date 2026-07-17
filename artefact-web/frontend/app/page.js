import { generateOrganizationSchema } from '@/lib/seo'
import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import AboutSection from '@/components/landing/AboutSection'
import ConvocatoriaSection from '@/components/landing/ConvocatoriaSection'
import CalendarSection from '@/components/landing/CalendarSection'
import ContactSection from '@/components/landing/ContactSection'
import Footer from '@/components/landing/Footer'

export const metadata = {
  title: 'ARTEFACT 2027 - Feria de Arte Contemporáneo',
  description: 'Descubre el talento emergente de artistas locales. ARTEFACT es una feria de arte que conecta artistas emergentes con coleccionistas y amantes del arte. Convocatoria abierta para Febrero 2027.',
  keywords: 'feria de arte, arte contemporáneo, artistas emergentes, exposición de arte, CDMX, convocatoria artistas',
}

/**
 * Landing Page Principal
 *
 * Componentes integrados:
 * - Navbar: Navegación sticky
 * - Hero: Hero section con CTA
 * - AboutSection: Información + Ubicación
 * - ConvocatoriaSection: Info de fases + descarga PDF + registro
 * - CalendarSection: Timeline de eventos
 * - ContactSection: Formulario de contacto
 * - Footer: Footer con links y redes
 *
 * TODOS LOS DATOS SON HARDCODEADOS POR AHORA
 * Ver comentarios en cada componente para estructura de BDD futura
 */

export default function Home() {
  const organizationSchema = generateOrganizationSchema()

  return (
    <>
      {/* JSON-LD Schema para SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <Hero />

        {/* About Section (incluye Ubicación) */}
        <AboutSection />

        {/* Convocatoria Section */}
        <ConvocatoriaSection />

        {/* Calendar Section */}
        <CalendarSection />

        {/* Contact Section */}
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer />
    </>
  )
}
