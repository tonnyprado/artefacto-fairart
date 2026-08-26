/**
 * Rutas de Favoritos
 * Endpoints para gestion de favoritos de curadores
 */

import express from 'express'
import {
  createFavorito,
  deleteFavorito,
  toggleFavorito,
  getMisFavoritos,
  getFavoritosByFase,
  checkFavorito,
  updateFavorito,
  getEstadisticasFavoritosAdmin,
  getFavoritosByCuradorAdmin
} from '../controllers/favoritos.controller.js'
import { verifyToken, isCurador, isAdmin, isAdminOrCurador } from '../middleware/auth.middleware.js'

const router = express.Router()

// Rutas para curadores
router.post('/', verifyToken, isCurador, createFavorito)
router.post('/toggle', verifyToken, isCurador, toggleFavorito)
router.get('/mis-favoritos', verifyToken, isCurador, getMisFavoritos)
router.get('/fase/:fase_id', verifyToken, isCurador, getFavoritosByFase)
router.get('/check/:artista_id/:fase_id', verifyToken, isCurador, checkFavorito)
router.put('/:id', verifyToken, isCurador, updateFavorito)
router.delete('/:id', verifyToken, isCurador, deleteFavorito)

// Rutas para admin
router.get('/admin/estadisticas', verifyToken, isAdmin, getEstadisticasFavoritosAdmin)
router.get('/admin/curador/:curador_id', verifyToken, isAdmin, getFavoritosByCuradorAdmin)

export default router
