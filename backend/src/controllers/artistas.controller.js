/**
 * Controlador de Artistas
 * Maneja la lógica de negocio para los artistas
 * Usa PostgreSQL si está disponible, sino usa mockData
 */

import pool from '../config/database.js'
import { getPresignedUrl } from '../services/upload.service.js'
import {
  artistas,
  artistas_fases,
  votaciones,
  getNextId,
  now
} from '../data/mockData.js'

// Helper para determinar si usamos DB o mockData
const useDatabase = () => !!pool

/**
 * GET /api/artistas
 * Obtener todos los artistas
 */
export const getAllArtistas = async (req, res) => {
  try {
    const {
      categoria,
      aprobado,
      estado_registro,
      search,
      limit = 50,
      offset = 0
    } = req.query

    if (useDatabase()) {
      // Construir query con filtros y JOINs para fase, paquete y votos
      let query = `
        SELECT
          a.*,
          af.fase_id,
          af.seleccionado as fase_seleccionado,
          f.nombre as fase_nombre,
          f.numero_fase,
          f.inscripciones_abiertas as fase_inscripciones_abiertas,
          f.votaciones_abiertas as fase_votacion_abierta,
          p.nombre as paquete_nombre,
          p.tipo as paquete_tipo,
          p.metros_lineales as paquete_metros_lineales,
          p.altura_pared as paquete_altura_pared,
          p.metros_cuadrados as paquete_metros_cuadrados,
          p.precio as paquete_precio_mxn,
          p.obras_maximas as paquete_obras_maximas,
          COALESCE((SELECT COUNT(*) FROM votaciones v WHERE v.artista_id = a.id AND v.voto = true), 0) as votos_favor,
          COALESCE((SELECT COUNT(*) FROM votaciones v WHERE v.artista_id = a.id AND v.voto = false), 0) as votos_contra
        FROM artistas a
        LEFT JOIN artistas_fases af ON af.artista_id = a.id
        LEFT JOIN fases f ON f.id = af.fase_id
        LEFT JOIN paquetes p ON p.id = a.paquete_id
        WHERE 1=1
      `
      const params = []
      let paramCount = 1

      if (categoria) {
        query += ` AND a.categoria = $${paramCount}`
        params.push(categoria)
        paramCount++
      }

      if (aprobado !== undefined) {
        query += ` AND a.aprobado = $${paramCount}`
        params.push(aprobado === 'true')
        paramCount++
      }

      if (estado_registro) {
        query += ` AND a.estado_registro = $${paramCount}`
        params.push(estado_registro)
        paramCount++
      }

      if (search) {
        query += ` AND (a.nombre ILIKE $${paramCount} OR a.apellido ILIKE $${paramCount} OR a.email ILIKE $${paramCount} OR a.bio ILIKE $${paramCount})`
        params.push(`%${search}%`)
        paramCount++
      }

      // Count total antes de paginación (sin JOINs para eficiencia)
      let countQuery = 'SELECT COUNT(*) FROM artistas a WHERE 1=1'
      const countParams = []
      let countParamCount = 1

      if (categoria) {
        countQuery += ` AND a.categoria = $${countParamCount}`
        countParams.push(categoria)
        countParamCount++
      }
      if (aprobado !== undefined) {
        countQuery += ` AND a.aprobado = $${countParamCount}`
        countParams.push(aprobado === 'true')
        countParamCount++
      }
      if (estado_registro) {
        countQuery += ` AND a.estado_registro = $${countParamCount}`
        countParams.push(estado_registro)
        countParamCount++
      }
      if (search) {
        countQuery += ` AND (a.nombre ILIKE $${countParamCount} OR a.apellido ILIKE $${countParamCount} OR a.email ILIKE $${countParamCount} OR a.bio ILIKE $${countParamCount})`
        countParams.push(`%${search}%`)
        countParamCount++
      }

      const countResult = await pool.query(countQuery, countParams)
      const total = parseInt(countResult.rows[0].count)

      // Agregar ordenamiento y paginación
      query += ' ORDER BY a.created_at DESC'
      query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`
      params.push(parseInt(limit), parseInt(offset))

      const result = await pool.query(query, params)

      // Transformar campos para cada artista
      const artistasTransformados = result.rows.map(artista => ({
        ...artista,
        // Agrupar redes sociales
        redes_sociales: {
          instagram: artista.instagram,
          facebook: artista.facebook,
          website: artista.website,
          sitio_web: artista.website // Alias para compatibilidad
        },
        // Agrupar documentos
        documentos: {
          cv_url: artista.cv_url,
          cv: artista.cv_url, // Alias
          portfolio_url: artista.portfolio_url,
          portfolio: artista.portfolio_url, // Alias
          identificacion_url: artista.identificacion_url,
          identificacion: artista.identificacion_url // Alias
        },
        // Mapear estado para compatibilidad
        estado: artista.estado_registro || artista.estado || 'pendiente',
        // Agregar info del paquete
        paquete: artista.paquete_id ? {
          id: artista.paquete_id,
          nombre: artista.paquete_nombre,
          tipo: artista.paquete_tipo,
          metros_lineales: artista.paquete_metros_lineales,
          altura_pared: artista.paquete_altura_pared,
          metros_cuadrados: artista.paquete_metros_cuadrados,
          precio_mxn: artista.paquete_precio_mxn,
          obras_maximas: artista.paquete_obras_maximas
        } : null,
        // Agregar info de fase si está disponible
        fase_inscripcion: artista.fase_id ? {
          id: artista.fase_id,
          nombre: artista.fase_nombre,
          numero_fase: artista.numero_fase,
          inscripciones_abiertas: artista.fase_inscripciones_abiertas,
          votacion_abierta: artista.fase_votacion_abierta
        } : null,
        // Votos
        total_votos_favor: parseInt(artista.votos_favor) || 0,
        total_votos_contra: parseInt(artista.votos_contra) || 0
      }))

      return res.json({
        success: true,
        data: artistasTransformados,
        total: total
      })
    }

    // Fallback a mockData
    let filteredArtistas = [...artistas]

    if (categoria) {
      filteredArtistas = filteredArtistas.filter(a => a.categoria === categoria)
    }

    if (aprobado !== undefined) {
      const isAprobado = aprobado === 'true'
      filteredArtistas = filteredArtistas.filter(a => a.aprobado === isAprobado)
    }

    if (estado_registro) {
      filteredArtistas = filteredArtistas.filter(a => a.estado_registro === estado_registro)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredArtistas = filteredArtistas.filter(a =>
        a.nombre.toLowerCase().includes(searchLower) ||
        a.apellido.toLowerCase().includes(searchLower) ||
        a.email.toLowerCase().includes(searchLower) ||
        (a.bio && a.bio.toLowerCase().includes(searchLower))
      )
    }

    filteredArtistas.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    const startIndex = parseInt(offset)
    const endIndex = startIndex + parseInt(limit)
    const paginatedArtistas = filteredArtistas.slice(startIndex, endIndex)

    res.json({
      success: true,
      data: paginatedArtistas,
      total: filteredArtistas.length
    })
  } catch (error) {
    console.error('Error al obtener artistas:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener artistas'
    })
  }
}

/**
 * GET /api/artistas/:id
 * Obtener un artista por ID
 */
export const getArtistaById = async (req, res) => {
  try {
    const { id } = req.params

    if (useDatabase()) {
      // Query optimizada: obtener artista con paquete, fase y conteo de votos en una sola consulta
      const artistaResult = await pool.query(`
        SELECT
          a.*,
          p.id as paquete_id_info,
          p.nombre as paquete_nombre,
          p.tipo as paquete_tipo,
          p.metros_lineales as paquete_metros_lineales,
          p.altura_pared as paquete_altura_pared,
          p.metros_cuadrados as paquete_metros_cuadrados,
          p.precio as paquete_precio,
          p.obras_maximas as paquete_obras_maximas,
          f.id as fase_id,
          f.nombre as fase_nombre,
          f.numero_fase as fase_numero,
          f.inscripciones_abiertas as fase_inscripciones_abiertas,
          f.votaciones_abiertas as fase_votaciones_abiertas,
          f.descripcion as fase_descripcion,
          COALESCE(v_stats.total_votos, 0) as total_votos,
          COALESCE(v_stats.votos_favor, 0) as votos_favor,
          COALESCE(v_stats.votos_contra, 0) as votos_contra,
          ARRAY_AGG(DISTINCT af.fase_id) FILTER (WHERE af.fase_id IS NOT NULL) as fases_ids
        FROM artistas a
        LEFT JOIN paquetes p ON p.id = a.paquete_id
        LEFT JOIN artistas_fases af ON af.artista_id = a.id
        LEFT JOIN fases f ON f.id = af.fase_id
        LEFT JOIN LATERAL (
          SELECT
            COUNT(*) as total_votos,
            COUNT(*) FILTER (WHERE voto = true) as votos_favor,
            COUNT(*) FILTER (WHERE voto = false) as votos_contra
          FROM votaciones
          WHERE artista_id = a.id
        ) v_stats ON true
        WHERE a.id = $1
        GROUP BY a.id, p.id, f.id, v_stats.total_votos, v_stats.votos_favor, v_stats.votos_contra
      `, [id])

      if (artistaResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Artista no encontrado'
        })
      }

      const row = artistaResult.rows[0]

      // Extraer datos del artista
      const artista = {
        id: row.id,
        nombre: row.nombre,
        apellido: row.apellido,
        nombre_artistico: row.nombre_artistico,
        email: row.email,
        telefono: row.telefono,
        fecha_nacimiento: row.fecha_nacimiento,
        ciudad: row.ciudad,
        pais: row.pais,
        categoria: row.categoria,
        bio: row.bio,
        foto: row.foto,
        instagram: row.instagram,
        facebook: row.facebook,
        website: row.website,
        cv_url: row.cv_url,
        portfolio_url: row.portfolio_url,
        identificacion_url: row.identificacion_url,
        paquete_id: row.paquete_id,
        layout_canvas_url: row.layout_canvas_url,
        layout_canvas_data: row.layout_canvas_data,
        aprobado: row.aprobado,
        estado_registro: row.estado_registro,
        folio: row.folio,
        created_at: row.created_at,
        updated_at: row.updated_at
      }

      const fasesArtista = row.fases_ids || []
      const totalVotos = parseInt(row.total_votos) || 0

      // Construir info del paquete
      const paqueteInfo = row.paquete_id_info ? {
        id: row.paquete_id_info,
        nombre: row.paquete_nombre,
        tipo: row.paquete_tipo,
        metros_lineales: row.paquete_metros_lineales,
        altura_pared: row.paquete_altura_pared,
        metros_cuadrados: row.paquete_metros_cuadrados,
        precio: row.paquete_precio,
        obras_maximas: row.paquete_obras_maximas
      } : null

      // Construir info de la fase
      const faseInfo = row.fase_id ? {
        id: row.fase_id,
        nombre: row.fase_nombre,
        numero_fase: row.fase_numero,
        inscripciones_abiertas: row.fase_inscripciones_abiertas,
        votaciones_abiertas: row.fase_votaciones_abiertas,
        descripcion: row.fase_descripcion
      } : null

      // Segunda query: obtener obras (necesario para el array completo)
      const obrasResult = await pool.query(
        'SELECT * FROM obras WHERE artista_id = $1 ORDER BY created_at DESC',
        [id]
      )

      // Generar URLs prefirmadas para documentos (válidas por 1 hora)
      const [fotoUrl, cvUrl, portfolioUrl, identificacionUrl, layoutCanvasUrl] = await Promise.all([
        artista.foto ? getPresignedUrl(artista.foto) : null,
        artista.cv_url ? getPresignedUrl(artista.cv_url) : null,
        artista.portfolio_url ? getPresignedUrl(artista.portfolio_url) : null,
        artista.identificacion_url ? getPresignedUrl(artista.identificacion_url) : null,
        artista.layout_canvas_url ? getPresignedUrl(artista.layout_canvas_url) : null
      ])

      // Generar URLs prefirmadas para las imágenes de las obras
      const obrasConUrls = await Promise.all(
        obrasResult.rows.map(async (obra) => {
          let imagenUrl = null

          if (obra.imagen_url) {
            // Verificar si es una URL de blob (no debería estar en DB)
            if (obra.imagen_url.startsWith('blob:')) {
              console.warn(`⚠️ Obra ${obra.id} tiene URL de blob inválida:`, obra.imagen_url)
              imagenUrl = null
            } else {
              try {
                imagenUrl = await getPresignedUrl(obra.imagen_url)
              } catch (err) {
                console.error(`❌ Error generando URL prefirmada para obra ${obra.id}:`, err.message)
                imagenUrl = null
              }
            }
          }

          return {
            ...obra,
            imagen_url: imagenUrl,
            // Incluir URL original para debugging si falla
            _original_url: obra.imagen_url
          }
        })
      )

      return res.json({
        success: true,
        data: {
          ...artista,
          foto: fotoUrl,
          layout_canvas_url: layoutCanvasUrl,
          redes_sociales: {
            instagram: artista.instagram,
            facebook: artista.facebook,
            website: artista.website,
            sitio_web: artista.website
          },
          documentos: {
            cv_url: cvUrl,
            cv: cvUrl,
            portfolio_url: portfolioUrl,
            portfolio: portfolioUrl,
            identificacion_url: identificacionUrl,
            identificacion: identificacionUrl,
            portfolio_images: obrasConUrls
          },
          paquete: paqueteInfo ? {
            id: paqueteInfo.id,
            nombre: paqueteInfo.nombre,
            tipo: paqueteInfo.tipo,
            metros_lineales: paqueteInfo.metros_lineales,
            altura_pared: paqueteInfo.altura_pared,
            metros_cuadrados: paqueteInfo.metros_cuadrados,
            precio_mxn: paqueteInfo.precio
          } : null,
          fase_inscripcion: faseInfo ? {
            id: faseInfo.id,
            nombre: faseInfo.nombre,
            numero_fase: faseInfo.numero_fase,
            inscripciones_abiertas: faseInfo.inscripciones_abiertas,
            votacion_abierta: faseInfo.votaciones_abiertas,
            descripcion: faseInfo.descripcion
          } : null,
          fases: fasesArtista,
          total_votos: totalVotos,
          total_votos_favor: parseInt(row.votos_favor) || 0,
          total_votos_contra: parseInt(row.votos_contra) || 0,
          estado: artista.estado_registro || artista.estado || 'pendiente'
        }
      })
    }

    // Fallback a mockData
    const artista = artistas.find(a => a.id === parseInt(id))

    if (!artista) {
      return res.status(404).json({
        success: false,
        error: 'Artista no encontrado'
      })
    }

    // Obtener fases en las que participa
    const fasesArtista = artistas_fases
      .filter(af => af.artista_id === parseInt(id))
      .map(af => af.fase_id)

    // Contar votos del artista
    const totalVotos = votaciones.filter(v => v.artista_id === parseInt(id)).length

    res.json({
      success: true,
      data: {
        ...artista,
        fases: fasesArtista,
        total_votos: totalVotos
      }
    })
  } catch (error) {
    console.error('Error al obtener artista:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener artista'
    })
  }
}

/**
 * POST /api/artistas
 * Crear un nuevo artista (Registro público)
 */
export const createArtista = async (req, res) => {
  try {
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
      foto,
      redes_sociales,
      documentos,
      paquete_id,
      layout_canvas_url,
      layout_canvas_data,
      portfolio_images_count
    } = req.body

    // Validaciones básicas
    if (!nombre || !apellido || !email || !fecha_nacimiento || !ciudad || !pais || !categoria) {
      return res.status(400).json({
        success: false,
        error: 'Campos requeridos: nombre, apellido, email, fecha_nacimiento, ciudad, pais, categoria'
      })
    }

    if (useDatabase()) {
      // Verificar si el email ya existe
      const emailCheck = await pool.query('SELECT id FROM artistas WHERE email = $1', [email])
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'El email ya está registrado'
        })
      }

      // Parsear layout_canvas_data si viene como string
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

      // Extraer redes sociales
      const instagram = redes_sociales?.instagram || null
      const facebook = redes_sociales?.facebook || null
      const website = redes_sociales?.website || null

      // Extraer documentos
      const cv_url = documentos?.cv_url || null
      const portfolio_url = documentos?.portfolio_url || null
      const identificacion_url = documentos?.identificacion_url || null

      // Insertar artista
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
          nombre, apellido, email, telefono, fecha_nacimiento,
          ciudad, pais, categoria, bio, foto,
          instagram, facebook, website,
          cv_url, portfolio_url, identificacion_url,
          paquete_id ? parseInt(paquete_id) : null,
          layout_canvas_url,
          parsedLayoutData,
          false, // aprobado
          'pendiente' // estado_registro
        ]
      )

      const nuevoArtista = artistaResult.rows[0]

      // Insertar obras del portfolio si existen
      const count = parseInt(portfolio_images_count) || 0
      const obrasCreadas = []

      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const titulo = req.body[`portfolio_image_${i}_titulo`]
          const alto_cm = req.body[`portfolio_image_${i}_alto_cm`]
          const ancho_cm = req.body[`portfolio_image_${i}_ancho_cm`]
          const imagen_url = req.body[`portfolio_image_${i}_url`] // URL viene del frontend

          if (imagen_url) {
            const obraResult = await pool.query(
              `INSERT INTO obras (artista_id, titulo, imagen_url, alto_cm, ancho_cm)
               VALUES ($1, $2, $3, $4, $5)
               RETURNING *`,
              [
                nuevoArtista.id,
                titulo || `Obra ${i + 1}`,
                imagen_url,
                parseFloat(alto_cm) || null,
                parseFloat(ancho_cm) || null
              ]
            )
            obrasCreadas.push(obraResult.rows[0])
          }
        }
      }

      return res.status(201).json({
        success: true,
        data: {
          ...nuevoArtista,
          redes_sociales: { instagram, facebook, website },
          documentos: {
            cv_url,
            portfolio_url,
            identificacion_url,
            portfolio_images: obrasCreadas
          }
        },
        message: 'Artista registrado exitosamente'
      })
    }

    // Fallback a mockData
    // Verificar si el email ya existe
    const emailExistente = artistas.some(a => a.email === email)
    if (emailExistente) {
      return res.status(400).json({
        success: false,
        error: 'El email ya está registrado'
      })
    }

    // Procesar portfolio_images si existen
    const portfolioImages = []
    const count = parseInt(portfolio_images_count) || 0

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const titulo = req.body[`portfolio_image_${i}_titulo`]
        const alto_cm = req.body[`portfolio_image_${i}_alto_cm`]
        const ancho_cm = req.body[`portfolio_image_${i}_ancho_cm`]
        const imagen_url = req.body[`portfolio_image_${i}_url`]

        if (imagen_url) {
          portfolioImages.push({
            id: `img-${Date.now()}-${i}`,
            titulo: titulo || `Obra ${i + 1}`,
            alto_cm: parseFloat(alto_cm) || 0,
            ancho_cm: parseFloat(ancho_cm) || 0,
            url: imagen_url
          })
        }
      }
    }

    // Parsear layout_canvas_data si viene como string
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

    // Crear artista
    const nuevoArtista = {
      id: getNextId.artista(),
      nombre,
      apellido,
      email,
      telefono: telefono || null,
      fecha_nacimiento,
      ciudad,
      pais,
      categoria,
      bio: bio || null,
      foto: foto || null,
      redes_sociales: redes_sociales || {},
      documentos: {
        ...(documentos || {}),
        portfolio_images: portfolioImages
      },
      paquete_id: paquete_id ? parseInt(paquete_id) : null,
      layout_canvas_url: layout_canvas_url || null,
      layout_canvas_data: parsedLayoutData,
      aprobado: false,
      estado_registro: 'pendiente',
      created_at: now(),
      updated_at: now()
    }

    artistas.push(nuevoArtista)

    res.status(201).json({
      success: true,
      data: nuevoArtista,
      message: 'Artista registrado exitosamente'
    })
  } catch (error) {
    console.error('Error al crear artista:', error)
    res.status(500).json({
      success: false,
      error: 'Error al crear artista'
    })
  }
}

/**
 * PUT /api/artistas/:id
 * Actualizar un artista (Solo admin)
 */
export const updateArtista = async (req, res) => {
  try {
    const { id } = req.params
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
      foto,
      redes_sociales,
      documentos,
      aprobado,
      estado_registro
    } = req.body

    if (useDatabase()) {
      // Verificar que el artista existe
      const checkArtista = await pool.query('SELECT * FROM artistas WHERE id = $1', [id])
      if (checkArtista.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Artista no encontrado'
        })
      }

      const artistaActual = checkArtista.rows[0]

      // Si se cambia el email, verificar que no esté en uso
      if (email && email !== artistaActual.email) {
        const emailCheck = await pool.query(
          'SELECT id FROM artistas WHERE email = $1 AND id != $2',
          [email, id]
        )
        if (emailCheck.rows.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'El email ya está en uso'
          })
        }
      }

      // Construir UPDATE dinámico
      const updates = []
      const values = []
      let paramCount = 1

      if (nombre !== undefined) {
        updates.push(`nombre = $${paramCount}`)
        values.push(nombre)
        paramCount++
      }
      if (apellido !== undefined) {
        updates.push(`apellido = $${paramCount}`)
        values.push(apellido)
        paramCount++
      }
      if (email !== undefined) {
        updates.push(`email = $${paramCount}`)
        values.push(email)
        paramCount++
      }
      if (telefono !== undefined) {
        updates.push(`telefono = $${paramCount}`)
        values.push(telefono)
        paramCount++
      }
      if (fecha_nacimiento !== undefined) {
        updates.push(`fecha_nacimiento = $${paramCount}`)
        values.push(fecha_nacimiento)
        paramCount++
      }
      if (ciudad !== undefined) {
        updates.push(`ciudad = $${paramCount}`)
        values.push(ciudad)
        paramCount++
      }
      if (pais !== undefined) {
        updates.push(`pais = $${paramCount}`)
        values.push(pais)
        paramCount++
      }
      if (categoria !== undefined) {
        updates.push(`categoria = $${paramCount}`)
        values.push(categoria)
        paramCount++
      }
      if (bio !== undefined) {
        updates.push(`bio = $${paramCount}`)
        values.push(bio)
        paramCount++
      }
      if (foto !== undefined) {
        updates.push(`foto = $${paramCount}`)
        values.push(foto)
        paramCount++
      }
      if (redes_sociales !== undefined) {
        if (redes_sociales.instagram !== undefined) {
          updates.push(`instagram = $${paramCount}`)
          values.push(redes_sociales.instagram)
          paramCount++
        }
        if (redes_sociales.facebook !== undefined) {
          updates.push(`facebook = $${paramCount}`)
          values.push(redes_sociales.facebook)
          paramCount++
        }
        if (redes_sociales.website !== undefined) {
          updates.push(`website = $${paramCount}`)
          values.push(redes_sociales.website)
          paramCount++
        }
      }
      if (documentos !== undefined) {
        if (documentos.cv_url !== undefined) {
          updates.push(`cv_url = $${paramCount}`)
          values.push(documentos.cv_url)
          paramCount++
        }
        if (documentos.portfolio_url !== undefined) {
          updates.push(`portfolio_url = $${paramCount}`)
          values.push(documentos.portfolio_url)
          paramCount++
        }
        if (documentos.identificacion_url !== undefined) {
          updates.push(`identificacion_url = $${paramCount}`)
          values.push(documentos.identificacion_url)
          paramCount++
        }
      }
      if (aprobado !== undefined) {
        updates.push(`aprobado = $${paramCount}`)
        values.push(aprobado)
        paramCount++
      }
      if (estado_registro !== undefined) {
        updates.push(`estado_registro = $${paramCount}`)
        values.push(estado_registro)
        paramCount++
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`)

      if (updates.length === 1) {
        // Solo updated_at, no hay cambios
        return res.json({
          success: true,
          data: artistaActual,
          message: 'No hay cambios que actualizar'
        })
      }

      values.push(id)
      const query = `UPDATE artistas SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`

      const result = await pool.query(query, values)
      const artistaActualizado = result.rows[0]

      return res.json({
        success: true,
        data: {
          ...artistaActualizado,
          redes_sociales: {
            instagram: artistaActualizado.instagram,
            facebook: artistaActualizado.facebook,
            website: artistaActualizado.website
          },
          documentos: {
            cv_url: artistaActualizado.cv_url,
            portfolio_url: artistaActualizado.portfolio_url,
            identificacion_url: artistaActualizado.identificacion_url
          }
        },
        message: 'Artista actualizado exitosamente'
      })
    }

    // Fallback a mockData
    const artistaIndex = artistas.findIndex(a => a.id === parseInt(id))

    if (artistaIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Artista no encontrado'
      })
    }

    // Si se cambia el email, verificar que no esté en uso
    if (email && email !== artistas[artistaIndex].email) {
      const emailExistente = artistas.some(a => a.email === email && a.id !== parseInt(id))
      if (emailExistente) {
        return res.status(400).json({
          success: false,
          error: 'El email ya está en uso'
        })
      }
    }

    // Actualizar artista
    artistas[artistaIndex] = {
      ...artistas[artistaIndex],
      ...(nombre && { nombre }),
      ...(apellido && { apellido }),
      ...(email && { email }),
      ...(telefono !== undefined && { telefono }),
      ...(fecha_nacimiento && { fecha_nacimiento }),
      ...(ciudad && { ciudad }),
      ...(pais && { pais }),
      ...(categoria && { categoria }),
      ...(bio !== undefined && { bio }),
      ...(foto !== undefined && { foto }),
      ...(redes_sociales !== undefined && { redes_sociales }),
      ...(documentos !== undefined && { documentos }),
      ...(aprobado !== undefined && { aprobado }),
      ...(estado_registro && { estado_registro }),
      updated_at: now()
    }

    res.json({
      success: true,
      data: artistas[artistaIndex],
      message: 'Artista actualizado exitosamente'
    })
  } catch (error) {
    console.error('Error al actualizar artista:', error)
    res.status(500).json({
      success: false,
      error: 'Error al actualizar artista'
    })
  }
}

