/**
 * Controlador de Favoritos
 * Maneja la logica de negocio para favoritos de curadores
 * Usa PostgreSQL si esta disponible, sino usa mockData
 */

import pool from '../config/database.js'
import {
  favoritos,
  fases,
  artistas,
  artistas_fases,
  curadores,
  getNextId,
  now
} from '../data/mockData.js'

// Helper para determinar si usamos DB o mockData
const useDatabase = () => !!pool

/**
 * POST /api/favoritos
 * Agregar artista a favoritos (Solo curador)
 */
export const createFavorito = async (req, res) => {
  try {
    const { artista_id, fase_id, notas } = req.body
    const curadorId = req.user.curadorId

    // Validaciones
    if (!artista_id || !fase_id) {
      return res.status(400).json({
        success: false,
        error: 'artista_id y fase_id son requeridos'
      })
    }

    if (useDatabase()) {
      // Verificar que el artista existe
      const artistaResult = await pool.query(
        'SELECT id FROM artistas WHERE id = $1',
        [artista_id]
      )
      if (artistaResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Artista no encontrado'
        })
      }

      // Verificar que la fase existe
      const faseResult = await pool.query(
        'SELECT id FROM fases WHERE id = $1',
        [fase_id]
      )
      if (faseResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Fase no encontrada'
        })
      }

      // Verificar que el artista esta inscrito en la fase
      const inscripcionResult = await pool.query(
        'SELECT id FROM artistas_fases WHERE artista_id = $1 AND fase_id = $2',
        [artista_id, fase_id]
      )
      if (inscripcionResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'El artista no esta inscrito en esta fase'
        })
      }

      // Verificar que no existe ya el favorito
      const favoritoExistenteResult = await pool.query(
        'SELECT id FROM favoritos WHERE curador_id = $1 AND artista_id = $2 AND fase_id = $3',
        [curadorId, artista_id, fase_id]
      )
      if (favoritoExistenteResult.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Este artista ya esta en tus favoritos para esta fase'
        })
      }

      // Crear favorito
      const result = await pool.query(
        `INSERT INTO favoritos (curador_id, artista_id, fase_id, notas, created_at, updated_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *`,
        [curadorId, artista_id, fase_id, notas || null]
      )

      return res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Artista agregado a favoritos'
      })
    }

    // Fallback a mockData
    // Verificar que el artista existe
    const artista = artistas.find(a => a.id === parseInt(artista_id))
    if (!artista) {
      return res.status(404).json({
        success: false,
        error: 'Artista no encontrado'
      })
    }

    // Verificar que la fase existe
    const fase = fases.find(f => f.id === parseInt(fase_id))
    if (!fase) {
      return res.status(404).json({
        success: false,
        error: 'Fase no encontrada'
      })
    }

    // Verificar que el artista esta inscrito en la fase
    const inscripcion = artistas_fases.find(
      af => af.artista_id === parseInt(artista_id) && af.fase_id === parseInt(fase_id)
    )
    if (!inscripcion) {
      return res.status(400).json({
        success: false,
        error: 'El artista no esta inscrito en esta fase'
      })
    }

    // Verificar que no existe ya el favorito
    const favoritoExistente = favoritos.find(
      f => f.curador_id === curadorId &&
           f.artista_id === parseInt(artista_id) &&
           f.fase_id === parseInt(fase_id)
    )
    if (favoritoExistente) {
      return res.status(400).json({
        success: false,
        error: 'Este artista ya esta en tus favoritos para esta fase'
      })
    }

    // Crear favorito
    const nuevoFavorito = {
      id: getNextId.favorito(),
      curador_id: curadorId,
      artista_id: parseInt(artista_id),
      fase_id: parseInt(fase_id),
      notas: notas || null,
      created_at: now(),
      updated_at: now()
    }

    favoritos.push(nuevoFavorito)

    res.status(201).json({
      success: true,
      data: nuevoFavorito,
      message: 'Artista agregado a favoritos'
    })
  } catch (error) {
    console.error('Error al crear favorito:', error)
    res.status(500).json({
      success: false,
      error: 'Error al crear favorito'
    })
  }
}

