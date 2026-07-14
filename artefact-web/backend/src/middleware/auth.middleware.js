import jwt from 'jsonwebtoken'

/**
 * Middleware para verificar el token JWT
 */
export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Token no proporcionado'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // Añadir datos del usuario al request
    next()
  } catch (error) {
    return res.status(401).json({
      error: 'Token inválido o expirado'
    })
  }
}

/**
 * Middleware para verificar si el usuario es admin
 */
export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Acceso denegado. Se requieren permisos de administrador.'
    })
  }
  next()
}

/**
 * Middleware opcional de autenticación (no falla si no hay token)
 */
export const optionalAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = decoded
    }
  } catch (error) {
    // No hacer nada si el token es inválido
  }
  next()
}