/**
 * PUT /api/artistas/:id/aprobar
 * Aprobar un artista (Solo admin)
 */
export const aprobarArtista = async (req, res) => {
  try {
    const { id } = req.params

    if (useDatabase()) {
      const result = await pool.query(
        `UPDATE artistas
         SET aprobado = true, estado_registro = 'aprobado', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [id]
      )

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Artista no encontrado'
        })
      }

      return res.json({
        success: true,
        data: result.rows[0],
        message: 'Artista aprobado exitosamente'
      })
    }

    // Fallback a mockData
    const artistaIndex = artistas.findIndex(a => a.id === parseInt(id))

    if (artistaIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Artista no encontrado'
      })
    }

    artistas[artistaIndex].aprobado = true
    artistas[artistaIndex].estado_registro = 'aprobado'
    artistas[artistaIndex].updated_at = now()

    res.json({
      success: true,
      data: artistas[artistaIndex],
      message: 'Artista aprobado exitosamente'
    })
  } catch (error) {
    console.error('Error al aprobar artista:', error)
    res.status(500).json({
      success: false,
      error: 'Error al aprobar artista'
    })
  }
}

/**
 * PUT /api/artistas/:id/rechazar
 * Rechazar un artista (Solo admin)
 */
export const rechazarArtista = async (req, res) => {
  try {
    const { id } = req.params

    if (useDatabase()) {
      const result = await pool.query(
        `UPDATE artistas
         SET aprobado = false, estado_registro = 'rechazado', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [id]
      )

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Artista no encontrado'
        })
      }

      return res.json({
        success: true,
        data: result.rows[0],
        message: 'Artista rechazado'
      })
    }

    // Fallback a mockData
    const artistaIndex = artistas.findIndex(a => a.id === parseInt(id))

    if (artistaIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Artista no encontrado'
      })
    }

    artistas[artistaIndex].aprobado = false
    artistas[artistaIndex].estado_registro = 'rechazado'
    artistas[artistaIndex].updated_at = now()

    res.json({
      success: true,
      data: artistas[artistaIndex],
      message: 'Artista rechazado'
    })
  } catch (error) {
    console.error('Error al rechazar artista:', error)
    res.status(500).json({
      success: false,
      error: 'Error al rechazar artista'
    })
  }
}