/**
 * DELETE /api/favoritos/:id
 * Quitar artista de favoritos (Solo curador dueno)
 */
export const deleteFavorito = async (req, res) => {
  try {
    const { id } = req.params
    const curadorId = req.user.curadorId

    if (useDatabase()) {
      // Buscar favorito
      const favoritoResult = await pool.query(
        'SELECT * FROM favoritos WHERE id = $1',
        [id]
      )
      if (favoritoResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Favorito no encontrado'
        })
      }

      const favorito = favoritoResult.rows[0]

      // Verificar permisos
      if (favorito.curador_id !== curadorId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'No tienes permiso para eliminar este favorito'
        })
      }

      await pool.query('DELETE FROM favoritos WHERE id = $1', [id])

      return res.json({
        success: true,
        message: 'Artista eliminado de favoritos'
      })
    }

    // Fallback a mockData
    const favoritoIndex = favoritos.findIndex(f => f.id === parseInt(id))
    if (favoritoIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Favorito no encontrado'
      })
    }

    const favorito = favoritos[favoritoIndex]

    // Verificar permisos
    if (favorito.curador_id !== curadorId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para eliminar este favorito'
      })
    }

    favoritos.splice(favoritoIndex, 1)

    res.json({
      success: true,
      message: 'Artista eliminado de favoritos'
    })
  } catch (error) {
    console.error('Error al eliminar favorito:', error)
    res.status(500).json({
      success: false,
      error: 'Error al eliminar favorito'
    })
  }
}

/**
 * POST /api/favoritos/toggle
 * Alternar favorito (agregar si no existe, quitar si existe)
 */
export const toggleFavorito = async (req, res) => {
  try {
    const { artista_id, fase_id, notas } = req.body
    const curadorId = req.user.curadorId

    if (!artista_id || !fase_id) {
      return res.status(400).json({
        success: false,
        error: 'artista_id y fase_id son requeridos'
      })
    }

    if (useDatabase()) {
      // Verificar si ya existe
      const existeResult = await pool.query(
        'SELECT * FROM favoritos WHERE curador_id = $1 AND artista_id = $2 AND fase_id = $3',
        [curadorId, artista_id, fase_id]
      )

      if (existeResult.rows.length > 0) {
        // Existe, eliminarlo
        await pool.query('DELETE FROM favoritos WHERE id = $1', [existeResult.rows[0].id])
        return res.json({
          success: true,
          data: { is_favorito: false },
          message: 'Artista eliminado de favoritos'
        })
      } else {
        // No existe, verificar inscripcion y crearlo
        const inscripcionResult = await pool.query(
          'SELECT id FROM artistas_fases WHERE artista_id = $1 AND fase_id = $2',
          [artista_id, fase_id]
        )
        if (inscripcionResult.rows.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'El artista no esta inscrito en esta fase'
          })
        }

        const result = await pool.query(
          `INSERT INTO favoritos (curador_id, artista_id, fase_id, notas, created_at, updated_at)
           VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           RETURNING *`,
          [curadorId, artista_id, fase_id, notas || null]
        )

        return res.json({
          success: true,
          data: { is_favorito: true, favorito: result.rows[0] },
          message: 'Artista agregado a favoritos'
        })
      }
    }

    // Fallback a mockData
    const favoritoExistente = favoritos.find(
      f => f.curador_id === curadorId &&
           f.artista_id === parseInt(artista_id) &&
           f.fase_id === parseInt(fase_id)
    )

    if (favoritoExistente) {
      // Existe, eliminarlo
      const index = favoritos.indexOf(favoritoExistente)
      favoritos.splice(index, 1)
      return res.json({
        success: true,
        data: { is_favorito: false },
        message: 'Artista eliminado de favoritos'
      })
    } else {
      // No existe, verificar inscripcion y crearlo
      const inscripcion = artistas_fases.find(
        af => af.artista_id === parseInt(artista_id) && af.fase_id === parseInt(fase_id)
      )
      if (!inscripcion) {
        return res.status(400).json({
          success: false,
          error: 'El artista no esta inscrito en esta fase'
        })
      }

      const nuevoFavorito = {
        id: getNextId.favorito(),
        curador_id: curadorId,
        artista_id: parseInt(artista_id),
        fase_id: parseInt(fase_id),
        notas: notas || null,
        created_at: now(),
        updated_at: now()
      }

      favoritos.push(nuevoFavorito)

      return res.json({
        success: true,
        data: { is_favorito: true, favorito: nuevoFavorito },
        message: 'Artista agregado a favoritos'
      })
    }
  } catch (error) {
    console.error('Error al toggle favorito:', error)
    res.status(500).json({
      success: false,
      error: 'Error al toggle favorito'
    })
  }
}

