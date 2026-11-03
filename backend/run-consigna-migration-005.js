/**
 * Script para ejecutar la migración consigna/005_nueva_formula_subtotal.sql
 * BREAKING CHANGE: Nueva fórmula de cálculo de precios
 * - Renombra gastos_admin → gestion
 * - Añade campo subtotal
 * - Actualiza comentarios con fórmula correcta
 * - Gestión cambia de 3% a 4%
 *
 * USO:
 * node run-consigna-migration-005.js
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
  console.log('🚀 Iniciando migración consigna/005_nueva_formula_subtotal...\n')
  console.log('⚠️  BREAKING CHANGE: Nueva fórmula de cálculo de precios')
  console.log('   Antigua: base → +IVA (16%) → +gestión (3%) → público')
  console.log('   Nueva:   base → +gestión (4%) → subtotal → +IVA (16%) → público\n')

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
    const migrationPath = join(__dirname, 'src', 'config', 'migrations', 'consigna', '005_nueva_formula_subtotal.sql')
    const sql = readFileSync(migrationPath, 'utf8')

    console.log('📄 Archivo de migración cargado')
    console.log('📊 Base de datos:', `${process.env.DB_HOST}/${process.env.DB_NAME}`)
    console.log('📦 Esquema: consigna')
    console.log('')

    // Ejecutar la migración
    console.log('⚙️  Ejecutando SQL...')
    await pool.query(sql)

    console.log('✅ Migración ejecutada exitosamente!')
    console.log('')
    console.log('📋 Verificando cambios en tabla acuerdo_obras...')

    // Verificar que los cambios se aplicaron
    const result = await pool.query(`
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'consigna'
        AND table_name = 'acuerdo_obras'
        AND column_name IN ('gestion', 'subtotal')
      ORDER BY column_name;
    `)

    console.log('')
    console.log('Columnas encontradas:')
    console.table(result.rows)

    // Verificar que gastos_admin ya no existe
    const oldColumn = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'consigna'
        AND table_name = 'acuerdo_obras'
        AND column_name = 'gastos_admin';
    `)

    console.log('')
    if (result.rows.length === 2 && oldColumn.rows.length === 0) {
      console.log('✅ Migración completada exitosamente!')
      console.log('   ✓ gastos_admin → gestion (renombrado)')
      console.log('   ✓ subtotal (agregado)')
      console.log('')
      console.log('📝 Comentarios de columnas actualizados con la nueva fórmula')
    } else {
      console.log('⚠️  Advertencia:')
      if (result.rows.length !== 2) {
        console.log(`   - Solo se encontraron ${result.rows.length} de 2 columnas esperadas`)
      }
      if (oldColumn.rows.length > 0) {
        console.log('   - La columna gastos_admin todavía existe (debería haberse renombrado)')
      }
    }

    // Verificar registros existentes
    const count = await pool.query(`
      SELECT COUNT(*) as total
      FROM consigna.acuerdo_obras;
    `)

    console.log('')
    console.log(`📊 Registros en acuerdo_obras: ${count.rows[0].total}`)

    if (parseInt(count.rows[0].total) > 0) {
      console.log('   ℹ️  Los registros existentes se actualizaron con subtotal = precio_base + gestion')
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
    console.log('\n⚠️  IMPORTANTE: Ahora puedes desplegar el nuevo código del backend y frontend')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error.message)
    process.exit(1)
  })
