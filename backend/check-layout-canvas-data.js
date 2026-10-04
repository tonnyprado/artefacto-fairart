/**
 * Script para verificar el layout_canvas_data del artista 132
 */

import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

async function checkLayoutCanvasData() {
  console.log('🔍 Verificando layout_canvas_data del artista 132...\n')

  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  })

  try {
    const result = await pool.query(`
      SELECT
        id,
        nombre,
        apellido,
        layout_canvas_data
      FROM artistas
      WHERE id = 132
    `)

    if (result.rows.length > 0) {
      const artista = result.rows[0]
      console.log('📊 Artista:', artista.nombre, artista.apellido)
      console.log('\n📋 layout_canvas_data:')
      console.log(JSON.stringify(artista.layout_canvas_data, null, 2))

      if (artista.layout_canvas_data?.obras) {
        console.log('\n✅ Obras en layout_canvas_data:', artista.layout_canvas_data.obras.length)
        artista.layout_canvas_data.obras.forEach((obra, index) => {
          console.log(`\n${index + 1}. ID: ${obra.id}`)
          console.log(`   Título: ${obra.titulo}`)
        })
      } else {
        console.log('\n⚠️  No hay obras en layout_canvas_data')
      }
    } else {
      console.log('❌ Artista 132 no encontrado')
    }

    console.log('\n✅ Verificación completada')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

checkLayoutCanvasData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error fatal:', error.message)
    process.exit(1)
  })
