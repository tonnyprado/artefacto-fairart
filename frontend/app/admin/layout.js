export const metadata = {
  title: {
    default: 'Panel de Administración',
    template: '%s | Admin ARTEFACT'
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({ children }) {
  // El layout ahora solo pasa el children ya que el diseño está en el page.js
  // El sidebar ha sido reemplazado por tabs en el panel principal
  return children
}
