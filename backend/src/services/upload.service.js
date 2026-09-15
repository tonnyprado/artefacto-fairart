/**
 * Servicio de Upload a AWS S3 con compresión automática
 * Usa Sharp para comprimir imágenes antes de subirlas
 * Maneja PDFs y otros documentos sin comprimir
 * Soporta URLs prefirmadas para acceso seguro
 */

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
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
const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
const PDF_TYPES = ['application/pdf']

/**
 * Detectar si un buffer es un archivo HEIC/HEIF por magic bytes
 * HEIC files start with: 00 00 00 XX 66 74 79 70 68 65 69 63 (ftyp heic)
 * @param {Buffer} buffer - Buffer del archivo
 * @returns {boolean}
 */
const isHeicBuffer = (buffer) => {
  if (buffer.length < 12) return false

  // Check for 'ftyp' at position 4
  const ftyp = buffer.slice(4, 8).toString('ascii')
  if (ftyp !== 'ftyp') return false

  // Check for heic/heif/mif1/msf1 variants
  const brand = buffer.slice(8, 12).toString('ascii')
  return ['heic', 'heif', 'mif1', 'msf1', 'heix', 'avif'].includes(brand)
}

/**
 * Comprimir imagen con Sharp
 * Reduce el tamaño de la imagen manteniendo buena calidad
 * Detecta y convierte automáticamente archivos HEIC a JPEG
 * @param {Buffer} buffer - Buffer de la imagen original
 * @param {string} mimetype - Tipo MIME del archivo
 * @returns {Promise<{buffer: Buffer, mimetype: string}>}
 */
