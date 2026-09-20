'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFasesStore } from '@/stores/fasesStore'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table'

export default function FasesPage() {
  const router = useRouter()
  const { fases, fetchFases, isLoading } = useFasesStore()
  const [error, setError] = useState(null)

  useEffect(() => {
    loadFases()
  }, [])

  const loadFases = async () => {
    setError(null)
    try {
      await fetchFases()
    } catch (err) {
      setError(err.message)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando fases...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Fases</h1>
          <p className="text-gray-600 mt-1">
            Administra las fases de ARTEFACTO y sus rondas de votación
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Fases de ARTEFACTO</CardTitle>
        </CardHeader>
        <CardContent>
          {fases.length === 0 ? (
            <p className="text-center text-gray-600 py-8">
              No hay fases registradas.
            </p>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Fase</TableHeader>
                  <TableHeader>Edición</TableHeader>
                  <TableHeader>Fecha Inicio</TableHeader>
                  <TableHeader>Fecha Fin</TableHeader>
                  <TableHeader>Estado</TableHeader>
                  <TableHeader>Acciones</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {fases.map(fase => (
                  <TableRow key={fase.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{fase.nombre}</p>
                        <p className="text-sm text-gray-500">{fase.descripcion}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-900">
                        Edición {fase.edicion_id}
                      </span>
                    </TableCell>
                    <TableCell>
                      {fase.fecha_inicio
                        ? new Date(fase.fecha_inicio).toLocaleDateString('es-MX')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {fase.fecha_fin
                        ? new Date(fase.fecha_fin).toLocaleDateString('es-MX')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={fase.votaciones_abiertas ? 'success' : 'secondary'}>
                        {fase.votaciones_abiertas ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => router.push(`/admin/fases/${fase.id}`)}
                      >
                        Gestionar Rondas
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
