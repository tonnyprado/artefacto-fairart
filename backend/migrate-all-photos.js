import dotenv from 'dotenv';
dotenv.config();

// Debug: Verificar que las variables de entorno se cargaron
console.log('🔍 Verificando variables de entorno AWS:');
console.log('AWS_S3_BUCKET_NAME:', process.env.AWS_S3_BUCKET_NAME);
console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'CONFIGURADO ✅' : 'NO CONFIGURADO ❌');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'CONFIGURADO ✅' : 'NO CONFIGURADO ❌');
console.log('');

import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import { uploadToS3 } from './src/services/upload.service.js';

const DATABASE_URL = 'postgresql://postgres:150599Ph$@database-1.c92k2sa2ka4j.us-east-2.rds.amazonaws.com:5432/postgres';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Mapeo de artistas con sus fotos
const artistasData = {
  'juarezag01@gmail.com': {
    fotoPerfil: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/Andres Juarez Garcia/AndresJuarezGarcia_perfil.jpg',
    obras: {
      'Delirio de notas amargas': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/Andres Juarez Garcia/Delirio de notas amargas_page-0001.jpg',
        detalles: [
          '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/Andres Juarez Garcia/Delirio de notas amargas_page-0002.jpg',
          '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/Andres Juarez Garcia/Delirio de notas amargas_page-0003.jpg',
          '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/Andres Juarez Garcia/Delirio de notas amargas_page-0004.jpg'
        ]
      },
      'Llegó por la noche': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/Andres Juarez Garcia/Llego por la noche_page-0001.jpg',
        detalles: [
          '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/Andres Juarez Garcia/Llego por la noche_page-0002.jpg',
          '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/Andres Juarez Garcia/Llego por la noche_page-0003.jpg',
          '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/Andres Juarez Garcia/Llego por la noche_page-0004.jpg',
          '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/Andres Juarez Garcia/Llego por la noche_page-0005.jpg'
        ]
      },
      'Nadé en el Lete': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/Andres Juarez Garcia/Nade por el lete_page-0001.jpg',
        detalles: [
          '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/Andres Juarez Garcia/Nade por el lete_page-0002.jpg',
          '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/Andres Juarez Garcia/Nade por el lete_page-0003.jpg',
          '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/Andres Juarez Garcia/Nade por el lete_page-0004.jpg',
          '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/Andres Juarez Garcia/Nade por el lete_page-0005.jpg'
        ]
      }
    }
  },
  'elogguer@gmail.com': {
    obras: {
      'La Cantera': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/EloisaGarcía/LaCantera_Eloisa.jpg'
      }
    }
  },
  'eperezangeles96@gmail.com': {
    obras: {
      'En sueños te evoco, pero quien viene no es más que una sombra': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/EmilioPerezAngeles/En sueños te evoco, pero quien viene no es más que una sombra.jpg.jpeg'
      },
      'Quimérico museo de formas inconstantes': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/EmilioPerezAngeles/Los pasos que ya no doy contigo.jpg.jpeg'
      },
      'Los pasos que ya no doy contigo': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/EmilioPerezAngeles/Quimérico museo de formas inconstantes.jpg.jpeg'
      }
    }
  },
  'meza@estrategasdigitales.com': {
    obras: {
      'Entresueño': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/JorgeMeza/Entresueño.jpeg'
      },
      'Abrazado': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/JorgeMeza/JorgeMeza_Abrazado.jpeg'
      },
      'Atardecer Sentado': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/JorgeMeza/JorgeMeza_AtardecerSentado.jpeg'
      },
      'Contemplacion': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/JorgeMeza/JorgeMeza_Contemplacion.jpeg'
      },
      'Descanso Morado': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/JorgeMeza/JorgeMeza_DescansoMorado.jpeg'
      },
      'Expectante': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/JorgeMeza/JorgeMeza_Expectante_imgen inferior.jpeg'
      },
      'Rebasado': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/JorgeMeza/JorgeMeza_Rebasado.jpeg'
      },
      'Santo Azul': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/JorgeMeza/JorgeMeza_SantoAzul.jpeg'
      },
      'Retrato complementario': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/JorgeMeza/JorgeMeza_RetratoComplementario.jpeg'
      }
    }
  },
  'jgarciatlanda@gmail.com': {
    obras: {
      'Tigre Floreciente': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/Juan Jose Torres Landa/Tigrefloreciente_JuanJose.JPG'
      },
      'Entrelazados': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/Juan Jose Torres Landa/Entrelazados_JuanJose.JPG'
      },
      'Esperándote': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/Juan Jose Torres Landa/Esperandote_JuanJose.JPG'
      },
      'Disociarse o No Disociarse': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/Juan Jose Torres Landa/Disociarse o no disociarse_JuanJose.JPG'
      },
      'Figura Roja Efímera': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/Juan Jose Torres Landa/FiguraRojaEfimera_JuanJose.JPG'
      },
      'Lobo Floreciente': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/Juan Jose Torres Landa/LoboFloreciente_JuanJose.JPG'
      }
    }
  },
  'juliocesarvela1@gmail.com': {
    obras: {
      'Maravilla': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/JulioCesar/JulioCesar_Maravilla.jpeg'
      },
      'Paraíso': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/JulioCesar/JulioCesar_Paraiso.jpeg'
      },
      'El joven que murió en el Nilo azul': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/JulioCesar/JulioCesar_ElJovenQueMurioEnElNiloAzul.jpeg'
      },
      'La visión del Balam en la selva Lacandona': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/JulioCesar/JulioCesar_LaVisiónDesBalamEnLaSelvaLacandona.jpeg'
      },
      'Luna y estrellas': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/JulioCesar/JulioCesar_LunayEstrellas.jpeg'
      },
      'Montaña divina': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/JulioCesar/JulioCesar_MontañaDivina.jpeg'
      }
    }
  },
  'manuelsolisarte@gmail.com': {
    obras: {
      'Ensamble residual II': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/Manuel Solis/EnsambleResidualII_ManuelSolis.jpg'
      },
      'Ensamble residual III': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/Manuel Solis/EnsambleResidual_III_ManuelSolis.jpg'
      },
      'Ensamble residual VI': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/Manuel Solis/EnsambleResidual_VI_Manuel Solis.jpg'
      },
      'Ensamble residual VIII': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/Manuel Solis/EnsambleResidual_VIII_ManuelSolis.jpg'
      },
      'Ensamble residual VII': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/Manuel Solis/EnsambleResidual_VII_ManuelSolis.jpg'
      },
      'Ensamble residual XI': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/Manuel Solis/EnsambleResidual_XI_ManuelSolis.jpg'
      },
      'Ensamble residual X': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/Manuel Solis/EnsambleResidual_X_ManuelSolis.jpg'
      },
      'Ensamble Residual XIII': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/Manuel Solis/Ensamble Residual XIII_ManuelSolis.jpg'
      }
    }
  },
  'victor.aniceto.abbud@gmail.com': {
    obras: {
      'acuerdo': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/VictorAniceto/Acuerdo_VictorAbboud.jpeg'
      },
      'caracol': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/VictorAniceto/Caracol_VictorAbboud.jpeg'
      },
      'estructura': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/VictorAniceto/Estructura_VictorAbboud.jpeg'
      },
      'rebozo': {
        principal: '/Users/tonyprado/Documents/Proyectos/Benito-web/docs/transfer2AWS/ARTISTAS ARTEFACTO PROCESO INTERNO/VictorAniceto/Rebozo_VictorAbboud.jpeg'
      }
    }
  }
};

