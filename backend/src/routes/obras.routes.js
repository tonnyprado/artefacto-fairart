import { Router } from 'express'
import { body } from 'express-validator'
import { validate } from '../middleware/validation.middleware.js'
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js'
import { uploadSingle } from '../middleware/upload.middleware.js'
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
    body('artista_id').isInt().withMessage('ID de artista inválido'),
    body('imagen_url').notEmpty().withMessage('La imagen_url es requerida'),
    body('alto_cm').optional().isFloat({ min: 0 }).withMessage('El alto debe ser un número positivo'),
    body('ancho_cm').optional().isFloat({ min: 0 }).withMessage('El ancho debe ser un número positivo'),
    body('precio_mxn').optional().isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
    validate
  ],
  obrasController.createObra
)

router.put('/:id',
  verifyToken,
  isAdmin,
  obrasController.updateObra
)

router.put('/:id/foto',
  verifyToken,
  isAdmin,
  uploadSingle('foto'),
  obrasController.updateObraFoto
)

router.delete('/:id',
  verifyToken,
  isAdmin,
  obrasController.deleteObra
)

export default router
