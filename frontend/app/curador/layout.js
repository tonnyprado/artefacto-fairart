export const metadata = {
  title: {
    default: 'Panel de Curaduría',
    template: '%s | Curador ARTEFACT'
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function CuradorLayout({ children }) {
  return (
    <>
      {/* Sobrescribir cursor oculto para el panel de curador */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .curador-panel,
          .curador-panel *,
          .curador-panel a,
          .curador-panel button,
          .curador-panel input,
          .curador-panel textarea,
          .curador-panel select,
          .curador-panel [role="button"] {
            cursor: auto !important;
          }
          .curador-panel button,
          .curador-panel a,
          .curador-panel [role="button"] {
            cursor: pointer !important;
          }
          .curador-panel input,
          .curador-panel textarea,
          .curador-panel select {
            cursor: text !important;
          }
        `
      }} />
      {children}
    </>
  )
}
