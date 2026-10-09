import { Router } from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';
import { obtenerContenedor } from '../consigna/contenedor.js';
import pool from '../config/database.js';
import { ConsignaEmailService } from '../consigna/services/ConsignaEmailService.js';

const router = Router();
const emailService = new ConsignaEmailService();

// Middleware: solo admins autenticados
router.use(verifyToken);
router.use(isAdmin);

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
        ac.estado_fiscal
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

    // Enviar emails a todos los artistas
    let emailsEnviados = 0;
    for (const liga of ligas) {
      try {
        await emailService.enviarInvitacionAceptado(
          {
            nombre: liga.nombre,
            nombrePila: liga.nombre.split(' ')[0],
            correo: liga.correo,
            folio: liga.artistaId, // TODO: obtener folio real
          },
          liga.url
        );
        emailsEnviados++;
        console.log(`✅ Email enviado a ${liga.correo}`);
      } catch (emailError) {
        console.error(`⚠️ Error enviando email a ${liga.correo}:`, emailError.message);
        // Continuar con los demás emails
      }
    }

    res.json({
      success: true,
      data: {
        generadas: ligas.length,
        emailsEnviados,
        invitaciones: ligas,
      },
      message: `${ligas.length} invitaciones generadas, ${emailsEnviados} emails enviados para ${edicion}`,
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
 * POST /api/admin/consigna/generar-invitacion/:artistaId
 * Genera invitación para un artista específico
 */
router.post('/generar-invitacion/:artistaId', async (req, res) => {
  try {
    const { artistaId } = req.params;
    const { edicion = 'AF2' } = req.body;

    // Verificar que el artista existe y está aprobado
    const artistaResult = await pool.query(
      `SELECT id, nombre, apellido, email, folio, aprobado, estado_registro
       FROM artistas
       WHERE id = $1`,
      [artistaId]
    );

    if (artistaResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Artista no encontrado',
      });
    }

    const artista = artistaResult.rows[0];

    if (!artista.aprobado || artista.estado_registro !== 'aprobado') {
      return res.status(400).json({
        success: false,
        error: 'El artista debe estar aprobado para generar invitación',
      });
    }

    // Verificar si ya tiene invitación
    const invExistente = await pool.query(
      `SELECT id FROM consigna.invitaciones
       WHERE artista_id = $1 AND edicion = $2`,
      [artistaId, edicion]
    );

    if (invExistente.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Este artista ya tiene una invitación generada',
      });
    }

    // Generar invitación usando el servicio
    const { invitaciones } = obtenerContenedor();
    const invitacionCreada = await invitaciones.crearParaArtista(artistaId, edicion);

    // Enviar email con la invitación
    try {
      await emailService.enviarInvitacionAceptado(
        {
          nombre: artista.nombre + ' ' + artista.apellido,
          nombrePila: artista.nombre,
          correo: artista.email,
          folio: artista.folio,
        },
        invitacionCreada.url
      );
      console.log(`✅ Email de invitación enviado a ${artista.email}`);
    } catch (emailError) {
      console.error('⚠️ Error enviando email:', emailError);
      // No fallar el request si el email falla, la invitación ya fue creada
    }

    res.json({
      success: true,
      data: invitacionCreada,
      message: `Invitación generada y enviada a ${artista.nombre} ${artista.apellido}`,
    });
  } catch (error) {
    console.error('Error generando invitación individual:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al generar invitación',
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
        ac.snapshot_artista,
        ac.estado_fiscal,
        ac.constancia_key,
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
          SELECT SUM(ao.ganancia_final)
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
        COUNT(DISTINCT CASE WHEN ac.estado_fiscal = 'cargada' THEN ac.id END) as con_constancia,
        COALESCE(SUM((
          SELECT COUNT(*)
          FROM consigna.acuerdo_obras ao
          WHERE ao.acuerdo_id = ac.id
        )), 0) as total_obras,
        COALESCE(SUM((
          SELECT SUM(ao.ganancia_final)
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

/**
 * GET /api/admin/consigna/acuerdos/:acuerdoId/constancia
 * Obtiene información y URL de descarga de la constancia fiscal
 */
router.get('/acuerdos/:acuerdoId/constancia', async (req, res) => {
  try {
    const { acuerdoId } = req.params;

    const result = await pool.query(
      `SELECT ac.constancia_key, ac.estado_fiscal, a.folio, a.nombre
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

    const { constancia_key, estado_fiscal, folio, nombre } = result.rows[0];

    // Si no hay constancia cargada
    if (!constancia_key) {
      return res.json({
        success: true,
        data: {
          existe: false,
          estadoFiscal: estado_fiscal,
          folio,
          nombre,
        },
      });
    }

    // Generar URL de descarga temporal (válida por 15 minutos)
    const { archivos } = obtenerContenedor();
    const ext = constancia_key.split('.').pop();
    const url = await archivos.urlDescarga(
      constancia_key,
      900, // 15 minutos
      `Constancia-${folio}.${ext}`
    );

    res.json({
      success: true,
      data: {
        existe: true,
        url,
        estadoFiscal: estado_fiscal,
        folio,
        nombre,
        nombreArchivo: constancia_key.split('/').pop(),
      },
    });
  } catch (error) {
    console.error('Error obteniendo constancia:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener constancia',
    });
  }
});

/**
 * POST /api/admin/consigna/acuerdos/:acuerdoId/constancia/upload-url
 * Genera URL presignada para que el admin suba/reemplace la constancia
 */
router.post('/acuerdos/:acuerdoId/constancia/upload-url', async (req, res) => {
  try {
    const { acuerdoId } = req.params;
    const { tipo, tamano } = req.body;

    // Validar tipo de archivo
    const TIPOS_PERMITIDOS = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!TIPOS_PERMITIDOS.includes(tipo)) {
      return res.status(400).json({
        success: false,
        error: 'Solo se permiten archivos PDF, JPG o PNG',
      });
    }

    // Validar tamaño (máx 10MB)
    if (tamano > 10 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        error: 'El archivo debe pesar menos de 10 MB',
      });
    }

    // Verificar que el acuerdo existe
    const acuerdoResult = await pool.query(
      `SELECT ac.artista_id, a.folio
       FROM consigna.acuerdos ac
       JOIN consigna.v_artistas_seleccionados a
         ON a.artista_id = ac.artista_id
       WHERE ac.id = $1`,
      [acuerdoId]
    );

    if (acuerdoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Acuerdo no encontrado',
      });
    }

    const { artista_id } = acuerdoResult.rows[0];

    // Generar key y URL de subida
    const { archivos } = obtenerContenedor();
    const crypto = await import('crypto');
    const ext = tipo === 'application/pdf' ? 'pdf' : tipo.split('/')[1];
    const key = `constancias/${artista_id}/${crypto.randomUUID()}.${ext}`;
    const uploadUrl = await archivos.urlSubida(key, tipo);

    res.json({
      success: true,
      data: {
        key,
        uploadUrl,
      },
    });
  } catch (error) {
    console.error('Error generando URL de subida:', error);
    res.status(500).json({
      success: false,
      error: 'Error al generar URL de subida',
    });
  }
});

/**
 * PUT /api/admin/consigna/acuerdos/:acuerdoId/constancia
 * Actualiza la referencia de la constancia en el acuerdo después de subirla
 */
router.put('/acuerdos/:acuerdoId/constancia', async (req, res) => {
  try {
    const { acuerdoId } = req.params;
    const { constanciaKey } = req.body;

    if (!constanciaKey) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere la clave de la constancia',
      });
    }

    // Actualizar el acuerdo
    const result = await pool.query(
      `UPDATE consigna.acuerdos
       SET constancia_key = $1,
           estado_fiscal = 'cargada'
       WHERE id = $2
       RETURNING id, artista_id, constancia_key, estado_fiscal`,
      [constanciaKey, acuerdoId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Acuerdo no encontrado',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Constancia actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error actualizando constancia:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar constancia',
    });
  }
});

export default router;
