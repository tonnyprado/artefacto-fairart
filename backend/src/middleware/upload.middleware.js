/**
 * Middleware de Multer para manejar uploads
 * Procesa archivos en memoria (buffer) para procesarlos con Sharp
 */

import multer from 'multer'

// Configuración de almacenamiento en memoria
const storage = multer.memoryStorage()

// Filtro de archivos permitidos
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
  const allowedDocTypes = [
    'application/pdf',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
  ]
  const allowedTypes = [...allowedImageTypes, ...allowedDocTypes]

  console.log(`📁 Archivo recibido: ${file.fieldname} - ${file.originalname} (${file.mimetype})`)

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    console.error(`❌ Tipo de archivo no permitido: ${file.mimetype}`)
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}. Solo se permiten imágenes (JPG, PNG, WebP, GIF) y documentos (PDF, DOC, DOCX).`), false)
  }
}

// Configuración de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo por archivo
    files: 20, // Máximo 20 archivos
    fieldSize: 100 * 1024 * 1024 // 100MB para campos de texto (layout_canvas_data puede ser grande)
  }
})

/**
 * Middleware para subir un solo archivo
 * Uso: upload.single('fieldname')
 */
export const uploadSingle = upload.single.bind(upload)

/**
 * Middleware para subir múltiples archivos con diferentes nombres de campo
 * Uso: upload.fields([{ name: 'foto', maxCount: 1 }, { name: 'cv', maxCount: 1 }])
 */
export const uploadFields = upload.fields.bind(upload)

/**
 * Middleware para subir múltiples archivos del mismo campo
 * Uso: upload.array('obras', 5)
 */
export const uploadArray = upload.array.bind(upload)

/**
 * Middleware personalizado para registro de artistas
 * Maneja todos los archivos que puede subir un artista
 *
 * CAMPOS ESPERADOS:
 * - foto: Foto de perfil (JPG, PNG, WebP) - REQUERIDO
 * - cv: CV Artístico (PDF, DOC, DOCX) - REQUERIDO
 * - portfolio: Portafolio (PDF) - REQUERIDO
 * - identificacion: INE o Pasaporte (JPG, PNG, PDF) - REQUERIDO
 * - layout_canvas_image: Preview del lienzo (JPG) - AUTO-GENERADO
 * - layout_canvas_pdf: PDF del lienzo (PDF) - AUTO-GENERADO
 * - obra_lienzo_0 a obra_lienzo_9: Imágenes de obras (JPG, PNG, WebP) - SEGÚN PAQUETE
 */
export const uploadArtistaFiles = upload.fields([
  { name: 'foto', maxCount: 1 },                    // Foto de perfil (imagen)
  { name: 'cv', maxCount: 1 },                      // CV (PDF, DOC, DOCX)
  { name: 'portfolio', maxCount: 1 },               // Portfolio (PDF)
  { name: 'identificacion', maxCount: 1 },          // Identificación (imagen o PDF)
  { name: 'layout_canvas_image', maxCount: 1 },     // Canvas preview (imagen)
  { name: 'layout_canvas_pdf', maxCount: 1 },       // Canvas completo (PDF)
  // Obras del lienzo (hasta 10)
  { name: 'obra_lienzo_0', maxCount: 1 },
  { name: 'obra_lienzo_1', maxCount: 1 },
  { name: 'obra_lienzo_2', maxCount: 1 },
  { name: 'obra_lienzo_3', maxCount: 1 },
  { name: 'obra_lienzo_4', maxCount: 1 },
  { name: 'obra_lienzo_5', maxCount: 1 },
  { name: 'obra_lienzo_6', maxCount: 1 },
  { name: 'obra_lienzo_7', maxCount: 1 },
  { name: 'obra_lienzo_8', maxCount: 1 },
  { name: 'obra_lienzo_9', maxCount: 1 }
])

/**
 * Middleware de manejo de errores de Multer
 */
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.log('❌ MULTER ERROR:', err.code, '-', err.message)
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'El archivo es demasiado grande. Máximo 10MB por archivo.',
        code: 'LIMIT_FILE_SIZE'
      })
    }
    if (err.code === 'LIMIT_FIELD_VALUE') {
      console.log('❌ Campo demasiado grande - probablemente layout_canvas_data')
      return res.status(400).json({
        success: false,
        error: 'Los datos del lienzo son demasiado grandes. Intenta reducir el número de obras o la complejidad del diseño.',
        code: 'LIMIT_FIELD_VALUE'
      })
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Demasiados archivos o nombre de campo incorrecto.',
        code: 'LIMIT_UNEXPECTED_FILE'
      })
    }
    return res.status(400).json({
      success: false,
      error: `Error al subir archivo: ${err.message}`,
      code: err.code
    })
  }

  if (err) {
    console.log('❌ UPLOAD ERROR (no Multer):', err.message)
    return res.status(400).json({
      success: false,
      error: err.message
    })
  }

  // Log cuando todo está OK y pasa al controlador
  console.log('✅ Archivos procesados correctamente, pasando al controlador...')
  next()
}

export default upload
