import { generateHomePageSchemas } from '@/lib/seo'
import { LandingArtefacto } from '@/components/artefacto'

export const metadata = {
  title: 'ARTEFACTO 2027 | Feria de Arte Contemporaneo en Mexico',
  description: 'Descubre el talento emergente de artistas mexicanos. ARTEFACTO es la feria de arte contemporaneo que conecta artistas con coleccionistas y amantes del arte. Convocatoria abierta Febrero 2027.',
  keywords: 'feria de arte, arte contemporaneo, artistas emergentes, exposicion de arte, CDMX, convocatoria artistas 2027, galeria mexico',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'ARTEFACTO 2027 | Feria de Arte Contemporaneo',
    description: 'Descubre el talento emergente de artistas mexicanos. Convocatoria abierta Febrero 2027.',
  },
}

/**
 * Landing Page Principal
 *
 * Componentes:
 * - Hero con fondo de letras animadas
 * - Navbar transparente con iconos-letra
 * - AboutSection: Informacion + Ubicacion
 * - ConvocatoriaSection: Info de fases + descarga PDF + registro
 * - CalendarSection: Timeline de eventos
 * - ContactSection: Formulario de contacto
 * - Footer: Footer con links y redes
 * - Transiciones flip-clock entre secciones
 * - Smooth scroll con Lenis
 */

export default function Home() {
  const schemas = generateHomePageSchemas()

  return (
    <>
      {/* JSON-LD Structured Data para SEO */}
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* Landing completa con transiciones SPA */}
      <LandingArtefacto />
    </>
  )
}
