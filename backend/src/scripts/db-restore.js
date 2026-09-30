#!/usr/bin/env node

/**
 * Script para restaurar snapshots de la base de datos
 * Uso: node src/scripts/db-restore.js <nombre-snapshot>
 *
 * ADVERTENCIA: Este script borrará todos los datos actuales y restaurará el snapshot.
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import readline from 'readline'

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
}

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(`${colors.yellow}${question}${colors.reset}`, (answer) => {
      rl.close()
      resolve(answer)
    })
  })
}

async function restoreSnapshot() {
  try {
    const snapshotName = process.argv[2]

    if (!snapshotName) {
      log('red', '\n❌ Error: Debes especificar el nombre del snapshot\n')
      log('yellow', 'Uso: node src/scripts/db-restore.js <nombre-snapshot>\n')

      // Listar snapshots disponibles
      const snapshotsDir = path.join(__dirname, '../../snapshots')
      try {
        const files = await fs.readdir(snapshotsDir)
        const snapshots = files.filter(f => f.endsWith('.sql'))

        if (snapshots.length > 0) {
          log('cyan', 'Snapshots disponibles:')
          for (const file of snapshots) {
            const filePath = path.join(snapshotsDir, file)
            const stats = await fs.stat(filePath)
            const sizeMB = (stats.size / 1024 / 1024).toFixed(2)
            const created = stats.mtime.toISOString().slice(0, 19).replace('T', ' ')
            log('yellow', `  - ${file.replace('.sql', '')} (${sizeMB} MB, ${created})`)
          }
          console.log()
        }
      } catch (err) {
        // Directorio no existe
      }

      process.exit(1)
    }

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

    // Verificar que el snapshot existe
    const snapshotsDir = path.join(__dirname, '../../snapshots')
    const snapshotPath = snapshotName.endsWith('.sql')
      ? path.join(snapshotsDir, snapshotName)
      : path.join(snapshotsDir, `${snapshotName}.sql`)

    try {
      await fs.access(snapshotPath)
    } catch {
      log('red', `\n❌ Error: Snapshot no encontrado: ${snapshotPath}\n`)
      process.exit(1)
    }

    const stats = await fs.stat(snapshotPath)
    const sizeInMB = (stats.size / 1024 / 1024).toFixed(2)

    // Advertencia y confirmación
    log('red', '\n⚠️  ADVERTENCIA: Esta operación es DESTRUCTIVA\n')
    log('yellow', `Database: ${dbName}`)
    log('yellow', `Host: ${dbHost}:${dbPort}`)
    log('yellow', `Snapshot: ${path.basename(snapshotPath)} (${sizeInMB} MB)`)
    log('red', '\n⚠️  Se borrarán TODOS los datos actuales de la base de datos.\n')

    const answer = await prompt('¿Estás seguro? Escribe "SI" para continuar: ')

    if (answer.trim().toUpperCase() !== 'SI') {
      log('yellow', '\n❌ Operación cancelada por el usuario.\n')
      process.exit(0)
    }

    log('cyan', '\n🔄 Restaurando snapshot...\n')

    // Ejecutar psql
    const command = `PGPASSWORD="${dbPassword}" psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -f "${snapshotPath}"`

    await execAsync(command, {
      env: { ...process.env, PGPASSWORD: dbPassword }
    })

    log('green', '\n✅ Snapshot restaurado exitosamente!\n')

  } catch (error) {
    log('red', `\n❌ Error restaurando snapshot: ${error.message}\n`)

    if (error.message.includes('psql')) {
      log('yellow', '💡 Asegúrate de tener PostgreSQL client tools instalados:')
      log('yellow', '   macOS: brew install postgresql')
      log('yellow', '   Ubuntu: sudo apt-get install postgresql-client')
      log('yellow', '   Windows: Descargar desde https://www.postgresql.org/download/\n')
    }

    process.exit(1)
  }
}

restoreSnapshot()
