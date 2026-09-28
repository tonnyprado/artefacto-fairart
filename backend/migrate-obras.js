import dotenv from 'dotenv';
dotenv.config();

import pool from './src/config/database.js';

(async () => {
  try {
    // 1. Obtener el artista
    const artistaResult = await pool.query(
      'SELECT id, nombre, apellido, layout_canvas_data FROM artistas WHERE email = $1',
      ['jgarciatlanda@gmail.com']
    );
    const artista = artistaResult.rows[0];

    console.log('Artista:', artista.nombre, artista.apellido, '(ID:', artista.id + ')');

    // 2. Extraer obras del canvas
    const canvasData = typeof artista.layout_canvas_data === 'string'
      ? JSON.parse(artista.layout_canvas_data)
      : artista.layout_canvas_data;

    if (!canvasData || !canvasData.obras || canvasData.obras.length === 0) {
      console.log('No hay obras en canvas');
      await pool.end();
      return;
    }

    console.log('Encontradas', canvasData.obras.length, 'obras en canvas');
    console.log('');

    // 3. Insertar cada obra en la tabla obras
    for (const obra of canvasData.obras) {
      const result = await pool.query(
        `INSERT INTO obras (artista_id, titulo, imagen_url, ancho_cm, alto_cm, tecnica, anio, precio_mxn, en_lienzo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [
          artista.id,
          obra.titulo || 'Sin título',
          '', // String vacío para evitar NOT NULL constraint
          obra.ancho_cm || null,
          obra.alto_cm || null,
          obra.tecnica || null,
          obra.anio || null,
          obra.precio_mxn || null,
          true // Viene del lienzo
        ]
      );

      console.log('✅ Obra creada:', obra.titulo, '(ID:', result.rows[0].id + ')');
    }

    console.log('');
    console.log('🎉 Migración completada! Se crearon', canvasData.obras.length, 'obras');

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
})();
