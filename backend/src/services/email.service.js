/**
 * Servicio de Email con Brevo (ex-Sendinblue)
 * Usa la API REST directamente para mayor compatibilidad
 * Soporta plantillas creadas en Brevo con parámetros dinámicos
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

// Configuración
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'contacto@artefact.mx'
const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'ARTEFACTO Feria de Arte'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@artefact.mx'

// IDs de plantillas de Brevo (configurar en .env o usar defaults)
// ID=1 es la plantilla de confirmación de registro en Brevo
const TEMPLATES = {
  CONFIRMACION_REGISTRO: process.env.BREVO_TEMPLATE_CONFIRMACION_REGISTRO || '1', // Default: plantilla ID 1
  NUEVO_ARTISTA_ADMIN: process.env.BREVO_TEMPLATE_NUEVO_ARTISTA_ADMIN,
  NUEVO_MENSAJE_ADMIN: process.env.BREVO_TEMPLATE_NUEVO_MENSAJE_ADMIN,
  RESPUESTA_MENSAJE: process.env.BREVO_TEMPLATE_RESPUESTA_MENSAJE,
}

/**
 * Verificar si Brevo está configurado
 */
export const isBrevoConfigured = () => {
  return !!(process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL)
}

/**
 * Enviar email usando la API REST de Brevo (con HTML directo)
 */