/**
 * GET /api/favoritos/mis-favoritos
 * Obtener favoritos del curador autenticado
 */
export const getMisFavoritos = async (req, res) => {
  try {
    const curadorId = req.user.curadorId
    const { fase_id } = req.query

    if (!curadorId) {
      return res.status(400).json({
        success: false,
        error: 'curadorId no encontrado en el token'
      })
    }

    if (useDatabase()) {
      let query = `
        SELECT f.*,
               a.nombre as artista_nombre,
               a.apellido as artista_apellido,
               a.foto as artista_foto,
               a.categoria as artista_categoria,
               a.ciudad as artista_ciudad,
               a.pais as artista_pais,
               a.bio as artista_bio,
               fa.nombre as fase_nombre
        FROM favoritos f
        LEFT JOIN artistas a ON a.id = f.artista_id
        LEFT JOIN fases fa ON fa.id = f.fase_id
        WHERE f.curador_id = $1
      `
      const values = [curadorId]

      if (fase_id) {
        query += ' AND f.fase_id = $2'
        values.push(fase_id)
      }

      query += ' ORDER BY f.created_at DESC'

      const result = await pool.query(query, values)

      return res.json({
        success: true,
        data: result.rows
      })
    }

    // Fallback a mockData
    let favoritosCurador = favoritos.filter(f => f.curador_id === curadorId)

    if (fase_id) {
      favoritosCurador = favoritosCurador.filter(f => f.fase_id === parseInt(fase_id))
    }

    // Enriquecer con datos del artista
    const favoritosEnriquecidos = favoritosCurador.map(f => {
      const artista = artistas.find(a => a.id === f.artista_id)
      const fase = fases.find(fa => fa.id === f.fase_id)
      return {
        ...f,
        artista_nombre: artista?.nombre,
        artista_apellido: artista?.apellido,
        artista_foto: artista?.foto,
        artista_categoria: artista?.categoria,
        artista_ciudad: artista?.ciudad,
        artista_pais: artista?.pais,
        artista_bio: artista?.bio,
        fase_nombre: fase?.nombre
      }
    })

    res.json({
      success: true,
      data: favoritosEnriquecidos
    })
  } catch (error) {
    console.error('Error al obtener favoritos:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener favoritos'
    })
  }
}

/**
 * GET /api/favoritos/fase/:fase_id
 * Obtener favoritos del curador para una fase especifica
 */
export const getFavoritosByFase = async (req, res) => {
  try {
    const { fase_id } = req.params
    const curadorId = req.user.curadorId

    if (useDatabase()) {
      const result = await pool.query(`
        SELECT f.*,
               a.nombre as artista_nombre,
               a.apellido as artista_apellido,
               a.foto as artista_foto,
               a.categoria as artista_categoria
        FROM favoritos f
        LEFT JOIN artistas a ON a.id = f.artista_id
        WHERE f.curador_id = $1 AND f.fase_id = $2
        ORDER BY f.created_at DESC
      `, [curadorId, fase_id])

      return res.json({
        success: true,
        data: result.rows
      })
    }

    // Fallback a mockData
    const favoritosFase = favoritos.filter(
      f => f.curador_id === curadorId && f.fase_id === parseInt(fase_id)
    ).map(f => {
      const artista = artistas.find(a => a.id === f.artista_id)
      return {
        ...f,
        artista_nombre: artista?.nombre,
        artista_apellido: artista?.apellido,
        artista_foto: artista?.foto,
        artista_categoria: artista?.categoria
      }
    })

    res.json({
      success: true,
      data: favoritosFase
    })
  } catch (error) {
    console.error('Error al obtener favoritos por fase:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener favoritos'
    })
  }
}

