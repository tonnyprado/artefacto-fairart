'use client'

import { useMemo, useState } from 'react'
import FileUpload from '@/components/ui/FileUpload'
import { compressImage } from '@/lib/imageCompression'

/**
 * Paso 3: Upload de Documentos
 *
 * CAMPOS QUE VAN A BASE DE DATOS:
 * - Tabla: artistas
 *   - documentos JSONB -- {cv_url, identificacion_url, portfolio_url}
 *   - foto VARCHAR(500) -- URL de foto de perfil
 *
 * PROCESO:
 * 1. Usuario sube archivos individuales
 * 2. Frontend comprime imágenes automáticamente
 * 3. Frontend valida tamaño de PDFs
 * 4. Al enviar formulario, se suben a Cloudinary
 * 5. URLs de Cloudinary se guardan en BDD
 */

const MAX_TOTAL_SIZE = 4.5 * 1024 * 1024 // 4.5MB - límite del servidor

export default function Step3Documentos({ formData, updateFormData, errors }) {
  // Estados de carga para cada campo
  const [loadingStates, setLoadingStates] = useState({
    foto: false,
    cv: false,
    portfolio: false,
    identificacion: false,
  })

  const setFieldLoading = (field, isLoading) => {
    setLoadingStates(prev => ({ ...prev, [field]: isLoading }))
  }
  // Calcular tamaño total de TODOS los archivos
  const sizeInfo = useMemo(() => {
    let totalSize = 0
    const breakdown = []

    // Canvas blobs (del paso 2 - Tu Lienzo)
    if (formData.layout_canvas_blob) {
      const size = formData.layout_canvas_blob.size
      totalSize += size
      breakdown.push({ name: 'Vista previa lienzo', size })
    }
    if (formData.layout_canvas_pdf_blob) {
      const size = formData.layout_canvas_pdf_blob.size
      totalSize += size
      breakdown.push({ name: 'PDF del lienzo', size })
    }

    // Obras del lienzo (del paso 2)
    if (formData.obras_lienzo && formData.obras_lienzo.length > 0) {
      let obrasTotal = 0
      formData.obras_lienzo.forEach((obra) => {
        if (obra.file) {
          obrasTotal += obra.file.size
          totalSize += obra.file.size
        }
      })
      if (obrasTotal > 0) {
        breakdown.push({ name: `Obras (${formData.obras_lienzo.length})`, size: obrasTotal })
      }
    }

    // Documentos (paso actual)
    if (formData.foto) {
      const size = formData.foto.size
      totalSize += size
      breakdown.push({ name: 'Foto de perfil', size })
    }
    if (formData.documentos?.cv) {
      const size = formData.documentos.cv.size
      totalSize += size
      breakdown.push({ name: 'CV Artístico', size })
    }
    if (formData.documentos?.portfolio) {
      const size = formData.documentos.portfolio.size
      totalSize += size
      breakdown.push({ name: 'Portafolio', size })
    }
    if (formData.documentos?.identificacion) {
      const size = formData.documentos.identificacion.size
      totalSize += size
      breakdown.push({ name: 'Identificación', size })
    }

    const totalMB = (totalSize / (1024 * 1024)).toFixed(2)
    const limitMB = (MAX_TOTAL_SIZE / (1024 * 1024)).toFixed(1)
    const percentage = Math.min((totalSize / MAX_TOTAL_SIZE) * 100, 100)
    const exceeds = totalSize > MAX_TOTAL_SIZE

    // Ordenar por tamaño descendente
    breakdown.sort((a, b) => b.size - a.size)

    return { totalSize, totalMB, limitMB, percentage, exceeds, breakdown }
  }, [formData])
  const handleFileChange = async (fieldName, file) => {
    if (!file) return

    const fileSizeMB = file.size / (1024 * 1024)

    // Rechazar archivos mayores a 10MB
    if (fileSizeMB > 10) {
      alert(`El archivo es muy grande (${fileSizeMB.toFixed(2)}MB). El tamaño máximo es 10MB.`)
      return
    }

    let processedFile = file

    // Si es imagen y es mayor a 5MB, comprimir
    if (file.type.startsWith('image/') && fileSizeMB > 5) {
      setFieldLoading(fieldName, true) // Activar loading
      try {
        processedFile = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.80,
          maxSizeKB: 2000 // Comprimir a menos de 2MB
        })
        console.log(`Imagen comprimida de ${fileSizeMB.toFixed(2)}MB a ${(processedFile.size / (1024 * 1024)).toFixed(2)}MB`)
      } catch (error) {
        console.error('Error al comprimir imagen:', error)
        setFieldLoading(fieldName, false) // Desactivar loading en error
        alert('Error al procesar la imagen. Por favor, intenta con otra imagen.')
        return
      }
      setFieldLoading(fieldName, false) // Desactivar loading
    }

    updateFormData({
      documentos: {
        ...formData.documentos,
        [fieldName]: processedFile
      }
    })
  }

  const handleFotoChange = async (file) => {
    if (!file) return

    const fileSizeMB = file.size / (1024 * 1024)

    // Rechazar archivos mayores a 10MB
    if (fileSizeMB > 10) {
      alert(`El archivo es muy grande (${fileSizeMB.toFixed(2)}MB). El tamaño máximo es 10MB.`)
      return
    }

    // Si es mayor a 5MB, comprimir
    if (fileSizeMB > 5) {
      setFieldLoading('foto', true) // Activar loading
      try {
        const compressedFile = await compressImage(file, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.80,
          maxSizeKB: 2000 // Comprimir a menos de 2MB
        })
        console.log(`Foto comprimida de ${fileSizeMB.toFixed(2)}MB a ${(compressedFile.size / (1024 * 1024)).toFixed(2)}MB`)
        setFieldLoading('foto', false) // Desactivar loading
        updateFormData({ foto: compressedFile })
      } catch (error) {
        console.error('Error al comprimir foto:', error)
        setFieldLoading('foto', false) // Desactivar loading en error
        alert('Error al procesar la foto. Por favor, intenta con otra imagen.')
      }
    } else {
      // Menos de 5MB, no comprimir
      updateFormData({ foto: file })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#141210' }}>
          Documentos Requeridos
        </h2>
        <p style={{ color: '#F4EDE4', fontSize: '15px' }}>
          Sube los documentos necesarios para completar tu inscripción
        </p>
      </div>

      {/* Error de tamaño total (mostrado al intentar continuar) */}
      {errors?.totalSize && (
        <div style={{
          background: 'rgba(220, 38, 38, 0.15)',
          border: '2px solid #DC2626',
          borderRadius: '12px',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <p style={{
            fontSize: '14px',
            color: '#DC2626',
            margin: 0,
            fontWeight: 500,
          }}>
            {errors.totalSize}
          </p>
        </div>
      )}

      {/* Foto de Perfil */}
      <FileUpload
        label="Foto de perfil"
        accept="image/*"
        maxSize={10}
        required
        value={formData.foto}
        onChange={handleFotoChange}
        error={errors?.foto}
        helperText="Nombrar archivo: Foto_NombreArtista/Colectivo"
        isLoading={loadingStates.foto}
        loadingText="Comprimiendo foto..."
      />

      {/* CV Artístico */}
      <FileUpload
        label="CV Artístico"
        accept=".pdf,.doc,.docx"
        maxSize={10}
        required
        value={formData.documentos?.cv}
        onChange={(file) => handleFileChange('cv', file)}
        error={errors?.cv}
        helperText="Nombrar archivo: CV_NombreArtista/Colectivo"
        isLoading={loadingStates.cv}
        loadingText="Procesando CV..."
      />

      {/* Portafolio */}
      <FileUpload
        label="Portafolio"
        accept=".pdf"
        maxSize={10}
        required
        value={formData.documentos?.portfolio}
        onChange={(file) => handleFileChange('portfolio', file)}
        error={errors?.portfolio}
        helperText="Nombrar archivo: Portafolio_NombreArtista/Colectivo — Con este documento queremos conocer tu trayectoria, no es necesariamente la obra con la que te postularás a ARTE FACTO."
        isLoading={loadingStates.portfolio}
        loadingText="Procesando portafolio..."
      />

      {/* Identificación Oficial */}
      <FileUpload
        label="Identificación Oficial (INE o pasaporte)"
        accept="image/*,.pdf"
        maxSize={10}
        required
        value={formData.documentos?.identificacion}
        onChange={(file) => handleFileChange('identificacion', file)}
        error={errors?.identificacion}
        helperText="Nombrar archivo: ID_NombreArtista/Colectivo"
        isLoading={loadingStates.identificacion}
        loadingText="Comprimiendo identificación..."
      />

      {/* Indicador de tamaño total */}
      {sizeInfo.totalSize > 0 && (
        <div style={{
          background: sizeInfo.exceeds ? 'rgba(220, 38, 38, 0.15)' : 'rgba(244, 237, 228, 0.12)',
          border: sizeInfo.exceeds ? '2px solid #DC2626' : '1px solid rgba(244, 237, 228, 0.2)',
          borderRadius: '16px',
          padding: '16px 20px',
          marginTop: '24px',
        }}>
          {/* Header con tamaño */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{
              fontSize: '14px',
              fontWeight: 600,
              color: sizeInfo.exceeds ? '#DC2626' : '#F4EDE4',
            }}>
              {sizeInfo.exceeds ? 'Archivos demasiado grandes' : 'Espacio utilizado'}
            </span>
            <span style={{
              fontSize: '14px',
              fontWeight: 700,
              color: sizeInfo.exceeds ? '#DC2626' : (sizeInfo.percentage > 80 ? '#F59E0B' : '#22C55E'),
            }}>
              {sizeInfo.totalMB}MB / {sizeInfo.limitMB}MB
            </span>
          </div>

          {/* Barra de progreso */}
          <div style={{
            width: '100%',
            height: '8px',
            background: 'rgba(244, 237, 228, 0.2)',
            borderRadius: '4px',
            overflow: 'hidden',
            marginBottom: '12px',
          }}>
            <div style={{
              width: `${sizeInfo.percentage}%`,
              height: '100%',
              background: sizeInfo.exceeds ? '#DC2626' : (sizeInfo.percentage > 80 ? '#F59E0B' : '#22C55E'),
              borderRadius: '4px',
              transition: 'width 0.3s ease, background 0.3s ease',
            }} />
          </div>

          {/* Desglose de archivos */}
          <div style={{ marginBottom: sizeInfo.exceeds ? '12px' : 0 }}>
            {sizeInfo.breakdown.slice(0, 4).map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: 'rgba(244, 237, 228, 0.7)',
                marginBottom: i < Math.min(sizeInfo.breakdown.length - 1, 3) ? '4px' : 0,
              }}>
                <span>{item.name}</span>
                <span style={{ fontWeight: 500 }}>{(item.size / (1024 * 1024)).toFixed(2)}MB</span>
              </div>
            ))}
          </div>

          {/* Warning si excede */}
          {sizeInfo.exceeds && (
            <div style={{
              background: 'rgba(220, 38, 38, 0.1)',
              borderRadius: '10px',
              padding: '12px 14px',
            }}>
              <p style={{
                fontSize: '13px',
                color: '#DC2626',
                margin: '0 0 8px',
                fontWeight: 600,
              }}>
                No podrás continuar hasta reducir el tamaño de tus archivos.
              </p>
              <p style={{
                fontSize: '12px',
                color: 'rgba(244, 237, 228, 0.8)',
                margin: 0,
              }}>
                Comprime tus PDFs con{' '}
                <a href="https://smallpdf.com/compress-pdf" target="_blank" rel="noopener noreferrer" style={{ color: '#F4EDE4', textDecoration: 'underline' }}>
                  smallpdf.com
                </a>{' '}o{' '}
                <a href="https://www.ilovepdf.com/compress_pdf" target="_blank" rel="noopener noreferrer" style={{ color: '#F4EDE4', textDecoration: 'underline' }}>
                  ilovepdf.com
                </a>
              </p>
            </div>
          )}
        </div>
      )}

      <div style={{
        background: 'rgba(244, 237, 228, 0.12)',
        borderRadius: '16px',
        padding: '16px 20px',
        marginTop: '24px',
        display: 'flex',
        gap: '16px',
        alignItems: 'flex-start'
      }}>
        <svg
          style={{ width: '24px', height: '24px', flexShrink: 0, marginTop: '2px' }}
          fill="none"
          stroke="rgba(244, 237, 228, 0.85)"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4M12 8h.01" />
        </svg>
        <p style={{
          fontSize: '13px',
          color: 'rgba(244, 237, 228, 0.85)',
          lineHeight: '1.7',
          margin: 0,
          flex: 1
        }}>
          Todos los documentos son obligatorios. Los archivos deben ser legibles y de buena calidad. Tu portafolio debe mostrar obra reciente (preferiblemente de los últimos 2-4 años). Los documentos serán revisados por el Comité Curatorial.
        </p>
      </div>

      <div style={{
        background: 'rgba(34, 197, 94, 0.15)',
        borderRadius: '16px',
        padding: '16px 20px',
        marginTop: '16px',
        display: 'flex',
        gap: '16px',
        alignItems: 'flex-start'
      }}>
        <svg
          style={{ width: '24px', height: '24px', flexShrink: 0, marginTop: '2px' }}
          fill="none"
          stroke="rgba(34, 197, 94, 0.9)"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div style={{ flex: 1 }}>
          <p style={{
            fontSize: '13px',
            fontWeight: '600',
            color: 'rgba(34, 197, 94, 0.95)',
            marginBottom: '4px'
          }}>
            Compresión Automática
          </p>
          <p style={{
            fontSize: '13px',
            color: 'rgba(34, 197, 94, 0.85)',
            lineHeight: '1.7',
            margin: 0
          }}>
            Las imágenes se comprimen automáticamente para optimizar el tamaño sin perder calidad. Los archivos por encima de los 10 MB no son aceptados, archivos por encima de 5 MB y debajo de 10 MB se comprimirán. Los archivos menores a 5 MB no serán comprimidos.
          </p>
        </div>
      </div>

      <div style={{
        background: 'rgba(244, 237, 228, 0.12)',
        borderRadius: '16px',
        padding: '16px 20px',
        marginTop: '16px',
        display: 'flex',
        gap: '16px',
        alignItems: 'flex-start'
      }}>
        <svg
          style={{ width: '24px', height: '24px', flexShrink: 0, marginTop: '2px' }}
          fill="none"
          stroke="rgba(244, 237, 228, 0.85)"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4M12 8h.01" />
        </svg>
        <p style={{
          fontSize: '13px',
          color: 'rgba(244, 237, 228, 0.85)',
          lineHeight: '1.7',
          margin: 0,
          flex: 1
        }}>
          Sobre tu portafolio: Incluye variedad de obras que muestren tu estilo. Fotografías de alta calidad con buena iluminación. Incluye ficha técnica de cada pieza: título, técnica o materiales, dimensiones y año. Las piezas de tu portafolio no son necesariamente con las que te postularás a ARTE FACTO.
        </p>
      </div>
    </div>
  )
}
