import dotenv from 'dotenv';
dotenv.config();

import pkg from 'pg';
const { Pool } = pkg;

const DATABASE_URL = 'postgresql://postgres:150599Ph$@database-1.c92k2sa2ka4j.us-east-2.rds.amazonaws.com:5432/postgres';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Mapeo de emails de artistas que necesitan migración
const artistasEmails = [
  'elogguer@gmail.com',
  'eperezangeles96@gmail.com',
  'meza@estrategasdigitales.com',
  'juliocesarvela1@gmail.com',
  'manuelsolisarte@gmail.com',
  'victor.aniceto.abbud@gmail.com'
];

(async () => {
  try {
    console.log('🚀 Iniciando migración de obras desde layout_canvas_data...\n');

    let totalObrasCreadas = 0;

    for (const email of artistasEmails) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`📧 Procesando artista: ${email}`);
      console.log(`${'='.repeat(80)}\n`);

      // 1. Buscar artista en BD
      const artistaResult = await pool.query(
        'SELECT id, nombre, apellido, layout_canvas_data FROM artistas WHERE email = $1',
        [email]
      );

      if (artistaResult.rows.length === 0) {
        console.log(`❌ Artista no encontrado: ${email}`);
        continue;
      }

      const artista = artistaResult.rows[0];
      console.log(`✅ Artista encontrado: ${artista.nombre} ${artista.apellido} (ID: ${artista.id})`);

      // 2. Verificar si tiene layout_canvas_data
      if (!artista.layout_canvas_data || !artista.layout_canvas_data.obras) {
        console.log(`⚠️ No tiene obras en layout_canvas_data`);
        continue;
      }

      const obras = artista.layout_canvas_data.obras;
      console.log(`📚 Encontradas ${obras.length} obras en layout_canvas_data\n`);

      // 3. Crear cada obra en la tabla obras
      for (const obra of obras) {
        try {
          // Verificar si la obra ya existe
          const existeResult = await pool.query(
            'SELECT id FROM obras WHERE artista_id = $1 AND titulo = $2',
            [artista.id, obra.titulo]
          );

          if (existeResult.rows.length > 0) {
            console.log(`  ⏭️  Obra ya existe: "${obra.titulo}"`);
            continue;
          }

          // Crear la obra (usando columnas correctas de la tabla)
          const insertResult = await pool.query(
            `INSERT INTO obras
            (artista_id, titulo, tecnica, anio, imagen_url, fotos_detalle_urls, notas)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id`,
            [
              artista.id,
              obra.titulo,
              obra.tecnica || '',
              obra.ano || null,
              null, // imagen_url - se llenará después con la migración de fotos
              null, // fotos_detalle_urls - se llenará después con la migración de fotos
              obra.descripcion || ''
            ]
          );

          const nuevaObraId = insertResult.rows[0].id;
          console.log(`  ✅ Obra creada: "${obra.titulo}" (ID: ${nuevaObraId})`);
          totalObrasCreadas++;
        } catch (error) {
          console.error(`  ❌ Error creando obra "${obra.titulo}":`, error.message);
        }
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('🎉 MIGRACIÓN COMPLETADA');
    console.log('='.repeat(80));
    console.log(`✅ Total de obras creadas: ${totalObrasCreadas}`);
    console.log('='.repeat(80));

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en migración:', error);
    await pool.end();
    process.exit(1);
  }
})();
