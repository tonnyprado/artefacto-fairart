/**
 * Script para ejecutar la migración 005_obras_3d_dimensiones.sql
 * Agrega las columnas largo_cm y tipo_obra a la tabla obras
 *
 * USO:
 * node run-migration-005.js
 */

import pg from 'pg'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Cargar variables de entorno
dotenv.config()

const { Pool } = pg

async function runMigration() {
  console.log('🚀 Iniciando migración 005_obras_3d_dimensiones...\n')

  // Crear pool de conexión
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  })

  try {
    // Leer el archivo de migración
    const migrationPath = join(__dirname, 'migrations', '005_obras_3d_dimensiones.sql')
    const sql = readFileSync(migrationPath, 'utf8')

    console.log('📄 Archivo de migración cargado')
    console.log('📊 Base de datos:', `${process.env.DB_HOST}/${process.env.DB_NAME}`)
    console.log('')

    // Ejecutar la migración
    console.log('⚙️  Ejecutando SQL...')
    await pool.query(sql)

    console.log('✅ Migración ejecutada exitosamente!')
    console.log('')
    console.log('📋 Verificando columnas agregadas...')

    // Verificar que las columnas se agregaron
    const result = await pool.query(`
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'obras'
        AND column_name IN ('largo_cm', 'tipo_obra')
      ORDER BY column_name;
    `)

    console.log('')
    console.log('Columnas encontradas:')
    console.table(result.rows)

    if (result.rows.length === 2) {
      console.log('')
      console.log('✅ Migración completada exitosamente!')
      console.log('   - largo_cm: agregado')
      console.log('   - tipo_obra: agregado')
    } else {
      console.log('')
      console.log('⚠️  Advertencia: Solo se encontraron', result.rows.length, 'de 2 columnas esperadas')
    }

  } catch (error) {
    console.error('❌ Error ejecutando migración:')
    console.error(error.message)
    if (error.stack) {
      console.error('\n📚 Stack trace:')
      console.error(error.stack)
    }
    process.exit(1)
  } finally {
    await pool.end()
  }
}

// Ejecutar
runMigration()
  .then(() => {
    console.log('\n🎉 Proceso completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error.message)
    process.exit(1)
  })
