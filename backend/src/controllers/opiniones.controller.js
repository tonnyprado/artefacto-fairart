import pool from '../config/database.js';
import { validateContent, validateName } from '../utils/badWordsFilter.js';

/**
 * Crear nueva opinión (público)
 * POST /api/opiniones
 */
export const createOpinion = async (req, res) => {
  try {
    const { opinion, nombre } = req.body;

    // Validar opinión
    const opinionValidation = validateContent(opinion);
    if (!opinionValidation.valid) {
      return res.status(400).json({
        success: false,
        error: opinionValidation.error
      });
    }

    // Validar nombre
    const nameValidation = validateName(nombre);
    if (!nameValidation.valid) {
      return res.status(400).json({
        success: false,
        error: nameValidation.error
      });
    }

    // Guardar en base de datos
    const result = await pool.query(
      `INSERT INTO opiniones_arte (opinion, nombre, aprobada)
       VALUES ($1, $2, true)
       RETURNING id, opinion, nombre, created_at`,
      [opinion.trim(), nombre.trim()]
    );

    const nuevaOpinion = result.rows[0];

    res.status(201).json({
      success: true,
      data: nuevaOpinion,
      message: 'Opinión guardada exitosamente'
    });
  } catch (error) {
    console.error('Error al crear opinión:', error);
    res.status(500).json({
      success: false,
      error: 'Error al guardar la opinión'
    });
  }
};

/**
 * Obtener una opinión aleatoria (público)
 * GET /api/opiniones/random
 */
export const getRandomOpinion = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, opinion, nombre, created_at
       FROM opiniones_arte
       WHERE aprobada = true
       ORDER BY RANDOM()
       LIMIT 1`
    );

    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No hay opiniones disponibles'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al obtener opinión aleatoria:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener opinión'
    });
  }
};

/**
 * Obtener todas las opiniones (admin)
 * GET /api/opiniones
 */
export const getAllOpinions = async (req, res) => {
  try {
    const { aprobada, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM opiniones_arte';
    const params = [];
    let paramCount = 1;

    if (aprobada !== undefined) {
      query += ` WHERE aprobada = $${paramCount}`;
      params.push(aprobada === 'true');
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // Obtener total
    let countQuery = 'SELECT COUNT(*) FROM opiniones_arte';
    if (aprobada !== undefined) {
      countQuery += ' WHERE aprobada = $1';
    }
    const countResult = await pool.query(
      countQuery,
      aprobada !== undefined ? [aprobada === 'true'] : []
    );

    res.status(200).json({
      success: true,
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error al obtener opiniones:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener opiniones'
    });
  }
};

/**
 * Eliminar opinión (admin)
 * DELETE /api/opiniones/:id
 */
export const deleteOpinion = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM opiniones_arte WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Opinión no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Opinión eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar opinión:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar opinión'
    });
  }
};

/**
 * Cambiar estado de aprobación (admin)
 * PUT /api/opiniones/:id/toggle
 */
export const toggleApproval = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE opiniones_arte
       SET aprobada = NOT aprobada
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Opinión no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: `Opinión ${result.rows[0].aprobada ? 'aprobada' : 'desaprobada'}`
    });
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({
      success: false,
      error: 'Error al cambiar estado de la opinión'
    });
  }
};

export default {
  createOpinion,
  getRandomOpinion,
  getAllOpinions,
  deleteOpinion,
  toggleApproval
};
