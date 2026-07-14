export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Cards de estadísticas */}
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500 mb-2">Total Artistas</p>
          <p className="text-3xl font-bold">0</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500 mb-2">Obras Registradas</p>
          <p className="text-3xl font-bold">0</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500 mb-2">Inscripciones Activas</p>
          <p className="text-3xl font-bold">0</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500 mb-2">Próximos Eventos</p>
          <p className="text-3xl font-bold">0</p>
        </div>
      </div>

      {/* Sección de actividad reciente */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
        <p className="text-gray-500">No hay actividad reciente</p>
      </div>
    </div>
  )
}
