#!/usr/bin/env node
/**
 * Script para configurar CORS en el bucket de S3
 *
 * Uso:
 *   node backend/scripts/configurar-cors-s3.js
 *
 * Requisitos:
 *   - Variables de entorno AWS_ACCESS_KEY_ID y AWS_SECRET_ACCESS_KEY configuradas
 *   - O perfil AWS configurado en ~/.aws/credentials
 */

import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from '@aws-sdk/client-s3';

const BUCKET_NAME = 'artefacto-artistas';
const REGION = 'us-east-2';

// Dominios permitidos
const ALLOWED_ORIGINS = [
  'https://arte-facto.mx',
  'https://www.arte-facto.mx',
  'http://localhost:3000',  // Para desarrollo local
];

const corsConfiguration = {
  CORSRules: [
    {
      ID: 'AllowConsignaUploads',
      AllowedOrigins: ALLOWED_ORIGINS,
      AllowedMethods: ['GET', 'PUT', 'POST', 'HEAD'],
      AllowedHeaders: [
        '*',
        'Content-Type',
        'x-amz-server-side-encryption',
        'x-amz-checksum-crc32',
        'x-amz-sdk-checksum-algorithm',
      ],
      ExposeHeaders: [
        'ETag',
        'x-amz-server-side-encryption',
        'x-amz-request-id',
        'x-amz-id-2',
      ],
      MaxAgeSeconds: 3600,
    },
  ],
};

async function configurarCORS() {
  const s3 = new S3Client({ region: REGION });

  console.log(`\n🔧 Configurando CORS para el bucket: ${BUCKET_NAME}`);
  console.log(`📍 Región: ${REGION}`);
  console.log(`🌐 Orígenes permitidos:`, ALLOWED_ORIGINS);

  try {
    // Intentar obtener la configuración CORS actual
    try {
      const currentCors = await s3.send(new GetBucketCorsCommand({ Bucket: BUCKET_NAME }));
      console.log('\n📋 Configuración CORS actual:');
      console.log(JSON.stringify(currentCors.CORSRules, null, 2));
    } catch (err) {
      if (err.name === 'NoSuchCORSConfiguration') {
        console.log('\n⚠️  No hay configuración CORS actual');
      } else {
        throw err;
      }
    }

    // Aplicar la nueva configuración CORS
    await s3.send(new PutBucketCorsCommand({
      Bucket: BUCKET_NAME,
      CORSConfiguration: corsConfiguration,
    }));

    console.log('\n✅ Configuración CORS aplicada exitosamente');
    console.log('\n📋 Nueva configuración:');
    console.log(JSON.stringify(corsConfiguration.CORSRules, null, 2));

    // Verificar la configuración aplicada
    const newCors = await s3.send(new GetBucketCorsCommand({ Bucket: BUCKET_NAME }));
    console.log('\n✅ Verificación - Configuración actual en S3:');
    console.log(JSON.stringify(newCors.CORSRules, null, 2));

    console.log('\n🎉 ¡CORS configurado correctamente!');
    console.log('\n💡 Nota: Los cambios pueden tardar unos segundos en propagarse.');

  } catch (error) {
    console.error('\n❌ Error al configurar CORS:');
    console.error(error.message);

    if (error.name === 'AccessDenied') {
      console.error('\n💡 Verifica que tus credenciales AWS tengan permisos s3:PutBucketCors y s3:GetBucketCors');
    }

    process.exit(1);
  }
}

// Ejecutar
configurarCORS();
