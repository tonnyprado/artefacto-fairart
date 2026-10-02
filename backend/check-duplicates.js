import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

console.log('🔍 Buscando artistas con perfiles dobles...\n');

try {
  const result = await pool.query(`
    SELECT
      a.id,
      a.email,
      a.nombre,
      a.apellido,
      array_agg(DISTINCT f.nombre ORDER BY f.nombre) as fases,
      array_agg(DISTINCT f.id ORDER BY f.id) as fase_ids
    FROM artistas a
    JOIN artistas_fases af ON af.artista_id = a.id
    JOIN fases f ON f.id = af.fase_id
    GROUP BY a.id, a.email, a.nombre, a.apellido
    HAVING COUNT(DISTINCT af.fase_id) > 1
    ORDER BY a.id
  `);

  if (result.rows.length === 0) {
    console.log('✅ No hay perfiles dobles. Base de datos está limpia.\n');
  } else {
    console.log(`❌ Encontrados ${result.rows.length} artistas con perfiles dobles:\n`);
    result.rows.forEach(r => {
      console.log(`  ID: ${r.id} | Email: ${r.email}`);
      console.log(`  Nombre: ${r.nombre} ${r.apellido}`);
      console.log(`  Fases: ${r.fases.join(', ')} (IDs: ${r.fase_ids.join(', ')})`);
      console.log('');
    });
  }

  await pool.end();
} catch (err) {
  console.error('❌ Error:', err.message);
  await pool.end();
  process.exit(1);
}
