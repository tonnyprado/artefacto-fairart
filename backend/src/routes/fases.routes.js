/**
 * Rutas de Fases
 * Endpoints para gestión de fases de selección
 */

import express from 'express'
import {
  getAllFases,
  getFaseById,
  createFase,
  updateFase,
  abrirVotaciones,
  cerrarVotaciones,
  finalizarFase,
  deleteFase,
  getArtistasFase,
  inscribirArtistas
} from '../controllers/fases.controller.js'
import { verifyToken, isAdmin, isAdminOrCurador } from '../middleware/auth.middleware.js'

const router = express.Router()

// Rutas públicas (para curadores y admins)
router.get('/', verifyToken, isAdminOrCurador, getAllFases)
router.get('/:id', verifyToken, isAdminOrCurador, getFaseById)
router.get('/:id/artistas', verifyToken, isAdminOrCurador, getArtistasFase)

// Rutas de admin
router.post('/', verifyToken, isAdmin, createFase)
router.put('/:id', verifyToken, isAdmin, updateFase)
router.put('/:id/abrir-votaciones', verifyToken, isAdmin, abrirVotaciones)
router.put('/:id/cerrar-votaciones', verifyToken, isAdmin, cerrarVotaciones)
router.put('/:id/finalizar', verifyToken, isAdmin, finalizarFase)
router.delete('/:id', verifyToken, isAdmin, deleteFase)
router.post('/:id/artistas', verifyToken, isAdmin, inscribirArtistas)

export default router
