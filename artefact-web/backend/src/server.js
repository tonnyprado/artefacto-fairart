import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Configuración de variables de entorno
dotenv.config()

// Importar rutas
import artistasRoutes from './routes/artistas.routes.js'
import obrasRoutes from './routes/obras.routes.js'
import eventosRoutes from './routes/eventos.routes.js'
import inscripcionesRoutes from './routes/inscripciones.routes.js'
import paquetesRoutes from './routes/paquetes.routes.js'
import authRoutes from './routes/auth.routes.js'

// Configuración de __dirname para ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 4000

// Middlewares
app.use(helmet()) // Seguridad headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(morgan('dev')) // Logging
app.use(express.json()) // Parse JSON
app.use(express.urlencoded({ extended: true }))

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static(join(__dirname, '../uploads')))

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'ARTEFACT API is running',
    timestamp: new Date().toISOString()
  })
})

// Rutas de la API
app.use('/api/auth', authRoutes)
app.use('/api/artistas', artistasRoutes)
app.use('/api/obras', obrasRoutes)
app.use('/api/eventos', eventosRoutes)
app.use('/api/inscripciones', inscripcionesRoutes)
app.use('/api/paquetes', paquetesRoutes)

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl
  })
})

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
  console.log(`📍 Entorno: ${process.env.NODE_ENV}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/health`)
})

export default app
