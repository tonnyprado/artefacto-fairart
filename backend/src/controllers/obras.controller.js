/**
 * Controlador de Obras
 * Maneja el portfolio de imágenes de los artistas
 * Usa PostgreSQL si está disponible, sino usa mockData
 */
import pool from '../config/database.js'
import { obras, getNextId, now } from '../data/mockData.js'
import { uploadToS3 } from '../services/upload.service.js'

// Helper para determinar si usamos DB o mockData
const useDatabase = () => !!pool

// Helper para parsear fotos_detalle_urls de JSONB a array
const parseFotosDetalle = (obra) => {
  let fotosDetalleUrls = obra.fotos_detalle_urls

  // Si es un string JSON, parsearlo
  if (typeof fotosDetalleUrls === 'string') {
    try {
      fotosDetalleUrls = JSON.parse(fotosDetalleUrls)
    } catch (e) {
      console.warn(`⚠️ Error parseando fotos_detalle_urls para obra ${obra.id}:`, e)
      fotosDetalleUrls = []
    }
  }

  // Asegurar que sea un array
  if (!Array.isArray(fotosDetalleUrls)) {
    fotosDetalleUrls = []
  }

  return {
    ...obra,
    fotos_detalle_urls: fotosDetalleUrls
  }
}

export const getObras = async (req, res) => {
  try {
    if (useDatabase()) {
      const result = await pool.query(
        'SELECT * FROM obras ORDER BY created_at DESC'
      )
      return res.json({
        success: true,
        obras: result.rows.map(parseFotosDetalle)
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
        obra: parseFotosDetalle(result.rows[0])
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
        obras: result.rows.map(parseFotosDetalle)
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
    const { titulo, artista_id, imagen_url, alto_cm, ancho_cm, largo_cm, precio_mxn, tecnica, en_lienzo, orden_lienzo } = req.body

    if (!artista_id || !imagen_url) {
      return res.status(400).json({
        success: false,
        error: 'artista_id e imagen_url son requeridos'
      })
    }

    if (useDatabase()) {
      const result = await pool.query(
        `INSERT INTO obras (artista_id, titulo, imagen_url, alto_cm, ancho_cm, largo_cm, precio_mxn, tecnica, en_lienzo, orden_lienzo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          artista_id,
          titulo || null,
          imagen_url,
          alto_cm || null,
          ancho_cm || null,
          largo_cm || null,
          precio_mxn || null,
          tecnica || null,
          en_lienzo || false,
          orden_lienzo || null
        ]
      )

      return res.status(201).json({
        success: true,
        message: 'Obra creada',
        obra: parseFotosDetalle(result.rows[0])
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
      largo_cm: largo_cm || null,
      precio_mxn: precio_mxn || null,
      tecnica: tecnica || null,
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
    const { titulo, imagen_url, alto_cm, ancho_cm, largo_cm, precio_mxn, tecnica, en_lienzo, orden_lienzo } = req.body

    console.log('📝 Actualizando obra ID:', id, 'con datos:', req.body)

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
      if (largo_cm !== undefined) {
        updates.push(`largo_cm = $${paramCount}`)
        values.push(largo_cm)
        paramCount++
      }
      if (precio_mxn !== undefined) {
        updates.push(`precio_mxn = $${paramCount}`)
        values.push(precio_mxn)
        paramCount++
      }
      if (tecnica !== undefined) {
        updates.push(`tecnica = $${paramCount}`)
        values.push(tecnica)
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
        obra: parseFotosDetalle(result.rows[0])
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
      ...(largo_cm !== undefined && { largo_cm }),
      ...(precio_mxn !== undefined && { precio_mxn }),
      ...(tecnica !== undefined && { tecnica }),
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

/**
 * Actualizar foto de obra (solo admin)
 * Sube la nueva imagen a S3 y actualiza imagen_url
 */
export const updateObraFoto = async (req, res) => {
  try {
    const { id } = req.params

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionó ninguna imagen'
      })
    }

    console.log(`📸 Actualizando foto de obra ${id}...`)

    // Subir nueva imagen a S3
    const imageUrl = await uploadToS3(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      'artistas/obras'
    )

    console.log(`✅ Imagen subida a S3: ${imageUrl}`)

    // Actualizar imagen_url en base de datos
    if (useDatabase()) {
      const result = await pool.query(
        'UPDATE obras SET imagen_url = $1 WHERE id = $2 RETURNING *',
        [imageUrl, id]
      )

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Obra no encontrada'
        })
      }

      return res.json({
        success: true,
        message: 'Foto de obra actualizada exitosamente',
        obra: parseFotosDetalle(result.rows[0])
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

    obras[index].imagen_url = imageUrl
    res.json({
      success: true,
      message: 'Foto de obra actualizada exitosamente',
      obra: obras[index]
    })
  } catch (error) {
    console.error('Error al actualizar foto de obra:', error)
    res.status(500).json({
      success: false,
      error: 'Error al actualizar foto de obra: ' + error.message
    })
  }
}

/**
 * GET /api/obras/postulacion/:postulacion_id
 * Obtener obras de una postulación específica
 */
export const getObrasByPostulacion = async (req, res) => {
  try {
    const { postulacion_id } = req.params

    if (useDatabase()) {
      const result = await pool.query(
        'SELECT * FROM obras WHERE postulacion_id = $1 ORDER BY orden ASC, created_at ASC',
        [postulacion_id]
      )

      return res.json({
        success: true,
        obras: result.rows.map(parseFotosDetalle)
      })
    }

    // Fallback a mockData
    const obrasFiltradas = obras.filter(o => o.postulacion_id === parseInt(postulacion_id))
    res.json({
      success: true,
      obras: obrasFiltradas
    })
  } catch (error) {
    console.error('Error al obtener obras por postulación:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener obras'
    })
  }
}

/**
 * POST /api/obras/copiar-de-fase-anterior
 * Copiar obras de una postulación anterior a una nueva
 * Útil para cuando un artista se inscribe a una nueva fase
 */
export const copiarObrasDePostulacionAnterior = async (req, res) => {
  try {
    const { artista_id, postulacion_destino_id } = req.body

    if (!artista_id || !postulacion_destino_id) {
      return res.status(400).json({
        success: false,
        error: 'artista_id y postulacion_destino_id son requeridos'
      })
    }

    if (useDatabase()) {
      // Buscar la postulación más reciente del artista que tenga obras (excluyendo la destino)
      const postulacionOrigenResult = await pool.query(`
        SELECT DISTINCT p.id, f.numero_fase, f.nombre as fase_nombre, COUNT(o.id) as total_obras
        FROM postulaciones p
        JOIN fases f ON f.id = p.fase_actual_id
        JOIN obras o ON o.postulacion_id = p.id
        WHERE p.artista_id = $1 AND p.id != $2
        GROUP BY p.id, f.numero_fase, f.nombre
        ORDER BY f.numero_fase DESC
        LIMIT 1
      `, [artista_id, postulacion_destino_id])

      if (postulacionOrigenResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No se encontraron obras en postulaciones anteriores de este artista'
        })
      }

      const postulacionOrigen = postulacionOrigenResult.rows[0]

      // Verificar que la postulación destino no tenga obras ya
      const obrasDestinoResult = await pool.query(
        'SELECT COUNT(*) as total FROM obras WHERE postulacion_id = $1',
        [postulacion_destino_id]
      )

      if (parseInt(obrasDestinoResult.rows[0].total) > 0) {
        return res.status(400).json({
          success: false,
          error: 'La postulación destino ya tiene obras. Elimínalas primero si deseas copiar obras nuevas.'
        })
      }

      // Copiar obras (compartiendo las mismas imágenes en S3, no duplicándolas)
      const result = await pool.query(`
        INSERT INTO obras (
          postulacion_id, titulo, imagen, imagen_url, tecnica, dimensiones, ano, descripcion, orden,
          precio, fotos_detalle_urls
        )
        SELECT
          $1, titulo, imagen, imagen_url, tecnica, dimensiones, ano, descripcion, orden,
          precio, fotos_detalle_urls
        FROM obras
        WHERE postulacion_id = $2
        ORDER BY orden ASC, created_at ASC
        RETURNING *
      `, [postulacion_destino_id, postulacionOrigen.id])

      console.log(`✅ ${result.rows.length} obras copiadas de "${postulacionOrigen.fase_nombre}" (postulacion ${postulacionOrigen.id}) a postulacion ${postulacion_destino_id}`)

      return res.json({
        success: true,
        data: result.rows.map(parseFotosDetalle),
        message: `${result.rows.length} obras copiadas desde ${postulacionOrigen.fase_nombre}`,
        origen: {
          fase: postulacionOrigen.fase_nombre,
          postulacion_id: postulacionOrigen.id
        }
      })
    }

    // Fallback a mockData
    res.status(501).json({
      success: false,
      error: 'Función no disponible en modo mockData'
    })
  } catch (error) {
    console.error('Error al copiar obras:', error)
    res.status(500).json({
      success: false,
      error: 'Error al copiar obras: ' + error.message
    })
  }
}
