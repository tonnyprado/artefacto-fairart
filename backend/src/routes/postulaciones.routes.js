/**
 * Rutas de Postulaciones
 * Endpoints para gestión de postulaciones de artistas
 */

import express from 'express'
import {
  getPostulaciones,
  getPostulacion,
  createPostulacion,
  updatePostulacion,
  moverAShortlist,
  getPostulacionesParaVotacion,
  deletePostulacion
} from '../controllers/postulaciones.controller.js'
import { verifyToken, isAdmin, isAdminOrCurador, isCurador } from '../middleware/auth.middleware.js'

const router = express.Router()

// Rutas para curadores y admin
router.get('/', verifyToken, isAdminOrCurador, getPostulaciones)
router.get('/fase/:fase_id/para-votacion', verifyToken, isCurador, getPostulacionesParaVotacion)
router.get('/:id', verifyToken, isAdminOrCurador, getPostulacion)

// Rutas solo para admin
router.post('/', verifyToken, isAdmin, createPostulacion)
router.put('/:id', verifyToken, isAdmin, updatePostulacion)
router.post('/:id/mover-a-shortlist', verifyToken, isAdmin, moverAShortlist)
router.delete('/:id', verifyToken, isAdmin, deletePostulacion)

export default router
