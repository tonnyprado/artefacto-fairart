/**
 * Rutas de Registro
 * Endpoint público para registro de artistas con archivos
 */

import express from 'express'
import { registrarArtista } from '../controllers/registro.controller.js'
import { uploadArtistaFiles, handleMulterError } from '../middleware/upload.middleware.js'

const router = express.Router()

/**
 * GET /api/registro/pageview
 * Registrar cuando un usuario accede a la página de registro
 * Para analytics y monitoreo
 */
router.get('/pageview', (req, res) => {
  const timestamp = new Date().toISOString()
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  const userAgent = req.headers['user-agent']

  console.log('='.repeat(60))
  console.log('👁️  ACCESO A PÁGINA DE REGISTRO')
  console.log(`⏰ Timestamp: ${timestamp}`)
  console.log(`🌐 IP: ${ip}`)
  console.log(`🔗 Origin: ${req.headers.origin || 'N/A'}`)
  console.log(`🖥️  User-Agent: ${userAgent}`)
  console.log(`📱 Referer: ${req.headers.referer || 'N/A'}`)
  console.log('='.repeat(60))

  res.json({
    success: true,
    message: 'Pageview registrada',
    timestamp
  })
})

/**
 * POST /api/registro
 * Registro completo de artista con archivos
 * Body: FormData con todos los campos y archivos
 */
router.post('/', uploadArtistaFiles, handleMulterError, registrarArtista)

export default router
