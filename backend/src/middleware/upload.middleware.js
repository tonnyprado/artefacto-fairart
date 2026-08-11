/**
 * Middleware de Multer para manejar uploads
 * Procesa archivos en memoria (buffer) para procesarlos con Sharp
 */

import multer from 'multer'

// Configuración de almacenamiento en memoria
const storage = multer.memoryStorage()

// Filtro de archivos permitidos
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const allowedDocTypes = ['application/pdf']
  const allowedTypes = [...allowedImageTypes, ...allowedDocTypes]

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}. Solo se permiten imágenes (JPG, PNG, WebP) y PDFs.`), false)
  }
}

// Configuración de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB máximo por archivo
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
 */
export const uploadArtistaFiles = upload.fields([
  { name: 'foto', maxCount: 1 },                    // Foto de perfil
  { name: 'cv', maxCount: 1 },                      // CV PDF
  { name: 'portfolio', maxCount: 1 },               // Portfolio PDF
  { name: 'identificacion', maxCount: 1 },          // Identificación
  { name: 'layout_canvas_image', maxCount: 1 },     // Canvas generado
  { name: 'obra_lienzo_0', maxCount: 1 },           // Obras del lienzo
  { name: 'obra_lienzo_1', maxCount: 1 },
  { name: 'obra_lienzo_2', maxCount: 1 },
  { name: 'obra_lienzo_3', maxCount: 1 },
  { name: 'obra_lienzo_4', maxCount: 1 }
])

/**
 * Middleware de manejo de errores de Multer
 */
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'El archivo es demasiado grande. Máximo 10MB por archivo.'
      })
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Demasiados archivos o nombre de campo incorrecto.'
      })
    }
    return res.status(400).json({
      success: false,
      error: `Error al subir archivo: ${err.message}`
    })
  }

  if (err) {
    return res.status(400).json({
      success: false,
      error: err.message
    })
  }

  next()
}

export default upload
