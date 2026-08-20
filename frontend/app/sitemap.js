/**
 * Sitemap configuration
 *
 * Genera el sitemap.xml automaticamente con todas las
 * paginas del sitio para mejorar la indexacion en buscadores.
 */

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://arte-facto.mx'

  // Fecha de ultima modificacion
  const lastModified = new Date().toISOString()

  // Rutas estaticas principales
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/registro`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Rutas de secciones (anchors de la landing)
  const sectionRoutes = [
    {
      url: `${baseUrl}/#about`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#convocatoria`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/#calendario`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/#contacto`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // TODO: Rutas dinamicas de artistas (cuando esten disponibles en produccion)
  // Descomentar cuando el backend este configurado con rutas publicas de artistas
  /*
  let artistasRoutes = []
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const response = await fetch(`${apiUrl}/artistas/public`)
    if (response.ok) {
      const artistas = await response.json()
      artistasRoutes = artistas.map((artista) => ({
        url: `${baseUrl}/artistas/${artista.slug}`,
        lastModified: artista.updatedAt || lastModified,
        changeFrequency: 'monthly',
        priority: 0.6,
      }))
    }
  } catch (error) {
    console.error('Error fetching artistas for sitemap:', error)
  }
  */

  return [
    ...staticRoutes,
    ...sectionRoutes,
    // ...artistasRoutes,
  ]
}
