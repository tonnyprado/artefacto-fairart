# Plantillas de Email en Brevo - Sistema de Consignación

Este documento contiene las 3 plantillas de email que deben crearse en Brevo para el sistema de consignación de ARTE FACTO.

## Acceso a Brevo

1. Ir a https://app.brevo.com/
2. Iniciar sesión con las credenciales de ARTE FACTO
3. Navegar a: **Campaigns** → **Templates** → **Create a template**

---

## Template 1: CONSIGNA_INVITACION (ID: 4)

### Configuración
- **Nombre**: CONSIGNA_INVITACION
- **Tipo**: Transactional
- **Asunto**: ¡Felicidades! Tu obra fue seleccionada para ARTE FACTO {{ params.edicion }}

### Contenido HTML

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitación - ARTE FACTO</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9fafb;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #000;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .content {
      margin: 30px 0;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .highlight {
      background-color: #fef3c7;
      padding: 20px;
      border-left: 4px solid #f59e0b;
      margin: 20px 0;
    }
    .cta-button {
      display: inline-block;
      background-color: #000;
      color: #fff !important;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 6px;
      font-weight: 600;
      text-align: center;
      margin: 20px 0;
      font-size: 16px;
    }
    .info-box {
      background-color: #f3f4f6;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .info-box p {
      margin: 5px 0;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
      text-align: center;
    }
    .warning {
      background-color: #fee2e2;
      border-left: 4px solid #dc2626;
      padding: 15px;
      margin: 20px 0;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ARTE FACTO</h1>
      <p>Feria de Arte Independiente</p>
    </div>

    <div class="content">
      <p class="greeting">¡Hola {{ params.nombre }}!</p>

      <div class="highlight">
        <strong>🎉 ¡Excelentes noticias!</strong><br>
        Tu obra ha sido seleccionada para participar en <strong>ARTE FACTO {{ params.edicion }}</strong>.
      </div>

      <p>Para formalizar tu participación, necesitamos que completes tu <strong>Hoja de Consignación</strong>.</p>

      <p>Este documento es fundamental ya que establece:</p>
      <ul>
        <li>Los términos de consignación de tus obras</li>
        <li>Los precios finales de venta</li>
        <li>Las condiciones de pago</li>
        <li>Tu información fiscal</li>
      </ul>

      <div style="text-align: center;">
        <a href="{{ params.link_consigna }}" class="cta-button">
          Completar Hoja de Consignación
        </a>
      </div>

      <div class="info-box">
        <p><strong>📋 Tu información:</strong></p>
        <p>Folio: <strong>{{ params.folio }}</strong></p>
        <p>Edición: <strong>{{ params.edicion }}</strong></p>
      </div>

      <div class="warning">
        <strong>⏰ Importante:</strong> Este enlace es válido por <strong>{{ params.dias_vigencia }} días</strong>.
        Después de este periodo, deberás solicitar un nuevo enlace.
      </div>

      <p><strong>¿Necesitas ayuda?</strong></p>
      <p>Si tienes alguna duda sobre el proceso, contáctanos:</p>
      <ul>
        <li>Email: <a href="mailto:hola@arte-facto.mx">hola@arte-facto.mx</a></li>
        <li>WhatsApp: +52 55 XXXX XXXX</li>
      </ul>

      <p>Estamos emocionados de tenerte en ARTE FACTO {{ params.edicion }}.</p>

      <p>
        Saludos cordiales,<br>
        <strong>Equipo ARTE FACTO</strong>
      </p>
    </div>

    <div class="footer">
      <p>© 2024 ARTE FACTO. Todos los derechos reservados.</p>
      <p>
        <a href="https://arte-facto.mx" style="color: #6b7280; text-decoration: none;">arte-facto.mx</a>
      </p>
    </div>
  </div>
</body>
</html>
```

### Variables requeridas
- `{{ params.nombre }}` - Nombre de pila del artista
- `{{ params.edicion }}` - Código de edición (ej: AF2, AF3)
- `{{ params.link_consigna }}` - URL única con token
- `{{ params.folio }}` - Folio del artista
- `{{ params.dias_vigencia }}` - Días de vigencia del link (4)

---

## Template 2: CONSIGNA_RECHAZO (ID: 5)

### Configuración
- **Nombre**: CONSIGNA_RECHAZO
- **Tipo**: Transactional
- **Asunto**: Resultado de tu postulación - ARTE FACTO {{ params.edicion }}

### Contenido HTML

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Postulación - ARTE FACTO</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9fafb;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #000;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .content {
      margin: 30px 0;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .info-box {
      background-color: #f3f4f6;
      padding: 20px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .cta-button {
      display: inline-block;
      background-color: #000;
      color: #fff !important;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 6px;
      font-weight: 600;
      text-align: center;
      margin: 20px 0;
      font-size: 16px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ARTE FACTO</h1>
      <p>Feria de Arte Independiente</p>
    </div>

    <div class="content">
      <p class="greeting">Hola {{ params.nombre }},</p>

      <p>Gracias por tu interés en participar en <strong>ARTE FACTO {{ params.edicion }}</strong>.</p>

      <p>Después de una cuidadosa revisión de todas las postulaciones recibidas, lamentamos informarte que en esta ocasión tu obra no ha sido seleccionada para formar parte de la feria.</p>

      <div class="info-box">
        <p>Recibimos un número excepcional de postulaciones de altísima calidad, lo que hizo el proceso de selección particularmente desafiante. Queremos que sepas que tu trabajo fue revisado con atención y apreciamos el esfuerzo que pusiste en tu postulación.</p>
      </div>

      <p><strong>No te desanimes.</strong> Te invitamos a seguir creando y a participar en nuestras futuras convocatorias.</p>

      <p>Mantente al tanto de nuestras próximas ediciones y eventos:</p>
      <ul>
        <li>Sitio web: <a href="https://arte-facto.mx">arte-facto.mx</a></li>
        <li>Instagram: <a href="https://instagram.com/artefacto.mx">@artefacto.mx</a></li>
        <li>Newsletter: <a href="https://arte-facto.mx/#contacto">Suscríbete aquí</a></li>
      </ul>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://arte-facto.mx" class="cta-button">
          Explorar ARTE FACTO
        </a>
      </div>

      <p>Agradecemos tu comprensión y te deseamos mucho éxito en tus proyectos artísticos.</p>

      <p>
        Con admiración,<br>
        <strong>Equipo ARTE FACTO</strong>
      </p>
    </div>

    <div class="footer">
      <p>© 2024 ARTE FACTO. Todos los derechos reservados.</p>
      <p>
        <a href="https://arte-facto.mx" style="color: #6b7280; text-decoration: none;">arte-facto.mx</a>
      </p>
    </div>
  </div>
</body>
</html>
```

### Variables requeridas
- `{{ params.nombre }}` - Nombre de pila del artista
- `{{ params.edicion }}` - Código de edición (ej: AF2, AF3)

---

## Template 3: CONSIGNA_ACUERDO (ID: 6)

### Configuración
- **Nombre**: CONSIGNA_ACUERDO
- **Tipo**: Transactional
- **Asunto**: ✅ Hoja de Consignación firmada - {{ params.folio }}

### Contenido HTML

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Acuerdo Firmado - ARTE FACTO</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9fafb;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #000;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .content {
      margin: 30px 0;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .success-box {
      background-color: #d1fae5;
      border-left: 4px solid #10b981;
      padding: 20px;
      margin: 20px 0;
    }
    .info-box {
      background-color: #f3f4f6;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .info-box p {
      margin: 5px 0;
    }
    .next-steps {
      background-color: #dbeafe;
      border-left: 4px solid #3b82f6;
      padding: 20px;
      margin: 20px 0;
    }
    .next-steps h3 {
      margin-top: 0;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ARTE FACTO</h1>
      <p>Feria de Arte Independiente</p>
    </div>

    <div class="content">
      <p class="greeting">¡Hola {{ params.nombre }}!</p>

      <div class="success-box">
        <strong>✅ ¡Hoja de Consignación firmada exitosamente!</strong><br>
        Hemos recibido y procesado tu acuerdo de consignación.
      </div>

      <p>Tu participación en <strong>ARTE FACTO {{ params.edicion }}</strong> ha sido confirmada.</p>

      <div class="info-box">
        <p><strong>📋 Información del acuerdo:</strong></p>
        <p>Folio: <strong>{{ params.folio }}</strong></p>
        <p>Fecha de firma: <strong>{{ params.fecha_firma }}</strong></p>
        <p>Obras consignadas: <strong>{{ params.total_obras }}</strong></p>
      </div>

      <p><strong>📎 Adjunto a este correo:</strong></p>
      <ul>
        <li>Hoja de Consignación firmada (PDF)</li>
        <li>Desglose de precios de tus obras</li>
      </ul>

      <div class="next-steps">
        <h3>📅 Próximos pasos:</h3>
        <ol>
          <li><strong>Guarda este documento</strong> - Lo necesitarás para cualquier referencia futura</li>
          <li><strong>Prepara tus obras</strong> - Asegúrate de que estén listas para entrega según las especificaciones</li>
          <li><strong>Fecha de entrega</strong> - Te contactaremos con los detalles específicos próximamente</li>
          <li><strong>Montaje</strong> - Recibirás instrucciones sobre el proceso de montaje</li>
        </ol>
      </div>

      <p><strong>Importante:</strong></p>
      <ul>
        <li>Conserva una copia impresa y digital de tu hoja de consignación</li>
        <li>Verifica que la información fiscal sea correcta</li>
        <li>Revisa los precios de venta de cada obra</li>
      </ul>

      <p><strong>¿Necesitas modificar algo?</strong></p>
      <p>Si encuentras algún error o necesitas hacer cambios, contáctanos de inmediato:</p>
      <ul>
        <li>Email: <a href="mailto:hola@arte-facto.mx">hola@arte-facto.mx</a></li>
        <li>WhatsApp: +52 55 XXXX XXXX</li>
      </ul>

      <p>Estamos emocionados de trabajar contigo en esta edición de ARTE FACTO.</p>

      <p>
        ¡Nos vemos pronto!<br>
        <strong>Equipo ARTE FACTO</strong>
      </p>
    </div>

    <div class="footer">
      <p>© 2024 ARTE FACTO. Todos los derechos reservados.</p>
      <p>
        <a href="https://arte-facto.mx" style="color: #6b7280; text-decoration: none;">arte-facto.mx</a>
      </p>
      <p style="margin-top: 10px; font-size: 12px;">
        Este es un email transaccional relacionado con tu participación en ARTE FACTO {{ params.edicion }}.
      </p>
    </div>
  </div>
</body>
</html>
```

### Variables requeridas
- `{{ params.nombre }}` - Nombre de pila del artista
- `{{ params.edicion }}` - Código de edición (ej: AF2, AF3)
- `{{ params.folio }}` - Folio del artista
- `{{ params.fecha_firma }}` - Fecha de firma (formato: dd/mm/yyyy HH:MM)
- `{{ params.total_obras }}` - Número total de obras consignadas

### Adjuntos
Este email debe configurarse para **permitir adjuntos** ya que se enviará el PDF de la hoja de consignación firmada.

---

## Configuración de Variables en .env

Después de crear las plantillas, actualizar el archivo `.env` con los IDs asignados por Brevo:

```bash
# Brevo Template IDs
BREVO_TEMPLATE_CONSIGNA_INVITACION=4
BREVO_TEMPLATE_CONSIGNA_RECHAZO=5
BREVO_TEMPLATE_CONSIGNA_ACUERDO=6
```

---

## Notas Importantes

1. **IDs de Templates**: Los IDs (4, 5, 6) son sugeridos. Brevo asignará automáticamente IDs secuenciales. Asegúrate de actualizar `.env` con los IDs reales.

2. **Modo de Prueba**: Antes de usar en producción, envía emails de prueba a ti mismo usando el dashboard de Brevo para verificar:
   - Formato correcto en desktop y móvil
   - Todas las variables se renderizan correctamente
   - Los enlaces funcionan
   - Los adjuntos se envían (Template 3)

3. **Personalización**: Actualiza los siguientes elementos con la información real:
   - Número de WhatsApp
   - Enlaces a redes sociales
   - Fechas específicas de la feria
   - Detalles de entrega y montaje

4. **Diseño Responsive**: Las plantillas están optimizadas para verse bien en:
   - Clientes de escritorio (Gmail, Outlook, Apple Mail)
   - Clientes móviles (iOS Mail, Gmail app)
   - Webmail (Gmail web, Outlook.com)

5. **Branding**: Los colores y estilos pueden ajustarse según la identidad visual de ARTE FACTO.

---

## Testing Checklist

Antes de activar en producción, verificar:

- [ ] Template 1 renderiza correctamente con todas las variables
- [ ] Template 2 renderiza correctamente con todas las variables
- [ ] Template 3 renderiza correctamente con todas las variables
- [ ] Template 3 permite y envía adjuntos PDF
- [ ] Links son clickeables y funcionan
- [ ] Formato responsive funciona en móvil
- [ ] No hay errores de ortografía o gramática
- [ ] IDs actualizados en `.env`
- [ ] Información de contacto es correcta
- [ ] Logos e imágenes cargan correctamente (si se agregan)

---

## Comando para Enviar Email de Prueba

Una vez configuradas las plantillas, puedes probar desde Node.js:

```javascript
import { sendEmailWithTemplate } from './src/services/email.service.js'

// Test Template 1 (Invitación)
await sendEmailWithTemplate({
  to: 'tu-email@ejemplo.com',
  toName: 'Artista Prueba',
  templateId: 4,
  params: {
    nombre: 'María',
    edicion: 'AF2',
    link_consigna: 'https://arte-facto.mx/consigna/TOKEN_PRUEBA',
    folio: 'AF2-001',
    dias_vigencia: 4
  }
})
```
