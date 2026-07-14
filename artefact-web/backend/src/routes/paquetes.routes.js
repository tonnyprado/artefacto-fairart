import { Router } from 'express'
import { body } from 'express-validator'
import { validate } from '../middleware/validation.middleware.js'
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js'
import * as paquetesController from '../controllers/paquetes.controller.js'

const router = Router()

// Rutas públicas
router.get('/', paquetesController.getPaquetes)
router.get('/:id', paquetesController.getPaqueteById)

// Rutas protegidas
router.post('/',
  verifyToken,
  isAdmin,
  [
    body('nombre').notEmpty().withMessage('El nombre es requerido'),
    body('precio').isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
    body('descripcion').notEmpty().withMessage('La descripción es requerida'),
    validate
  ],
  paquetesController.createPaquete
)

router.put('/:id',
  verifyToken,
  isAdmin,
  paquetesController.updatePaquete
)

router.delete('/:id',
  verifyToken,
  isAdmin,
  paquetesController.deletePaquete
)

export default router
