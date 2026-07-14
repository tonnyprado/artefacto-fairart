import { validationResult } from 'express-validator'

/**
 * Middleware para validar los resultados de express-validator
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    })
  }

  next()
}
