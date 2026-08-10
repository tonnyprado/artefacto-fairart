/**
 * Controlador de Obras
 * Maneja el portfolio de imágenes de los artistas
 * Usa PostgreSQL si está disponible, sino usa mockData
 */
import pool from '../config/database.js'
import { obras, getNextId, now } from '../data/mockData.js'

// Helper para determinar si usamos DB o mockData
const useDatabase = () => !!pool

export const getObras = async (req, res) => {
  try {
    if (useDatabase()) {
      const result = await pool.query(
        'SELECT * FROM obras ORDER BY created_at DESC'
      )
      return res.json({
        success: true,
        obras: result.rows
      })
    }

    // Fallback a mockData
    const sortedObras = [...obras].sort((a, b) =>
      new Date(b.created_at) - new Date(a.created_at)
    )
    res.json({ success: true, obras: sortedObras })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener obras'
    })
  }
}

export const getObraById = async (req, res) => {
  try {
    const { id } = req.params

    if (useDatabase()) {
      const result = await pool.query('SELECT * FROM obras WHERE id = $1', [id])

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Obra no encontrada'
        })
      }

      return res.json({
        success: true,
        obra: result.rows[0]
      })
    }

    // Fallback a mockData
    const obra = obras.find(o => o.id === parseInt(id))
    if (!obra) {
      return res.status(404).json({
        success: false,
        error: 'Obra no encontrada'
      })
    }
    res.json({ success: true, obra })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener obra'
    })
  }
}

export const getObrasByArtista = async (req, res) => {
  try {
    const { artistaId } = req.params

    if (useDatabase()) {
      const result = await pool.query(
        'SELECT * FROM obras WHERE artista_id = $1 ORDER BY created_at DESC',
        [artistaId]
      )

      return res.json({
        success: true,
        obras: result.rows
      })
    }

    // Fallback a mockData
    const obrasArtista = obras.filter(o => o.artista_id === parseInt(artistaId))
    res.json({ success: true, obras: obrasArtista })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener obras'
    })
  }
}

export const createObra = async (req, res) => {
  try {
    const { titulo, artista_id, imagen_url, alto_cm, ancho_cm, precio_mxn, en_lienzo, orden_lienzo } = req.body

    if (!artista_id || !imagen_url) {
      return res.status(400).json({
        success: false,
        error: 'artista_id e imagen_url son requeridos'
      })
    }

    if (useDatabase()) {
      const result = await pool.query(
        `INSERT INTO obras (artista_id, titulo, imagen_url, alto_cm, ancho_cm, precio_mxn, en_lienzo, orden_lienzo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          artista_id,
          titulo || null,
          imagen_url,
          alto_cm || null,
          ancho_cm || null,
          precio_mxn || null,
          en_lienzo || false,
          orden_lienzo || null
        ]
      )

      return res.status(201).json({
        success: true,
        message: 'Obra creada',
        obra: result.rows[0]
      })
    }

    // Fallback a mockData
    const nuevaObra = {
      id: getNextId.obra(),
      artista_id,
      titulo: titulo || null,
      imagen_url,
      alto_cm: alto_cm || null,
      ancho_cm: ancho_cm || null,
      precio_mxn: precio_mxn || null,
      en_lienzo: en_lienzo || false,
      orden_lienzo: orden_lienzo || null,
      created_at: now()
    }
    obras.push(nuevaObra)
    res.status(201).json({
      success: true,
      message: 'Obra creada',
      obra: nuevaObra
    })
  } catch (error) {
    console.error('Error al crear obra:', error)
    res.status(500).json({
      success: false,
      error: 'Error al crear obra'
    })
  }
}

export const updateObra = async (req, res) => {
  try {
    const { id } = req.params
    const { titulo, imagen_url, alto_cm, ancho_cm, precio_mxn, en_lienzo, orden_lienzo } = req.body

    if (useDatabase()) {
      const updates = []
      const values = []
      let paramCount = 1

      if (titulo !== undefined) {
        updates.push(`titulo = $${paramCount}`)
        values.push(titulo)
        paramCount++
      }
      if (imagen_url !== undefined) {
        updates.push(`imagen_url = $${paramCount}`)
        values.push(imagen_url)
        paramCount++
      }
      if (alto_cm !== undefined) {
        updates.push(`alto_cm = $${paramCount}`)
        values.push(alto_cm)
        paramCount++
      }
      if (ancho_cm !== undefined) {
        updates.push(`ancho_cm = $${paramCount}`)
        values.push(ancho_cm)
        paramCount++
      }
      if (precio_mxn !== undefined) {
        updates.push(`precio_mxn = $${paramCount}`)
        values.push(precio_mxn)
        paramCount++
      }
      if (en_lienzo !== undefined) {
        updates.push(`en_lienzo = $${paramCount}`)
        values.push(en_lienzo)
        paramCount++
      }
      if (orden_lienzo !== undefined) {
        updates.push(`orden_lienzo = $${paramCount}`)
        values.push(orden_lienzo)
        paramCount++
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No hay campos para actualizar'
        })
      }

      values.push(id)
      const query = `UPDATE obras SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`

      const result = await pool.query(query, values)

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Obra no encontrada'
        })
      }

      return res.json({
        success: true,
        message: 'Obra actualizada',
        obra: result.rows[0]
      })
    }

    // Fallback a mockData
    const index = obras.findIndex(o => o.id === parseInt(id))
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Obra no encontrada'
      })
    }

    obras[index] = {
      ...obras[index],
      ...(titulo !== undefined && { titulo }),
      ...(imagen_url !== undefined && { imagen_url }),
      ...(alto_cm !== undefined && { alto_cm }),
      ...(ancho_cm !== undefined && { ancho_cm }),
      ...(precio_mxn !== undefined && { precio_mxn }),
      ...(en_lienzo !== undefined && { en_lienzo }),
      ...(orden_lienzo !== undefined && { orden_lienzo })
    }

    res.json({
      success: true,
      message: 'Obra actualizada',
      obra: obras[index]
    })
  } catch (error) {
    console.error('Error al actualizar obra:', error)
    res.status(500).json({
      success: false,
      error: 'Error al actualizar obra'
    })
  }
}

export const deleteObra = async (req, res) => {
  try {
    const { id } = req.params

    if (useDatabase()) {
      const result = await pool.query('DELETE FROM obras WHERE id = $1 RETURNING *', [id])

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Obra no encontrada'
        })
      }

      return res.json({
        success: true,
        message: 'Obra eliminada'
      })
    }

    // Fallback a mockData
    const index = obras.findIndex(o => o.id === parseInt(id))
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Obra no encontrada'
      })
    }

    obras.splice(index, 1)
    res.json({
      success: true,
      message: 'Obra eliminada'
    })
  } catch (error) {
    console.error('Error al eliminar obra:', error)
    res.status(500).json({
      success: false,
      error: 'Error al eliminar obra'
    })
  }
}
