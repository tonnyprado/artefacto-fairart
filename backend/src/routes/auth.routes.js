import { Router } from 'express'
import { body } from 'express-validator'
import { validate } from '../middleware/validation.middleware.js'
import * as authController from '../controllers/auth.controller.js'

const router = Router()

// Registro de usuario
router.post('/register',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('name').notEmpty().withMessage('El nombre es requerido'),
    validate
  ],
  authController.register
)

// Login
router.post('/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es requerida'),
    validate
  ],
  authController.login
)

// Verificar token
router.get('/verify', authController.verifyToken)

export default router