/**
 * GET /api/favoritos/check/:artista_id/:fase_id
 * Verificar si un artista es favorito del curador en una fase
 */
export const checkFavorito = async (req, res) => {
  try {
    const { artista_id, fase_id } = req.params
    const curadorId = req.user.curadorId

    if (useDatabase()) {
      const result = await pool.query(
        'SELECT * FROM favoritos WHERE curador_id = $1 AND artista_id = $2 AND fase_id = $3',
        [curadorId, artista_id, fase_id]
      )

      const favorito = result.rows.length > 0 ? result.rows[0] : null

      return res.json({
        success: true,
        data: {
          is_favorito: !!favorito,
          favorito: favorito
        }
      })
    }

    // Fallback a mockData
    const favorito = favoritos.find(
      f => f.curador_id === curadorId &&
           f.artista_id === parseInt(artista_id) &&
           f.fase_id === parseInt(fase_id)
    )

    res.json({
      success: true,
      data: {
        is_favorito: !!favorito,
        favorito: favorito || null
      }
    })
  } catch (error) {
    console.error('Error al verificar favorito:', error)
    res.status(500).json({
      success: false,
      error: 'Error al verificar favorito'
    })
  }
}

/**
 * PUT /api/favoritos/:id
 * Actualizar notas de un favorito
 */
export const updateFavorito = async (req, res) => {
  try {
    const { id } = req.params
    const { notas } = req.body
    const curadorId = req.user.curadorId

    if (useDatabase()) {
      // Buscar favorito
      const favoritoResult = await pool.query(
        'SELECT * FROM favoritos WHERE id = $1',
        [id]
      )
      if (favoritoResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Favorito no encontrado'
        })
      }

      const favorito = favoritoResult.rows[0]

      // Verificar permisos
      if (favorito.curador_id !== curadorId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'No tienes permiso para editar este favorito'
        })
      }

      const result = await pool.query(
        'UPDATE favoritos SET notas = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [notas, id]
      )

      return res.json({
        success: true,
        data: result.rows[0],
        message: 'Favorito actualizado'
      })
    }

    // Fallback a mockData
    const favoritoIndex = favoritos.findIndex(f => f.id === parseInt(id))
    if (favoritoIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Favorito no encontrado'
      })
    }

    const favorito = favoritos[favoritoIndex]

    if (favorito.curador_id !== curadorId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para editar este favorito'
      })
    }

    favoritos[favoritoIndex].notas = notas
    favoritos[favoritoIndex].updated_at = now()

    res.json({
      success: true,
      data: favoritos[favoritoIndex],
      message: 'Favorito actualizado'
    })
  } catch (error) {
    console.error('Error al actualizar favorito:', error)
    res.status(500).json({
      success: false,
      error: 'Error al actualizar favorito'
    })
  }
}

// =====================================================
// ENDPOINTS PARA ADMIN
// =====================================================

/**
 * GET /api/favoritos/admin/estadisticas
 * Obtener estadisticas de favoritos (Solo admin)
 */
