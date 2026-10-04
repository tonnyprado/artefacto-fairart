/**
 * Script para verificar la estructura de la tabla obras
 */

import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

async function checkObrasTable() {
  console.log('🔍 Verificando estructura de la tabla obras...\n')

  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  })

  try {
    // Verificar todas las columnas de la tabla obras
    const result = await pool.query(`
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'obras'
      ORDER BY ordinal_position;
    `)

    console.log('📊 Columnas de la tabla obras:')
    console.table(result.rows)

    console.log('\n✅ Verificación completada')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

checkObrasTable()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error fatal:', error.message)
    process.exit(1)
  })
