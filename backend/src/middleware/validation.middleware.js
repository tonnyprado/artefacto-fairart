/**
 * Middleware de Validación
 * Usa express-validator para validar y sanitizar inputs
 */

import { body, param, query, validationResult } from 'express-validator'

/**
 * Middleware para validar los resultados de express-validator
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Error de validación',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    })
  }

  next()
}

// Alias para compatibilidad
export const handleValidationErrors = validate

// ==========================================
// VALIDADORES DE AUTENTICACIÓN
// ==========================================

export const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email demasiado largo'),
  body('password')
    .isLength({ min: 6, max: 100 })
    .withMessage('La contraseña debe tener entre 6 y 100 caracteres'),
  validate
]

// ==========================================
// VALIDADORES DE CURADORES
// ==========================================

export const validateCreateCurador = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('Nombre es requerido')
    .isLength({ min: 2, max: 255 })
    .withMessage('Nombre debe tener entre 2 y 255 caracteres')
    .escape(),
  body('apellido')
    .trim()
    .notEmpty()
    .withMessage('Apellido es requerido')
    .isLength({ min: 2, max: 255 })
    .withMessage('Apellido debe tener entre 2 y 255 caracteres')
    .escape(),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email demasiado largo'),
  body('password')
    .isLength({ min: 8, max: 100 })
    .withMessage('La contraseña debe tener entre 8 y 100 caracteres'),
  body('telefono')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Teléfono demasiado largo'),
  body('especialidad')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Especialidad demasiado larga')
    .escape(),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Biografía demasiado larga'),
  validate
]

export const validateUpdateCurador = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de curador inválido'),
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Nombre debe tener entre 2 y 255 caracteres')
    .escape(),
  body('apellido')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Apellido debe tener entre 2 y 255 caracteres')
    .escape(),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('telefono')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Teléfono demasiado largo'),
  body('especialidad')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Especialidad demasiado larga')
    .escape(),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Biografía demasiado larga'),
  validate
]

export const validateResetPassword = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de curador inválido'),
  body('password')
    .isLength({ min: 8, max: 100 })
    .withMessage('La contraseña debe tener entre 8 y 100 caracteres'),
  validate
]

// ==========================================
// VALIDADORES DE VOTACIONES
// ==========================================

export const validateCreateVotacion = [
  body('artista_id')
    .isInt({ min: 1 })
    .withMessage('ID de artista inválido'),
  body('fase_id')
    .isInt({ min: 1 })
    .withMessage('ID de fase inválido'),
  body('voto')
    .isBoolean()
    .withMessage('Voto debe ser true o false'),
  body('comentario')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comentario demasiado largo'),
  validate
]

export const validateUpdateVotacion = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de votación inválido'),
  body('voto')
    .optional()
    .isBoolean()
    .withMessage('Voto debe ser true o false'),
  body('comentario')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comentario demasiado largo'),
  validate
]

// ==========================================
// VALIDADORES COMUNES
// ==========================================

export const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID inválido'),
  validate
]
