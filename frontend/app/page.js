import { generateHomePageSchemas } from '@/lib/seo'
import { LandingArtefacto } from '@/components/artefacto'

export const metadata = {
  title: 'ARTEFACTO 2027 | Feria de Arte Contemporaneo CDMX',
  description: 'ARTEFACTO - La feria de arte contemporaneo en CDMX. Semana del arte, exposiciones y convocatoria abierta para artistas emergentes. Febrero 2027 en Ciudad de Mexico.',
  keywords: 'artefacto, arte facto, arte-facto, feria de arte, feria de arte mexico, feria de arte cdmx, semana del arte, semana del arte mexico, art week mexico, exposicion de arte, arte contemporaneo, artistas emergentes, convocatoria artistas 2027, eventos arte cdmx',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'ARTEFACTO 2027 | Feria de Arte y Semana del Arte CDMX',
    description: 'La feria de arte contemporaneo en Mexico. Exposiciones, convocatoria para artistas emergentes y semana del arte. Febrero 2027.',
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
