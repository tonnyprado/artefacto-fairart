// TEMPORAL: PostgreSQL deshabilitado mientras se usan datos en memoria
// TODO: Descomentar cuando se configure PostgreSQL

import pg from 'pg'
const { Pool } = pg

// Solo intentar conectar si las variables de entorno están configuradas
const shouldConnectDB = process.env.DB_HOST && process.env.DB_PASSWORD

let pool = null

if (shouldConnectDB) {
  // Configuración del pool de conexiones a PostgreSQL
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'artefact_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    max: 20, // Máximo número de clientes en el pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  })

  // Evento cuando se conecta un cliente
  pool.on('connect', () => {
    console.log('✅ Conectado a PostgreSQL')
  })

  // Evento cuando hay un error
  pool.on('error', (err) => {
    console.error('❌ Error inesperado en PostgreSQL:', err)
    process.exit(-1)
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
