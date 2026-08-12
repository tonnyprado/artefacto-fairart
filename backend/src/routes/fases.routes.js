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
  toggleInscripciones,
  toggleVotaciones,
  abrirVotaciones,
  cerrarVotaciones,
  finalizarFase,
  deleteFase,
  getArtistasFase,
  inscribirArtistas
} from '../controllers/fases.controller.js'
import { verifyToken, isAdmin, isAdminOrCurador } from '../middleware/auth.middleware.js'

const router = express.Router()

// Rutas públicas (sin autenticación - para landing page)
router.get('/', getAllFases) // Necesario para banner de inscripciones en landing
router.get('/:id', getFaseById) // Necesario para mostrar info de fase en landing

// Rutas para admin y curadores (requieren auth)
router.get('/:id/artistas', verifyToken, isAdminOrCurador, getArtistasFase)

// Rutas de admin
router.post('/', verifyToken, isAdmin, createFase)
router.put('/:id', verifyToken, isAdmin, updateFase)
router.put('/:id/inscripciones', verifyToken, isAdmin, toggleInscripciones)
router.put('/:id/votaciones', verifyToken, isAdmin, toggleVotaciones)
router.put('/:id/abrir-votaciones', verifyToken, isAdmin, abrirVotaciones)
router.put('/:id/cerrar-votaciones', verifyToken, isAdmin, cerrarVotaciones)
router.put('/:id/finalizar', verifyToken, isAdmin, finalizarFase)
router.delete('/:id', verifyToken, isAdmin, deleteFase)
router.post('/:id/artistas', verifyToken, isAdmin, inscribirArtistas)

export default router
