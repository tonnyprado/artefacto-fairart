/**
 * Rutas de Curadores
 * Endpoints para gestión de curadores
 */

import express from 'express'
import {
  getAllCuradores,
  getCuradorById,
  createCurador,
  updateCurador,
  activarCurador,
  desactivarCurador,
  deleteCurador,
  getVotacionesCurador,
  resetPasswordCurador
} from '../controllers/curadores.controller.js'
import { verifyToken, isAdmin, isAdminOrCurador } from '../middleware/auth.middleware.js'
import {
  validateCreateCurador,
  validateUpdateCurador,
  validateResetPassword,
  validateId
} from '../middleware/validation.middleware.js'

const router = express.Router()

// Rutas para admin y curadores
router.get('/', verifyToken, isAdminOrCurador, getAllCuradores)
router.get('/:id', verifyToken, isAdminOrCurador, validateId, getCuradorById)
router.get('/:id/votaciones', verifyToken, isAdminOrCurador, validateId, getVotacionesCurador)

// Rutas solo para admin
router.post('/', verifyToken, isAdmin, validateCreateCurador, createCurador)
router.put('/:id', verifyToken, isAdmin, validateUpdateCurador, updateCurador)
router.put('/:id/activar', verifyToken, isAdmin, validateId, activarCurador)
router.put('/:id/desactivar', verifyToken, isAdmin, validateId, desactivarCurador)
router.put('/:id/reset-password', verifyToken, isAdmin, validateResetPassword, resetPasswordCurador)
router.delete('/:id', verifyToken, isAdmin, validateId, deleteCurador)

export default router
