import pool from '../src/config/database.js'

async function contarObras() {
  try {
    const total = await pool.query('SELECT COUNT(*) as total FROM obras')
    console.log('📊 Total de obras en BD:', total.rows[0].total)

    const conObras = await pool.query('SELECT COUNT(DISTINCT postulacion_id) as postulaciones_con_obras FROM obras WHERE postulacion_id IS NOT NULL')
    console.log('📋 Postulaciones con obras:', conObras.rows[0].postulaciones_con_obras)

    const totalPost = await pool.query('SELECT COUNT(*) as total FROM postulaciones')
    console.log('📋 Total postulaciones:', totalPost.rows[0].total)

    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

contarObras()
