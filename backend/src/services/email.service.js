/**
 * Servicio de Email con Brevo (ex-Sendinblue)
 * Maneja el envío de correos electrónicos transaccionales
 */

import * as brevo from '@getbrevo/brevo'

// Configurar cliente de Brevo
const apiInstance = new brevo.TransactionalEmailsApi()

// Configurar autenticación
const apiKey = apiInstance.authentications['apiKey']
apiKey.apiKey = process.env.BREVO_API_KEY

// Email del remitente (debe estar verificado en Brevo)
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'contacto@artefact.mx'
const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'ARTEFACTO Feria de Arte'

// Email del admin para notificaciones
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@artefact.mx'

/**
 * Verificar si Brevo está configurado
 */
export const isBrevoConfigured = () => {
  return !!(process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL)
}

/**
 * Enviar email genérico
 * @param {Object} options - Opciones del email
 * @param {string} options.to - Email del destinatario
 * @param {string} options.toName - Nombre del destinatario
 * @param {string} options.subject - Asunto del email
 * @param {string} options.htmlContent - Contenido HTML
 * @param {string} options.textContent - Contenido de texto plano (opcional)
 * @returns {Promise<Object>} - Respuesta de Brevo
 */
export const sendEmail = async ({ to, toName, subject, htmlContent, textContent }) => {
  if (!isBrevoConfigured()) {
    console.warn('⚠️ Brevo no configurado. Email no enviado.')
    return { success: false, error: 'Brevo no configurado' }
  }

  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail()

    sendSmtpEmail.sender = { email: SENDER_EMAIL, name: SENDER_NAME }
    sendSmtpEmail.to = [{ email: to, name: toName || to }]
    sendSmtpEmail.subject = subject
    sendSmtpEmail.htmlContent = htmlContent
    if (textContent) {
      sendSmtpEmail.textContent = textContent
    }

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail)
    console.log('✅ Email enviado exitosamente:', { to, subject, messageId: result.messageId })

    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('❌ Error enviando email:', error.message || error)
    return { success: false, error: error.message || 'Error desconocido' }
  }
}

