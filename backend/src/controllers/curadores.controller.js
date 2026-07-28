/**
 * Controlador de Curadores
 * Maneja la lógica de negocio para los curadores
 */

import {
  usuarios,
  curadores,
  votaciones,
  getNextId,
  now,
  hashPassword
} from '../data/mockData.js'

/**
 * GET /api/curadores
 * Obtener todos los curadores
 */
export const getAllCuradores = async (req, res) => {
  try {
    res.json({
      success: true,
      data: curadores
    })
  } catch (error) {
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
    res.status(500).json({
      success: false,
      error: 'Error al obtener votaciones del curador'
    })
  }
}
