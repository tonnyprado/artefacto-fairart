import { generateOrganizationSchema } from '@/lib/seo'

export const metadata = {
  title: 'Inicio',
  description: 'Bienvenido a ARTEFACT, la feria de arte que conecta artistas emergentes con coleccionistas y amantes del arte.',
}

export default function Home() {
  const organizationSchema = generateOrganizationSchema()

  return (
    <>
      {/* JSON-LD Schema para SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <main className="min-h-screen">
        <section className="container mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-8">
            Bienvenido a ARTEFACT
          </h1>
          <p className="text-xl text-center text-gray-600 max-w-2xl mx-auto">
            La feria de arte que conecta artistas emergentes con coleccionistas y amantes del arte.
          </p>

          {/* Aquí irá el contenido principal */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="p-6 border rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">Artistas</h2>
              <p className="text-gray-600">
                Descubre talento emergente y obras únicas de artistas locales.
              </p>
            </div>

            <div className="p-6 border rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">Eventos</h2>
              <p className="text-gray-600">
                Participa en nuestras ferias y eventos especiales durante el año.
              </p>
            </div>

            <div className="p-6 border rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">Inscripciones</h2>
              <p className="text-gray-600">
                ¿Eres artista? Conoce nuestros paquetes y forma parte de ARTEFACT.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
