/**
 * Controlador de Curadores
 * Maneja la lógica de negocio para los curadores
 * Usa PostgreSQL si está disponible, sino usa mockData
 */

import pool from '../config/database.js'
import bcrypt from 'bcryptjs'
import {
  usuarios,
  curadores,
  votaciones,
  getNextId,
  now,
  hashPassword
} from '../data/mockData.js'

// Helper para determinar si usamos DB o mockData
const useDatabase = () => !!pool

/**
 * GET /api/curadores
 * Obtener todos los curadores
 */
export const getAllCuradores = async (req, res) => {
  try {
    if (useDatabase()) {
      // Query optimizada con conteo de votaciones
      const result = await pool.query(`
        SELECT
          c.*,
          u.email as usuario_email,
          u.role as usuario_role,
          COALESCE(v_count.total_votaciones, 0) as total_votaciones
        FROM curadores c
        LEFT JOIN usuarios u ON u.id = c.usuario_id
        LEFT JOIN LATERAL (
          SELECT COUNT(*) as total_votaciones
          FROM votaciones
          WHERE curador_id = c.id
        ) v_count ON true
        ORDER BY c.created_at DESC
      `)

      return res.json({
        success: true,
        data: result.rows
      })
    }

    // Fallback a mockData
    // Agregar conteo de votaciones a cada curador
    const curadoresConVotaciones = curadores.map(c => ({
      ...c,
      total_votaciones: votaciones.filter(v => v.curador_id === c.id).length
    }))

    res.json({
      success: true,
      data: curadoresConVotaciones
    })
  } catch (error) {
    console.error('Error al obtener curadores:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener curadores'
    })
  }
}

/**
 * GET /api/curadores/:id
 * Obtener un curador por ID
 */
export const getCuradorById = async (req, res) => {
  try {
    const { id } = req.params

    if (useDatabase()) {
      const result = await pool.query(`
        SELECT
          c.*,
          u.email as usuario_email,
          u.role as usuario_role,
          COALESCE(v_count.total_votaciones, 0) as total_votaciones
        FROM curadores c
        LEFT JOIN usuarios u ON u.id = c.usuario_id
        LEFT JOIN LATERAL (
          SELECT COUNT(*) as total_votaciones
          FROM votaciones
          WHERE curador_id = c.id
        ) v_count ON true
        WHERE c.id = $1
      `, [id])

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Curador no encontrado'
        })
      }

      return res.json({
        success: true,
        data: result.rows[0]
      })
    }

    // Fallback a mockData
    const curador = curadores.find(c => c.id === parseInt(id))

    if (!curador) {
      return res.status(404).json({
        success: false,
        error: 'Curador no encontrado'
      })
    }

    // Contar votaciones del curador
    const totalVotaciones = votaciones.filter(v => v.curador_id === curador.id).length

    res.json({
      success: true,
      data: {
        ...curador,
        total_votaciones: totalVotaciones
      }
    })
  } catch (error) {
    console.error('Error al obtener curador:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener curador'
    })
  }
}

/**
 * POST /api/curadores
 * Crear un nuevo curador (Solo admin)
 */
