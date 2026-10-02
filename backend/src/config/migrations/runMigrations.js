/**
 * Script para ejecutar migraciones de la base de datos principal
 * Ejecutar con: node src/config/migrations/runMigrations.js
 */

import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const { Pool } = pg

// Leer DATABASE_URL del .env
import dotenv from 'dotenv'
dotenv.config()

// Remover sslmode del connection string para usar nuestra config SSL
const connectionString = process.env.DATABASE_URL?.replace(/[?&]sslmode=[^&]*/g, '')

// SSL requerido para hosts remotos
const isRemoteHost = process.env.DB_HOST && process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1'
const sslConfig = (process.env.NODE_ENV === 'production' || isRemoteHost || process.env.DATABASE_URL)
  ? { rejectUnauthorized: false }
  : false

const pool = new Pool({
  connectionString: connectionString,
  ssl: sslConfig
})

async function runMigrations() {
  const client = await pool.connect()

  try {
    console.log('🔄 Ejecutando migraciones de artistas...')

    // Leer y ejecutar migración 001
    const migration001 = fs.readFileSync(
      path.join(__dirname, '001_add_tags_to_artistas.sql'),
      'utf8'
    )

    await client.query(migration001)
    console.log('✅ Migración 001: Campo tags agregado a artistas')

    console.log('✅ Todas las migraciones completadas exitosamente')
  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

runMigrations()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
