import { Router } from 'express'
import { body } from 'express-validator'
import { validate } from '../middleware/validation.middleware.js'
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js'
import * as obrasController from '../controllers/obras.controller.js'

const router = Router()

// Rutas públicas
router.get('/', obrasController.getObras)
router.get('/:id', obrasController.getObraById)
router.get('/artista/:artistaId', obrasController.getObrasByArtista)

// Rutas protegidas
router.post('/',
  verifyToken,
  isAdmin,
  [
    body('titulo').notEmpty().withMessage('El título es requerido'),
    body('artista_id').isInt().withMessage('ID de artista inválido'),
    body('precio').isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
    body('categoria').notEmpty().withMessage('La categoría es requerida'),
    validate
  ],
  obrasController.createObra
)

router.put('/:id',
  verifyToken,
  isAdmin,
  obrasController.updateObra
)

router.delete('/:id',
  verifyToken,
  isAdmin,
  obrasController.deleteObra
)

export default router
