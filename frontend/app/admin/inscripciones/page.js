export default function InscripcionesAdmin() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Inscripciones a Ferias</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Nueva Inscripción
        </button>
      </div>

      {/* Estadísticas de inscripciones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500 mb-2">Pendientes</p>
          <p className="text-3xl font-bold text-yellow-600">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500 mb-2">Aprobadas</p>
          <p className="text-3xl font-bold text-green-600">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500 mb-2">Rechazadas</p>
          <p className="text-3xl font-bold text-red-600">0</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Buscar artista..."
            className="border rounded px-4 py-2"
          />
          <select className="border rounded px-4 py-2">
            <option>Todos los estados</option>
            <option>Pendiente</option>
            <option>Aprobada</option>
            <option>Rechazada</option>
          </select>
          <select className="border rounded px-4 py-2">
            <option>Todos los eventos</option>
          </select>
          <select className="border rounded px-4 py-2">
            <option>Todos los paquetes</option>
          </select>
        </div>
      </div>

      {/* Tabla de inscripciones */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Artista
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Evento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Paquete
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                No hay inscripciones registradas
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
