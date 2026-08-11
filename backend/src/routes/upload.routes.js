/**
 * Rutas de Upload
 * Endpoints para subir archivos a S3
 */

import express from 'express'
import {
  uploadSingleFile,
  uploadMultipleFiles,
  uploadArtistaFiles
} from '../controllers/upload.controller.js'
import {
  uploadSingle,
  uploadArray,
  uploadArtistaFiles as uploadArtistaMiddleware,
  handleMulterError
} from '../middleware/upload.middleware.js'

const router = express.Router()

/**
 * POST /api/upload/single
 * Subir un solo archivo
 * Body: FormData con campo 'file' y opcional 'folder'
 */
router.post('/single', uploadSingle('file'), handleMulterError, uploadSingleFile)

/**
 * POST /api/upload/multiple
 * Subir múltiples archivos
 * Body: FormData con campo 'files[]' y opcional 'folder'
 */
router.post('/multiple', uploadArray('files', 10), handleMulterError, uploadMultipleFiles)

/**
 * POST /api/upload/artista
 * Subir archivos de registro de artista
 * Body: FormData con campos:
 * - foto (imagen)
 * - cv (PDF)
 * - portfolio (PDF)
 * - identificacion (imagen/PDF)
 * - layout_canvas_image (imagen)
 * - obra_lienzo_0, obra_lienzo_1, etc. (imágenes)
 */
router.post('/artista', uploadArtistaMiddleware, handleMulterError, uploadArtistaFiles)

export default router
