/**
 * Controlador de Layouts
 * Maneja el upload de imágenes del canvas layout a Cloudinary
 */

/**
 * POST /api/layouts/upload
 * Subir imagen del canvas layout
 *
 * NOTA: Esta es una versión simplificada para desarrollo con mock data.
 * Cuando se conecte a Cloudinary real, descomentar el código de upload.
 */
export const uploadLayoutCanvas = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionó ninguna imagen'
      })
    }

    // ===================================================================
    // OPCIÓN 1: MOCK (Desarrollo sin Cloudinary conectado)
    // ===================================================================
    // Simular upload a Cloudinary
    const mockCloudinaryUrl = `https://res.cloudinary.com/demo/image/upload/layouts/layout_${Date.now()}.png`

    console.log('📸 [MOCK] Simulando upload de layout canvas:', {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    })

    res.json({
      success: true,
      data: {
        url: mockCloudinaryUrl,
        public_id: `layouts/layout_${Date.now()}`
      }
    })

    // ===================================================================
    // OPCIÓN 2: CLOUDINARY REAL (Descomentar cuando esté configurado)
    // ===================================================================
    /*
    import { v2 as cloudinary } from 'cloudinary'

    // Configurar Cloudinary (debe estar en variables de entorno)
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    })

    // Subir a Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'layouts',
          resource_type: 'image',
          format: 'png'
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )

      uploadStream.end(req.file.buffer)
    })

    res.json({
      success: true,
      data: {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id
      }
    })
    */

  } catch (error) {
    console.error('Error al subir layout canvas:', error)
    res.status(500).json({
      success: false,
      error: 'Error al subir la imagen del layout'
    })
  }
}
