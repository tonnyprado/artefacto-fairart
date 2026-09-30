/**
 * Layout para las páginas de consignación
 *
 * Este layout NO incluye la navegación principal del sitio
 * para dar una experiencia limpia y enfocada al formulario.
 */
export const metadata = {
  title: 'Hoja de Consignación - ARTE FACTO',
  description: 'Completa tu hoja de consignación para participar en ARTE FACTO',
}

export default function ConsignaLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {children}
    </div>
  )
}
