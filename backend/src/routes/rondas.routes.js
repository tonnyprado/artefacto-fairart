/**
 * Rutas de Rondas
 * Endpoints para gestión de rondas de votación
 */

import express from 'express'
import {
  getRondasPorFase,
  getRonda,
  createRonda,
  abrirRonda,
  cerrarRonda,
  getEstadisticasRonda,
  deleteRonda
} from '../controllers/rondas.controller.js'
import { verifyToken, isAdmin, isAdminOrCurador } from '../middleware/auth.middleware.js'

const router = express.Router()

// Rutas públicas para curadores autenticados
router.get('/fase/:fase_id', verifyToken, isAdminOrCurador, getRondasPorFase)
router.get('/:id', verifyToken, isAdminOrCurador, getRonda)
router.get('/:id/estadisticas', verifyToken, isAdminOrCurador, getEstadisticasRonda)

// Rutas solo para admin
router.post('/', verifyToken, isAdmin, createRonda)
router.post('/:id/abrir', verifyToken, isAdmin, abrirRonda)
router.post('/:id/cerrar', verifyToken, isAdmin, cerrarRonda)
router.delete('/:id', verifyToken, isAdmin, deleteRonda)

export default router