(async () => {
  try {
    console.log('🚀 Iniciando migración de fotos a AWS S3...\n');

    let totalFotosSubidas = 0;
    let totalErrors = 0;

    for (const [email, data] of Object.entries(artistasData)) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`📧 Procesando artista: ${email}`);
      console.log(`${'='.repeat(80)}\n`);

      // 1. Buscar artista en BD
      const artistaResult = await pool.query(
        'SELECT id, nombre, apellido FROM artistas WHERE email = $1',
        [email]
      );

      if (artistaResult.rows.length === 0) {
        console.log(`❌ Artista no encontrado: ${email}`);
        totalErrors++;
        continue;
      }

      const artista = artistaResult.rows[0];
      console.log(`✅ Artista encontrado: ${artista.nombre} ${artista.apellido} (ID: ${artista.id})`);

      // 2. Subir foto de perfil si existe
      if (data.fotoPerfil) {
        console.log(`\n📸 Subiendo foto de perfil...`);
        try {
          if (!fs.existsSync(data.fotoPerfil)) {
            console.log(`   ⚠️  Archivo no encontrado: ${data.fotoPerfil}`);
            totalErrors++;
          } else {
            const buffer = fs.readFileSync(data.fotoPerfil);
            const filename = data.fotoPerfil.split('/').pop();
            const fotoUrl = await uploadToS3(buffer, filename, 'image/jpeg', 'artistas/perfiles');

            await pool.query(
              'UPDATE artistas SET foto = $1 WHERE id = $2',
              [fotoUrl, artista.id]
            );

            console.log(`   ✅ Foto de perfil subida: ${fotoUrl}`);
            totalFotosSubidas++;
          }
        } catch (error) {
          console.log(`   ❌ Error subiendo foto de perfil: ${error.message}`);
          totalErrors++;
        }
      }

      // 3. Procesar obras
      if (data.obras) {
        console.log(`\n🎨 Procesando ${Object.keys(data.obras).length} obras...`);

        for (const [nombreObra, obraData] of Object.entries(data.obras)) {
          console.log(`\n  📝 Obra: "${nombreObra}"`);

          // Subir foto principal primero (requerida para crear la obra)
          let imagenUrl = null;
          if (obraData.principal) {
            try {
              if (!fs.existsSync(obraData.principal)) {
                console.log(`     ⚠️  Archivo no encontrado: ${obraData.principal}`);
                totalErrors++;
                continue; // Sin foto principal no podemos crear la obra
              } else {
                const buffer = fs.readFileSync(obraData.principal);
                const filename = obraData.principal.split('/').pop();
                imagenUrl = await uploadToS3(buffer, filename, 'image/jpeg', 'artistas/obras');
                console.log(`     ✅ Foto principal subida`);
                totalFotosSubidas++;
              }
            } catch (error) {
              console.log(`     ❌ Error subiendo foto principal: ${error.message}`);
              totalErrors++;
              continue; // Sin foto principal no podemos crear la obra
            }
          } else {
            console.log(`     ⚠️  No hay foto principal definida`);
            totalErrors++;
            continue;
          }

          // Buscar o crear obra en BD
          let obraResult = await pool.query(
            'SELECT id, titulo FROM obras WHERE artista_id = $1 AND titulo = $2',
            [artista.id, nombreObra]
          );

          let obra;
          if (obraResult.rows.length === 0) {
            // Crear la obra con la foto ya subida
            console.log(`     📝 Creando obra en BD: "${nombreObra}"`);
            const insertResult = await pool.query(
              `INSERT INTO obras (artista_id, titulo, imagen_url, tecnica, anio, notas)
               VALUES ($1, $2, $3, $4, $5, $6)
               RETURNING id, titulo`,
              [artista.id, nombreObra, imagenUrl, '', null, '']
            );
            obra = insertResult.rows[0];
            console.log(`     ✅ Obra creada (ID: ${obra.id})`);
          } else {
            obra = obraResult.rows[0];
            console.log(`     ✅ Obra encontrada (ID: ${obra.id})`);
            // Actualizar imagen_url
            await pool.query(
              'UPDATE obras SET imagen_url = $1 WHERE id = $2',
              [imagenUrl, obra.id]
            );
            console.log(`     ✅ Imagen actualizada`);
          }

          // Subir fotos de detalles
          if (obraData.detalles && obraData.detalles.length > 0) {
            console.log(`     📷 Subiendo ${obraData.detalles.length} fotos de detalle...`);
            const detalleUrls = [];

            for (let i = 0; i < obraData.detalles.length; i++) {
              const detallePath = obraData.detalles[i];
              try {
                if (!fs.existsSync(detallePath)) {
                  console.log(`        ⚠️  Detalle ${i+1}: Archivo no encontrado`);
                  totalErrors++;
                } else {
                  const buffer = fs.readFileSync(detallePath);
                  const filename = detallePath.split('/').pop();
                  const detalleUrl = await uploadToS3(buffer, filename, 'image/jpeg', 'artistas/obras/detalles');
                  detalleUrls.push(detalleUrl);
                  console.log(`        ✅ Detalle ${i+1}/${obraData.detalles.length} subido`);
                  totalFotosSubidas++;
                }
              } catch (error) {
                console.log(`        ❌ Error subiendo detalle ${i+1}: ${error.message}`);
                totalErrors++;
              }
            }

            // Actualizar fotos_detalle_urls
            if (detalleUrls.length > 0) {
              await pool.query(
                'UPDATE obras SET fotos_detalle_urls = $1 WHERE id = $2',
                [JSON.stringify(detalleUrls), obra.id]
              );
              console.log(`     ✅ ${detalleUrls.length} fotos de detalle guardadas en BD`);
            }
          }
        }
      }
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log(`🎉 MIGRACIÓN COMPLETADA`);
    console.log(`${'='.repeat(80)}`);
    console.log(`✅ Total de fotos subidas: ${totalFotosSubidas}`);
    console.log(`❌ Total de errores: ${totalErrors}`);
    console.log(`${'='.repeat(80)}\n`);

    await pool.end();
  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  }
})();
