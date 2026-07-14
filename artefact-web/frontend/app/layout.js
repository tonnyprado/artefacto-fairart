import './globals.css'

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'ARTEFACT - Feria de Arte',
    template: '%s | ARTEFACT'
  },
  description: 'Descubre y conecta con artistas emergentes en la Feria de Arte ARTEFACT',
  keywords: ['feria de arte', 'artistas', 'arte contemporáneo', 'galería', 'exposición'],
  authors: [{ name: 'ARTEFACT' }],
  creator: 'ARTEFACT',
  publisher: 'ARTEFACT',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: 'ARTEFACT - Feria de Arte',
    title: 'ARTEFACT - Feria de Arte',
    description: 'Descubre y conecta con artistas emergentes en la Feria de Arte ARTEFACT',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ARTEFACT - Feria de Arte',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ARTEFACT - Feria de Arte',
    description: 'Descubre y conecta con artistas emergentes en la Feria de Arte ARTEFACT',
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
      </body>
    </html>
  )
}
