/**
 * Rutas de Votaciones - Sistema de Rondas
 * Endpoints para gestión de votaciones de curadores
 */

import express from 'express'
import {
  createVotacion,
  updateVotacion,
  getMisVotaciones,
  getResultadosRonda,
  getResultadosFase,
  getEstadisticasCurador,
  deleteVotacion,
  verificarVoto,
  getProgresoRonda
} from '../controllers/votaciones.controller.js'
import { verifyToken, isCurador, isAdminOrCurador } from '../middleware/auth.middleware.js'

const router = express.Router()

// Rutas para curadores
router.post('/', verifyToken, isCurador, createVotacion)
router.put('/:id', verifyToken, isCurador, updateVotacion)
router.get('/mis-votos', verifyToken, isCurador, getMisVotaciones)
router.get('/estadisticas', verifyToken, isCurador, getEstadisticasCurador)
router.delete('/:id', verifyToken, isCurador, deleteVotacion)

// Rutas para progreso y verificación
router.get('/ronda/:ronda_id/progreso', verifyToken, isCurador, getProgresoRonda)
router.get('/fase/:fase_id/artista/:artista_id', verifyToken, isCurador, verificarVoto)

// Rutas para resultados (admin y curadores, solo rondas cerradas)
router.get('/ronda/:ronda_id/resultados', verifyToken, isAdminOrCurador, getResultadosRonda)
router.get('/resultados/:fase_id', verifyToken, isAdminOrCurador, getResultadosFase)

export default router