export const sendEmail = async ({ to, toName, subject, htmlContent, textContent }) => {
  if (!isBrevoConfigured()) {
    console.warn('⚠️ Brevo no configurado. Email no enviado.')
    return { success: false, error: 'Brevo no configurado' }
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { email: SENDER_EMAIL, name: SENDER_NAME },
        to: [{ email: to, name: toName || to }],
        subject: subject,
        htmlContent: htmlContent,
        textContent: textContent || undefined
      })
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('❌ Error de Brevo:', result)
      return { success: false, error: result.message || 'Error de Brevo' }
    }

    console.log('✅ Email enviado:', { to, subject, messageId: result.messageId })
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('❌ Error enviando email:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Enviar email usando una plantilla de Brevo
 * Los parámetros se usan en la plantilla como {{ params.nombre }}, {{ params.folio }}, etc.
 *
 * @param {Object} options
 * @param {string} options.to - Email del destinatario
 * @param {string} options.toName - Nombre del destinatario
 * @param {number} options.templateId - ID de la plantilla en Brevo
 * @param {Object} options.params - Parámetros para la plantilla (ej: { folio: 'AF-001', nombre: 'Juan' })
 * @param {string} options.subject - Asunto (opcional, puede estar definido en la plantilla)
 */
export const sendEmailWithTemplate = async ({ to, toName, templateId, params, subject }) => {
  if (!isBrevoConfigured()) {
    console.warn('⚠️ Brevo no configurado. Email no enviado.')
    return { success: false, error: 'Brevo no configurado' }
  }

  if (!templateId) {
    console.error('❌ No se especificó templateId')
    return { success: false, error: 'templateId es requerido' }
  }

  try {
    const emailData = {
      sender: { email: SENDER_EMAIL, name: SENDER_NAME },
      to: [{ email: to, name: toName || to }],
      templateId: parseInt(templateId),
      params: params || {}
    }

    // El subject es opcional si ya está definido en la plantilla
    if (subject) {
      emailData.subject = subject
    }

    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify(emailData)
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('❌ Error de Brevo (template):', result)
      return { success: false, error: result.message || 'Error de Brevo' }
    }

    console.log('✅ Email con plantilla enviado:', { to, templateId, messageId: result.messageId })
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('❌ Error enviando email con plantilla:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Notificar al admin cuando llega un nuevo mensaje de contacto
 * Usa plantilla de Brevo si está configurada, sino usa HTML por defecto
 */
export const notificarNuevoMensaje = async (mensaje) => {
  const { nombre, email, telefono, asunto, mensaje: contenido } = mensaje

  // Si hay plantilla configurada, usarla
  if (TEMPLATES.NUEVO_MENSAJE_ADMIN) {
    return sendEmailWithTemplate({
      to: ADMIN_EMAIL,
      toName: 'Administrador',
      templateId: TEMPLATES.NUEVO_MENSAJE_ADMIN,
      params: {
        nombre,
        email,
        telefono: telefono || 'No proporcionado',
        asunto,
        mensaje: contenido,
        adminUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin`
      }
    })
  }

  // Fallback: HTML por defecto
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #B83030, #141210); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px; }
        .field { margin-bottom: 20px; }
        .field-label { font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; }
        .message-box { background: white; padding: 20px; border-left: 4px solid #B83030; margin-top: 10px; }
        .btn { display: inline-block; background: #B83030; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin:0;font-size:24px;">Nuevo Mensaje de Contacto</h1>
        </div>
        <div class="content">
          <div class="field">
            <div class="field-label">De</div>
            <div><strong>${nombre}</strong></div>
          </div>
          <div class="field">
            <div class="field-label">Email</div>
            <div><a href="mailto:${email}">${email}</a></div>
          </div>
          ${telefono ? `<div class="field"><div class="field-label">Teléfono</div><div>${telefono}</div></div>` : ''}
          <div class="field">
            <div class="field-label">Asunto</div>
            <div>${asunto}</div>
          </div>
          <div class="field">
            <div class="field-label">Mensaje</div>
            <div class="message-box">${contenido.replace(/\n/g, '<br>')}</div>
          </div>
          <center>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin" class="btn">Ver en Panel de Admin</a>
          </center>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: ADMIN_EMAIL,
    toName: 'Administrador',
    subject: `[Nuevo Mensaje] ${asunto} - de ${nombre}`,
    htmlContent
  })
}

/**
 * Enviar respuesta a un mensaje de contacto
 * Usa plantilla de Brevo si está configurada, sino usa HTML por defecto
 */
export const enviarRespuestaMensaje = async (mensaje, respuesta, adminNombre = 'Equipo ARTEFACTO') => {
  const { nombre, email, asunto } = mensaje

  // Si hay plantilla configurada, usarla
  if (TEMPLATES.RESPUESTA_MENSAJE) {
    return sendEmailWithTemplate({
      to: email,
      toName: nombre,
      templateId: TEMPLATES.RESPUESTA_MENSAJE,
      params: {
        nombre,
        asunto,
        respuesta,
        mensajeOriginal: mensaje.mensaje ? mensaje.mensaje.substring(0, 200) + (mensaje.mensaje.length > 200 ? '...' : '') : '',
        adminNombre
      }
    })
  }

  // Fallback: HTML por defecto
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #B83030, #141210); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px; }
        .response-box { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; }
        .original-box { background: #f0f0f0; padding: 15px; border-left: 4px solid #ccc; margin-top: 30px; font-size: 14px; color: #666; }
        .signature { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin:0;font-size:24px;">ARTE FACTO</h1>
          <p style="margin:10px 0 0;opacity:0.9;">Respuesta a tu mensaje</p>
        </div>
        <div class="content">
          <p style="font-size:18px;">Hola <strong>${nombre}</strong>,</p>
          <p>Gracias por contactarnos. A continuación nuestra respuesta:</p>
          <div class="response-box">${respuesta.replace(/\n/g, '<br>')}</div>
          <div class="original-box">
            <strong>Tu mensaje original:</strong><br>
            <strong>Asunto:</strong> ${asunto}<br>
            ${mensaje.mensaje ? mensaje.mensaje.substring(0, 200) + (mensaje.mensaje.length > 200 ? '...' : '') : ''}
          </div>
          <div class="signature">
            <p>Saludos cordiales,<br><strong>${adminNombre}</strong><br><span style="color:#666;">Equipo ARTE FACTO</span></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    toName: nombre,
    subject: `Re: ${asunto} - ARTE FACTO`,
    htmlContent
  })
}

/**
 * Enviar confirmación de registro a artista
 * Usa plantilla de Brevo (ID=1 por defecto) con parámetros dinámicos
 *
 * Parámetros disponibles para la plantilla de Brevo:
 * - nombre, apellido, nombreCompleto
 * - email, folio, categoria
 * - faseNombre, faseTipo, faseNumero, esConcurso
 * - paqueteNombre, paqueteTipo, paquetePrecio
 * - fecha (fecha actual)
 * - anio (año del evento)
 */
export const enviarConfirmacionRegistro = async (artista) => {
  const {
    nombre, apellido, email, folio, categoria,
    faseNombre, faseTipo, faseNumero,
    paqueteNombre, paqueteTipo, paquetePrecio
  } = artista

  // Siempre intentar usar plantilla de Brevo (ID=1 por defecto)
  if (TEMPLATES.CONFIRMACION_REGISTRO) {
    console.log('📧 Enviando email con plantilla Brevo ID:', TEMPLATES.CONFIRMACION_REGISTRO)

    return sendEmailWithTemplate({
      to: email,
      toName: `${nombre} ${apellido}`,
      templateId: TEMPLATES.CONFIRMACION_REGISTRO,
      params: {
        // Datos del artista
        nombre,
        apellido,
        nombreCompleto: `${nombre} ${apellido}`,
        NOMBRE: nombre, // Alias en mayúsculas por si la plantilla lo usa así
        APELLIDO: apellido,
        folio,
        FOLIO: folio,
        categoria,
        CATEGORIA: categoria,
        email,
        EMAIL: email,
        // Fase/Concurso
        faseNombre: faseNombre || 'Sin fase asignada',
        faseTipo: faseTipo || '',
        faseNumero: faseNumero || '',
        esConcurso: faseTipo === 'concurso',
        fase: faseNombre || 'Convocatoria General',
        FASE: faseNombre || 'Convocatoria General',
        // Paquete
        paqueteNombre: paqueteNombre || 'Sin paquete',
        paqueteTipo: paqueteTipo || '',
        paquetePrecio: paquetePrecio ? `$${parseFloat(paquetePrecio).toLocaleString('es-MX')} MXN` : '',
        paquete: paqueteNombre || 'Sin paquete',
        PAQUETE: paqueteNombre || 'Sin paquete',
        precio: paquetePrecio ? `$${parseFloat(paquetePrecio).toLocaleString('es-MX')} MXN` : '',
        PRECIO: paquetePrecio ? `$${parseFloat(paquetePrecio).toLocaleString('es-MX')} MXN` : '',
        // Fechas
        fecha: new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }),
        anio: '2027',
        year: '2027'
      }
    })
  }

  // Fallback: HTML por defecto
  const tipoInscripcion = faseTipo === 'concurso' ? 'Concurso' : (faseNombre || 'Convocatoria')

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #B83030, #141210); color: white; padding: 40px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px; }
        .folio-box { background: linear-gradient(135deg, #3B82F6, #9333EA); color: white; padding: 25px; border-radius: 12px; text-align: center; margin: 20px 0; }
        .folio-number { font-size: 36px; font-weight: 700; font-family: monospace; letter-spacing: 2px; margin: 10px 0; }
        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #B83030; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .info-row:last-child { border-bottom: none; }
        .info-label { color: #666; font-size: 13px; }
        .info-value { font-weight: 600; }
        .steps { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; }
        .step { display: flex; align-items: flex-start; margin-bottom: 15px; }
        .step-number { background: #3B82F6; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; margin-right: 15px; flex-shrink: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin:0;font-size:28px;">ARTE FACTO 2027</h1>
          <p style="margin:15px 0 0;opacity:0.9;">Tu registro ha sido recibido</p>
        </div>
        <div class="content">
          <p style="font-size:18px;">Hola <strong>${nombre} ${apellido}</strong>,</p>
          <p>Tu solicitud de participación ha sido recibida exitosamente. Nuestro equipo de curadores revisará tu portafolio y te contactaremos pronto.</p>
          <div class="folio-box">
            <div style="font-size:14px;opacity:0.9;">Tu folio de registro es:</div>
            <div class="folio-number">${folio}</div>
            <div style="font-size:12px;opacity:0.9;">Guarda este número para dar seguimiento</div>
          </div>
          <div class="info-box">
            <h3 style="margin-top:0;margin-bottom:15px;">Detalles de tu inscripción</h3>
            <div class="info-row">
              <span class="info-label">Inscrito en:</span>
              <span class="info-value">${tipoInscripcion}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Categoría:</span>
              <span class="info-value">${categoria}</span>
            </div>
            ${paqueteNombre ? `
            <div class="info-row">
              <span class="info-label">Paquete:</span>
              <span class="info-value">${paqueteNombre} ${paqueteTipo ? `(${paqueteTipo})` : ''}</span>
            </div>
            ` : ''}
            ${paquetePrecio ? `
            <div class="info-row">
              <span class="info-label">Inversión:</span>
              <span class="info-value">$${parseFloat(paquetePrecio).toLocaleString('es-MX')} MXN</span>
            </div>
            ` : ''}
          </div>
          <div class="steps">
            <h3 style="margin-top:0;">Próximos pasos:</h3>
            <div class="step"><span class="step-number">1</span><span>Nuestro equipo de curadores revisará tu portafolio.</span></div>
            <div class="step"><span class="step-number">2</span><span>Recibirás un correo con los resultados de la selección.</span></div>
            <div class="step"><span class="step-number">3</span><span>Si eres seleccionado, te enviaremos información de pago.</span></div>
          </div>
          <p style="background:#FEF3C7;padding:15px;border-radius:8px;font-size:14px;">
            <strong>Importante:</strong> Revisa tu correo (incluyendo spam) en los próximos días.
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    toName: `${nombre} ${apellido}`,
    subject: `Registro Recibido - ARTE FACTO 2027 [Folio: ${folio}]`,
    htmlContent
  })
}

/**
 * Notificar al admin de nuevo registro de artista
 * Usa plantilla de Brevo si está configurada, sino usa HTML por defecto
 */
export const notificarNuevoArtista = async (artista) => {
  const {
    nombre, apellido, email, telefono, folio, categoria,
    faseNombre, faseTipo, faseNumero,
    paqueteNombre, paqueteTipo, paquetePrecio, paqueteMetros
  } = artista

  // Si hay plantilla configurada, usarla
  if (TEMPLATES.NUEVO_ARTISTA_ADMIN) {
    return sendEmailWithTemplate({
      to: ADMIN_EMAIL,
      toName: 'Administrador',
      templateId: TEMPLATES.NUEVO_ARTISTA_ADMIN,
      params: {
        nombre,
        apellido,
        nombreCompleto: `${nombre} ${apellido}`,
        email,
        telefono: telefono || 'No proporcionado',
        folio,
        categoria,
        // Fase/Concurso
        faseNombre: faseNombre || 'Sin fase asignada',
        faseTipo: faseTipo || '',
        faseNumero: faseNumero || '',
        esConcurso: faseTipo === 'concurso',
        // Paquete
        paqueteNombre: paqueteNombre || 'Sin paquete',
        paqueteTipo: paqueteTipo || '',
        paquetePrecio: paquetePrecio ? `$${parseFloat(paquetePrecio).toLocaleString('es-MX')} MXN` : '',
        paqueteMetros: paqueteMetros ? `${paqueteMetros}m` : '',
        adminUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin`
      }
    })
  }

  // Fallback: HTML por defecto
  const tipoInscripcion = faseTipo === 'concurso' ? 'Concurso' : (faseNombre || 'Convocatoria')

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px; }
        .field { margin-bottom: 15px; }
        .field-label { font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .badge-fase { background: #DBEAFE; color: #1D4ED8; }
        .badge-concurso { background: #FEF3C7; color: #B45309; }
        .btn { display: inline-block; background: #B83030; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin:0;font-size:24px;">Nuevo Artista Registrado</h1>
          <p style="margin:10px 0 0;opacity:0.9;">${tipoInscripcion}</p>
        </div>
        <div class="content">
          <div class="field"><div class="field-label">Nombre</div><div><strong>${nombre} ${apellido}</strong></div></div>
          <div class="field"><div class="field-label">Email</div><div><a href="mailto:${email}">${email}</a></div></div>
          <div class="field"><div class="field-label">Folio</div><div style="font-family:monospace;font-size:18px;">${folio}</div></div>
          <div class="field"><div class="field-label">Categoría</div><div>${categoria}</div></div>
          <div class="field">
            <div class="field-label">Inscripción</div>
            <div><span class="badge ${faseTipo === 'concurso' ? 'badge-concurso' : 'badge-fase'}">${tipoInscripcion}</span></div>
          </div>
          ${paqueteNombre ? `
          <div class="field">
            <div class="field-label">Paquete</div>
            <div><strong>${paqueteNombre}</strong> ${paqueteTipo ? `(${paqueteTipo})` : ''} ${paqueteMetros ? `- ${paqueteMetros}m` : ''}</div>
          </div>
          ` : ''}
          ${paquetePrecio ? `
          <div class="field">
            <div class="field-label">Inversión</div>
            <div style="color:#10B981;font-weight:600;">$${parseFloat(paquetePrecio).toLocaleString('es-MX')} MXN</div>
          </div>
          ` : ''}
          <center><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin" class="btn">Revisar en Panel de Admin</a></center>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: ADMIN_EMAIL,
    toName: 'Administrador',
    subject: `[Nuevo Artista] ${nombre} ${apellido} - ${categoria} (${tipoInscripcion})`,
    htmlContent
  })
}

export default {
  isBrevoConfigured,
  sendEmail,
  sendEmailWithTemplate,
  notificarNuevoMensaje,
  enviarRespuestaMensaje,
  enviarConfirmacionRegistro,
  notificarNuevoArtista
}
