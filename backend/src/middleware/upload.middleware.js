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
    'image/gif',
    // Formatos HEIC/HEIF (iPhone moderno)
    'image/heic',
    'image/heif',
    'image/heic-sequence',
    'image/heif-sequence'
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
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}. Solo se permiten imágenes (JPG, PNG, WebP, GIF, HEIC) y documentos (PDF, DOC, DOCX).`), false)
  }
}

// Configuración de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB máximo por archivo individual
    files: 300, // Máximo 300 archivos (50 obras + 250 fotos detalle máximo)
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
 * - obra_lienzo_0 a obra_lienzo_49: Imágenes de obras (JPG, PNG, WebP) - HASTA 50 OBRAS
 * - obra_lienzo_X_detalle_Y: Fotos de detalle por obra (hasta 10 por obra)
 *
 * CAPACIDAD TOTAL:
 * - 50 obras principales
 * - 500 fotos de detalle máximo (50 obras × 10 fotos)
 * - 6 documentos básicos
 * - Total: hasta 300 archivos simultáneos
 */

// Generar campos dinámicamente para obras y sus detalles
const generarCamposObras = () => {
  const campos = []
  // AUMENTADO A 50 obras para soportar muchas fotografías
  // Artistas de fotografía pueden querer subir muchas obras
  for (let i = 0; i < 50; i++) {
    // Imagen principal de la obra
    campos.push({ name: `obra_lienzo_${i}`, maxCount: 1 })
    // Fotos de detalle de cada obra (hasta 10 por obra para esculturas y obras complejas)
    for (let j = 0; j < 10; j++) {
      campos.push({ name: `obra_lienzo_${i}_detalle_${j}`, maxCount: 1 })
    }
  }
  return campos
}

export const uploadArtistaFiles = upload.fields([
  { name: 'foto', maxCount: 1 },                    // Foto de perfil (imagen)
  { name: 'cv', maxCount: 1 },                      // CV (PDF, DOC, DOCX)
  { name: 'portfolio', maxCount: 1 },               // Portfolio (PDF)
  { name: 'identificacion', maxCount: 1 },          // Identificación (imagen o PDF)
  { name: 'layout_canvas_image', maxCount: 1 },     // Canvas preview (imagen)
  { name: 'layout_canvas_pdf', maxCount: 1 },       // Canvas completo (PDF)
  // Obras del lienzo (hasta 15 para dar margen) + fotos de detalle (hasta 5 por obra)
  ...generarCamposObras()
])

/**
 * Middleware de manejo de errores de Multer
 */
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.log('❌ MULTER ERROR:', err.code, '-', err.message)
    console.log('📊 Error completo:', JSON.stringify(err, null, 2))
    console.log('📝 Archivos recibidos antes del error:', req.files ? Object.keys(req.files) : 'ninguno')

    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'El archivo es demasiado grande. Máximo 100MB por archivo.',
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
      console.log('❌ Campo inesperado:', err.field)
      console.log('📋 Campos configurados:', ['foto', 'cv', 'portfolio', 'identificacion', 'layout_canvas_image', 'layout_canvas_pdf', 'obra_lienzo_0 a 49', 'obra_lienzo_X_detalle_Y (10 por obra)'])
      return res.status(400).json({
        success: false,
        error: `Campo inesperado: "${err.field || 'desconocido'}". Límites: 50 obras + 10 fotos detalle por obra = 300 archivos máximo.`,
        code: 'LIMIT_UNEXPECTED_FILE',
        field: err.field
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
