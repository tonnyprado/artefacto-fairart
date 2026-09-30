/**
 * Rutas de Concurso
 * Endpoints para gestión de concursos y selección de obras
 * SOLO ACCESIBLE PARA ADMIN
 */

import express from 'express'
import {
  getArtistasElegibles,
  getObrasArtista,
  seleccionarObra,
  deseleccionarObra,
  getObrasSeleccionadas,
  getEstadisticas
} from '../controllers/concurso.controller.js'
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js'

const router = express.Router()

// Todas las rutas requieren autenticación de admin
router.use(verifyToken, isAdmin)

/**
 * GET /api/concurso/artistas-elegibles
 * Obtener lista de artistas elegibles para concurso
 * Query params: search, limit, offset
 */
router.get('/artistas-elegibles', getArtistasElegibles)

/**
 * GET /api/concurso/artistas/:artista_id/obras
 * Obtener obras de un artista con información de selección
 */
router.get('/artistas/:artista_id/obras', getObrasArtista)

/**
 * POST /api/concurso/:fase_id/seleccionar-obra
 * Seleccionar una obra para concurso
 * Body: { obra_id, notas? }
 */
router.post('/:fase_id/seleccionar-obra', seleccionarObra)

/**
 * DELETE /api/concurso/:fase_id/deseleccionar-obra/:obra_id
 * Deseleccionar una obra de concurso
 */
router.delete('/:fase_id/deseleccionar-obra/:obra_id', deseleccionarObra)

/**
 * GET /api/concurso/:fase_id/obras-seleccionadas
 * Obtener obras seleccionadas de un concurso
 * Query params: artista_id (opcional)
 */
router.get('/:fase_id/obras-seleccionadas', getObrasSeleccionadas)

/**
 * GET /api/concurso/:fase_id/estadisticas
 * Obtener estadísticas de un concurso
 */
router.get('/:fase_id/estadisticas', getEstadisticas)

export default router
