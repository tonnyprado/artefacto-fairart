/**
 * Script para abrir Ronda 2
 * Uso: node scripts/abrirRonda2.js
 */

import pool from '../src/config/database.js'

async function abrirRonda2() {
  try {
    console.log('🔍 Buscando Ronda 2...')

    // Buscar ronda 2 (la más reciente)
    const rondaResult = await pool.query(`
      SELECT r.*, f.nombre as fase_nombre
      FROM rondas r
      JOIN fases f ON f.id = r.fase_id
      WHERE r.numero = 2
      ORDER BY r.id DESC
      LIMIT 1
    `)

    if (rondaResult.rows.length === 0) {
      console.log('❌ No se encontró ninguna Ronda 2')
      process.exit(1)
    }

    const ronda = rondaResult.rows[0]
    console.log(`\n📋 Ronda encontrada:`)
    console.log(`   ID: ${ronda.id}`)
    console.log(`   Fase: ${ronda.fase_nombre} (ID: ${ronda.fase_id})`)
    console.log(`   Estado actual: ${ronda.estado}`)
    console.log(`   Votos asignados: ${ronda.votos_asignados || 'Sin límite'}`)

    if (ronda.estado === 'abierta') {
      console.log('\n✅ La Ronda 2 ya está abierta. No se requiere acción.')
      process.exit(0)
    }

    // Abrir la ronda
    console.log('\n🔄 Abriendo Ronda 2...')
    await pool.query(
      'UPDATE rondas SET estado = $1, fecha_apertura = NOW() WHERE id = $2',
      ['abierta', ronda.id]
    )

    console.log('✅ Ronda 2 abierta exitosamente!')
    console.log('\n📊 Estado actualizado:')
    console.log(`   Estado: abierta`)
    console.log(`   Fecha apertura: ${new Date().toISOString()}`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error al abrir Ronda 2:', error)
    process.exit(1)
  }
}

abrirRonda2()
