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
  getVotacionesCurador
} from '../controllers/curadores.controller.js'
import { verifyToken, isAdmin, isAdminOrCurador } from '../middleware/auth.middleware.js'

const router = express.Router()

// Rutas para admin y curadores
router.get('/', verifyToken, isAdminOrCurador, getAllCuradores)
router.get('/:id', verifyToken, isAdminOrCurador, getCuradorById)
router.get('/:id/votaciones', verifyToken, isAdminOrCurador, getVotacionesCurador)

// Rutas solo para admin
router.post('/', verifyToken, isAdmin, createCurador)
router.put('/:id', verifyToken, isAdmin, updateCurador)
router.put('/:id/activar', verifyToken, isAdmin, activarCurador)
router.put('/:id/desactivar', verifyToken, isAdmin, desactivarCurador)
router.delete('/:id', verifyToken, isAdmin, deleteCurador)

export default router
