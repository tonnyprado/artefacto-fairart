export default function ArtistasAdmin() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Artistas y Obras</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Agregar Artista
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Buscar artista..."
            className="border rounded px-4 py-2"
          />
          <select className="border rounded px-4 py-2">
            <option>Todos los estados</option>
            <option>Activo</option>
            <option>Inactivo</option>
          </select>
          <select className="border rounded px-4 py-2">
            <option>Todas las categorías</option>
            <option>Pintura</option>
            <option>Escultura</option>
            <option>Fotografía</option>
          </select>
        </div>
      </div>

      {/* Tabla de artistas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Obras
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                No hay artistas registrados
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