/**
 * DELETE /api/artistas/:id
 * Eliminar un artista (Solo admin)
 */
export const deleteArtista = async (req, res) => {
  try {
    const { id } = req.params

    if (useDatabase()) {
      // Verificar que el artista existe
      const checkArtista = await pool.query('SELECT id FROM artistas WHERE id = $1', [id])
      if (checkArtista.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Artista no encontrado'
        })
      }

      // Verificar si tiene votaciones
      const votacionesCheck = await pool.query(
        'SELECT COUNT(*) as total FROM votaciones WHERE artista_id = $1',
        [id]
      )
      const tieneVotaciones = parseInt(votacionesCheck.rows[0].total) > 0

      if (tieneVotaciones) {
        return res.status(400).json({
          success: false,
          error: 'No se puede eliminar un artista con votaciones registradas'
        })
      }

      // Eliminar artista (CASCADE eliminará obras y artistas_fases automáticamente)
      await pool.query('DELETE FROM artistas WHERE id = $1', [id])

      return res.json({
        success: true,
        message: 'Artista eliminado exitosamente'
      })
    }

    // Fallback a mockData
    const artistaIndex = artistas.findIndex(a => a.id === parseInt(id))

    if (artistaIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Artista no encontrado'
      })
    }

    // Verificar si tiene votaciones
    const tieneVotaciones = votaciones.some(v => v.artista_id === parseInt(id))
    if (tieneVotaciones) {
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar un artista con votaciones registradas'
      })
    }

    // Eliminar inscripciones a fases
    const inscripcionesIndexes = []
    artistas_fases.forEach((af, index) => {
      if (af.artista_id === parseInt(id)) {
        inscripcionesIndexes.push(index)
      }
    })
    inscripcionesIndexes.reverse().forEach(index => {
      artistas_fases.splice(index, 1)
    })

    // Eliminar artista
    artistas.splice(artistaIndex, 1)

    res.json({
      success: true,
      message: 'Artista eliminado exitosamente'
    })
  } catch (error) {
    console.error('Error al eliminar artista:', error)
    res.status(500).json({
      success: false,
      error: 'Error al eliminar artista'
    })
  }
}

