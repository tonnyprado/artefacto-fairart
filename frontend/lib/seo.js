/**
 * Utilidades para SEO y Schema.org markup
 *
 * Genera structured data (JSON-LD) para mejorar el SEO y
 * la representacion del sitio en resultados de busqueda.
 */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://arte-facto.mx'

/**
 * Genera Schema.org markup para la organizacion ARTEFACTO
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: 'ARTEFACTO',
    // Variaciones del nombre para que Google asocie todas las busquedas
    alternateName: [
      'ARTEFACTO Feria de Arte',
      'Arte Facto',
      'Arte-Facto',
      'ARTE FACTO',
      'Artefacto Feria de Arte Contemporaneo',
      'Artefacto Mexico',
      'Artefacto CDMX',
      'Feria Artefacto',
    ],
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/assets/logo-artefacto.png`,
      width: 512,
      height: 512,
    },
    image: `${BASE_URL}/og-image.jpg`,
    description: 'Feria de arte contemporaneo que impulsa y conecta artistas emergentes con coleccionistas, curadores y amantes del arte en Mexico.',
    foundingDate: '2024',
    foundingLocation: {
      '@type': 'Place',
      name: 'Ciudad de Mexico',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Ciudad de Mexico',
        addressCountry: 'MX',
      }
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Providencia 325, Col. Del Valle Norte',
      addressLocality: 'Ciudad de Mexico',
      addressRegion: 'Benito Juarez',
      postalCode: '03103',
      addressCountry: 'MX',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+52-55-7836-3207',
        contactType: 'customer service',
        email: 'curatorial@arte-facto.mx',
        availableLanguage: ['Spanish', 'English'],
        areaServed: 'MX',
      },
    ],
    sameAs: [
      'https://www.instagram.com/artefacto.feria',
      'https://wa.me/525578363207',
    ],
    knowsAbout: [
      'Arte Contemporaneo',
      'Artistas Emergentes',
      'Ferias de Arte',
      'Feria de Arte Mexico',
      'Feria de Arte CDMX',
      'Semana del Arte Mexico',
      'Art Week Mexico',
      'Exposiciones de Arte',
      'Curaduria',
      'Coleccionismo de Arte',
      'Arte Visual',
      'Artes Visuales',
      'Galerias de Arte',
      'Convocatoria Artistas',
    ],
    slogan: 'Impulsando el talento de artistas emergentes en Mexico',
    areaServed: {
      '@type': 'Country',
      name: 'Mexico',
    },
    award: 'Feria de Arte Emergente',
  }
}

/**
 * Genera Schema.org markup para el evento principal de la feria
 */
export function generateMainEventSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ExhibitionEvent',
    '@id': `${BASE_URL}/#event-2027`,
    name: 'ARTEFACTO 2027 - Feria de Arte Contemporaneo Mexico',
    alternateName: [
      'Feria de Arte ARTEFACTO',
      'Feria de Arte Contemporaneo CDMX 2027',
      'Feria Arte Facto 2027',
      'Semana del Arte ARTEFACTO',
      'Art Week ARTEFACTO Mexico',
    ],
    description: 'ARTEFACTO - La feria de arte contemporaneo mas importante para artistas emergentes en Mexico. Exposicion, convocatoria abierta y semana del arte en CDMX. Febrero 2027.',
    url: BASE_URL,
    image: `${BASE_URL}/og-image.jpg`,
    startDate: '2027-02-01',
    endDate: '2027-02-28',
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: 'Centro Cultural Estacion Indianilla',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Claudio Bernard 111, Col. Doctores',
        addressLocality: 'Ciudad de Mexico',
        addressRegion: 'Cuauhtemoc',
        postalCode: '06720',
        addressCountry: 'MX',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 19.4167,
        longitude: -99.1463,
      },
    },
    organizer: {
      '@type': 'Organization',
      name: 'ARTEFACTO',
      url: BASE_URL,
    },
    performer: {
      '@type': 'PerformingGroup',
      name: 'Artistas Emergentes Mexicanos',
    },
    offers: {
      '@type': 'Offer',
      name: 'Inscripcion para Artistas',
      url: `${BASE_URL}/registro`,
      availability: 'https://schema.org/InStock',
      priceCurrency: 'MXN',
      validFrom: '2026-01-01',
    },
    inLanguage: 'es',
    isAccessibleForFree: false,
    typicalAgeRange: '18-',
    about: [
      {
        '@type': 'Thing',
        name: 'Arte Contemporaneo',
      },
      {
        '@type': 'Thing',
        name: 'Artistas Emergentes',
      },
      {
        '@type': 'Thing',
        name: 'Feria de Arte',
      },
      {
        '@type': 'Thing',
        name: 'Exposicion de Arte',
      },
    ],
    keywords: 'feria de arte, feria de arte mexico, feria de arte cdmx, semana del arte, art week mexico, exposicion arte, artistas emergentes, convocatoria artistas, arte contemporaneo mexico',
    audience: {
      '@type': 'Audience',
      audienceType: 'Artistas, Coleccionistas, Amantes del Arte, Curadores, Galerias',
    },
  }
}

/**
 * Genera Schema.org markup para un evento especifico
 */