/**
 * Enviar notificación al admin cuando llega un nuevo mensaje de contacto
 * @param {Object} mensaje - Datos del mensaje
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
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px; }
        .field { margin-bottom: 20px; }
        .field-label { font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
        .field-value { margin-top: 5px; font-size: 16px; }
        .message-box { background: white; padding: 20px; border-left: 4px solid #B83030; margin-top: 10px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .btn { display: inline-block; background: #B83030; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Nuevo Mensaje de Contacto</h1>
        </div>
        <div class="content">
          <div class="field">
            <div class="field-label">De</div>
            <div class="field-value"><strong>${nombre}</strong></div>
          </div>
          <div class="field">
            <div class="field-label">Email</div>
            <div class="field-value"><a href="mailto:${email}">${email}</a></div>
          </div>
          ${telefono ? `
          <div class="field">
            <div class="field-label">Teléfono</div>
            <div class="field-value">${telefono}</div>
          </div>
          ` : ''}
          <div class="field">
            <div class="field-label">Asunto</div>
            <div class="field-value">${asunto}</div>
          </div>
          <div class="field">
            <div class="field-label">Mensaje</div>
            <div class="message-box">${contenido.replace(/\n/g, '<br>')}</div>
          </div>
          <center>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin" class="btn">
              Ver en Panel de Admin
            </a>
          </center>
        </div>
        <div class="footer">
          ARTEFACTO 2027 - Sistema de Notificaciones
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: ADMIN_EMAIL,
    toName: 'Administrador ARTEFACTO',
    subject: `[Nuevo Mensaje] ${asunto} - de ${nombre}`,
    htmlContent
  })
}

/**
 * Enviar respuesta a un mensaje de contacto
 * @param {Object} mensaje - Datos del mensaje original
 * @param {string} respuesta - Texto de la respuesta
 * @param {string} adminNombre - Nombre del admin que responde
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
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 10px 0 0; opacity: 0.9; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px; }
        .greeting { font-size: 18px; margin-bottom: 20px; }
        .response-box { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; }
        .original-box { background: #f0f0f0; padding: 15px; border-left: 4px solid #ccc; margin-top: 30px; font-size: 14px; color: #666; }
        .original-label { font-weight: 600; font-size: 12px; text-transform: uppercase; color: #999; margin-bottom: 10px; }
        .signature { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .social { margin-top: 15px; }
        .social a { color: #B83030; text-decoration: none; margin: 0 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ARTEFACTO 2027</h1>
          <p>Respuesta a tu mensaje</p>
        </div>
        <div class="content">
          <div class="greeting">
            Hola <strong>${nombre}</strong>,
          </div>
          <p>Gracias por contactarnos. A continuación nuestra respuesta:</p>

          <div class="response-box">
            ${respuesta.replace(/\n/g, '<br>')}
          </div>

          <div class="original-box">
            <div class="original-label">Tu mensaje original:</div>
            <strong>Asunto:</strong> ${asunto}<br>
            <strong>Mensaje:</strong> ${mensaje.mensaje ? mensaje.mensaje.substring(0, 200) + (mensaje.mensaje.length > 200 ? '...' : '') : ''}
          </div>

          <div class="signature">
            <p>
              Saludos cordiales,<br>
              <strong>${adminNombre}</strong><br>
              <span style="color: #666;">Equipo ARTEFACTO</span>
            </p>
          </div>
        </div>
        <div class="footer">
          <p>ARTEFACTO - Feria de Arte 2027</p>
          <div class="social">
            <a href="https://instagram.com/artefacto">Instagram</a>
            <a href="https://artefact.mx">Sitio Web</a>
          </div>
          <p style="margin-top: 15px; font-size: 11px; color: #999;">
            Este es un correo automático. Si tienes más preguntas, puedes responder directamente a este email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    toName: nombre,
    subject: `Re: ${asunto} - ARTEFACTO`,
    htmlContent
  })
}

/**
 * Enviar confirmación de registro a artista
 * @param {Object} artista - Datos del artista
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
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 15px 0 0; opacity: 0.9; font-size: 16px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px; }
        .folio-box { background: linear-gradient(135deg, #3B82F6, #9333EA); color: white; padding: 25px; border-radius: 12px; text-align: center; margin: 20px 0; }
        .folio-label { font-size: 14px; opacity: 0.9; }
        .folio-number { font-size: 36px; font-weight: 700; font-family: monospace; letter-spacing: 2px; margin: 10px 0; }
        .steps { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; }
        .step { display: flex; align-items: flex-start; margin-bottom: 15px; }
        .step-number { background: #3B82F6; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; margin-right: 15px; flex-shrink: 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ARTEFACTO 2027</h1>
          <p>Tu registro ha sido recibido</p>
        </div>
        <div class="content">
          <p style="font-size: 18px;">
            Hola <strong>${nombre} ${apellido}</strong>,
          </p>
          <p>
            Tu solicitud de participación en ARTEFACTO 2027 ha sido recibida exitosamente.
            Nuestro equipo de curadores revisará tu portafolio y te contactaremos pronto.
          </p>

          <div class="folio-box">
            <div class="folio-label">Tu folio de registro es:</div>
            <div class="folio-number">${folio}</div>
            <div class="folio-label">Guarda este número para dar seguimiento</div>
          </div>

          <div class="steps">
            <h3 style="margin-top: 0;">Próximos pasos:</h3>
            <div class="step">
              <div class="step-number">1</div>
              <div>Nuestro equipo de curadores revisará tu portafolio y propuesta artística.</div>
            </div>
            <div class="step">
              <div class="step-number">2</div>
              <div>Recibirás un correo con los resultados de la selección.</div>
            </div>
            <div class="step">
              <div class="step-number">3</div>
              <div>Si eres seleccionado, te enviaremos información de pago y participación.</div>
            </div>
          </div>

          <p style="background: #FEF3C7; padding: 15px; border-radius: 8px; font-size: 14px;">
            <strong>Importante:</strong> Revisa tu correo (incluyendo spam) en los próximos días.
          </p>
        </div>
        <div class="footer">
          <p>ARTEFACTO - Feria de Arte 2027</p>
          <p style="font-size: 11px; color: #999;">
            ¿Dudas? Contáctanos en contacto@artefact.mx
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    toName: `${nombre} ${apellido}`,
    subject: `Registro Recibido - ARTEFACTO 2027 [Folio: ${folio}]`,
    htmlContent
  })
}

/**
 * Notificar al admin de nuevo registro de artista
 * @param {Object} artista - Datos del artista
 */
export const notificarNuevoArtista = async (artista) => {
  const { nombre, apellido, email, folio, categoria, paquete_id } = artista

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px; }
        .field { margin-bottom: 15px; }
        .field-label { font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; }
        .field-value { font-size: 16px; margin-top: 5px; }
        .btn { display: inline-block; background: #B83030; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Nuevo Artista Registrado</h1>
        </div>
        <div class="content">
          <div class="field">
            <div class="field-label">Nombre</div>
            <div class="field-value"><strong>${nombre} ${apellido}</strong></div>
          </div>
          <div class="field">
            <div class="field-label">Email</div>
            <div class="field-value"><a href="mailto:${email}">${email}</a></div>
          </div>
          <div class="field">
            <div class="field-label">Folio</div>
            <div class="field-value" style="font-family: monospace; font-size: 18px;">${folio}</div>
          </div>
          <div class="field">
            <div class="field-label">Categoría</div>
            <div class="field-value">${categoria}</div>
          </div>
          <center>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin" class="btn">
              Revisar en Panel de Admin
            </a>
          </center>
        </div>
        <div class="footer">
          ARTEFACTO 2027 - Sistema de Notificaciones
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: ADMIN_EMAIL,
    toName: 'Administrador ARTEFACTO',
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
