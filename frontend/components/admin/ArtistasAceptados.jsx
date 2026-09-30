'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
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
  const [artistasAprobados, setArtistasAprobados] = useState([])
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

      // Solo cargar artistas aprobados por ahora
      // Los endpoints de consignación se cargarán cuando estén disponibles
      const artistasRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/artistas?estado_registro=aprobado`,
        { headers }
      )

      if (!artistasRes.ok) {
        throw new Error('Error al cargar artistas')
      }

      const artistasData = await artistasRes.json()
      setArtistasAprobados(artistasData.data || [])

      // Intentar cargar datos de consignación (opcional)
      // Estos endpoints fallarán hasta que se configure el módulo de consignación
      try {
        const [invRes, acuRes, estRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/consigna/invitaciones?edicion=${edicion}`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/consigna/acuerdos?edicion=${edicion}`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/consigna/estadisticas?edicion=${edicion}`, { headers }),
        ])

        if (invRes.ok && acuRes.ok && estRes.ok) {
          const [invData, acuData, estData] = await Promise.all([
            invRes.json(),
            acuRes.json(),
            estRes.json(),
          ])
          setInvitaciones(invData.data || [])
          setAcuerdos(acuData.data || [])
          setEstadisticas(estData.data || null)
        }
        // Si algún endpoint falla (500), simplemente usar arrays vacíos
      } catch (consignaError) {
        // Silenciar estos errores esperados hasta que se configure consignación
        // No es crítico, continuar con datos vacíos
      }
    } catch (error) {
      console.error('Error cargando datos:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los artistas aprobados',
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/consigna/generar-invitaciones`, {
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

  const generarInvitacionIndividual = async (artista) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/consigna/generar-invitacion/${artista.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ edicion }),
      })

      if (!res.ok) {
        throw new Error('Error al generar invitación')
      }

      const data = await res.json()

      toast({
        title: 'Invitación enviada',
        description: `Invitación enviada a ${artista.nombre} ${artista.apellido}`,
      })

      await cargarDatos()
    } catch (error) {
      console.error('Error generando invitación:', error)
      toast({
        title: 'Error',
        description: `No se pudo enviar la invitación a ${artista.nombre}`,
        variant: 'destructive',
      })
    }
  }

  const descargarPDF = async (acuerdoId, folio) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/consigna/acuerdos/${acuerdoId}/pdf`,
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
      {/* Header con botón de generar todas */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Artistas Aprobados & Hojas de Consignación</h3>
          <p className="text-sm text-gray-600">
            {artistasAprobados.length} artista{artistasAprobados.length !== 1 ? 's' : ''} aprobado{artistasAprobados.length !== 1 ? 's' : ''}
            {' · '}
            {artistasAprobados.filter(a => !invitaciones.some(inv => inv.artista_id === a.id)).length} pendiente{artistasAprobados.filter(a => !invitaciones.some(inv => inv.artista_id === a.id)).length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={generarInvitaciones}
          disabled={generando || artistasAprobados.length === 0}
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
              Generar Todas las Invitaciones
            </>
          )}
        </Button>
      </div>

      {/* Tabla Unificada */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Folio</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Estado Invitación</TableHead>
              <TableHead>Estado Consigna</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {artistasAprobados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No hay artistas aprobados</p>
                  <p className="text-sm mt-1">
                    Aprueba artistas desde el panel de Concurso o Lista
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              artistasAprobados.map((artista) => {
                const invitacion = invitaciones.find(inv => inv.artista_id === artista.id)
                const acuerdo = acuerdos.find(ac => ac.artista_id === artista.id)

                return (
                  <TableRow key={artista.id}>
                    <TableCell className="font-medium font-mono">{artista.folio}</TableCell>
                    <TableCell>{artista.nombre} {artista.apellido}</TableCell>
                    <TableCell className="text-sm">{artista.email}</TableCell>
                    <TableCell className="text-sm">{artista.telefono || '-'}</TableCell>
                    <TableCell>
                      {invitacion ? (
                        <Badge className="bg-green-500 text-white">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Enviada
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-500 text-white">
                          <Clock className="w-3 h-3 mr-1" />
                          Pendiente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {acuerdo ? (
                        <Badge className="bg-purple-500 text-white">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Completada
                        </Badge>
                      ) : invitacion ? (
                        <Badge className="bg-blue-500 text-white">
                          <Clock className="w-3 h-3 mr-1" />
                          En proceso
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-400 text-white">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Sin iniciar
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!invitacion && (
                          <Button
                            onClick={() => generarInvitacionIndividual(artista)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Mail className="w-3 h-3 mr-1" />
                            Enviar Invitación
                          </Button>
                        )}
                        {acuerdo && (
                          <Button
                            onClick={() => descargarPDF(acuerdo.id, artista.folio)}
                            size="sm"
                            variant="outline"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            PDF
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

    </div>
  )
}
