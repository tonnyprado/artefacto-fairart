import { Router } from 'express'
import { body } from 'express-validator'
import { validate } from '../middleware/validation.middleware.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware.js'
import * as eventosController from '../controllers/eventos.controller.js'

const router = Router()

// Rutas públicas - IMPORTANTE: Las rutas específicas deben ir ANTES de las dinámicas
router.get('/principal', eventosController.getEventoPrincipal)
router.get('/calendario', eventosController.getEventosCalendario)
router.get('/slug/:slug', eventosController.getEventoBySlug)
router.get('/:id', eventosController.getEventoById)
router.get('/', eventosController.getAllEventos)

// Rutas protegidas (admin)
router.post('/',
  authenticateToken,
  requireAdmin,
  [
    body('nombre').notEmpty().withMessage('El nombre es requerido'),
    body('fecha_inicio').isISO8601().withMessage('Fecha de inicio inválida'),
    body('fecha_fin').isISO8601().withMessage('Fecha de fin inválida'),
    body('ubicacion').notEmpty().withMessage('La ubicación es requerida'),
    validate
  ],
  eventosController.createEvento
)

router.put('/:id',
  authenticateToken,
  requireAdmin,
  eventosController.updateEvento
)

router.delete('/:id',
  authenticateToken,
  requireAdmin,
  eventosController.deleteEvento
)

export default router
