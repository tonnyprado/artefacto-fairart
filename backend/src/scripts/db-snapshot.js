#!/usr/bin/env node

/**
 * Script para crear snapshots de la base de datos
 * Uso: node src/scripts/db-snapshot.js [nombre-snapshot]
 *
 * Crea un dump SQL de la base de datos actual para backup antes de migraciones.
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Colores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
}

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function createSnapshot() {
  try {
    // Leer configuración de .env
    const envPath = path.join(__dirname, '../../.env')
    const envContent = await fs.readFile(envPath, 'utf-8')

    const getEnvVar = (key) => {
      const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'))
      return match ? match[1].trim() : null
    }

    const dbHost = getEnvVar('DB_HOST') || 'localhost'
    const dbPort = getEnvVar('DB_PORT') || '5432'
    const dbName = getEnvVar('DB_NAME') || 'benito'
    const dbUser = getEnvVar('DB_USER') || 'postgres'
    const dbPassword = getEnvVar('DB_PASSWORD')

    if (!dbPassword) {
      log('red', '❌ Error: DB_PASSWORD no encontrado en .env')
      process.exit(1)
    }

    // Nombre del snapshot
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const snapshotName = process.argv[2] || `snapshot-${timestamp}`
    const snapshotsDir = path.join(__dirname, '../../snapshots')
    const snapshotPath = path.join(snapshotsDir, `${snapshotName}.sql`)

    // Crear directorio si no existe
    await fs.mkdir(snapshotsDir, { recursive: true })

    log('cyan', '\n📸 Creando snapshot de base de datos...\n')
    log('yellow', `Database: ${dbName}`)
    log('yellow', `Host: ${dbHost}:${dbPort}`)
    log('yellow', `User: ${dbUser}`)
    log('yellow', `Output: ${snapshotPath}\n`)

    // Ejecutar pg_dump
    const command = `PGPASSWORD="${dbPassword}" pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} --clean --if-exists --no-owner --no-acl -f "${snapshotPath}"`

    log('cyan', '⏳ Ejecutando pg_dump...')

    await execAsync(command, {
      env: { ...process.env, PGPASSWORD: dbPassword }
    })

    // Verificar tamaño del archivo
    const stats = await fs.stat(snapshotPath)
    const sizeInMB = (stats.size / 1024 / 1024).toFixed(2)

    log('green', `\n✅ Snapshot creado exitosamente!`)
    log('green', `📁 Archivo: ${snapshotPath}`)
    log('green', `📊 Tamaño: ${sizeInMB} MB\n`)

    // Instrucciones de restauración
    log('cyan', '💡 Para restaurar este snapshot:')
    log('yellow', `   PGPASSWORD="<password>" psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -f "${snapshotPath}"\n`)

    // Listar todos los snapshots
    const files = await fs.readdir(snapshotsDir)
    const snapshots = files.filter(f => f.endsWith('.sql'))

    if (snapshots.length > 1) {
      log('cyan', '📂 Snapshots disponibles:')
      for (const file of snapshots) {
        const filePath = path.join(snapshotsDir, file)
        const fileStats = await fs.stat(filePath)
        const fileSizeMB = (fileStats.size / 1024 / 1024).toFixed(2)
        const created = fileStats.mtime.toISOString().slice(0, 19).replace('T', ' ')
        log('yellow', `   - ${file} (${fileSizeMB} MB, ${created})`)
      }
      console.log()
    }

  } catch (error) {
    log('red', `\n❌ Error creando snapshot: ${error.message}\n`)

    if (error.message.includes('pg_dump')) {
      log('yellow', '💡 Asegúrate de tener PostgreSQL client tools instalados:')
      log('yellow', '   macOS: brew install postgresql')
      log('yellow', '   Ubuntu: sudo apt-get install postgresql-client')
      log('yellow', '   Windows: Descargar desde https://www.postgresql.org/download/\n')
    }

    process.exit(1)
  }
}

createSnapshot()
