import { S3Client } from '@aws-sdk/client-s3';
import pool from '../config/database.js';

// Config
import { config, validarConfig } from './config/env.js';

// Repositories
import { PgRegistroArtistasLectura } from './repositories/pg/PgRegistroArtistasLectura.js';
import {
  PgInvitacionesRepo,
  PgBorradoresRepo,
  PgAcuerdosRepo,
  PgEventosRepo,
} from './repositories/pg/PgConsignaRepos.js';

// Infrastructure
import { S3Almacenamiento } from './infra/almacenamiento.js';
import { BrevoNotificador, ConsolaNotificador } from './infra/notificaciones.js';

// PDF
import { PdfKitGenerador } from './pdf/PdfKitGenerador.js';

// Services
import { TokenService } from './services/TokenService.js';
import { InvitacionService } from './services/InvitacionService.js';
import { ConsignaService } from './services/ConsignaService.js';

// HTTP
import { ConsignaController } from './http/controller.js';

/**
 * Crea el contenedor de dependencias para el módulo de consigna.
 * Composición de objetos siguiendo el patrón Dependency Injection.
 *
 * @returns {{
 *   db: import('pg').Pool,
 *   invitaciones: InvitacionService,
 *   consigna: ConsignaService,
 *   controller: ConsignaController,
 *   archivos: import('./infra/almacenamiento.js').S3Almacenamiento
 * }}
 */
export function crearContenedor() {
  // Validar configuración
  if (config.nodeEnv === 'production') {
    validarConfig();
  }

  // ==========================================
  // REPOSITORIOS (capa de datos)
  // ==========================================
  const registro = new PgRegistroArtistasLectura(pool);
  const invitacionesRepo = new PgInvitacionesRepo(pool);
  const borradoresRepo = new PgBorradoresRepo(pool);
  const acuerdosRepo = new PgAcuerdosRepo(pool);
  const eventosRepo = new PgEventosRepo(pool);

  // ==========================================
  // INFRAESTRUCTURA (servicios externos)
  // ==========================================

  // S3 para almacenamiento de archivos
  const s3 = new S3Client({
    region: config.s3.region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const archivos = new S3Almacenamiento(s3, config.s3.bucket, config.s3.prefix);

  // Brevo para notificaciones por email
  const correo =
    config.nodeEnv === 'production'
      ? new BrevoNotificador(config.brevo.apiKey, config.brevo.senderEmail)
      : new ConsolaNotificador();

  // PDFKit para generación de PDFs
  const pdfGenerador = new PdfKitGenerador();

  // Token service para generación y hashing
  const tokens = new TokenService();

  // ==========================================
  // SERVICIOS DE DOMINIO (lógica de negocio)
  // ==========================================

  const invitaciones = new InvitacionService(
    invitacionesRepo,
    registro,
    eventosRepo,
    tokens,
    config.publicAppUrl,
    config.diasVigencia
  );

  const consigna = new ConsignaService(
    registro,
    borradoresRepo,
    acuerdosRepo,
    eventosRepo,
    archivos,
    pdfGenerador,
    correo,
    {
      pago: config.pago,
      sufijoEdicion: config.edicionSufijo,
      contacto: config.contacto,
      firmaDireccionKey: config.firmaDireccionKey,
      correosAdmin: config.adminEmails,
    }
  );

  // ==========================================
  // CAPA HTTP (controllers)
  // ==========================================

  const controller = new ConsignaController(invitaciones, consigna);

  // ==========================================
  // RETORNAR CONTENEDOR
  // ==========================================

  return {
    // Para uso interno
    db: pool,
    invitaciones,
    consigna,
    archivos,

    // Para integración en Express
    controller,
  };
}

/**
 * Singleton para reutilizar la misma instancia en toda la app
 */
let _contenedor = null;

/**
 * Obtiene o crea el contenedor singleton
 * @returns {ReturnType<typeof crearContenedor>}
 */
export function obtenerContenedor() {
  if (!_contenedor) {
    _contenedor = crearContenedor();
  }
  return _contenedor;
}