export const getEstadisticasFavoritosAdmin = async (req, res) => {
  try {
    if (useDatabase()) {
      // Stats por curador
      const porCuradorResult = await pool.query(`
        SELECT
          c.id as curador_id,
          c.nombre,
          c.apellido,
          c.foto,
          COUNT(f.id)::int as total_favoritos,
          COUNT(DISTINCT f.fase_id)::int as fases_con_favoritos
        FROM curadores c
        LEFT JOIN favoritos f ON f.curador_id = c.id
        WHERE c.activo = true
        GROUP BY c.id, c.nombre, c.apellido, c.foto
        ORDER BY total_favoritos DESC
      `)

      // Stats por fase
      const porFaseResult = await pool.query(`
        SELECT
          fa.id as fase_id,
          fa.nombre as fase_nombre,
          COUNT(f.id)::int as total_favoritos,
          COUNT(DISTINCT f.curador_id)::int as curadores_con_favoritos
        FROM fases fa
        LEFT JOIN favoritos f ON f.fase_id = fa.id
        GROUP BY fa.id, fa.nombre
        ORDER BY fa.id
      `)

      return res.json({
        success: true,
        data: {
          por_curador: porCuradorResult.rows,
          por_fase: porFaseResult.rows
        }
      })
    }

    // Fallback a mockData
    const curadorStats = curadores.filter(c => c.activo).map(c => {
      const favsCurador = favoritos.filter(f => f.curador_id === c.id)
      const fasesUnicas = [...new Set(favsCurador.map(f => f.fase_id))]
      return {
        curador_id: c.id,
        nombre: c.nombre,
        apellido: c.apellido,
        foto: c.foto,
        total_favoritos: favsCurador.length,
        fases_con_favoritos: fasesUnicas.length
      }
    }).sort((a, b) => b.total_favoritos - a.total_favoritos)

    const faseStats = fases.map(f => {
      const favsFase = favoritos.filter(fav => fav.fase_id === f.id)
      const curadoresUnicos = [...new Set(favsFase.map(fav => fav.curador_id))]
      return {
        fase_id: f.id,
        fase_nombre: f.nombre,
        total_favoritos: favsFase.length,
        curadores_con_favoritos: curadoresUnicos.length
      }
    })

    res.json({
      success: true,
      data: {
        por_curador: curadorStats,
        por_fase: faseStats
      }
    })
  } catch (error) {
    console.error('Error al obtener estadisticas de favoritos:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadisticas'
    })
  }
}

/**
 * GET /api/favoritos/admin/curador/:curador_id
 * Obtener favoritos de un curador especifico (Solo admin)
 */
export const getFavoritosByCuradorAdmin = async (req, res) => {
  try {
    const { curador_id } = req.params
    const { fase_id } = req.query

    if (useDatabase()) {
      let query = `
        SELECT f.*,
               a.nombre as artista_nombre,
               a.apellido as artista_apellido,
               a.foto as artista_foto,
               a.categoria as artista_categoria,
               a.ciudad as artista_ciudad,
               a.pais as artista_pais,
               fa.nombre as fase_nombre
        FROM favoritos f
        LEFT JOIN artistas a ON a.id = f.artista_id
        LEFT JOIN fases fa ON fa.id = f.fase_id
        WHERE f.curador_id = $1
      `
      const values = [curador_id]

      if (fase_id) {
        query += ' AND f.fase_id = $2'
        values.push(fase_id)
      }

      query += ' ORDER BY fa.id, f.created_at DESC'

      const result = await pool.query(query, values)

      return res.json({
        success: true,
        data: result.rows
      })
    }

    // Fallback a mockData
    let favsCurador = favoritos.filter(f => f.curador_id === parseInt(curador_id))

    if (fase_id) {
      favsCurador = favsCurador.filter(f => f.fase_id === parseInt(fase_id))
    }

    const favsEnriquecidos = favsCurador.map(f => {
      const artista = artistas.find(a => a.id === f.artista_id)
      const fase = fases.find(fa => fa.id === f.fase_id)
      return {
        ...f,
        artista_nombre: artista?.nombre,
        artista_apellido: artista?.apellido,
        artista_foto: artista?.foto,
        artista_categoria: artista?.categoria,
        artista_ciudad: artista?.ciudad,
        artista_pais: artista?.pais,
        fase_nombre: fase?.nombre
      }
    })

    res.json({
      success: true,
      data: favsEnriquecidos
    })
  } catch (error) {
    console.error('Error al obtener favoritos del curador:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener favoritos'
    })
  }
}
