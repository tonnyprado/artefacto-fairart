/**
 * Rutas de Artistas
 * Endpoints para gestión de artistas
 */

import express from 'express'
import {
  getAllArtistas,
  getArtistaById,
  createArtista,
  updateArtista,
  aprobarArtista,
  rechazarArtista,
  deleteArtista,
  getArtistasByFase
} from '../controllers/artistas.controller.js'
import { verifyToken, isAdmin, isAdminOrCurador } from '../middleware/auth.middleware.js'

const router = express.Router()

// Rutas públicas (registro de artistas)
router.post('/', createArtista)

// Rutas para admin y curadores
router.get('/', verifyToken, isAdminOrCurador, getAllArtistas)
router.get('/fase/:fase_id', verifyToken, isAdminOrCurador, getArtistasByFase)
router.get('/:id', verifyToken, isAdminOrCurador, getArtistaById)

// Rutas solo para admin
router.put('/:id', verifyToken, isAdmin, updateArtista)
router.put('/:id/aprobar', verifyToken, isAdmin, aprobarArtista)
router.put('/:id/rechazar', verifyToken, isAdmin, rechazarArtista)
router.delete('/:id', verifyToken, isAdmin, deleteArtista)

export default router
