'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Mail,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Users,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

/**
 * Componente para gestionar artistas aceptados y sus hojas de consignación
 * Se integra como sub-tab en la tabla de artistas
 */
export default function ArtistasAceptados() {
  const { toast } = useToast()
  const [invitaciones, setInvitaciones] = useState([])
  const [acuerdos, setAcuerdos] = useState([])
  const [estadisticas, setEstadisticas] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generando, setGenerando] = useState(false)
  const [edicion, setEdicion] = useState('AF2')

  useEffect(() => {
    cargarDatos()
  }, [edicion])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }

      const [invRes, acuRes, estRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/consigna/invitaciones?edicion=${edicion}`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/consigna/acuerdos?edicion=${edicion}`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/consigna/estadisticas?edicion=${edicion}`, { headers }),
      ])

      if (!invRes.ok || !acuRes.ok || !estRes.ok) {
        throw new Error('Error al cargar datos')
      }

      const [invData, acuData, estData] = await Promise.all([
        invRes.json(),
        acuRes.json(),
        estRes.json(),
      ])

      setInvitaciones(invData.data || [])
      setAcuerdos(acuData.data || [])
      setEstadisticas(estData.data || null)
    } catch (error) {
      console.error('Error cargando datos:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos de consignación',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const generarInvitaciones = async () => {
    setGenerando(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/consigna/generar-invitaciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ edicion }),
      })

      if (!res.ok) {
        throw new Error('Error al generar invitaciones')
      }

      const data = await res.json()

      toast({
        title: 'Éxito',
        description: `${data.data.generadas} invitaciones generadas y enviadas`,
      })

      await cargarDatos()
    } catch (error) {
      console.error('Error generando invitaciones:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron generar las invitaciones',
        variant: 'destructive',
      })
    } finally {
      setGenerando(false)
    }
  }

  const descargarPDF = async (acuerdoId, folio) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/consigna/acuerdos/${acuerdoId}/pdf`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!res.ok) {
        throw new Error('Error al obtener PDF')
      }

      const data = await res.json()
      window.open(data.data.url, '_blank')
    } catch (error) {
      console.error('Error descargando PDF:', error)
      toast({
        title: 'Error',
        description: 'No se pudo descargar el PDF',
        variant: 'destructive',
      })
    }
  }

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: { color: 'bg-gray-500', icon: Clock, label: 'Pendiente' },
      abierta: { color: 'bg-blue-500', icon: Mail, label: 'Abierta' },
      completada: { color: 'bg-green-500', icon: CheckCircle2, label: 'Completada' },
    }

    const config = badges[estado] || badges.pendiente
    const Icon = config.icon

    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const getEstadoFiscalBadge = (estadoFiscal) => {
    const badges = {
      pendiente: { color: 'bg-gray-400', label: 'Sin constancia' },
      cargada: { color: 'bg-yellow-500', label: 'Cargada' },
      verificada: { color: 'bg-green-500', label: 'Verificada' },
    }

    const config = badges[estadoFiscal] || badges.pendiente

    return (
      <Badge className={`${config.color} text-white`}>
        <FileText className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos de consignación...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Invitaciones</p>
                <p className="text-2xl font-bold">{estadisticas.total_invitaciones}</p>
              </div>
              <Mail className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Abiertas</p>
                <p className="text-2xl font-bold">{estadisticas.abiertas}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completadas</p>
                <p className="text-2xl font-bold">{estadisticas.completadas}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Con Constancia</p>
                <p className="text-2xl font-bold">{estadisticas.con_constancia}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Invitaciones de Consignación</h3>
          <p className="text-sm text-gray-600">Edición: {edicion}</p>
        </div>
        <Button
          onClick={generarInvitaciones}
          disabled={generando}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {generando ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generando...
            </>
          ) : (
            <>
              <Mail className="w-4 h-4 mr-2" />
              Generar Invitaciones
            </>
          )}
        </Button>
      </div>

      {/* Tabla de invitaciones */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Folio</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Estado Invitación</TableHead>
              <TableHead>Hoja Consigna</TableHead>
              <TableHead>Situación Fiscal</TableHead>
              <TableHead>Creada</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitaciones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No hay invitaciones generadas para {edicion}</p>
                  <p className="text-sm mt-1">
                    Haz clic en "Generar Invitaciones" para crear tokens para artistas aprobados
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              invitaciones.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.folio}</TableCell>
                  <TableCell>{inv.nombre}</TableCell>
                  <TableCell className="text-sm text-gray-600">{inv.correo}</TableCell>
                  <TableCell>{getEstadoBadge(inv.estado)}</TableCell>
                  <TableCell>
                    {inv.acuerdo_id ? (
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Firmada
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-400 text-white">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Pendiente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {inv.estado_fiscal
                      ? getEstadoFiscalBadge(inv.estado_fiscal)
                      : <span className="text-sm text-gray-400">N/A</span>}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {new Date(inv.creada_en).toLocaleDateString('es-MX')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {inv.acuerdo_id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => descargarPDF(inv.acuerdo_id, inv.folio)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
