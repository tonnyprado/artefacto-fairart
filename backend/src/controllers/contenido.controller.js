/**
 * Controlador de Contenido
 * Maneja el contenido dinámico del landing (hero, about, convocatoria)
 */

import { contenidos, getNextId, now } from '../data/mockData.js'

/**
 * GET /api/contenido
 * Obtener contenido por tipo
 * Query params: tipo (hero, about, convocatoria)
 * PÚBLICO - No requiere autenticación
 */
export const getContenido = async (req, res) => {
  try {
    const { tipo } = req.query

    if (!tipo) {
      return res.status(400).json({
        success: false,
        error: 'El parámetro "tipo" es requerido (hero, about, convocatoria)'
      })
    }

    // Buscar contenido por tipo y que esté publicado
    const contenido = contenidos.find(
      c => c.tipo === tipo && c.publicado === true
    )

    if (!contenido) {
      return res.status(404).json({
        success: false,
        error: `No se encontró contenido del tipo "${tipo}"`
      })
    }

    res.json({
      success: true,
      data: contenido
    })
  } catch (error) {
    console.error('Error al obtener contenido:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener contenido'
    })
  }
}

/**
 * GET /api/contenido/:id
 * Obtener contenido por ID (Solo admin)
 */
export const getContenidoById = async (req, res) => {
  try {
    const { id } = req.params
    const contenido = contenidos.find(c => c.id === parseInt(id))

    if (!contenido) {
      return res.status(404).json({
        success: false,
        error: 'Contenido no encontrado'
      })
    }

    res.json({
      success: true,
      data: contenido
    })
  } catch (error) {
    console.error('Error al obtener contenido:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener contenido'
    })
  }
}

/**
 * GET /api/contenido/all
 * Obtener todos los contenidos (Solo admin)
 */
export const getAllContenidos = async (req, res) => {
  try {
    res.json({
      success: true,
      data: contenidos
    })
  } catch (error) {
    console.error('Error al obtener contenidos:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener contenidos'
    })
  }
}

/**
 * POST /api/contenido
 * Crear nuevo contenido (Solo admin)
 */
export const createContenido = async (req, res) => {
  try {
    const {
      tipo,
      titulo,
      subtitulo,
      slug,
      contenido,
      imagen,
      publicado,
      cta_principal_texto,
      cta_principal_url,
      cta_secundario_texto,
      cta_secundario_url,
      mision,
      vision,
      valores,
      requisitos,
      beneficios,
      pdf_url
    } = req.body

    // Validaciones
    if (!tipo || !titulo || !slug) {
      return res.status(400).json({
        success: false,
        error: 'tipo, titulo y slug son requeridos'
      })
    }

    // Verificar que el slug no exista
    const slugExiste = contenidos.some(c => c.slug === slug)
    if (slugExiste) {
      return res.status(400).json({
        success: false,
        error: 'El slug ya está en uso'
      })
    }

    const nuevoContenido = {
      id: getNextId.contenido(),
      tipo,
      titulo,
      subtitulo: subtitulo || null,
      slug,
      contenido: contenido || null,
      imagen: imagen || null,
      publicado: publicado || false,
      cta_principal_texto: cta_principal_texto || null,
      cta_principal_url: cta_principal_url || null,
      cta_secundario_texto: cta_secundario_texto || null,
      cta_secundario_url: cta_secundario_url || null,
      mision: mision || null,
      vision: vision || null,
      valores: valores || null,
      requisitos: requisitos || null,
      beneficios: beneficios || null,
      pdf_url: pdf_url || null,
      created_at: now(),
      updated_at: now()
    }

    contenidos.push(nuevoContenido)

    res.status(201).json({
      success: true,
      data: nuevoContenido,
      message: 'Contenido creado exitosamente'
    })
  } catch (error) {
    console.error('Error al crear contenido:', error)
    res.status(500).json({
      success: false,
      error: 'Error al crear contenido'
    })
  }
}

/**
 * PUT /api/contenido/:id
 * Actualizar contenido (Solo admin)
 */
export const updateContenido = async (req, res) => {
  try {
    const { id } = req.params
    const {
      tipo,
      titulo,
      subtitulo,
      slug,
      contenido,
      imagen,
      publicado,
      cta_principal_texto,
      cta_principal_url,
      cta_secundario_texto,
      cta_secundario_url,
      mision,
      vision,
      valores,
      requisitos,
      beneficios,
      pdf_url
    } = req.body

    const contenidoIndex = contenidos.findIndex(c => c.id === parseInt(id))

    if (contenidoIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Contenido no encontrado'
      })
    }

    // Si se cambia el slug, verificar que no esté en uso
    if (slug && slug !== contenidos[contenidoIndex].slug) {
      const slugExiste = contenidos.some(c => c.slug === slug && c.id !== parseInt(id))
      if (slugExiste) {
        return res.status(400).json({
          success: false,
          error: 'El slug ya está en uso'
        })
      }
    }

    // Actualizar contenido
    contenidos[contenidoIndex] = {
      ...contenidos[contenidoIndex],
      ...(tipo && { tipo }),
      ...(titulo && { titulo }),
      ...(subtitulo !== undefined && { subtitulo }),
      ...(slug && { slug }),
      ...(contenido !== undefined && { contenido }),
      ...(imagen !== undefined && { imagen }),
      ...(publicado !== undefined && { publicado }),
      ...(cta_principal_texto !== undefined && { cta_principal_texto }),
      ...(cta_principal_url !== undefined && { cta_principal_url }),
      ...(cta_secundario_texto !== undefined && { cta_secundario_texto }),
      ...(cta_secundario_url !== undefined && { cta_secundario_url }),
      ...(mision !== undefined && { mision }),
      ...(vision !== undefined && { vision }),
      ...(valores !== undefined && { valores }),
      ...(requisitos !== undefined && { requisitos }),
      ...(beneficios !== undefined && { beneficios }),
      ...(pdf_url !== undefined && { pdf_url }),
      updated_at: now()
    }

    res.json({
      success: true,
      data: contenidos[contenidoIndex],
      message: 'Contenido actualizado exitosamente'
    })
  } catch (error) {
    console.error('Error al actualizar contenido:', error)
    res.status(500).json({
      success: false,
      error: 'Error al actualizar contenido'
    })
  }
}

/**
 * DELETE /api/contenido/:id
 * Eliminar contenido (Solo admin)
 */
export const deleteContenido = async (req, res) => {
  try {
    const { id } = req.params
    const contenidoIndex = contenidos.findIndex(c => c.id === parseInt(id))

    if (contenidoIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Contenido no encontrado'
      })
    }

    contenidos.splice(contenidoIndex, 1)

    res.json({
      success: true,
      message: 'Contenido eliminado exitosamente'
    })
  } catch (error) {
    console.error('Error al eliminar contenido:', error)
    res.status(500).json({
      success: false,
      error: 'Error al eliminar contenido'
    })
  }
}
