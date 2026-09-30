import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware.js';
import { obtenerContenedor } from '../consigna/contenedor.js';
import pool from '../config/database.js';

const router = Router();

// Middleware: solo admins autenticados
router.use(authenticateToken);
router.use(authorizeRole(['admin']));

/**
 * GET /api/admin/consigna/invitaciones
 * Lista todas las invitaciones de una edición
 */
router.get('/invitaciones', async (req, res) => {
  try {
    const { edicion = 'AF2' } = req.query;

    const result = await pool.query(
      `SELECT
        i.id,
        i.artista_id,
        i.edicion,
        i.creada_en,
        i.expira_en,
        i.abierta_en,
        i.revocada,
        a.nombre,
        a.correo,
        a.folio,
        CASE
          WHEN ac.id IS NOT NULL THEN 'completada'
          WHEN i.abierta_en IS NOT NULL THEN 'abierta'
          ELSE 'pendiente'
        END as estado,
        ac.id as acuerdo_id,
        ac.firmado_en,
        ac.datos->>'estadoFiscal' as estado_fiscal
      FROM consigna.invitaciones i
      JOIN consigna.v_artistas_seleccionados a
        ON a.artista_id = i.artista_id
      LEFT JOIN consigna.acuerdos ac
        ON ac.invitacion_id = i.id
      WHERE i.edicion = $1
      ORDER BY i.creada_en DESC`,
      [edicion]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error obteniendo invitaciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener invitaciones',
    });
  }
});

/**
 * POST /api/admin/consigna/generar-invitaciones
 * Genera invitaciones para todos los artistas aprobados sin invitación
 */
router.post('/generar-invitaciones', async (req, res) => {
  try {
    const { edicion = 'AF2' } = req.body;
    const { invitaciones } = obtenerContenedor();

    const ligas = await invitaciones.crearPendientes(edicion);

    res.json({
      success: true,
      data: {
        generadas: ligas.length,
        invitaciones: ligas,
      },
      message: `${ligas.length} invitaciones generadas para ${edicion}`,
    });
  } catch (error) {
    console.error('Error generando invitaciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error al generar invitaciones',
    });
  }
});

/**
 * POST /api/admin/consigna/reenviar/:invitacionId
 * Reenvía el email de invitación a un artista
 */
router.post('/reenviar/:invitacionId', async (req, res) => {
  try {
    const { invitacionId } = req.params;

    // Obtener datos de la invitación
    const invResult = await pool.query(
      `SELECT i.*, a.nombre, a.correo, a.folio, a.nombre_pila
       FROM consigna.invitaciones i
       JOIN consigna.v_artistas_seleccionados a
         ON a.artista_id = i.artista_id
       WHERE i.id = $1`,
      [invitacionId]
    );

    if (invResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Invitación no encontrada',
      });
    }

    const inv = invResult.rows[0];

    // Verificar que no esté revocada
    if (inv.revocada) {
      return res.status(400).json({
        success: false,
        error: 'Esta invitación fue revocada',
      });
    }

    // Verificar que no haya expirado
    if (new Date(inv.expira_en) < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Esta invitación expiró',
      });
    }

    // Generar nuevo token (el hash ya está en BD, necesitamos regenerar el token)
    // Por seguridad, NO podemos recuperar el token original (solo está hasheado)
    // Por lo tanto, esta funcionalidad requiere crear una nueva invitación o
    // almacenar el token original encriptado

    return res.status(501).json({
      success: false,
      error: 'Funcionalidad de reenvío en desarrollo. Por ahora, generar nueva invitación.',
      message: 'El token original no se puede recuperar por seguridad (solo hash SHA-256 en BD)',
    });
  } catch (error) {
    console.error('Error reenviando invitación:', error);
    res.status(500).json({
      success: false,
      error: 'Error al reenviar invitación',
    });
  }
});

/**
 * GET /api/admin/consigna/acuerdos
 * Lista todos los acuerdos firmados de una edición
 */
