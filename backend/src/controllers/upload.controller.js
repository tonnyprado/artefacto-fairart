/**
 * Controlador de Uploads
 * Maneja la subida de archivos a S3
 */

import { uploadToS3, uploadMultipleToS3 } from '../services/upload.service.js'

/**
 * POST /api/upload/single
 * Subir un solo archivo
 */
export const uploadSingleFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No se recibió ningún archivo'
      })
    }

    const { buffer, originalname, mimetype } = req.file
    const folder = req.body.folder || 'uploads'

    const fileUrl = await uploadToS3(buffer, originalname, mimetype, folder)

    res.json({
      success: true,
      data: {
        url: fileUrl,
        originalname,
        mimetype,
        size: buffer.length
      }
    })
  } catch (error) {
    console.error('Error en upload single:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

/**
 * POST /api/upload/multiple
 * Subir múltiples archivos
 */
export const uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se recibieron archivos'
      })
    }

    const folder = req.body.folder || 'uploads'
    const urls = await uploadMultipleToS3(req.files, folder)

    res.json({
      success: true,
      data: {
        urls,
        count: urls.length
      }
    })
  } catch (error) {
    console.error('Error en upload multiple:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

/**
 * POST /api/upload/artista
 * Subir archivos de registro de artista
 * Maneja foto, documentos, canvas y obras
 */
export const uploadArtistaFiles = async (req, res) => {
  try {
    if (!req.files) {
      return res.status(400).json({
        success: false,
        error: 'No se recibieron archivos'
      })
    }

    console.log('📦 Archivos recibidos:', Object.keys(req.files))

    const uploadedFiles = {}

    // Subir foto de perfil
    if (req.files.foto && req.files.foto[0]) {
      const { buffer, originalname, mimetype } = req.files.foto[0]
      uploadedFiles.foto = await uploadToS3(buffer, originalname, mimetype, 'artistas/fotos')
    }

    // Subir CV
    if (req.files.cv && req.files.cv[0]) {
      const { buffer, originalname, mimetype } = req.files.cv[0]
      uploadedFiles.cv_url = await uploadToS3(buffer, originalname, mimetype, 'artistas/documentos')
    }

    // Subir Portfolio PDF
    if (req.files.portfolio && req.files.portfolio[0]) {
      const { buffer, originalname, mimetype } = req.files.portfolio[0]
      uploadedFiles.portfolio_url = await uploadToS3(buffer, originalname, mimetype, 'artistas/documentos')
    }

    // Subir Identificación
    if (req.files.identificacion && req.files.identificacion[0]) {
      const { buffer, originalname, mimetype } = req.files.identificacion[0]
      uploadedFiles.identificacion_url = await uploadToS3(buffer, originalname, mimetype, 'artistas/documentos')
    }

    // Subir Canvas
    if (req.files.layout_canvas_image && req.files.layout_canvas_image[0]) {
      const { buffer, originalname, mimetype } = req.files.layout_canvas_image[0]
      uploadedFiles.layout_canvas_url = await uploadToS3(buffer, originalname, mimetype, 'artistas/canvas')
    }

    // Subir obras del lienzo
    const obras = []
    for (let i = 0; i < 5; i++) {
      const fieldName = `obra_lienzo_${i}`
      if (req.files[fieldName] && req.files[fieldName][0]) {
        const { buffer, originalname, mimetype } = req.files[fieldName][0]
        const url = await uploadToS3(buffer, originalname, mimetype, 'artistas/obras')
        obras.push({
          index: i,
          url,
          titulo: req.body[`obra_lienzo_${i}_titulo`] || `Obra ${i + 1}`,
          alto_cm: parseFloat(req.body[`obra_lienzo_${i}_alto_cm`]) || null,
          ancho_cm: parseFloat(req.body[`obra_lienzo_${i}_ancho_cm`]) || null
        })
      }
    }

    uploadedFiles.obras = obras

    console.log('✅ Todos los archivos subidos exitosamente')

    res.json({
      success: true,
      data: uploadedFiles,
      message: 'Archivos subidos exitosamente'
    })
  } catch (error) {
    console.error('❌ Error en upload artista:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
