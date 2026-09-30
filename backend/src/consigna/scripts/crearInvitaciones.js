#!/usr/bin/env node

/**
 * Script para generar invitaciones masivas de consigna
 *
 * Uso:
 *   node src/consigna/scripts/crearInvitaciones.js AF2
 *   npm run consigna:invitaciones AF2
 *
 * Genera tokens únicos para todos los artistas aprobados
 * que aún no tienen invitación para la edición especificada.
 */

import { crearContenedor } from '../contenedor.js';

async function main() {
  const edicion = process.argv[2] || process.env.EDICION_SUFIJO || 'AF2';

  console.log(`\n📧 Generando invitaciones para edición: ${edicion}\n`);

  try {
    const { invitaciones } = crearContenedor();
    const ligas = await invitaciones.crearPendientes(edicion);

    if (ligas.length === 0) {
      console.log('✅ No hay artistas pendientes de invitación\n');
      process.exit(0);
    }

    console.log(`✅ ${ligas.length} invitaciones generadas:\n`);

    // Formato CSV para fácil importación
    console.log('artista_id,nombre,correo,url');
    ligas.forEach(liga => {
      console.log(`${liga.artistaId},"${liga.nombre}",${liga.correo},${liga.url}`);
    });

    console.log(`\n⚠️  IMPORTANTE: Estas URLs contienen tokens únicos.`);
    console.log('   Guárdalas en un lugar seguro y envíalas a los artistas.');
    console.log('   Los tokens NO se pueden recuperar después.\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error generando invitaciones:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
