/**
 * Rutas de Registro
 * Endpoint público para registro de artistas con archivos
 */

import express from 'express'
import { registrarArtista } from '../controllers/registro.controller.js'
import { uploadArtistaFiles, handleMulterError } from '../middleware/upload.middleware.js'

const router = express.Router()

/**
 * POST /api/registro
 * Registro completo de artista con archivos
 * Body: FormData con todos los campos y archivos
 */
router.post('/', uploadArtistaFiles, handleMulterError, registrarArtista)

export default router
