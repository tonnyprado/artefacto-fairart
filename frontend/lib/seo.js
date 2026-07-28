/**
 * Utilidades para SEO y Schema.org markup
 */

/**
 * Genera Schema.org markup para la organización
 */
export function generateOrganizationSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ARTEFACT - Feria de Arte',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'Feria de arte que conecta artistas emergentes con coleccionistas y amantes del arte',
    contactPoint: {
      '@type': 'ContactPoint',
      email: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
      contactType: 'customer service',
      availableLanguage: ['Spanish', 'English']
    },
    sameAs: [
      // Agregar redes sociales cuando estén disponibles
      // 'https://www.facebook.com/artefact',
      // 'https://www.instagram.com/artefact',
      // 'https://twitter.com/artefact',
    ]
  }
}

/**
 * Genera Schema.org markup para un evento
 */
export function generateEventSchema(event) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.location?.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: event.location?.address,
        addressLocality: event.location?.city,
        addressCountry: event.location?.country
      }
    },
    image: event.image ? `${baseUrl}${event.image}` : undefined,
    organizer: {
      '@type': 'Organization',
      name: 'ARTEFACT',
      url: baseUrl
    }
  }
}

/**
 * Genera Schema.org markup para un artista (Person/Artist)
 */
export function generateArtistSchema(artist) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: artist.name,
    description: artist.bio,
    url: `${baseUrl}/artistas/${artist.slug}`,
    image: artist.photo ? `${baseUrl}${artist.photo}` : undefined,
    jobTitle: 'Artist',
    workLocation: artist.location,
    sameAs: artist.socialLinks || []
  }
}

/**
 * Genera Schema.org markup para una obra de arte
 */
export function generateArtworkSchema(artwork) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    name: artwork.title,
    description: artwork.description,
    image: artwork.image ? `${baseUrl}${artwork.image}` : undefined,
    creator: {
      '@type': 'Person',
      name: artwork.artist?.name
    },
    artMedium: artwork.medium,
    artform: artwork.category,
    dateCreated: artwork.year,
    width: artwork.dimensions?.width,
    height: artwork.dimensions?.height,
    offers: artwork.price ? {
      '@type': 'Offer',
      price: artwork.price,
      priceCurrency: 'MXN',
      availability: artwork.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
    } : undefined
  }
}

/**
 * Genera breadcrumbs Schema.org markup
 */
export function generateBreadcrumbSchema(items) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.path}`
    }))
  }
}