router.get('/acuerdos', async (req, res) => {
  try {
    const { edicion = 'AF2' } = req.query;

    const result = await pool.query(
      `SELECT
        ac.id,
        ac.invitacion_id,
        ac.artista_id,
        ac.firmado_en,
        ac.datos,
        ac.pdf_key,
        a.nombre,
        a.correo,
        a.folio,
        i.edicion,
        (
          SELECT COUNT(*)
          FROM consigna.acuerdo_obras ao
          WHERE ao.acuerdo_id = ac.id
        ) as num_obras,
        (
          SELECT SUM(ao.ganancia)
          FROM consigna.acuerdo_obras ao
          WHERE ao.acuerdo_id = ac.id
        ) as total_ganancia
      FROM consigna.acuerdos ac
      JOIN consigna.invitaciones i
        ON i.id = ac.invitacion_id
      JOIN consigna.v_artistas_seleccionados a
        ON a.artista_id = ac.artista_id
      WHERE i.edicion = $1
      ORDER BY ac.firmado_en DESC`,
      [edicion]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error obteniendo acuerdos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener acuerdos',
    });
  }
});

/**
 * GET /api/admin/consigna/acuerdos/:acuerdoId/pdf
 * Obtiene URL prefirmada para descargar el PDF de un acuerdo
 */
router.get('/acuerdos/:acuerdoId/pdf', async (req, res) => {
  try {
    const { acuerdoId } = req.params;

    const result = await pool.query(
      `SELECT ac.pdf_key, a.folio
       FROM consigna.acuerdos ac
       JOIN consigna.v_artistas_seleccionados a
         ON a.artista_id = ac.artista_id
       WHERE ac.id = $1`,
      [acuerdoId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Acuerdo no encontrado',
      });
    }

    const { pdf_key, folio } = result.rows[0];
    const { archivos } = obtenerContenedor();

    const url = await archivos.urlDescarga(
      pdf_key,
      900, // 15 minutos
      `Acuerdo-Consignacion-${folio}.pdf`
    );

    res.json({
      success: true,
      data: { url },
    });
  } catch (error) {
    console.error('Error obteniendo PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener PDF',
    });
  }
});

/**
 * GET /api/admin/consigna/acuerdos/:acuerdoId/obras
 * Lista las obras de un acuerdo específico
 */
router.get('/acuerdos/:acuerdoId/obras', async (req, res) => {
  try {
    const { acuerdoId } = req.params;

    const result = await pool.query(
      `SELECT
        ao.*
      FROM consigna.acuerdo_obras ao
      WHERE ao.acuerdo_id = $1
      ORDER BY ao.titulo`,
      [acuerdoId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error obteniendo obras del acuerdo:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener obras',
    });
  }
});

/**
 * GET /api/admin/consigna/estadisticas
 * Obtiene estadísticas generales de una edición
 */
router.get('/estadisticas', async (req, res) => {
  try {
    const { edicion = 'AF2' } = req.query;

    const result = await pool.query(
      `SELECT
        COUNT(DISTINCT i.id) as total_invitaciones,
        COUNT(DISTINCT CASE WHEN i.abierta_en IS NOT NULL THEN i.id END) as abiertas,
        COUNT(DISTINCT ac.id) as completadas,
        COUNT(DISTINCT CASE WHEN ac.datos->>'estadoFiscal' = 'cargada' THEN ac.id END) as con_constancia,
        COALESCE(SUM((
          SELECT COUNT(*)
          FROM consigna.acuerdo_obras ao
          WHERE ao.acuerdo_id = ac.id
        )), 0) as total_obras,
        COALESCE(SUM((
          SELECT SUM(ao.ganancia)
          FROM consigna.acuerdo_obras ao
          WHERE ao.acuerdo_id = ac.id
        )), 0) as total_ganancias
      FROM consigna.invitaciones i
      LEFT JOIN consigna.acuerdos ac
        ON ac.invitacion_id = i.id
      WHERE i.edicion = $1`,
      [edicion]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas',
    });
  }
});

export default router;
