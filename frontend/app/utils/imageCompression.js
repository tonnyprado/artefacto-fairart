/**
 * Utilidad de Compresión de Imágenes para el Navegador
 * Comprime automáticamente las imágenes antes de guardarlas
 * Usa browser-image-compression (similar a Sharp pero para el navegador)
 */

import imageCompression from 'browser-image-compression'

/**
 * Comprimir imagen en el navegador
 * @param {File} file - Archivo de imagen original
 * @param {Object} options - Opciones de compresión
 * @returns {Promise<File>} - Archivo comprimido
 */
export const compressImage = async (file, options = {}) => {
  try {
    console.log(`📸 Comprimiendo imagen: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)

    const defaultOptions = {
      maxSizeMB: 2, // Tamaño máximo en MB
      maxWidthOrHeight: 2000, // Máximo ancho o alto
      useWebWorker: true, // Usar Web Worker para no bloquear el UI
      fileType: 'image/jpeg', // Convertir todo a JPEG para mejor compresión
      initialQuality: 0.85 // Calidad 85%
    }

    const finalOptions = { ...defaultOptions, ...options }

    const compressedFile = await imageCompression(file, finalOptions)

    const compressionRatio = ((1 - compressedFile.size / file.size) * 100).toFixed(1)
    console.log(`✅ Imagen comprimida: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB (ahorro: ${compressionRatio}%)`)

    return compressedFile
  } catch (error) {
    console.error('❌ Error al comprimir imagen:', error)
    // Si falla la compresión, devolver el original
    return file
  }
}

/**
 * Convertir File a Base64 para guardar en localStorage
 * @param {File} file - Archivo
 * @returns {Promise<string>} - String en base64
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}

/**
 * Convertir Base64 a File
 * @param {string} base64 - String en base64
 * @param {string} filename - Nombre del archivo
 * @returns {File} - Archivo reconstruido
 */
export const base64ToFile = (base64, filename) => {
  const arr = base64.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

/**
 * Comprimir y guardar imagen en localStorage
 * @param {File} file - Archivo de imagen
 * @param {string} key - Clave para localStorage
 * @returns {Promise<Object>} - Info del archivo comprimido
 */
export const compressAndSaveToLocalStorage = async (file, key) => {
  try {
    // Comprimir imagen
    const compressedFile = await compressImage(file)

    // Convertir a base64
    const base64 = await fileToBase64(compressedFile)

    // Guardar en localStorage
    const fileData = {
      base64,
      name: compressedFile.name,
      type: compressedFile.type,
      size: compressedFile.size,
      originalSize: file.size,
      compressionRatio: ((1 - compressedFile.size / file.size) * 100).toFixed(1),
      timestamp: Date.now()
    }

    localStorage.setItem(key, JSON.stringify(fileData))

    console.log(`💾 Archivo guardado en localStorage: ${key}`)

    return fileData
  } catch (error) {
    console.error('❌ Error al guardar archivo:', error)
    throw error
  }
}

/**
 * Recuperar archivo comprimido de localStorage
 * @param {string} key - Clave de localStorage
 * @returns {File|null} - Archivo o null si no existe
 */
export const getFileFromLocalStorage = (key) => {
  try {
    const fileDataStr = localStorage.getItem(key)
    if (!fileDataStr) return null

    const fileData = JSON.parse(fileDataStr)
    return base64ToFile(fileData.base64, fileData.name)
  } catch (error) {
    console.error('❌ Error al recuperar archivo:', error)
    return null
  }
}

/**
 * Limpiar archivos del localStorage
 * @param {Array<string>} keys - Array de claves a eliminar
 */
export const clearFilesFromLocalStorage = (keys) => {
  keys.forEach(key => {
    localStorage.removeItem(key)
    console.log(`🗑️  Eliminado de localStorage: ${key}`)
  })
}

/**
 * Obtener info de archivo sin recuperarlo
 * @param {string} key - Clave de localStorage
 * @returns {Object|null} - Info del archivo o null
 */
export const getFileInfo = (key) => {
  try {
    const fileDataStr = localStorage.getItem(key)
    if (!fileDataStr) return null

    const fileData = JSON.parse(fileDataStr)
    return {
      name: fileData.name,
      type: fileData.type,
      size: fileData.size,
      originalSize: fileData.originalSize,
      compressionRatio: fileData.compressionRatio,
      timestamp: fileData.timestamp
    }
  } catch (error) {
    console.error('❌ Error al obtener info de archivo:', error)
    return null
  }
}

/**
 * Comprimir múltiples imágenes en paralelo
 * @param {Array<File>} files - Array de archivos
 * @returns {Promise<Array<File>>} - Array de archivos comprimidos
 */
export const compressMultipleImages = async (files) => {
  const compressionPromises = files.map(file => compressImage(file))
  return await Promise.all(compressionPromises)
}

/**
 * Validar tamaño de archivo
 * @param {File} file - Archivo
 * @param {number} maxSizeMB - Tamaño máximo en MB
 * @returns {boolean}
 */
export const validateFileSize = (file, maxSizeMB = 10) => {
  const sizeMB = file.size / 1024 / 1024
  return sizeMB <= maxSizeMB
}

/**
 * Validar tipo de archivo (imágenes)
 * @param {File} file - Archivo
 * @returns {boolean}
 */
export const validateImageType = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  return allowedTypes.includes(file.type)
}
