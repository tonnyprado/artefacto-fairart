/**
 * Rutas de Ediciones
 * Endpoints para gestión de ediciones de ARTEFACT
 */

import express from 'express'
import {
  getAllEdiciones,
  getEdicionById,
  getEdicionActiva,
  createEdicion,
  updateEdicion,
  deleteEdicion,
  getFasesEdicion
} from '../controllers/ediciones.controller.js'
import { verifyToken, isAdmin, isAdminOrCurador } from '../middleware/auth.middleware.js'

const router = express.Router()

// Rutas públicas (sin autenticación - para landing page)
router.get('/', getAllEdiciones) // Necesario para mostrar ediciones en landing
router.get('/activa', getEdicionActiva) // Necesario para mostrar edición activa en convocatoria

// Rutas para admin y curadores (requieren auth)
router.get('/:id', verifyToken, isAdminOrCurador, getEdicionById)
router.get('/:id/fases', verifyToken, isAdminOrCurador, getFasesEdicion)

// Rutas de admin
router.post('/', verifyToken, isAdmin, createEdicion)
router.put('/:id', verifyToken, isAdmin, updateEdicion)
router.delete('/:id', verifyToken, isAdmin, deleteEdicion)

export default router
