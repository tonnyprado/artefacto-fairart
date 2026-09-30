/**
 * Script para ejecutar las migraciones del sistema de Consigna
 *
 * IMPORTANTE:
 * - Ejecutar SOLO en staging primero
 * - Hacer snapshot de RDS antes de ejecutar en producción
 * - 000_roles.sql debe ejecutarse como admin de PostgreSQL
 * - 001_esquema_consigna.sql ejecutarse con el rol consigna_app
 * - 002_vistas_lectura.sql debe ejecutarse como admin/dueño de las tablas
 *
 * Uso:
 *   node src/config/migrations/runConsignaMigrations.js
 */

import pool from '../database.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function runConsignaMigrations() {
  console.log('🚀 Iniciando migraciones de Consigna...\n')

  const client = await pool.connect()

  try {
    // Verificar conexión
    const versionResult = await client.query('SELECT version()')
    console.log('✅ Conectado a:', versionResult.rows[0].version.split(',')[0])
    console.log('')

    await client.query('BEGIN')

    const migrations = [
      {
        file: '001_esquema_consigna.sql',
        description: 'Esquema y tablas de consigna'
      },
      {
        file: '002_vistas_lectura.sql',
        description: 'Vistas de solo lectura sobre artistas y obras'
      }
    ]

    for (const migration of migrations) {
      console.log(`📄 Ejecutando: ${migration.file}`)
      console.log(`   ${migration.description}`)

      const sql = fs.readFileSync(
        path.join(__dirname, 'consigna', migration.file),
        'utf8'
      )

      await client.query(sql)
      console.log(`   ✅ Completada\n`)
    }

    await client.query('COMMIT')

    console.log('✅ Todas las migraciones completadas exitosamente!\n')
    console.log('⚠️  NOTA: El archivo 000_roles.sql debe ejecutarse MANUALMENTE')
    console.log('   como administrador de PostgreSQL para crear el rol consigna_app')
    console.log('')

    // Verificar que las vistas fueron creadas
    const viewsCheck = await client.query(`
      SELECT table_name
      FROM information_schema.views
      WHERE table_schema = 'consigna'
      ORDER BY table_name
    `)

    console.log('📊 Vistas creadas:')
    viewsCheck.rows.forEach(row => {
      console.log(`   - ${row.table_name}`)
    })

    // Verificar que las tablas fueron creadas
    const tablesCheck = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'consigna'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `)

    console.log('\n📊 Tablas creadas:')
    tablesCheck.rows.forEach(row => {
      console.log(`   - ${row.table_name}`)
    })

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('\n❌ Error en migraciones:', error.message)
    console.error('\nDetalle:', error)
    throw error
  } finally {
    client.release()
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runConsignaMigrations()
    .then(() => {
      console.log('\n✅ Proceso completado')
      process.exit(0)
    })
    .catch(err => {
      console.error('\n❌ Proceso fallido:', err.message)
      process.exit(1)
    })
}