export const createCurador = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      email,
      telefono,
      especialidad,
      bio,
      foto,
      password
    } = req.body

    // Validaciones
    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Nombre, apellido, email y password son requeridos'
      })
    }

    if (useDatabase()) {
      // Verificar si el email ya existe
      const emailCheck = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email])
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'El email ya está registrado'
        })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Crear usuario
      const usuarioResult = await pool.query(
        `INSERT INTO usuarios (email, password, nombre, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, nombre, role, created_at`,
        [email, hashedPassword, `${nombre} ${apellido}`, 'curador']
      )

      const nuevoUsuario = usuarioResult.rows[0]

      // Crear curador
      const curadorResult = await pool.query(
        `INSERT INTO curadores (usuario_id, nombre, apellido, email, telefono, especialidad, bio, foto, activo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          nuevoUsuario.id,
          nombre,
          apellido,
          email,
          telefono || null,
          especialidad || null,
          bio || null,
          foto || null,
          true
        ]
      )

      const nuevoCurador = curadorResult.rows[0]

      return res.status(201).json({
        success: true,
        data: {
          curador: nuevoCurador,
          usuario: {
            id: nuevoUsuario.id,
            email: nuevoUsuario.email,
            nombre: nuevoUsuario.nombre,
            role: nuevoUsuario.role
          }
        },
        message: 'Curador creado exitosamente'
      })
    }

    // Fallback a mockData
    // Verificar si el email ya existe
    const emailExistente = usuarios.some(u => u.email === email)
    if (emailExistente) {
      return res.status(400).json({
        success: false,
        error: 'El email ya está registrado'
      })
    }

    // Crear usuario
    const hashedPassword = await hashPassword(password)
    const nuevoUsuario = {
      id: getNextId.usuario(),
      email,
      password: hashedPassword,
      nombre: `${nombre} ${apellido}`,
      role: 'curador',
      created_at: now(),
      updated_at: now()
    }
    usuarios.push(nuevoUsuario)

    // Crear curador
    const nuevoCurador = {
      id: getNextId.curador(),
      usuario_id: nuevoUsuario.id,
      nombre,
      apellido,
      email,
      telefono: telefono || null,
      especialidad: especialidad || null,
      bio: bio || null,
      foto: foto || null,
      activo: true,
      created_at: now(),
      updated_at: now()
    }
    curadores.push(nuevoCurador)

    // No devolver password
    const { password: _, ...usuarioSinPassword } = nuevoUsuario

    res.status(201).json({
      success: true,
      data: {
        curador: nuevoCurador,
        usuario: usuarioSinPassword
      },
      message: 'Curador creado exitosamente'
    })
  } catch (error) {
    console.error('Error al crear curador:', error)
    res.status(500).json({
      success: false,
      error: 'Error al crear curador'
    })
  }
}

/**
 * PUT /api/curadores/:id
 * Actualizar un curador (Solo admin)
 */
export const updateCurador = async (req, res) => {
  try {
    const { id } = req.params
    const {
      nombre,
      apellido,
      email,
      telefono,
      especialidad,
      bio,
      foto,
      activo
    } = req.body

    if (useDatabase()) {
      // Verificar que el curador existe
      const checkCurador = await pool.query('SELECT * FROM curadores WHERE id = $1', [id])
      if (checkCurador.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Curador no encontrado'
        })
      }

      const curadorActual = checkCurador.rows[0]

      // Si se cambia el email, verificar que no esté en uso
      if (email && email !== curadorActual.email) {
        const emailCheck = await pool.query(
          'SELECT id FROM usuarios WHERE email = $1 AND id != $2',
          [email, curadorActual.usuario_id]
        )
        if (emailCheck.rows.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'El email ya está en uso'
          })
        }

        // Actualizar email en usuario
        await pool.query(
          'UPDATE usuarios SET email = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [email, curadorActual.usuario_id]
        )
      }

      // Construir UPDATE dinámico
      const updates = []
      const values = []
      let paramCount = 1

      if (nombre !== undefined) { updates.push(`nombre = $${paramCount}`); values.push(nombre); paramCount++ }
      if (apellido !== undefined) { updates.push(`apellido = $${paramCount}`); values.push(apellido); paramCount++ }
      if (email !== undefined) { updates.push(`email = $${paramCount}`); values.push(email); paramCount++ }
      if (telefono !== undefined) { updates.push(`telefono = $${paramCount}`); values.push(telefono); paramCount++ }
      if (especialidad !== undefined) { updates.push(`especialidad = $${paramCount}`); values.push(especialidad); paramCount++ }
      if (bio !== undefined) { updates.push(`bio = $${paramCount}`); values.push(bio); paramCount++ }
      if (foto !== undefined) { updates.push(`foto = $${paramCount}`); values.push(foto); paramCount++ }
      if (activo !== undefined) { updates.push(`activo = $${paramCount}`); values.push(activo); paramCount++ }
      updates.push('updated_at = CURRENT_TIMESTAMP')

      if (updates.length === 1) {
        return res.json({
          success: true,
          data: curadorActual,
          message: 'No hay cambios que actualizar'
        })
      }

      values.push(id)
      const query = `UPDATE curadores SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`

      const result = await pool.query(query, values)

      return res.json({
        success: true,
        data: result.rows[0],
        message: 'Curador actualizado exitosamente'
      })
    }

    // Fallback a mockData
    const curadorIndex = curadores.findIndex(c => c.id === parseInt(id))

    if (curadorIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Curador no encontrado'
      })
    }

    // Si se cambia el email, verificar que no esté en uso
    if (email && email !== curadores[curadorIndex].email) {
      const emailExistente = usuarios.some(u => u.email === email && u.id !== curadores[curadorIndex].usuario_id)
      if (emailExistente) {
        return res.status(400).json({
          success: false,
          error: 'El email ya está en uso'
        })
      }

      // Actualizar email en usuario
      const usuarioIndex = usuarios.findIndex(u => u.id === curadores[curadorIndex].usuario_id)
      if (usuarioIndex !== -1) {
        usuarios[usuarioIndex].email = email
        usuarios[usuarioIndex].updated_at = now()
      }
    }

    // Actualizar curador
    curadores[curadorIndex] = {
      ...curadores[curadorIndex],
      ...(nombre && { nombre }),
      ...(apellido && { apellido }),
      ...(email && { email }),
      ...(telefono !== undefined && { telefono }),
      ...(especialidad !== undefined && { especialidad }),
      ...(bio !== undefined && { bio }),
      ...(foto !== undefined && { foto }),
      ...(activo !== undefined && { activo }),
      updated_at: now()
    }

    res.json({
      success: true,
      data: curadores[curadorIndex],
      message: 'Curador actualizado exitosamente'
    })
  } catch (error) {
    console.error('Error al actualizar curador:', error)
    res.status(500).json({
      success: false,
      error: 'Error al actualizar curador'
    })
  }
}

/**
 * PUT /api/curadores/:id/activar
 * Activar un curador (Solo admin)
 */
export const activarCurador = async (req, res) => {
  try {
    const { id } = req.params

    if (useDatabase()) {
      const result = await pool.query(
        `UPDATE curadores SET activo = true, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 RETURNING *`,
        [id]
      )

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Curador no encontrado'
        })
      }

      return res.json({
        success: true,
        data: result.rows[0],
        message: 'Curador activado exitosamente'
      })
    }

    // Fallback a mockData
    const curadorIndex = curadores.findIndex(c => c.id === parseInt(id))

    if (curadorIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Curador no encontrado'
      })
    }

    curadores[curadorIndex].activo = true
    curadores[curadorIndex].updated_at = now()

    res.json({
      success: true,
      data: curadores[curadorIndex],
      message: 'Curador activado exitosamente'
    })
  } catch (error) {
    console.error('Error al activar curador:', error)
    res.status(500).json({
      success: false,
      error: 'Error al activar curador'
    })
  }
}

/**
 * PUT /api/curadores/:id/desactivar
 * Desactivar un curador (Solo admin)
 */
export const desactivarCurador = async (req, res) => {
  try {
    const { id } = req.params

    if (useDatabase()) {
      const result = await pool.query(
        `UPDATE curadores SET activo = false, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 RETURNING *`,
        [id]
      )

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Curador no encontrado'
        })
      }

      return res.json({
        success: true,
        data: result.rows[0],
        message: 'Curador desactivado exitosamente'
      })
    }

    // Fallback a mockData
    const curadorIndex = curadores.findIndex(c => c.id === parseInt(id))

    if (curadorIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Curador no encontrado'
      })
    }

    curadores[curadorIndex].activo = false
    curadores[curadorIndex].updated_at = now()

    res.json({
      success: true,
      data: curadores[curadorIndex],
      message: 'Curador desactivado exitosamente'
    })
  } catch (error) {
    console.error('Error al desactivar curador:', error)
    res.status(500).json({
      success: false,
      error: 'Error al desactivar curador'
    })
  }
}

/**
 * DELETE /api/curadores/:id
 * Eliminar un curador (Solo admin)
 */
export const deleteCurador = async (req, res) => {
  try {
    const { id } = req.params

    if (useDatabase()) {
      // Verificar que el curador existe
      const checkCurador = await pool.query('SELECT * FROM curadores WHERE id = $1', [id])
      if (checkCurador.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Curador no encontrado'
        })
      }

      const curador = checkCurador.rows[0]

      // Verificar si tiene votaciones
      const votacionesCheck = await pool.query(
        'SELECT COUNT(*) as total FROM votaciones WHERE curador_id = $1',
        [id]
      )
      if (parseInt(votacionesCheck.rows[0].total) > 0) {
        return res.status(400).json({
          success: false,
          error: 'No se puede eliminar un curador con votaciones registradas. Considere desactivarlo en su lugar.'
        })
      }

      // Eliminar curador (CASCADE eliminará el usuario automáticamente si está configurado)
      await pool.query('DELETE FROM curadores WHERE id = $1', [id])

      // También eliminar el usuario asociado
      if (curador.usuario_id) {
        await pool.query('DELETE FROM usuarios WHERE id = $1', [curador.usuario_id])
      }

      return res.json({
        success: true,
        message: 'Curador eliminado exitosamente'
      })
    }

    // Fallback a mockData
    const curadorIndex = curadores.findIndex(c => c.id === parseInt(id))

    if (curadorIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Curador no encontrado'
      })
    }

    // Verificar si tiene votaciones
    const tieneVotaciones = votaciones.some(v => v.curador_id === parseInt(id))
    if (tieneVotaciones) {
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar un curador con votaciones registradas. Considere desactivarlo en su lugar.'
      })
    }

    // Eliminar usuario asociado
    const usuarioId = curadores[curadorIndex].usuario_id
    const usuarioIndex = usuarios.findIndex(u => u.id === usuarioId)
    if (usuarioIndex !== -1) {
      usuarios.splice(usuarioIndex, 1)
    }

    // Eliminar curador
    curadores.splice(curadorIndex, 1)

    res.json({
      success: true,
      message: 'Curador eliminado exitosamente'
    })
  } catch (error) {
    console.error('Error al eliminar curador:', error)
    res.status(500).json({
      success: false,
      error: 'Error al eliminar curador'
    })
  }
}

/**
 * GET /api/curadores/:id/votaciones
 * Obtener votaciones de un curador
 */
export const getVotacionesCurador = async (req, res) => {
  try {
    const { id } = req.params

    if (useDatabase()) {
      // Verificar que el curador existe
      const checkCurador = await pool.query('SELECT id FROM curadores WHERE id = $1', [id])
      if (checkCurador.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Curador no encontrado'
        })
      }

      // Obtener votaciones con información del artista
      const result = await pool.query(`
        SELECT
          v.*,
          a.nombre as artista_nombre,
          a.apellido as artista_apellido,
          a.categoria as artista_categoria
        FROM votaciones v
        LEFT JOIN artistas a ON a.id = v.artista_id
        WHERE v.curador_id = $1
        ORDER BY v.created_at DESC
      `, [id])

      return res.json({
        success: true,
        data: result.rows
      })
    }

    // Fallback a mockData
    const curador = curadores.find(c => c.id === parseInt(id))

    if (!curador) {
      return res.status(404).json({
        success: false,
        error: 'Curador no encontrado'
      })
    }

    const votacionesCurador = votaciones.filter(v => v.curador_id === parseInt(id))

    res.json({
      success: true,
      data: votacionesCurador
    })
  } catch (error) {
    console.error('Error al obtener votaciones del curador:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener votaciones del curador'
    })
  }
}
