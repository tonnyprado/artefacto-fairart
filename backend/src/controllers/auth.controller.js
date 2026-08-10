/**
 * Controlador de Autenticación
 * Maneja login, registro y verificación de tokens
 * Usa PostgreSQL si está disponible, sino usa mockData
 */
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../config/database.js'
import { usuarios, curadores, getNextId, now, hashPassword, comparePassword } from '../data/mockData.js'

// Helper para determinar si usamos DB o mockData
const useDatabase = () => !!pool

/**
 * Registro de nuevo usuario
 */
export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body

    // Verificar si el usuario ya existe
    const existingUser = usuarios.find(u => u.email === email)

    if (existingUser) {
      return res.status(400).json({
        error: 'El email ya está registrado'
      })
    }

    // Hashear contraseña
    const hashedPassword = await hashPassword(password)

    // Crear usuario
    const nuevoUsuario = {
      id: getNextId.usuario(),
      email,
      password: hashedPassword,
      nombre: name,
      role: 'user',
      created_at: now(),
      updated_at: now()
    }

    usuarios.push(nuevoUsuario)

    // Generar token
    const token = jwt.sign(
      { id: nuevoUsuario.id, email: nuevoUsuario.email, role: nuevoUsuario.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: nuevoUsuario.id,
        email: nuevoUsuario.email,
        nombre: nuevoUsuario.nombre,
        role: nuevoUsuario.role
      },
      token
    })
  } catch (error) {
    console.error('Error en registro:', error)
    res.status(500).json({ error: 'Error al registrar usuario' })
  }
}

/**
 * Login de usuario
 */
export const login = async (req, res) => {
  try {
    console.log('Login attempt - Full request:', {
      body: req.body,
      headers: req.headers['content-type'],
      method: req.method
    })
    const { email, password } = req.body

    if (!email || !password) {
      console.log('Missing credentials:', { email: !!email, password: !!password })
      return res.status(400).json({
        error: 'Email y contraseña son requeridos'
      })
    }

    if (useDatabase()) {
      // Buscar usuario en PostgreSQL
      const userResult = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email])

      if (userResult.rows.length === 0) {
        return res.status(401).json({
          error: 'Credenciales inválidas'
        })
      }

      const user = userResult.rows[0]

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, user.password)

      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Credenciales inválidas'
        })
      }

      // Si es curador, buscar su curadorId
      let curadorId = null
      if (user.role === 'curador') {
        const curadorResult = await pool.query(
          'SELECT id FROM curadores WHERE usuario_id = $1',
          [user.id]
        )
        if (curadorResult.rows.length > 0) {
          curadorId = curadorResult.rows[0].id
        }
      }

      // Generar token
      const tokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role
      }

      if (curadorId) {
        tokenPayload.curadorId = curadorId
      }

      const token = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      )

      const userData = {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        role: user.role
      }

      if (curadorId) {
        userData.curadorId = curadorId
      }

      return res.json({
        message: 'Login exitoso',
        user: userData,
        token
      })
    }

    // Fallback a mockData
    const user = usuarios.find(u => u.email === email)

    if (!user) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      })
    }

    // Verificar contraseña
    const isValidPassword = await comparePassword(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      })
    }

    // Si es curador, buscar su curadorId
    let curadorId = null
    if (user.role === 'curador') {
      const curador = curadores.find(c => c.usuario_id === user.id)
      if (curador) {
        curadorId = curador.id
      }
    }

    // Generar token
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role
    }

    if (curadorId) {
      tokenPayload.curadorId = curadorId
    }

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    const userData = {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      role: user.role
    }

    if (curadorId) {
      userData.curadorId = curadorId
    }

    res.json({
      message: 'Login exitoso',
      user: userData,
      token
    })
  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({ error: 'Error al iniciar sesión' })
  }
}

/**
 * Verificar token
 */
export const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (useDatabase()) {
      // Buscar usuario en PostgreSQL
      const userResult = await pool.query('SELECT * FROM usuarios WHERE id = $1', [decoded.id])

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' })
      }

      const user = userResult.rows[0]

      // Si es curador, buscar su curadorId
      let curadorId = null
      if (user.role === 'curador') {
        const curadorResult = await pool.query(
          'SELECT id FROM curadores WHERE usuario_id = $1',
          [user.id]
        )
        if (curadorResult.rows.length > 0) {
          curadorId = curadorResult.rows[0].id
        }
      }

      const userData = {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        role: user.role
      }

      if (curadorId) {
        userData.curadorId = curadorId
      }

      return res.json({
        valid: true,
        user: userData
      })
    }

    // Fallback a mockData
    const user = usuarios.find(u => u.id === decoded.id)

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    // Si es curador, buscar su curadorId
    let curadorId = null
    if (user.role === 'curador') {
      const curador = curadores.find(c => c.usuario_id === user.id)
      if (curador) {
        curadorId = curador.id
      }
    }

    const userData = {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      role: user.role
    }

    if (curadorId) {
      userData.curadorId = curadorId
    }

    res.json({
      valid: true,
      user: userData
    })
  } catch (error) {
    res.status(401).json({
      valid: false,
      error: 'Token inválido o expirado'
    })
  }
}
