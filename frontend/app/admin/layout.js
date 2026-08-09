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
  return (
    <>
      {/* Sobrescribir cursor oculto para el panel de admin */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .admin-panel,
          .admin-panel *,
          .admin-panel a,
          .admin-panel button,
          .admin-panel input,
          .admin-panel textarea,
          .admin-panel select,
          .admin-panel [role="button"] {
            cursor: auto !important;
          }
          .admin-panel button,
          .admin-panel a,
          .admin-panel [role="button"] {
            cursor: pointer !important;
          }
          .admin-panel input,
          .admin-panel textarea,
          .admin-panel select {
            cursor: text !important;
          }
        `
      }} />
      {children}
    </>
  )
}
