'use client'

import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

/**
 * About Section - Acerca de la Feria (incluye Ubicación)
 *
 * DATOS HARDCODEADOS (por ahora):
 * - Historia de la feria
 * - Misión y visión
 * - Valores
 * - Ubicación del evento
 * - Mapa (Google Maps embed o coordenadas)
 *
 * BASE DE DATOS FUTURA:
 * - Tabla: contenido
 *   WHERE tipo = 'about'
 *   - titulo VARCHAR(255)
 *   - contenido TEXT
 *   - mision TEXT
 *   - vision TEXT
 *
 * - Tabla: eventos
 *   WHERE activo = true
 *   - ubicacion TEXT
 *   - direccion_completa TEXT
 *   - coordenadas_lat DECIMAL(10, 8)
 *   - coordenadas_lng DECIMAL(11, 8)
 *   - lugar_nombre VARCHAR(255)
 *   - ciudad VARCHAR(100)
 *   - estado VARCHAR(100)
 */

export default function AboutSection() {
  // HARDCODED: En producción, estos datos vendrán de la BDD
  const aboutData = {
    title: 'Acerca de ARTEFACT',
    description: 'ARTEFACT es una feria de arte contemporáneo que nace con el objetivo de impulsar y visibilizar el talento de artistas emergentes. Creamos un espacio donde el arte se encuentra con coleccionistas, galeristas y amantes del arte.',
    mission: 'Nuestra misión es crear un puente entre artistas emergentes y el mercado del arte, proporcionando una plataforma profesional para la exhibición y comercialización de obras contemporáneas.',
    values: [
      {
        title: 'Calidad',
        description: 'Selección rigurosa de artistas a través de curadores profesionales',
        icon: '🎨'
      },
      {
        title: 'Inclusión',
        description: 'Espacio abierto para todas las disciplinas y expresiones artísticas',
        icon: '🤝'
      },
      {
        title: 'Profesionalismo',
        description: 'Estándares de calidad internacional en organización y curaduría',
        icon: '⭐'
      }
    ],
    location: {
      name: 'Centro de Convenciones CDMX',
      address: 'Av. Reforma 123, Cuauhtémoc',
      city: 'Ciudad de México',
      state: 'CDMX',
      zipCode: '06600',
      country: 'México',
      // Coordenadas de ejemplo (Google Maps embed)
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3762.6026394046724!2d-99.16580168509398!3d19.432607986886587!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d1ff35f5bd1563%3A0x6c366f0e2de02ff7!2sCentro%20Hist%C3%B3rico%2C%20CDMX!5e0!3m2!1ses!2smx!4v1234567890'
    }
  }

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {aboutData.title}
          </h2>
          <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {aboutData.description}
          </p>
        </div>

        {/* Mission */}
        <div className="mb-16 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8 md:p-12 border-l-4 border-red-600">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Nuestra Misión</h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              {aboutData.mission}
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Nuestros Valores
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {aboutData.values.map((value, index) => (
              <Card key={index} hover>
                <div className="text-center">
                  <div className="text-5xl mb-4">{value.icon}</div>
                  <CardHeader>
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{value.description}</p>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Location Section */}
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Ubicación del Evento
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Location Info */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="mb-6">
                <div className="flex items-start mb-4">
                  <div className="text-2xl mr-4">📍</div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      {aboutData.location.name}
                    </h4>
                    <p className="text-gray-600">
                      {aboutData.location.address}<br />
                      {aboutData.location.city}, {aboutData.location.state}<br />
                      C.P. {aboutData.location.zipCode}<br />
                      {aboutData.location.country}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h5 className="font-semibold text-gray-900 mb-4">Cómo llegar</h5>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start">
                    <span className="text-lg mr-3">🚇</span>
                    <div>
                      <strong>Metro:</strong> Línea 1 - Estación Reforma
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-lg mr-3">🚌</span>
                    <div>
                      <strong>Metrobús:</strong> Línea 4 - Reforma
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-lg mr-3">🚗</span>
                    <div>
                      <strong>Estacionamiento:</strong> Disponible en el lugar
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Maps */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="relative w-full h-full min-h-[400px]">
                <iframe
                  src={aboutData.location.mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