/**
 * GET /api/artistas/fase/:fase_id
 * Obtener artistas de una fase específica
 */
export const getArtistasByFase = async (req, res) => {
  try {
    const { fase_id } = req.params

    if (useDatabase()) {
      // JOIN para obtener artistas de la fase
      const result = await pool.query(
        `SELECT a.*
         FROM artistas a
         INNER JOIN artistas_fases af ON af.artista_id = a.id
         WHERE af.fase_id = $1
         ORDER BY a.created_at DESC`,
        [fase_id]
      )

      return res.json({
        success: true,
        data: result.rows
      })
    }

    // Fallback a mockData
    // Obtener IDs de artistas en la fase
    const artistaIds = artistas_fases
      .filter(af => af.fase_id === parseInt(fase_id))
      .map(af => af.artista_id)

    // Obtener datos completos de los artistas
    const artistasFase = artistas.filter(a => artistaIds.includes(a.id))

    res.json({
      success: true,
      data: artistasFase
    })
  } catch (error) {
    console.error('Error al obtener artistas de fase:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener artistas de fase'
    })
  }
}

/**
 * GET /api/artistas/export
 * Obtener todos los artistas con información completa para exportación a Excel
 * Incluye: datos del artista, obras, paquete con precios por fase
 */
export const getArtistasForExport = async (req, res) => {
  try {
    const { fase_id } = req.query

    if (useDatabase()) {
      // Query principal con todos los datos del artista y paquete
      let query = `
        SELECT
          a.*,
          af.fase_id,
          f.nombre as fase_nombre,
          f.numero_fase,
          p.nombre as paquete_nombre,
          p.tipo as paquete_tipo,
          p.metros_lineales as paquete_metros_lineales,
          p.altura_pared as paquete_altura_pared,
          p.metros_cuadrados as paquete_metros_cuadrados,
          p.precio as paquete_precio,
          p.precio_fase1 as paquete_precio_fase1,
          p.precio_fase2 as paquete_precio_fase2,
          p.precio_fase3 as paquete_precio_fase3,
          p.obras_maximas as paquete_obras_maximas,
          p.beneficios as paquete_beneficios,
          COALESCE((SELECT COUNT(*) FROM votaciones v WHERE v.artista_id = a.id AND v.voto = true), 0) as votos_favor,
          COALESCE((SELECT COUNT(*) FROM votaciones v WHERE v.artista_id = a.id AND v.voto = false), 0) as votos_contra
        FROM artistas a
        LEFT JOIN artistas_fases af ON af.artista_id = a.id
        LEFT JOIN fases f ON f.id = af.fase_id
        LEFT JOIN paquetes p ON p.id = a.paquete_id
        WHERE 1=1
      `
      const params = []
      let paramCount = 1

      // Filtro opcional por fase
      if (fase_id && fase_id !== 'all') {
        query += ` AND af.fase_id = $${paramCount}`
        params.push(parseInt(fase_id))
        paramCount++
      }

      query += ' ORDER BY a.created_at DESC'

      const artistasResult = await pool.query(query, params)

      // Obtener todas las obras de todos los artistas
      const artistaIds = artistasResult.rows.map(a => a.id)

      let obrasResult = { rows: [] }
      if (artistaIds.length > 0) {
        obrasResult = await pool.query(
          `SELECT * FROM obras WHERE artista_id = ANY($1) ORDER BY artista_id, created_at DESC`,
          [artistaIds]
        )
      }

      // Agrupar obras por artista
      const obrasPorArtista = {}
      obrasResult.rows.forEach(obra => {
        if (!obrasPorArtista[obra.artista_id]) {
          obrasPorArtista[obra.artista_id] = []
        }
        obrasPorArtista[obra.artista_id].push(obra)
      })

      // Combinar datos
      const artistasConObras = artistasResult.rows.map(artista => ({
        ...artista,
        obras: obrasPorArtista[artista.id] || [],
        paquete: artista.paquete_nombre ? {
          nombre: artista.paquete_nombre,
          tipo: artista.paquete_tipo,
          metros_lineales: artista.paquete_metros_lineales,
          altura_pared: artista.paquete_altura_pared,
          metros_cuadrados: artista.paquete_metros_cuadrados,
          precio: artista.paquete_precio,
          precio_fase1: artista.paquete_precio_fase1,
          precio_fase2: artista.paquete_precio_fase2,
          precio_fase3: artista.paquete_precio_fase3,
          obras_maximas: artista.paquete_obras_maximas,
          beneficios: artista.paquete_beneficios
        } : null,
        fase_inscripcion: artista.fase_nombre ? {
          nombre: artista.fase_nombre,
          numero_fase: artista.numero_fase
        } : null,
        total_votos_favor: parseInt(artista.votos_favor) || 0,
        total_votos_contra: parseInt(artista.votos_contra) || 0
      }))

      return res.json({
        success: true,
        data: artistasConObras,
        total: artistasConObras.length
      })
    }

    // Fallback a mockData (sin obras)
    res.json({
      success: true,
      data: artistas,
      total: artistas.length
    })
  } catch (error) {
    console.error('Error al obtener artistas para exportación:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener datos para exportación'
    })
  }
}
