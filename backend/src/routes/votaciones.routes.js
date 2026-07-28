/**
 * Rutas de Votaciones
 * Endpoints para gestión de votaciones de curadores
 */

import express from 'express'
import {
  createVotacion,
  updateVotacion,
  getMisVotaciones,
  getResultadosFase,
  getEstadisticasCurador,
  deleteVotacion,
  verificarVoto
} from '../controllers/votaciones.controller.js'
import { verifyToken, isCurador, isAdminOrCurador } from '../middleware/auth.middleware.js'

const router = express.Router()

// Rutas para curadores
router.post('/', verifyToken, isCurador, createVotacion)
router.put('/:id', verifyToken, isCurador, updateVotacion)
router.get('/mis-votos', verifyToken, isCurador, getMisVotaciones)
router.get('/estadisticas', verifyToken, isCurador, getEstadisticasCurador)
router.delete('/:id', verifyToken, isCurador, deleteVotacion)

// Rutas para verificar votos
router.get('/fase/:fase_id/artista/:artista_id', verifyToken, isCurador, verificarVoto)

// Rutas para resultados (admin y curadores)
router.get('/resultados/:fase_id', verifyToken, isAdminOrCurador, getResultadosFase)

export default router
