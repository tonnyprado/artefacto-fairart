'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { FileText, Download, Upload, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

/**
 * Modal para gestionar la constancia de situación fiscal de un artista
 * Permite ver, descargar y cargar/reemplazar el documento
 */
export default function ModalConstanciaFiscal({ isOpen, onClose, acuerdo, onActualizado }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [constancia, setConstancia] = useState(null)
  const [archivo, setArchivo] = useState(null)
  const [subiendo, setSubiendo] = useState(false)

  useEffect(() => {
    if (isOpen && acuerdo) {
      cargarConstancia()
    }
  }, [isOpen, acuerdo])

  const cargarConstancia = async () => {
    if (!acuerdo?.id) return

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/consigna/acuerdos/${acuerdo.id}/constancia`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!res.ok) {
        throw new Error('Error al cargar constancia')
      }

      const data = await res.json()
      setConstancia(data.data)
    } catch (error) {
      console.error('Error cargando constancia:', error)
      toast({
        title: 'Error',
        description: 'No se pudo cargar la información de la constancia',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleArchivoSeleccionado = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo
    const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png']
    if (!tiposPermitidos.includes(file.type)) {
      toast({
        title: 'Archivo inválido',
        description: 'Solo se permiten archivos PDF, JPG o PNG',
        variant: 'destructive',
      })
      return
    }

    // Validar tamaño (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Archivo muy grande',
        description: 'El archivo debe pesar menos de 10 MB',
        variant: 'destructive',
      })
      return
    }

    setArchivo(file)
  }

  const subirConstancia = async () => {
    if (!archivo) return

    setSubiendo(true)
    try {
      const token = localStorage.getItem('token')

      // 1. Obtener URL presignada
      const urlRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/consigna/acuerdos/${acuerdo.id}/constancia/upload-url`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nombre: archivo.name,
            tipo: archivo.type,
            tamano: archivo.size,
          }),
        }
      )

      if (!urlRes.ok) {
        throw new Error('Error al obtener URL de subida')
      }

      const { data: { key, uploadUrl } } = await urlRes.json()

      // 2. Subir archivo a S3
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': archivo.type,
        },
        body: archivo,
      })

      if (!uploadRes.ok) {
        throw new Error('Error al subir archivo')
      }

      // 3. Actualizar referencia en BD
      const updateRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/consigna/acuerdos/${acuerdo.id}/constancia`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ constanciaKey: key }),
        }
      )

      if (!updateRes.ok) {
        throw new Error('Error al actualizar referencia')
      }

      toast({
        title: 'Constancia actualizada',
        description: 'El documento se subió correctamente',
      })

      // Recargar datos
      setArchivo(null)
      await cargarConstancia()

      // Notificar al padre que se actualizó
      if (onActualizado) {
        onActualizado()
      }
    } catch (error) {
      console.error('Error subiendo constancia:', error)
      toast({
        title: 'Error',
        description: 'No se pudo subir la constancia',
        variant: 'destructive',
      })
    } finally {
      setSubiendo(false)
    }
  }

  const descargarConstancia = () => {
    if (constancia?.url) {
      window.open(constancia.url, '_blank')
    }
  }

  const getEstadoFiscalInfo = (estado) => {
    const estados = {
      cargada: {
        icon: CheckCircle2,
        color: 'text-green-600 bg-green-50',
        label: 'Constancia cargada'
      },
      pendiente: {
        icon: AlertCircle,
        color: 'text-yellow-600 bg-yellow-50',
        label: 'Constancia pendiente'
      },
      tercero_sin_datos: {
        icon: AlertCircle,
        color: 'text-orange-600 bg-orange-50',
        label: 'Facturará tercero (sin datos)'
      },
    }
    return estados[estado] || estados.pendiente
  }

  if (!acuerdo) return null

  const estadoInfo = getEstadoFiscalInfo(constancia?.estadoFiscal || acuerdo.estado_fiscal)
  const IconoEstado = estadoInfo.icon

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Constancia de Situación Fiscal"
      size="md"
    >
      <div className="space-y-6">
        {/* Información del artista */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">
                {constancia?.nombre || 'Cargando...'}
              </p>
              <p className="text-sm text-gray-600">
                Folio: {constancia?.folio || acuerdo.folio || '-'}
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-2 mt-3 px-3 py-2 rounded-md ${estadoInfo.color}`}>
            <IconoEstado className="w-4 h-4" />
            <span className="text-sm font-medium">{estadoInfo.label}</span>
          </div>
        </div>

        {/* Documento actual */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : constancia?.existe ? (
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Documento cargado</p>
                  <p className="text-sm text-gray-600">{constancia.nombreArchivo}</p>
                </div>
              </div>
              <Button
                onClick={descargarConstancia}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Descargar
              </Button>
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-1">No hay constancia cargada</p>
            <p className="text-sm text-gray-500">
              El artista seleccionó: <strong>{estadoInfo.label}</strong>
            </p>
          </div>
        )}

        {/* Subir nuevo documento */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            {constancia?.existe ? 'Reemplazar documento' : 'Cargar documento'}
          </h4>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="flex-1">
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  onChange={handleArchivoSeleccionado}
                  disabled={subiendo}
                  className="hidden"
                  id="constancia-upload"
                />
                <div className="border border-gray-300 rounded-lg p-3 hover:border-gray-400 cursor-pointer transition-colors">
                  {archivo ? (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">{archivo.name}</span>
                      <span className="text-xs text-gray-500 ml-auto">
                        {(archivo.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Upload className="w-4 h-4" />
                      <span className="text-sm">Seleccionar archivo (PDF, JPG, PNG)</span>
                    </div>
                  )}
                </div>
              </label>
            </div>

            {archivo && (
              <Button
                onClick={subirConstancia}
                disabled={subiendo}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {subiendo ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Subir constancia
                  </>
                )}
              </Button>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-3">
            Máximo 10 MB · Formatos permitidos: PDF, JPG, PNG
          </p>
        </div>
      </div>
    </Modal>
  )
}
