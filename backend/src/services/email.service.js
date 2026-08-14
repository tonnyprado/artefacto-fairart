/**
 * Servicio de Email con Brevo (ex-Sendinblue)
 * Usa la API REST directamente para mayor compatibilidad
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

// Configuración
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'contacto@artefact.mx'
const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'ARTEFACTO Feria de Arte'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@artefact.mx'

/**
 * Verificar si Brevo está configurado
 */
export const isBrevoConfigured = () => {
  return !!(process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL)
}

/**
 * Enviar email usando la API REST de Brevo
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
 * Notificar al admin cuando llega un nuevo mensaje de contacto
 */
export const notificarNuevoMensaje = async (mensaje) => {
  const { nombre, email, telefono, asunto, mensaje: contenido } = mensaje

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
 */
export const enviarRespuestaMensaje = async (mensaje, respuesta, adminNombre = 'Equipo ARTEFACTO') => {
  const { nombre, email, asunto } = mensaje

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
 */
export const enviarConfirmacionRegistro = async (artista) => {
  const { nombre, apellido, email, folio, categoria } = artista

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
        .steps { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; }
        .step { display: flex; align-items: flex-start; margin-bottom: 15px; }
        .step-number { background: #3B82F6; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; margin-right: 15px; }
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
 */
export const notificarNuevoArtista = async (artista) => {
  const { nombre, apellido, email, folio, categoria } = artista

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
        .btn { display: inline-block; background: #B83030; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin:0;font-size:24px;">Nuevo Artista Registrado</h1>
        </div>
        <div class="content">
          <div class="field"><div class="field-label">Nombre</div><div><strong>${nombre} ${apellido}</strong></div></div>
          <div class="field"><div class="field-label">Email</div><div><a href="mailto:${email}">${email}</a></div></div>
          <div class="field"><div class="field-label">Folio</div><div style="font-family:monospace;font-size:18px;">${folio}</div></div>
          <div class="field"><div class="field-label">Categoría</div><div>${categoria}</div></div>
          <center><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin" class="btn">Revisar en Panel de Admin</a></center>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: ADMIN_EMAIL,
    toName: 'Administrador',
    subject: `[Nuevo Artista] ${nombre} ${apellido} - ${categoria}`,
    htmlContent
  })
}

export default {
  isBrevoConfigured,
  sendEmail,
  notificarNuevoMensaje,
  enviarRespuestaMensaje,
  enviarConfirmacionRegistro,
  notificarNuevoArtista
}
