import { generateOrganizationSchema } from '@/lib/seo'
import { LandingArtefacto } from '@/components/artefacto'

export const metadata = {
  title: 'ARTEFACT 2027 - Feria de Arte Contemporáneo',
  description: 'Descubre el talento emergente de artistas locales. ARTEFACT es una feria de arte que conecta artistas emergentes con coleccionistas y amantes del arte. Convocatoria abierta para Febrero 2027.',
  keywords: 'feria de arte, arte contemporáneo, artistas emergentes, exposición de arte, CDMX, convocatoria artistas',
}

/**
 * Landing Page Principal
 *
 * Ahora usando el componente LandingArtefacto que orquesta:
 * - Hero con fondo de letras animadas
 * - Navbar transparente con iconos-letra
 * - AboutSection: Información + Ubicación
 * - ConvocatoriaSection: Info de fases + descarga PDF + registro
 * - CalendarSection: Timeline de eventos
 * - ContactSection: Formulario de contacto
 * - Footer: Footer con links y redes
 * - Transiciones flip-clock entre secciones
 * - Smooth scroll con Lenis
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

      {/* Landing completa con transiciones SPA */}
      <LandingArtefacto />
    </>
  )
}
