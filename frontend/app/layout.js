import './globals.css'
import '@/components/artefacto/artefacto.css'
import FloatingRegistrationButton from '@/components/shared/FloatingRegistrationButton'
import { Inter_Tight, EB_Garamond } from 'next/font/google'

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-inter-tight',
  display: 'swap',
})

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-eb-garamond',
  display: 'swap',
})

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://arte-facto.mx'

export const metadata = {
  metadataBase: new URL(BASE_URL),

  // Titulo principal - aparece en pestanas y resultados de busqueda
  title: {
    default: 'ARTEFACTO | Feria de Arte Contemporaneo',
    template: '%s | ARTEFACTO',
  },

  // Descripcion optimizada para SEO (155-160 caracteres)
  description: 'Feria de arte contemporaneo en CDMX. Conectamos artistas emergentes con coleccionistas y amantes del arte. Convocatoria abierta 2027. Inscribete ahora.',

  // Keywords relevantes
  keywords: [
    'feria de arte',
    'arte contemporaneo',
    'artistas emergentes',
    'exposicion de arte',
    'CDMX',
    'convocatoria artistas',
    'galeria de arte',
    'arte mexicano',
    'coleccionismo de arte',
    'ARTEFACTO',
    'feria arte Mexico',
    'artistas mexicanos',
  ],

  // Informacion del autor/creador
  authors: [{ name: 'ARTEFACTO', url: BASE_URL }],
  creator: 'ARTEFACTO',
  publisher: 'ARTEFACTO',

  // Categoria del sitio
  category: 'Arte y Cultura',

  // URL canonica - evita contenido duplicado en buscadores
  alternates: {
    canonical: BASE_URL,
  },

  // Favicon e iconos
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  },

  // Manifest para PWA
  manifest: '/manifest.json',

  // Desactivar deteccion automatica de formatos
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  // Open Graph - para compartir en Facebook, LinkedIn, etc.
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: BASE_URL,
    siteName: 'ARTEFACTO | Feria de Arte',
    title: 'ARTEFACTO | Feria de Arte Contemporaneo en Mexico',
    description: 'Feria de arte contemporaneo en CDMX. Conectamos artistas emergentes con coleccionistas. Convocatoria abierta 2027.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ARTEFACTO - Feria de Arte Contemporaneo en Mexico',
        type: 'image/jpeg',
      },
    ],
  },

  // Twitter Cards - para compartir en Twitter/X
  twitter: {
    card: 'summary_large_image',
    site: '@artefacto_feria',
    creator: '@artefacto_feria',
    title: 'ARTEFACTO | Feria de Arte Contemporaneo',
    description: 'Feria de arte contemporaneo en CDMX. Conectamos artistas emergentes con coleccionistas. Convocatoria abierta 2027.',
    images: ['/og-image.jpg'],
  },

  // Configuracion de robots/crawlers
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Verificacion de propiedad (descomentar cuando tengas los codigos)
  verification: {
    // google: 'tu-codigo-de-verificacion-google',
    // yandex: 'tu-codigo-de-verificacion-yandex',
    // bing: 'tu-codigo-de-verificacion-bing',
  },

  // Otros metadatos
  other: {
    'theme-color': '#b83030',
    'msapplication-TileColor': '#b83030',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
}

// Viewport configuration (Next.js 14+)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4ede4' },
    { media: '(prefers-color-scheme: dark)', color: '#141210' },
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${interTight.variable} ${ebGaramond.variable}`}>
      <body className="antialiased">
        {children}
        <FloatingRegistrationButton />
      </body>
    </html>
  )
}
