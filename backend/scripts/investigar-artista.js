/**
 * Script para investigar un artista específico
 * Uso: node scripts/investigar-artista.js
 */

import pool from '../src/config/database.js'

async function investigarArtista(email) {
  try {
    console.log(`\n🔍 Investigando artista: ${email}\n`)

    // 1. Buscar artista
    const artistaResult = await pool.query(
      'SELECT * FROM artistas WHERE email = $1',
      [email]
    )

    if (artistaResult.rows.length === 0) {
      console.log('❌ Artista no encontrado')
      process.exit(1)
    }

    const artista = artistaResult.rows[0]
    console.log('👤 ARTISTA:')
    console.log(`   ID: ${artista.id}`)
    console.log(`   Nombre: ${artista.nombre} ${artista.apellido}`)
    console.log(`   Email: ${artista.email}`)
    console.log(`   Estado: ${artista.estado_registro}`)
    console.log(`   Foto perfil: ${artista.foto || 'No tiene'}`)

    // 2. Buscar todas las postulaciones
    const postulacionesResult = await pool.query(
      `SELECT p.*, f.nombre as fase_nombre, f.numero_fase
       FROM postulaciones p
       JOIN fases f ON f.id = p.fase_actual_id
       WHERE p.artista_id = $1
       ORDER BY p.created_at DESC`,
      [artista.id]
    )

    console.log(`\n📋 POSTULACIONES (${postulacionesResult.rows.length}):`)
    for (const post of postulacionesResult.rows) {
      console.log(`\n   Postulación ID: ${post.id}`)
      console.log(`   Fase: ${post.fase_nombre} (ID: ${post.fase_actual_id})`)
      console.log(`   Estado: ${post.estado}`)
      console.log(`   Tipo: ${post.tipo}`)
      console.log(`   Disciplina: ${post.disciplina}`)
      console.log(`   Índice R1: ${post.indice_r1}`)
      console.log(`   Respaldo R2: ${post.respaldo_r2}`)
      console.log(`   Layout Canvas: ${post.layout_canvas_url || 'No tiene'}`)
      console.log(`   Layout Data: ${post.layout_canvas_data ? 'Sí' : 'No'}`)

      // 3. Buscar obras de esta postulación
      const obrasResult = await pool.query(
        'SELECT * FROM obras WHERE postulacion_id = $1 ORDER BY orden ASC',
        [post.id]
      )

      console.log(`   Obras vinculadas: ${obrasResult.rows.length}`)
      if (obrasResult.rows.length > 0) {
        obrasResult.rows.forEach((obra, i) => {
          console.log(`      ${i + 1}. "${obra.titulo || 'Sin título'}" - ${obra.imagen ? 'Con imagen' : 'Sin imagen'}`)
          if (obra.imagen) {
            console.log(`         URL: ${obra.imagen}`)
          }
        })
      }
    }

    // 4. Buscar TODAS las obras del artista (sin filtro de postulación)
    const todasObrasResult = await pool.query(
      `SELECT o.*, p.fase_actual_id, f.nombre as fase_nombre
       FROM obras o
       LEFT JOIN postulaciones p ON p.id = o.postulacion_id
       LEFT JOIN fases f ON f.id = p.fase_actual_id
       WHERE o.postulacion_id IN (
         SELECT id FROM postulaciones WHERE artista_id = $1
       )
       ORDER BY o.created_at DESC`,
      [artista.id]
    )

    console.log(`\n🎨 TODAS LAS OBRAS DEL ARTISTA (${todasObrasResult.rows.length}):`)
    if (todasObrasResult.rows.length > 0) {
      todasObrasResult.rows.forEach((obra, i) => {
        console.log(`\n   ${i + 1}. "${obra.titulo || 'Sin título'}"`)
        console.log(`      Postulación ID: ${obra.postulacion_id}`)
        console.log(`      Fase: ${obra.fase_nombre || 'Desconocida'}`)
        console.log(`      Imagen: ${obra.imagen || 'No tiene'}`)
        console.log(`      Orden: ${obra.orden}`)
      })
    } else {
      console.log('   ❌ No hay obras registradas para este artista')
    }

    // 5. Verificar inscripciones a fases
    const inscripcionesResult = await pool.query(
      `SELECT af.*, f.nombre as fase_nombre, f.numero_fase
       FROM artistas_fases af
       JOIN fases f ON f.id = af.fase_id
       WHERE af.artista_id = $1
       ORDER BY f.numero_fase DESC`,
      [artista.id]
    )

    console.log(`\n📝 INSCRIPCIONES A FASES (${inscripcionesResult.rows.length}):`)
    inscripcionesResult.rows.forEach(insc => {
      console.log(`   - ${insc.fase_nombre}: ${insc.aprobada ? 'Aprobada' : 'Pendiente'}`)
    })

    console.log('\n✅ Investigación completada\n')
    process.exit(0)

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

// Ejecutar
investigarArtista('monicadower@gmail.com')
