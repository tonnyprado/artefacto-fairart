/**
 * Servicio de Concurso
 *
 * RESPONSABILIDAD ÚNICA: Lógica de negocio de concursos
 *
 * SOLID Principles Applied:
 * - SRP: Solo gestión de concursos
 * - OCP: Extensible sin modificar código existente
 * - DIP: Depende de pool (abstracción) no implementación específica
 *
 * @module ConcursoService
 */

import pool from '../config/database.js'

class ConcursoService {
  /**
   * Obtener artistas elegibles para concurso
   * Solo retorna artistas que aceptaron concurso, están aprobados y tienen registro completo
   *
   * @param {Object} filtros - Filtros opcionales
   * @param {string} filtros.search - Búsqueda por nombre/email
   * @param {number} filtros.limit - Límite de resultados (default: 50)
   * @param {number} filtros.offset - Offset para paginación (default: 0)
   * @returns {Promise<Array>} Array de artistas elegibles
   */
  async getArtistasElegibles(filtros = {}) {
    const { search, limit = 50, offset = 0 } = filtros

    let query = 'SELECT * FROM v_artistas_elegibles_concurso WHERE 1=1'
    const params = []
    let paramCount = 1

    // Filtro de búsqueda por nombre, apellido o email
    if (search) {
      query += ` AND (
        nombre ILIKE $${paramCount}
        OR apellido ILIKE $${paramCount}
        OR email ILIKE $${paramCount}
        OR CONCAT(nombre, ' ', apellido) ILIKE $${paramCount}
      )`
      params.push(`%${search}%`)
      paramCount++
    }

    // Ordenar por fecha de registro más reciente
    query += ' ORDER BY created_at DESC'

    // Paginación
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`
    params.push(parseInt(limit), parseInt(offset))

    const result = await pool.query(query, params)
    return result.rows
  }

  /**
   * Obtener obras de un artista con información de si ya están seleccionadas en algún concurso
   *
   * @param {number} artistaId - ID del artista
   * @returns {Promise<Array>} Array de obras con flag de selección
   */
  async getObrasArtistaParaConcurso(artistaId) {
    const query = `
      SELECT
        o.*,
        CASE
          WHEN osc.id IS NOT NULL THEN true
          ELSE false
        END as ya_seleccionada_en_concurso,
        osc.fase_id as concurso_id,
        f.nombre as concurso_nombre
      FROM obras o
      LEFT JOIN obras_seleccionadas_concurso osc ON osc.obra_id = o.id
      LEFT JOIN fases f ON f.id = osc.fase_id
      WHERE o.artista_id = $1
      ORDER BY o.created_at DESC
    `
    const result = await pool.query(query, [artistaId])
    return result.rows
  }

  /**
   * Seleccionar obra para concurso
   * Valida que sea obra de artista elegible y crea la selección en transacción
   *
   * @param {number} faseId - ID de la fase de concurso
   * @param {number} obraId - ID de la obra a seleccionar
   * @param {number} adminId - ID del admin que selecciona (opcional)
   * @param {string} notas - Notas sobre la selección (opcional)
   * @returns {Promise<Object>} Objeto de selección creado
   */
  async seleccionarObraParaConcurso(faseId, obraId, adminId, notas = null) {
    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      // Validar que sea obra de artista elegible usando función PL/pgSQL
      await client.query(
        'SELECT validar_obra_para_concurso($1, $2)',
        [obraId, faseId]
      )

      // Obtener artista_id de la obra
      const obraResult = await client.query(
        'SELECT artista_id FROM obras WHERE id = $1',
        [obraId]
      )

      if (obraResult.rows.length === 0) {
        throw new Error('Obra no encontrada')
      }

      const artistaId = obraResult.rows[0].artista_id

      // Insertar selección (con UPSERT para idempotencia)
      const insertQuery = `
        INSERT INTO obras_seleccionadas_concurso
        (fase_id, artista_id, obra_id, seleccionada_por, notas)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (fase_id, obra_id) DO UPDATE
        SET notas = EXCLUDED.notas,
            seleccionada_por = EXCLUDED.seleccionada_por,
            fecha_seleccion = CURRENT_TIMESTAMP
        RETURNING *
      `
      const result = await client.query(insertQuery, [
        faseId,
        artistaId,
        obraId,
        adminId,
        notas
      ])

      // Inscribir artista a la fase si no está inscrito
      // Esto permite que el artista aparezca en el sistema de votación
      await client.query(`
        INSERT INTO artistas_fases (artista_id, fase_id, seleccionado)
        VALUES ($1, $2, false)
        ON CONFLICT (artista_id, fase_id) DO NOTHING
      `, [artistaId, faseId])

      await client.query('COMMIT')
      return result.rows[0]
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  /**
   * Deseleccionar obra de concurso
   *
   * @param {number} faseId - ID de la fase de concurso
   * @param {number} obraId - ID de la obra a deseleccionar
   * @returns {Promise<Object|null>} Objeto deseleccionado o null si no existía
   */
  async deseleccionarObraParaConcurso(faseId, obraId) {
    const query = `
      DELETE FROM obras_seleccionadas_concurso
      WHERE fase_id = $1 AND obra_id = $2
      RETURNING *
    `
    const result = await pool.query(query, [faseId, obraId])
    return result.rows[0] || null
  }

  /**
   * Obtener obras seleccionadas de un concurso con información completa
   *
   * @param {number} faseId - ID de la fase de concurso
   * @param {Object} filtros - Filtros opcionales
   * @param {number} filtros.artista_id - Filtrar por artista específico
   * @returns {Promise<Array>} Array de obras seleccionadas con datos completos
   */
  async getObrasSeleccionadasConcurso(faseId, filtros = {}) {
    const { artista_id } = filtros

    let query = `
      SELECT
        osc.*,
        o.titulo,
        o.imagen_url,
        o.alto_cm,
        o.ancho_cm,
        o.profundidad_cm,
        o.precio_mxn,
        o.tecnica,
        o.anio,
        a.nombre,
        a.apellido,
        a.nombre_artistico,
        a.email,
        a.foto,
        a.folio,
        u.nombre as seleccionada_por_nombre,
        u.apellido as seleccionada_por_apellido
      FROM obras_seleccionadas_concurso osc
      JOIN obras o ON o.id = osc.obra_id
      JOIN artistas a ON a.id = osc.artista_id
      LEFT JOIN usuarios u ON u.id = osc.seleccionada_por
      WHERE osc.fase_id = $1
    `
    const params = [faseId]

    // Filtro por artista específico
    if (artista_id) {
      query += ' AND osc.artista_id = $2'
      params.push(artista_id)
    }

    query += ' ORDER BY osc.fecha_seleccion DESC'

    const result = await pool.query(query, params)
    return result.rows
  }

  /**
   * Obtener estadísticas de un concurso
   *
   * @param {number} faseId - ID de la fase de concurso
   * @returns {Promise<Object>} Estadísticas del concurso
   */
  async getEstadisticasConcurso(faseId) {
    const query = `
      SELECT
        COUNT(DISTINCT osc.artista_id) as total_artistas_seleccionados,
        COUNT(osc.id) as total_obras_seleccionadas,
        COUNT(DISTINCT CASE WHEN af.seleccionado = true THEN af.artista_id END) as artistas_ganadores,
        COUNT(CASE WHEN af.seleccionado = true THEN 1 END) as obras_ganadoras
      FROM obras_seleccionadas_concurso osc
      LEFT JOIN artistas_fases af ON af.artista_id = osc.artista_id AND af.fase_id = osc.fase_id
      WHERE osc.fase_id = $1
    `
    const result = await pool.query(query, [faseId])

    // Convertir a números enteros
    const stats = result.rows[0]
    return {
      total_artistas_seleccionados: parseInt(stats.total_artistas_seleccionados) || 0,
      total_obras_seleccionadas: parseInt(stats.total_obras_seleccionadas) || 0,
      artistas_ganadores: parseInt(stats.artistas_ganadores) || 0,
      obras_ganadoras: parseInt(stats.obras_ganadoras) || 0
    }
  }

  /**
   * Obtener conteo de obras seleccionadas por artista en un concurso
   *
   * @param {number} faseId - ID de la fase de concurso
   * @param {number} artistaId - ID del artista
   * @returns {Promise<number>} Número de obras seleccionadas del artista
   */
  async getConteoObrasArtistaEnConcurso(faseId, artistaId) {
    const query = `
      SELECT COUNT(*) as total
      FROM obras_seleccionadas_concurso
      WHERE fase_id = $1 AND artista_id = $2
    `
    const result = await pool.query(query, [faseId, artistaId])
    return parseInt(result.rows[0].total) || 0
  }
}

// Exportar instancia única del servicio (Singleton pattern)
export default new ConcursoService()
