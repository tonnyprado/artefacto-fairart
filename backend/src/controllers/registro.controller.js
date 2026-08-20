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
import { enviarConfirmacionRegistro, notificarNuevoArtista, isBrevoConfigured } from '../services/email.service.js'

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
    console.log('🎨 Formato tipo:', req.body.formato_tipo)
    console.log('🎨 Formatos:', req.body.formatos)
    console.log('🎨 Formato otro texto:', req.body.formato_otro_texto)
    console.log('🎨 Categoría (legacy):', req.body.categoria)

    // ========================================
    // 1. EXTRAER Y VALIDAR DATOS DEL BODY
    // ========================================
    const {
      nombre,
      apellido,
      nombre_artistico, // Nuevo campo opcional
      email,
      telefono,
      fecha_nacimiento,
      ciudad,
      pais,
      // Nuevo sistema de formato de trabajo
      formato_tipo, // '2D', '3D', 'OTRO'
      formatos, // JSON string de array de formatos seleccionados
      formato_otro_texto, // Texto libre si eligen "Otro"
      categoria, // Compatibilidad - primer formato seleccionado
      bio,
      instagram,
      facebook,
      website,
      paquete_id,
      layout_canvas_data
    } = req.body

    // Parsear formatos si viene como string
    let formatosArray = []
    try {
      formatosArray = formatos ? JSON.parse(formatos) : []
    } catch (e) {
      formatosArray = []
    }

    // Determinar categoría final: usar el nuevo sistema o compatibilidad
    const categoriaFinal = categoria || formatosArray[0] || formato_tipo || ''

    // Validaciones básicas - ahora acepta formato_tipo o categoria
    if (!nombre || !apellido || !email || !fecha_nacimiento || !ciudad || !pais) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos: nombre, apellido, email, fecha_nacimiento, ciudad, pais'
      })
    }

    // Validar que al menos hay un formato/categoría seleccionado
    if (!categoriaFinal && !formato_tipo) {
      return res.status(400).json({
        success: false,
        error: 'Debes seleccionar un formato de trabajo (2D, 3D u Otro)'
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
    let layout_canvas_pdf_url = null

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

      // Canvas imagen (preview)
      if (req.files?.layout_canvas_image?.[0]) {
        console.log('🎨 Subiendo Canvas (imagen preview)...')
        const { buffer, originalname, mimetype } = req.files.layout_canvas_image[0]
        layout_canvas_url = await uploadToS3(buffer, originalname, mimetype, 'artistas/canvas')
      }

      // Canvas PDF (documento completo)
      if (req.files?.layout_canvas_pdf?.[0]) {
        console.log('📄 Subiendo Canvas (PDF)...')
        const { buffer, originalname, mimetype } = req.files.layout_canvas_pdf[0]
        layout_canvas_pdf_url = await uploadToS3(buffer, originalname, mimetype, 'artistas/canvas')
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

    // Agregar URL del PDF al layout_canvas_data
    if (layout_canvas_pdf_url) {
      parsedLayoutData.pdf_url = layout_canvas_pdf_url
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

    // Preparar datos de formato para guardar en layout_canvas_data
    parsedLayoutData.formato_tipo = formato_tipo || null
    parsedLayoutData.formatos = formatosArray
    parsedLayoutData.formato_otro_texto = formato_otro_texto || null

    const artistaResult = await pool.query(
      `INSERT INTO artistas (
        nombre, apellido, nombre_artistico, email, telefono, fecha_nacimiento,
        ciudad, pais, categoria, bio, foto,
        instagram, facebook, website,
        cv_url, portfolio_url, identificacion_url,
        paquete_id, layout_canvas_url, layout_canvas_data,
        aprobado, estado_registro
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      RETURNING *`,
      [
        nombre,
        apellido,
        nombre_artistico || null,
        email,
        telefono || null,
        fecha_nacimiento,
        ciudad,
        pais,
        categoriaFinal, // Usar categoría final calculada
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
        parsedLayoutData, // Ahora incluye datos de formato
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
        `SELECT id, nombre, tipo, numero_fase FROM fases
         WHERE inscripciones_abiertas = true
         ORDER BY created_at DESC
         LIMIT 1`
      )

      if (faseActivaResult.rows.length > 0) {
        const faseActiva = faseActivaResult.rows[0]

        // Insertar en artistas_fases
        await pool.query(
          `INSERT INTO artistas_fases (artista_id, fase_id, seleccionado)
           VALUES ($1, $2, $3)
           ON CONFLICT (artista_id, fase_id) DO NOTHING`,
          [nuevoArtista.id, faseActiva.id, false]
        )

        // Guardar info de fase para emails
        nuevoArtista.fase = faseActiva

        console.log(`✅ Artista inscrito a la fase ${faseActiva.id} (${faseActiva.nombre})`)
      } else {
        console.log('⚠️  No hay fases activas con inscripciones abiertas')
      }
    } catch (faseError) {
      console.error('❌ Error al inscribir a fase:', faseError)
      // No fallar el registro si no se puede inscribir a fase
    }

    // ========================================
    // 4.6. OBTENER INFO DEL PAQUETE SELECCIONADO
    // ========================================
    try {
      if (nuevoArtista.paquete_id) {
        const paqueteResult = await pool.query(
          `SELECT id, nombre, tipo, precio, metros_lineales, metros_cuadrados FROM paquetes WHERE id = $1`,
          [nuevoArtista.paquete_id]
        )
        if (paqueteResult.rows.length > 0) {
          nuevoArtista.paquete = paqueteResult.rows[0]
        }
      }
    } catch (paqueteError) {
      console.error('❌ Error al obtener paquete:', paqueteError)
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
          const tecnica = req.body[`obra_lienzo_${i}_tecnica`] || null
          const anio = parseInt(req.body[`obra_lienzo_${i}_anio`]) || null
          // Aceptar ambos nombres de campo: precio_mxn (frontend) o precio (legacy)
          const precio_mxn = parseFloat(req.body[`obra_lienzo_${i}_precio_mxn`] || req.body[`obra_lienzo_${i}_precio`]) || null
          // Aceptar ambos nombres: notas_montaje (frontend) o notas (legacy)
          const notas_montaje = req.body[`obra_lienzo_${i}_notas_montaje`] || req.body[`obra_lienzo_${i}_notas`] || null

          console.log(`   📝 Obra ${i + 1}: ${titulo} (${ancho_cm}x${alto_cm}cm, $${precio_mxn || 'sin precio'})`)

          const obraResult = await pool.query(
            `INSERT INTO obras (artista_id, titulo, imagen_url, alto_cm, ancho_cm, tecnica, anio, precio_mxn, notas_montaje)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [nuevoArtista.id, titulo, imagen_url, alto_cm, ancho_cm, tecnica, anio, precio_mxn, notas_montaje]
          )
          obrasCreadas.push(obraResult.rows[0])
        }
      }
    } else {
      console.log('⚠️  Obras del lienzo pendientes de subir (S3 no configurado)')
    }

    console.log('✅ Artista registrado exitosamente')
    console.log('   ID:', nuevoArtista.id)
    console.log('   FOLIO:', nuevoArtista.folio)
    console.log('   Nombre:', nuevoArtista.nombre, nuevoArtista.apellido)
    console.log('   Formato:', formato_tipo, '|', formatosArray.join(', ') || 'ninguno')
    if (formato_otro_texto) console.log('   Formato otro:', formato_otro_texto)

    // ========================================
    // 6. ENVIAR EMAILS (async, no bloquea respuesta)
    // ========================================
    if (isBrevoConfigured()) {
      // Email de confirmación al artista
      enviarConfirmacionRegistro({
        nombre: nuevoArtista.nombre,
        apellido: nuevoArtista.apellido,
        email: nuevoArtista.email,
        folio: nuevoArtista.folio,
        categoria: nuevoArtista.categoria,
        // Info de fase/concurso
        fase: nuevoArtista.fase || null,
        faseNombre: nuevoArtista.fase?.nombre || 'Sin fase asignada',
        faseTipo: nuevoArtista.fase?.tipo || null, // 'fase' o 'concurso'
        faseNumero: nuevoArtista.fase?.numero_fase || null,
        // Info de paquete
        paquete: nuevoArtista.paquete || null,
        paqueteNombre: nuevoArtista.paquete?.nombre || 'Sin paquete',
        paqueteTipo: nuevoArtista.paquete?.tipo || null, // '2D' o '3D'
        paquetePrecio: nuevoArtista.paquete?.precio || null
      }).then(result => {
        if (result.success) {
          console.log('📧 Email de confirmación enviado al artista')
        }
      }).catch(err => console.error('Error enviando email de confirmación:', err))

      // Notificación al admin
      notificarNuevoArtista({
        nombre: nuevoArtista.nombre,
        apellido: nuevoArtista.apellido,
        email: nuevoArtista.email,
        folio: nuevoArtista.folio,
        categoria: nuevoArtista.categoria,
        // Info de fase/concurso
        fase: nuevoArtista.fase || null,
        faseNombre: nuevoArtista.fase?.nombre || 'Sin fase asignada',
        faseTipo: nuevoArtista.fase?.tipo || null,
        faseNumero: nuevoArtista.fase?.numero_fase || null,
        // Info de paquete
        paquete: nuevoArtista.paquete || null,
        paqueteNombre: nuevoArtista.paquete?.nombre || 'Sin paquete',
        paqueteTipo: nuevoArtista.paquete?.tipo || null,
        paquetePrecio: nuevoArtista.paquete?.precio || null,
        paqueteMetros: nuevoArtista.paquete?.metros_lineales || nuevoArtista.paquete?.metros_cuadrados || null
      }).then(result => {
        if (result.success) {
          console.log('📧 Notificación enviada al admin')
        }
      }).catch(err => console.error('Error enviando notificación al admin:', err))
    }

    // ========================================
    // 7. RESPUESTA
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
