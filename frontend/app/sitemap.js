export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  // Rutas estáticas
  const routes = ['', '/artistas', '/eventos', '/inscripciones', '/contacto'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }))

  // Aquí se pueden agregar rutas dinámicas de artistas, eventos, etc.
  // Ejemplo:
  // const artistas = await fetch('API_URL/artistas').then(res => res.json())
  // const artistasRoutes = artistas.map((artista) => ({
  //   url: `${baseUrl}/artistas/${artista.slug}`,
  //   lastModified: artista.updatedAt,
  //   changeFrequency: 'monthly',
  //   priority: 0.6,
  // }))

  return [...routes]
}