export function generateEventSchema(event) {
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
        addressCountry: event.location?.country || 'MX',
      }
    },
    image: event.image ? `${BASE_URL}${event.image}` : `${BASE_URL}/og-image.jpg`,
    organizer: {
      '@type': 'Organization',
      name: 'ARTEFACTO',
      url: BASE_URL,
    }
  }
}

/**
 * Genera Schema.org markup para un artista (Person/Artist)
 */
export function generateArtistSchema(artist) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: artist.name,
    description: artist.bio,
    url: `${BASE_URL}/artistas/${artist.slug}`,
    image: artist.photo ? `${BASE_URL}${artist.photo}` : undefined,
    jobTitle: 'Artista Visual',
    workLocation: {
      '@type': 'Place',
      name: artist.location || 'Mexico',
    },
    nationality: artist.nationality || 'Mexicana',
    sameAs: artist.socialLinks || [],
    knowsAbout: artist.techniques || ['Arte Contemporaneo'],
  }
}

/**
 * Genera Schema.org markup para una obra de arte
 */
export function generateArtworkSchema(artwork) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    name: artwork.title,
    description: artwork.description,
    image: artwork.image ? `${BASE_URL}${artwork.image}` : undefined,
    creator: {
      '@type': 'Person',
      name: artwork.artist?.name,
    },
    artMedium: artwork.medium,
    artform: artwork.category,
    dateCreated: artwork.year,
    width: artwork.dimensions?.width ? {
      '@type': 'Distance',
      name: `${artwork.dimensions.width} cm`,
    } : undefined,
    height: artwork.dimensions?.height ? {
      '@type': 'Distance',
      name: `${artwork.dimensions.height} cm`,
    } : undefined,
    offers: artwork.price ? {
      '@type': 'Offer',
      price: artwork.price,
      priceCurrency: 'MXN',
      availability: artwork.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    } : undefined,
  }
}

/**
 * Genera breadcrumbs Schema.org markup
 */
export function generateBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.path}`,
    }))
  }
}

/**
 * Genera Schema.org markup para el sitio web
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: 'ARTEFACTO',
    alternateName: [
      'ARTEFACTO Feria de Arte',
      'Arte Facto',
      'Arte-Facto',
      'Artefacto',
      'Feria Artefacto',
    ],
    description: 'ARTEFACTO (Arte Facto) - Feria de arte contemporaneo que impulsa artistas emergentes en Mexico',
    publisher: {
      '@id': `${BASE_URL}/#organization`,
    },
    inLanguage: 'es-MX',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/artistas?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/**
 * Genera todos los schemas principales para la pagina de inicio
 */
export function generateHomePageSchemas() {
  return [
    generateWebSiteSchema(),
    generateOrganizationSchema(),
    generateMainEventSchema(),
  ]
}

/**
 * Genera Schema.org markup para la pagina de Aviso de Privacidad
 */
export function generatePrivacyPolicySchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${BASE_URL}/privacy-policy`,
    url: `${BASE_URL}/privacy-policy`,
    name: 'Aviso de Privacidad - ARTE FACTO',
    description: 'Aviso de Privacidad de ARTE FACTO ETICAS CREATIVAS, S. de R.L. de C.V. conforme a la Ley Federal de Proteccion de Datos Personales en Posesion de los Particulares.',
    inLanguage: 'es-MX',
    isPartOf: {
      '@id': `${BASE_URL}/#website`,
    },
    about: {
      '@type': 'Thing',
      name: 'Proteccion de Datos Personales',
    },
    datePublished: '2026-08-23',
    dateModified: '2026-08-23',
    publisher: {
      '@id': `${BASE_URL}/#organization`,
    },
  }
}

/**
 * Genera Schema.org markup para la pagina de Terminos y Condiciones
 */
export function generateTermsSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${BASE_URL}/terms`,
    url: `${BASE_URL}/terms`,
    name: 'Terminos y Condiciones de Postulacion - ARTE FACTO',
    description: 'Terminos y Condiciones de Postulacion a la convocatoria ARTE FACTO Eticas Creativas Edicion II.',
    inLanguage: 'es-MX',
    isPartOf: {
      '@id': `${BASE_URL}/#website`,
    },
    about: {
      '@type': 'Thing',
      name: 'Condiciones de Participacion en Convocatoria de Arte',
    },
    datePublished: '2026-08-23',
    dateModified: '2026-08-23',
    publisher: {
      '@id': `${BASE_URL}/#organization`,
    },
  }
}

/**
 * Genera Schema.org markup para paginas legales (breadcrumbs incluidos)
 */
export function generateLegalPageSchemas(page) {
  const schemas = []

  if (page === 'privacy-policy') {
    schemas.push(generatePrivacyPolicySchema())
    schemas.push(generateBreadcrumbSchema([
      { name: 'Inicio', path: '/' },
      { name: 'Aviso de Privacidad', path: '/privacy-policy' },
    ]))
  } else if (page === 'terms') {
    schemas.push(generateTermsSchema())
    schemas.push(generateBreadcrumbSchema([
      { name: 'Inicio', path: '/' },
      { name: 'Terminos y Condiciones', path: '/terms' },
    ]))
  }

  return schemas
}
