/**
 * Script para verificar las obras del artista 132
 */

import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

async function checkArtista132() {
  console.log('🔍 Verificando obras del artista 132...\n')

  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  })

  try {
    // Ver todas las obras del artista 132
    const result = await pool.query(`
      SELECT
        id,
        titulo,
        tecnica,
        alto_cm,
        ancho_cm,
        precio_mxn,
        imagen_url,
        created_at
      FROM obras
      WHERE artista_id = 132
      ORDER BY id DESC
    `)

    console.log(`📊 Total de obras del artista 132: ${result.rows.length}\n`)

    if (result.rows.length > 0) {
      console.log('📋 Obras encontradas:')
      result.rows.forEach((obra, index) => {
        console.log(`\n${index + 1}. ID: ${obra.id}`)
        console.log(`   Título: ${obra.titulo}`)
        console.log(`   Técnica: ${obra.tecnica}`)
        console.log(`   Dimensiones: ${obra.alto_cm} x ${obra.ancho_cm} cm`)
        console.log(`   Precio: $${obra.precio_mxn}`)
        console.log(`   Imagen: ${obra.imagen_url?.substring(0, 80)}...`)
        console.log(`   Creada: ${obra.created_at}`)
      })
    }

    console.log('\n✅ Verificación completada')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

checkArtista132()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error fatal:', error.message)
    process.exit(1)
  })
