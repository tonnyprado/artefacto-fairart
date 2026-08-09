#!/usr/bin/env node

/**
 * Script para configurar la base de datos en Neon
 *
 * Uso:
 *   node setup-neon.js "postgresql://user:password@host/database"
 *
 * O con variable de entorno:
 *   DATABASE_URL="postgresql://..." node setup-neon.js
 */

const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

// Colores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(emoji, message, color = 'reset') {
  console.log(`${colors[color]}${emoji} ${message}${colors.reset}`)
}

async function setupDatabase() {
  // Obtener DATABASE_URL de argumentos o variable de entorno
  const databaseUrl = process.argv[2] || process.env.DATABASE_URL

  if (!databaseUrl) {
    log('❌', 'Error: Debes proporcionar la DATABASE_URL', 'red')
    console.log('')
    console.log('Uso:')
    console.log('  node setup-neon.js "postgresql://user:password@host/database"')
    console.log('')
    console.log('O con variable de entorno:')
    console.log('  DATABASE_URL="postgresql://..." node setup-neon.js')
    console.log('')
    log('📝', 'Obtén tu DATABASE_URL desde:', 'cyan')
    console.log('   https://console.neon.tech → Tu Proyecto → Connection String')
    process.exit(1)
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false } // Neon requiere SSL
  })

  try {
    log('🚀', 'Conectando a Neon...', 'cyan')
    await client.connect()
    log('✅', 'Conexión exitosa', 'green')

    // Leer schema.sql
    console.log('')
    log('1️⃣ ', 'Ejecutando schema.sql (crear tablas)...', 'blue')
    const schemaPath = path.join(__dirname, 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    await client.query(schema)
    log('✅', 'Schema creado exitosamente', 'green')

    // Leer seed.sql
    console.log('')
    log('2️⃣ ', 'Ejecutando seed.sql (datos iniciales)...', 'blue')
    const seedPath = path.join(__dirname, 'seed.sql')
    const seed = fs.readFileSync(seedPath, 'utf8')
    await client.query(seed)
    log('✅', 'Datos iniciales insertados exitosamente', 'green')

    console.log('')
    log('✨', '¡Base de datos configurada exitosamente!', 'green')
    console.log('')
    log('📋', 'Credenciales de Admin:', 'cyan')
    console.log('   Email: admin@artefact.com')
    console.log('   Password: admin123')
    console.log('')
    log('⚠️ ', 'IMPORTANTE: Actualiza tu archivo backend/.env con:', 'yellow')
    console.log(`   DATABASE_URL=${databaseUrl}`)
    console.log('')

  } catch (error) {
    log('❌', `Error: ${error.message}`, 'red')
    console.error(error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Ejecutar
setupDatabase()
