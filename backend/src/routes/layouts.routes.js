/**
 * Rutas de Layouts
 * Endpoints para manejo de canvas layouts
 */

import { Router } from 'express'
import multer from 'multer'
import * as layoutsController from '../controllers/layouts.controller.js'

const router = Router()

// Configurar multer para almacenar archivos en memoria
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Aceptar solo imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false)
    }
  }
})

/**
 * POST /api/layouts/upload
 * Subir imagen del canvas layout
 * Body: form-data con campo 'layout' (file)
 */
router.post('/upload', upload.single('layout'), layoutsController.uploadLayoutCanvas)

export default router
