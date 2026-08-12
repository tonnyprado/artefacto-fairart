import './globals.css'
import '@/components/artefacto/artefacto.css'
import FloatingRegistrationButton from '@/components/shared/FloatingRegistrationButton'

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'ARTEFACTO - Feria de Arte',
    template: '%s | ARTEFACTO'
  },
  description: 'Descubre y conecta con artistas emergentes en la Feria de Arte ARTEFACTO',
  keywords: ['feria de arte', 'artistas', 'arte contemporáneo', 'galería', 'exposición'],
  authors: [{ name: 'ARTEFACTO' }],
  creator: 'ARTEFACTO',
  publisher: 'ARTEFACTO',
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
    ],
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: 'ARTEFACTO - Feria de Arte',
    title: 'ARTEFACTO - Feria de Arte',
    description: 'Descubre y conecta con artistas emergentes en la Feria de Arte ARTEFACTO',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ARTEFACTO - Feria de Arte',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ARTEFACTO - Feria de Arte',
    description: 'Descubre y conecta con artistas emergentes en la Feria de Arte ARTEFACTO',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Agregar tokens de verificación cuando estén disponibles
    // google: 'google-site-verification-code',
    // yandex: 'yandex-verification-code',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
        <FloatingRegistrationButton />
      </body>
    </html>
  )
}
