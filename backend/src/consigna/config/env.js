/**
 * Configuración centralizada de variables de entorno para el módulo de consigna.
 * Valida que todas las variables requeridas estén presentes al iniciar.
 */

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  publicAppUrl: process.env.PUBLIC_APP_URL || '',
  diasVigencia: parseInt(process.env.INVITACION_DIAS_VIGENCIA || '4', 10),
  edicionSufijo: process.env.EDICION_SUFIJO || 'AF2',

  // AWS S3
  s3: {
    bucket: process.env.S3_CONSIGNA_BUCKET || '',
    prefix: process.env.S3_CONSIGNA_PREFIX || 'consigna/',
    region: process.env.AWS_REGION || 'us-east-1',
  },

  // Brevo
  brevo: {
    apiKey: process.env.BREVO_API_KEY || '',
    senderEmail: process.env.BREVO_SENDER_EMAIL || '',
    templates: {
      invitacion: parseInt(process.env.BREVO_TEMPLATE_CONSIGNA_INVITACION || '0', 10),
      rechazo: parseInt(process.env.BREVO_TEMPLATE_CONSIGNA_RECHAZO || '0', 10),
      acuerdo: parseInt(process.env.BREVO_TEMPLATE_CONSIGNA_ACUERDO || '0', 10),
    },
  },

  // Datos de pago
  pago: {
    beneficiario: process.env.PAGO_BENEFICIARIO || '',
    banco: process.env.PAGO_BANCO || '',
    clabe: process.env.PAGO_CLABE || '',
    cuenta: process.env.PAGO_CUENTA || '',
    plazos: process.env.PAGO_PLAZOS || '',
  },

  // Contacto
  contacto: {
    whatsapp: process.env.CONTACTO_WHATSAPP || '',
    url: process.env.CONTACTO_URL || '/#contacto',
  },

  // Assets
  firmaDireccionKey: process.env.FIRMA_DIRECCION_KEY || 'assets/firma-direccion.png',

  // Admin
  adminEmails: (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim())
    .filter(Boolean),
};

/**
 * Valida que las variables críticas estén configuradas.
 * @throws {Error} Si falta alguna variable requerida
 */
export function validarConfig() {
  const requeridas = [
    ['PUBLIC_APP_URL', config.publicAppUrl],
    ['S3_CONSIGNA_BUCKET', config.s3.bucket],
    ['BREVO_API_KEY', config.brevo.apiKey],
    ['BREVO_SENDER_EMAIL', config.brevo.senderEmail],
    ['PAGO_BENEFICIARIO', config.pago.beneficiario],
    ['PAGO_CLABE', config.pago.clabe],
  ];

  const faltantes = requeridas
    .filter(([, valor]) => !valor)
    .map(([nombre]) => nombre);

  if (faltantes.length > 0) {
    throw new Error(
      `Faltan variables de entorno requeridas para Consigna: ${faltantes.join(', ')}`
    );
  }

  if (config.nodeEnv === 'production') {
    console.log('✅ Configuración de Consigna validada');
  }
}