const compressImage = async (buffer, mimetype) => {
  try {
    // Detectar HEIC por magic bytes (iPhone a veces envía HEIC con mimetype image/jpeg)
    const isHeic = isHeicBuffer(buffer)
    if (isHeic) {
      console.log('📱 Detectado archivo HEIC/HEIF - convirtiendo a JPEG...')
      mimetype = 'image/heic' // Forzar mimetype correcto para el switch
    }

    const image = sharp(buffer)
    const metadata = await image.metadata()

    console.log(`📸 Imagen original: ${(buffer.length / 1024 / 1024).toFixed(2)}MB, ${metadata.width}x${metadata.height}${isHeic ? ' (HEIC)' : ''}`)

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
    } else if (mimetype === 'image/heic' || mimetype === 'image/heif') {
      // HEIC/HEIF (iPhone): convertir a JPEG
      console.log('🔄 Convirtiendo HEIC/HEIF a JPEG...')
      compressedBuffer = await image
        .resize(resizeOptions)
        .jpeg({ quality: 85, progressive: true })
        .toBuffer()
      outputMimetype = 'image/jpeg'
    } else {
      // JPEG y otros: comprimir con calidad 85%
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
    // VALIDACIÓN CRÍTICA: Verificar que el buffer no esté vacío
    if (!fileBuffer || fileBuffer.length === 0) {
      console.error(`❌ BUFFER VACÍO detectado para archivo: ${originalname}`)
      throw new Error(`El archivo ${originalname} está vacío o corrupto. Por favor, intenta subirlo nuevamente.`)
    }

    console.log(`📤 Iniciando upload: ${originalname} (${(fileBuffer.length / 1024 / 1024).toFixed(2)}MB)`)

    let bufferToUpload = fileBuffer
    let finalMimetype = mimetype

    // Detectar HEIC incluso si el mimetype reportado es incorrecto
    const isHiddenHeic = isHeicBuffer(fileBuffer)
    if (isHiddenHeic && !['image/heic', 'image/heif'].includes(mimetype)) {
      console.log(`⚠️ Archivo reportado como ${mimetype} pero detectado como HEIC - corrigiendo...`)
      mimetype = 'image/heic'
    }

    // Comprimir si es imagen (incluyendo HEIC detectado)
    if (IMAGE_TYPES.includes(mimetype) || isHiddenHeic) {
      const compressed = await compressImage(fileBuffer, mimetype)
      bufferToUpload = compressed.buffer
      finalMimetype = compressed.mimetype

      // VALIDACIÓN CRÍTICA: Verificar que la compresión no devolvió buffer vacío
      if (!bufferToUpload || bufferToUpload.length === 0) {
        console.error(`❌ La compresión devolvió un buffer VACÍO para: ${originalname}`)
        throw new Error(`Error al procesar la imagen ${originalname}. El archivo puede estar corrupto. Por favor, intenta con otro archivo.`)
      }
    } else {
      console.log(`📄 Archivo sin comprimir: ${originalname} (${(fileBuffer.length / 1024 / 1024).toFixed(2)}MB)`)
    }

    // Generar nombre único
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    // Si convertimos a JPEG (incluyendo desde HEIC), usar extensión .jpg
    let ext = path.extname(originalname)
    if (finalMimetype === 'image/jpeg' || isHiddenHeic) {
      ext = '.jpg'
    } else if (!ext) {
      ext = finalMimetype === 'application/pdf' ? '.pdf' : ''
    }
    const fileName = `${folder}/${timestamp}-${randomString}${ext}`

    // VALIDACIÓN FINAL: Verificar buffer antes de S3
    if (!bufferToUpload || bufferToUpload.length === 0) {
      console.error(`❌ Buffer final VACÍO antes de subir a S3: ${originalname}`)
      throw new Error(`Error crítico: No se puede subir un archivo vacío a S3. Archivo: ${originalname}`)
    }

    console.log(`☁️  Subiendo a S3: ${fileName} (${(bufferToUpload.length / 1024).toFixed(2)}KB)`)

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

/**
 * Extraer la Key de S3 desde una URL completa
 * @param {string} url - URL de S3
 * @returns {string|null} - Key del objeto en S3
 */
const extractKeyFromUrl = (url) => {
  if (!url) return null

  try {
    // URL format: https://bucket.s3.region.amazonaws.com/key
    const urlObj = new URL(url)
    // Remove leading slash
    return urlObj.pathname.substring(1)
  } catch (error) {
    console.error('Error extrayendo key de URL:', error)
    return null
  }
}

/**
 * Generar URL prefirmada para acceso temporal a un archivo
 * @param {string} url - URL pública del archivo en S3
 * @param {number} expiresIn - Tiempo de expiración en segundos (default: 1 hora)
 * @returns {Promise<string>} - URL prefirmada
 */
export const getPresignedUrl = async (url, expiresIn = 3600) => {
  try {
    const key = extractKeyFromUrl(url)
    if (!key) {
      console.error('No se pudo extraer key de URL:', url)
      return url // Devolver URL original si no se puede procesar
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    })

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn })
    return presignedUrl
  } catch (error) {
    console.error('Error generando URL prefirmada:', error)
    return url // Devolver URL original si falla
  }
}

/**
 * Generar URLs prefirmadas para múltiples archivos
 * @param {Array<string>} urls - Array de URLs de S3
 * @param {number} expiresIn - Tiempo de expiración en segundos
 * @returns {Promise<Array<string>>} - Array de URLs prefirmadas
 */
export const getPresignedUrls = async (urls, expiresIn = 3600) => {
  try {
    const promises = urls.map(url => getPresignedUrl(url, expiresIn))
    return await Promise.all(promises)
  } catch (error) {
    console.error('Error generando URLs prefirmadas:', error)
    return urls
  }
}

/**
 * Transformar objeto de documentos con URLs prefirmadas
 * @param {Object} documentos - Objeto con URLs de documentos
 * @param {number} expiresIn - Tiempo de expiración en segundos
 * @returns {Promise<Object>} - Objeto con URLs prefirmadas
 */
export const getPresignedDocumentos = async (documentos, expiresIn = 3600) => {
  if (!documentos) return documentos

  const result = {}
  for (const [key, url] of Object.entries(documentos)) {
    if (url && typeof url === 'string' && url.includes('s3.')) {
      result[key] = await getPresignedUrl(url, expiresIn)
    } else {
      result[key] = url
    }
  }
  return result
}
