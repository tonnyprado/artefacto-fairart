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
  // TODO: Implementar autenticación y verificación de permisos
  // Ejemplo: const session = await getServerSession()
  // if (!session) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r">
        <div className="p-6">
          <h1 className="text-2xl font-bold">ARTEFACT</h1>
          <p className="text-sm text-gray-500">Panel Admin</p>
        </div>

        <nav className="px-4 space-y-2">
          <a href="/admin" className="block px-4 py-2 rounded hover:bg-gray-100">
            Dashboard
          </a>
          <a href="/admin/artistas" className="block px-4 py-2 rounded hover:bg-gray-100">
            Artistas y Obras
          </a>
          <a href="/admin/eventos" className="block px-4 py-2 rounded hover:bg-gray-100">
            Eventos/Ferias
          </a>
          <a href="/admin/inscripciones" className="block px-4 py-2 rounded hover:bg-gray-100">
            Inscripciones
          </a>
          <a href="/admin/paquetes" className="block px-4 py-2 rounded hover:bg-gray-100">
            Paquetes y Precios
          </a>
        </nav>
      </aside>

      {/* Main content */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
