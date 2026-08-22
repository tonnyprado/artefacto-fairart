import { Router } from 'express'
import { validateLogin } from '../middleware/validation.middleware.js'
import * as authController from '../controllers/auth.controller.js'

const router = Router()

// Login con validación mejorada
router.post('/login', validateLogin, authController.login)

// Verificar token
router.get('/verify', authController.verifyToken)

export default router
