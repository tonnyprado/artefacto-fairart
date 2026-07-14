import { Router } from 'express'
import { body } from 'express-validator'
import { validate } from '../middleware/validation.middleware.js'
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js'
import * as artistasController from '../controllers/artistas.controller.js'

const router = Router()

// Rutas públicas
router.get('/', artistasController.getArtistas)
router.get('/:id', artistasController.getArtistaById)
router.get('/slug/:slug', artistasController.getArtistaBySlug)

// Rutas protegidas (requieren autenticación de admin)
router.post('/',
  verifyToken,
  isAdmin,
  [
    body('nombre').notEmpty().withMessage('El nombre es requerido'),
    body('email').isEmail().withMessage('Email inválido'),
    body('bio').optional(),
    body('categoria').notEmpty().withMessage('La categoría es requerida'),
    validate
  ],
  artistasController.createArtista
)

router.put('/:id',
  verifyToken,
  isAdmin,
  artistasController.updateArtista
)

router.delete('/:id',
  verifyToken,
  isAdmin,
  artistasController.deleteArtista
)

export default router
