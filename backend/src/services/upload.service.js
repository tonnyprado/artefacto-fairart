/**
 * Servicio de Upload a AWS S3 con compresión automática
 * Usa Sharp para comprimir imágenes antes de subirlas
 * Maneja PDFs y otros documentos sin comprimir
 */

import { S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import sharp from 'sharp'
import path from 'path'

// Configurar cliente S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME

// Tipos de archivos soportados
const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const PDF_TYPES = ['application/pdf']

/**
 * Comprimir imagen con Sharp
 * Reduce el tamaño de la imagen manteniendo buena calidad
 * @param {Buffer} buffer - Buffer de la imagen original
 * @param {string} mimetype - Tipo MIME del archivo
 * @returns {Promise<{buffer: Buffer, mimetype: string}>}
 */
const compressImage = async (buffer, mimetype) => {
  try {
    const image = sharp(buffer)
    const metadata = await image.metadata()

    console.log(`📸 Imagen original: ${(buffer.length / 1024 / 1024).toFixed(2)}MB, ${metadata.width}x${metadata.height}`)

    // Redimensionar si es muy grande (máx 2000px en el lado más largo)
    const maxDimension = 2000
    let resizeOptions = {}

    if (metadata.width > maxDimension || metadata.height > maxDimension) {
      resizeOptions = {
        width: metadata.width > metadata.height ? maxDimension : undefined,
        height: metadata.height > metadata.width ? maxDimension : undefined,
        fit: 'inside',
        withoutEnlargement: true
      }
    }

    // Comprimir según el formato
    let compressedBuffer
    let outputMimetype = mimetype

    if (mimetype === 'image/png') {
      // PNG: convertir a JPEG para mayor compresión
      compressedBuffer = await image
        .resize(resizeOptions)
        .jpeg({ quality: 85, progressive: true })
        .toBuffer()
      outputMimetype = 'image/jpeg'
    } else if (mimetype === 'image/webp') {
      // WebP: mantener formato pero comprimir
      compressedBuffer = await image
        .resize(resizeOptions)
        .webp({ quality: 85 })
        .toBuffer()
    } else {
      // JPEG: comprimir con calidad 85%
      compressedBuffer = await image
        .resize(resizeOptions)
        .jpeg({ quality: 85, progressive: true })
        .toBuffer()
      outputMimetype = 'image/jpeg'
    }

    const compressionRatio = ((1 - compressedBuffer.length / buffer.length) * 100).toFixed(1)
    console.log(`✅ Imagen comprimida: ${(compressedBuffer.length / 1024 / 1024).toFixed(2)}MB (ahorro: ${compressionRatio}%)`)

    return {
      buffer: compressedBuffer,
      mimetype: outputMimetype
    }
  } catch (error) {
    console.error('❌ Error comprimiendo imagen:', error)
    // Si falla la compresión, devolver el original
    return { buffer, mimetype }
  }
}

/**
 * Subir archivo a S3
 * Comprime automáticamente las imágenes
 * @param {Buffer} fileBuffer - Buffer del archivo
 * @param {string} originalname - Nombre original del archivo
 * @param {string} mimetype - Tipo MIME
 * @param {string} folder - Carpeta en S3 (opcional)
 * @returns {Promise<string>} - URL del archivo en S3
 */
export const uploadToS3 = async (fileBuffer, originalname, mimetype, folder = 'uploads') => {
  try {
    let bufferToUpload = fileBuffer
    let finalMimetype = mimetype

    // Comprimir si es imagen
    if (IMAGE_TYPES.includes(mimetype)) {
      const compressed = await compressImage(fileBuffer, mimetype)
      bufferToUpload = compressed.buffer
      finalMimetype = compressed.mimetype
    } else {
      console.log(`📄 Archivo sin comprimir: ${originalname} (${(fileBuffer.length / 1024 / 1024).toFixed(2)}MB)`)
    }

    // Generar nombre único
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const ext = path.extname(originalname) || (finalMimetype === 'image/jpeg' ? '.jpg' : '.pdf')
    const fileName = `${folder}/${timestamp}-${randomString}${ext}`

    // Subir a S3
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: bufferToUpload,
        ContentType: finalMimetype,
        ACL: 'public-read' // Hacer el archivo público
      }
    })

    await upload.done()

    // Construir URL pública
    const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileName}`

    console.log(`✅ Archivo subido a S3: ${fileUrl}`)

    return fileUrl
  } catch (error) {
    console.error('❌ Error subiendo archivo a S3:', error)
    throw new Error(`Error al subir archivo: ${error.message}`)
  }
}

/**
 * Subir múltiples archivos
 * @param {Array} files - Array de archivos de multer
 * @param {string} folder - Carpeta en S3
 * @returns {Promise<Array<string>>} - Array de URLs
 */
export const uploadMultipleToS3 = async (files, folder = 'uploads') => {
  try {
    const uploadPromises = files.map(file =>
      uploadToS3(file.buffer, file.originalname, file.mimetype, folder)
    )
    return await Promise.all(uploadPromises)
  } catch (error) {
    console.error('❌ Error subiendo múltiples archivos:', error)
    throw error
  }
}

/**
 * Validar tamaño de archivo
 * @param {Buffer} buffer - Buffer del archivo
 * @param {number} maxSizeMB - Tamaño máximo en MB
 * @returns {boolean}
 */
export const validateFileSize = (buffer, maxSizeMB = 10) => {
  const sizeMB = buffer.length / 1024 / 1024
  return sizeMB <= maxSizeMB
}

/**
 * Validar tipo de archivo
 * @param {string} mimetype - Tipo MIME
 * @param {Array<string>} allowedTypes - Tipos permitidos
 * @returns {boolean}
 */
export const validateFileType = (mimetype, allowedTypes) => {
  return allowedTypes.includes(mimetype)
}
