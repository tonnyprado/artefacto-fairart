import pg from 'pg'
const { Pool } = pg

// Railway proporciona DATABASE_URL automáticamente cuando agregas PostgreSQL
const shouldConnectDB = process.env.DATABASE_URL || (process.env.DB_HOST && process.env.DB_PASSWORD)

let pool = null

if (shouldConnectDB) {
  // Configuración del pool de conexiones a PostgreSQL
  // Priorizar DATABASE_URL (Railway) sobre variables individuales (desarrollo local)
  // SSL requerido para AWS RDS y otros hosts remotos
  const isRemoteHost = process.env.DB_HOST && process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1'
  const sslConfig = (process.env.NODE_ENV === 'production' || isRemoteHost) ? { rejectUnauthorized: false } : false

  const config = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: sslConfig,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'artefact_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        ssl: sslConfig,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      }

  pool = new Pool(config)

  // Evento cuando se conecta un cliente
  pool.on('connect', () => {
    console.log('✅ Conectado a PostgreSQL')
  })

  // Evento cuando hay un error
  pool.on('error', (err) => {
    console.error('❌ Error inesperado en PostgreSQL:', err)
    // No matar el proceso en producción, solo logear el error
    if (process.env.NODE_ENV !== 'production') {
      process.exit(-1)
    }
  })

  // Verificar conexión inicial
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('❌ Error al verificar conexión a PostgreSQL:', err.message)
    } else {
      console.log('✅ PostgreSQL conectado exitosamente -', res.rows[0].now)
    }
  })
} else {
  console.log('ℹ️  PostgreSQL deshabilitado - Usando datos en memoria (mockData.js)')
}

// Función helper para queries
export const query = async (text, params) => {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('Executed query', { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error('Error en query:', error)
    throw error
  }
}

// Función helper para transacciones
export const getClient = async () => {
  const client = await pool.connect()
  const query = client.query.bind(client)
  const release = client.release.bind(client)

  // Set timeout para transacciones
  const timeout = setTimeout(() => {
    console.error('⚠️ Cliente ha estado en uso por más de 5 segundos')
  }, 5000)

  client.release = () => {
    clearTimeout(timeout)
    client.release()
  }

  return { query, release }
}

export default pool
