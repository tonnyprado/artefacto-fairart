/**
 * Robots.txt configuration
 *
 * Este archivo controla como los motores de busqueda
 * (Google, Bing, etc.) rastrean tu sitio web.
 */

export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://arte-facto.mx'

  return {
    rules: [
      {
        // Reglas para todos los bots
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',      // Panel de administracion
          '/api/',        // Endpoints de API
          '/curador/',    // Area de curadores
          '/_next/',      // Assets internos de Next.js
          '/private/',    // Archivos privados
        ],
      },
      {
        // Reglas especificas para Googlebot
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/api/', '/curador/'],
      },
      {
        // Reglas para bots de imagenes
        userAgent: 'Googlebot-Image',
        allow: ['/assets/', '/og-image.jpg'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
