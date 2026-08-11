/**
 * Controlador de Registro de Artistas
 * Maneja el registro completo con archivos
 *
 * MODOS:
 * 1. CON AWS S3: Sube archivos comprimidos a S3 y guarda URLs en PostgreSQL
 * 2. SIN AWS S3: Guarda datos en PostgreSQL con archivos en NULL (pendientes)
 */

import pool from '../config/database.js'
import { uploadToS3 } from '../services/upload.service.js'

// Verificar si S3 está configurado
const isS3Configured = () => {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET_NAME
  )
}

/**
 * POST /api/registro
 * Registro completo de artista con archivos
 * Maneja FormData con archivos + campos de texto
 */
export const registrarArtista = async (req, res) => {
  try {
    console.log('📝 Iniciando registro de artista...')
    console.log('📦 Archivos recibidos:', req.files ? Object.keys(req.files) : 'ninguno')
    console.log('📋 Datos recibidos:', Object.keys(req.body).filter(k => !k.startsWith('obra_lienzo')))

    // ========================================
    // 1. EXTRAER Y VALIDAR DATOS DEL BODY
    // ========================================
    const {
      nombre,
      apellido,
      email,
      telefono,
      fecha_nacimiento,
      ciudad,
      pais,
      categoria,
      bio,
      instagram,
      facebook,
      website,
      paquete_id,
      layout_canvas_data
    } = req.body

    // Validaciones básicas
    if (!nombre || !apellido || !email || !fecha_nacimiento || !ciudad || !pais || !categoria) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos: nombre, apellido, email, fecha_nacimiento, ciudad, pais, categoria'
      })
    }

    // Verificar si el email ya existe
    if (pool) {
      const emailCheck = await pool.query('SELECT id FROM artistas WHERE email = $1', [email])
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'El email ya está registrado'
        })
      }
    }

    // ========================================
    // 2. SUBIR ARCHIVOS A S3 (SI ESTÁ CONFIGURADO)
    // ========================================
    let foto_url = null
    let cv_url = null
    let portfolio_url = null
    let identificacion_url = null
    let layout_canvas_url = null

    const s3Available = isS3Configured()

    if (!s3Available) {
      console.log('⚠️  AWS S3 no configurado - Guardando artista sin archivos')
      console.log('   Los archivos quedarán pendientes hasta configurar S3')
    }

    // Solo subir archivos si S3 está configurado
    if (s3Available) {
      // Foto de perfil
      if (req.files?.foto?.[0]) {
        console.log('📸 Subiendo foto de perfil...')
        const { buffer, originalname, mimetype } = req.files.foto[0]
        foto_url = await uploadToS3(buffer, originalname, mimetype, 'artistas/fotos')
      }

      // CV
      if (req.files?.cv?.[0]) {
        console.log('📄 Subiendo CV...')
        const { buffer, originalname, mimetype } = req.files.cv[0]
        cv_url = await uploadToS3(buffer, originalname, mimetype, 'artistas/documentos')
      }

      // Portfolio PDF
      if (req.files?.portfolio?.[0]) {
        console.log('📄 Subiendo Portfolio...')
        const { buffer, originalname, mimetype } = req.files.portfolio[0]
        portfolio_url = await uploadToS3(buffer, originalname, mimetype, 'artistas/documentos')
      }

      // Identificación
      if (req.files?.identificacion?.[0]) {
        console.log('🆔 Subiendo Identificación...')
        const { buffer, originalname, mimetype } = req.files.identificacion[0]
        identificacion_url = await uploadToS3(buffer, originalname, mimetype, 'artistas/documentos')
      }

      // Canvas
      if (req.files?.layout_canvas_image?.[0]) {
        console.log('🎨 Subiendo Canvas...')
        const { buffer, originalname, mimetype } = req.files.layout_canvas_image[0]
        layout_canvas_url = await uploadToS3(buffer, originalname, mimetype, 'artistas/canvas')
      }
    }

    // ========================================
    // 3. PARSEAR layout_canvas_data
    // ========================================
    let parsedLayoutData = {}
    if (layout_canvas_data) {
      try {
        parsedLayoutData = typeof layout_canvas_data === 'string'
          ? JSON.parse(layout_canvas_data)
          : layout_canvas_data
      } catch (e) {
        console.error('Error parsing layout_canvas_data:', e)
      }
    }

    // ========================================
    // 4. INSERTAR ARTISTA EN LA BASE DE DATOS
    // ========================================
    if (!pool) {
      return res.status(500).json({
        success: false,
        error: 'Base de datos no configurada. Configura PostgreSQL primero.'
      })
    }

    const artistaResult = await pool.query(
      `INSERT INTO artistas (
        nombre, apellido, email, telefono, fecha_nacimiento,
        ciudad, pais, categoria, bio, foto,
        instagram, facebook, website,
        cv_url, portfolio_url, identificacion_url,
        paquete_id, layout_canvas_url, layout_canvas_data,
        aprobado, estado_registro
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *`,
      [
        nombre,
        apellido,
        email,
        telefono || null,
        fecha_nacimiento,
        ciudad,
        pais,
        categoria,
        bio || null,
        foto_url,
        instagram || null,
        facebook || null,
        website || null,
        cv_url,
        portfolio_url,
        identificacion_url,
        paquete_id ? parseInt(paquete_id) : null,
        layout_canvas_url,
        parsedLayoutData,
        false, // aprobado
        'pendiente' // estado_registro
      ]
    )

    const nuevoArtista = artistaResult.rows[0]

    // ========================================
    // 4.5. INSCRIBIR A LA FASE ACTIVA AUTOMÁTICAMENTE
    // ========================================
    try {
      // Buscar la fase activa con inscripciones abiertas
      const faseActivaResult = await pool.query(
        `SELECT id FROM fases
         WHERE inscripciones_abiertas = true
         ORDER BY created_at DESC
         LIMIT 1`
      )

      if (faseActivaResult.rows.length > 0) {
        const faseId = faseActivaResult.rows[0].id

        // Insertar en artistas_fases
        await pool.query(
          `INSERT INTO artistas_fases (artista_id, fase_id, seleccionado)
           VALUES ($1, $2, $3)
           ON CONFLICT (artista_id, fase_id) DO NOTHING`,
          [nuevoArtista.id, faseId, false]
        )

        console.log(`✅ Artista inscrito a la fase ${faseId}`)
      } else {
        console.log('⚠️  No hay fases activas con inscripciones abiertas')
      }
    } catch (faseError) {
      console.error('❌ Error al inscribir a fase:', faseError)
      // No fallar el registro si no se puede inscribir a fase
    }

    // ========================================
    // 5. SUBIR Y GUARDAR OBRAS DEL LIENZO (SI S3 ESTÁ CONFIGURADO)
    // ========================================
    const obrasCreadas = []

    if (s3Available) {
      for (let i = 0; i < 5; i++) {
        const fieldName = `obra_lienzo_${i}`
        if (req.files?.[fieldName]?.[0]) {
          console.log(`🖼️ Subiendo obra ${i + 1}...`)

          const { buffer, originalname, mimetype } = req.files[fieldName][0]
          const imagen_url = await uploadToS3(buffer, originalname, mimetype, 'artistas/obras')

          const titulo = req.body[`obra_lienzo_${i}_titulo`] || `Obra ${i + 1}`
          const alto_cm = parseFloat(req.body[`obra_lienzo_${i}_alto_cm`]) || null
          const ancho_cm = parseFloat(req.body[`obra_lienzo_${i}_ancho_cm`]) || null

          const obraResult = await pool.query(
            `INSERT INTO obras (artista_id, titulo, imagen_url, alto_cm, ancho_cm)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [nuevoArtista.id, titulo, imagen_url, alto_cm, ancho_cm]
          )
          obrasCreadas.push(obraResult.rows[0])
        }
      }
    } else {
      console.log('⚠️  Obras del lienzo pendientes de subir (S3 no configurado)')
    }

    console.log('✅ Artista registrado exitosamente con ID:', nuevoArtista.id)

    // ========================================
    // 6. RESPUESTA
    // ========================================
    const mensaje = s3Available
      ? '¡Registro exitoso! Tu solicitud está pendiente de aprobación.'
      : '¡Registro exitoso! Tus archivos quedarán pendientes hasta que se configure el almacenamiento.'

    res.status(201).json({
      success: true,
      data: {
        ...nuevoArtista,
        redes_sociales: {
          instagram: nuevoArtista.instagram,
          facebook: nuevoArtista.facebook,
          website: nuevoArtista.website
        },
        documentos: {
          cv_url: nuevoArtista.cv_url,
          portfolio_url: nuevoArtista.portfolio_url,
          identificacion_url: nuevoArtista.identificacion_url,
          portfolio_images: obrasCreadas
        },
        s3_configured: s3Available
      },
      message: mensaje
    })
  } catch (error) {
    console.error('❌ Error en registro de artista:', error)
    res.status(500).json({
      success: false,
      error: 'Error al registrar artista: ' + error.message
    })
  }
}
