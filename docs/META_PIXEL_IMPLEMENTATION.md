# Implementación del Meta Pixel (Facebook Pixel)

## Resumen
Se ha implementado el Meta Pixel de Facebook en la plataforma ARTEFACTO para rastrear conversiones y eventos importantes de usuarios.

**Pixel ID**: `1499180309056570`

## Archivos Creados

### 1. `/frontend/components/analytics/MetaPixel.jsx`
Componente que inicializa el Meta Pixel usando Next.js Script component con estrategia `afterInteractive` para óptimo rendimiento.

**Funcionalidad:**
- Carga el script de Facebook Pixel de forma asíncrona
- Inicializa el pixel con el ID correcto
- Dispara automáticamente evento `PageView` en cada carga de página
- Incluye fallback `<noscript>` para navegadores sin JavaScript

### 2. `/frontend/lib/metaPixel.js`
Utilidades para disparar eventos del Meta Pixel desde cualquier parte de la aplicación.

**Funciones exportadas:**
- `trackSubmitApplication(data)` - Rastrea cuando un usuario completa el registro
- `trackContact(data)` - Rastrea cuando un usuario envía el formulario de contacto
- `trackCustomEvent(eventName, data)` - Para eventos personalizados futuros
- `trackPageView()` - Para disparar PageView manualmente si es necesario

## Archivos Modificados

### 1. `/frontend/app/layout.js`
- **Línea 4**: Import del componente `MetaPixel`
- **Línea 217**: Componente `<MetaPixel />` agregado al inicio del `<body>`

### 2. `/frontend/app/registro/page.js`
- **Línea 17**: Import de `trackSubmitApplication`
- **Líneas 597-602**: Evento disparado cuando el registro es exitoso, justo antes de redirigir a la página de confirmación

**Datos enviados:**
```javascript
{
  content_name: 'Registro Artista ARTEFACTO 2027',
  status: 'completed',
  folio: 'ART-2027-XXX' // Folio único del registro
}
```

### 3. `/frontend/components/artefacto/ContactSection.jsx`
- **Línea 4**: Import de `trackContact`
- **Líneas 30-34**: Evento disparado cuando el formulario de contacto se envía exitosamente

**Datos enviados:**
```javascript
{
  content_name: 'Formulario de Contacto ARTEFACTO',
  asunto: 'Asunto del mensaje'
}
```

## Eventos Implementados

### 1. PageView (Automático)
Se dispara automáticamente en cada carga de página.

### 2. SubmitApplication
Se dispara cuando un artista completa exitosamente su registro.

**Ubicación**: `/frontend/app/registro/page.js:597-602`

**Cuándo se dispara**:
- Después de que el backend confirma el registro exitoso
- Antes de redirigir a la página de confirmación

### 3. Contact
Se dispara cuando un usuario envía el formulario de contacto.

**Ubicación**: `/frontend/components/artefacto/ContactSection.jsx:30-34`

**Cuándo se dispara**:
- Después de que el formulario se envía exitosamente
- Antes de mostrar el mensaje de confirmación

## Verificación de la Implementación

### 1. En el navegador (Development)
1. Abre las DevTools del navegador
2. Ve a la pestaña "Console"
3. Busca mensajes que empiecen con `📊 Meta Pixel:`
4. Ejemplos:
   ```
   📊 Meta Pixel: SubmitApplication tracked {content_name: "...", ...}
   📊 Meta Pixel: Contact tracked {content_name: "...", ...}
   ```

### 2. Con Facebook Pixel Helper (Extensión de Chrome)
1. Instala la extensión "Facebook Pixel Helper"
2. Navega por el sitio
3. La extensión mostrará:
   - ✅ Pixel ID detectado
   - Lista de eventos disparados
   - Datos enviados con cada evento

### 3. En Facebook Events Manager
1. Ve a [Facebook Events Manager](https://business.facebook.com/events_manager2)
2. Selecciona el Pixel ID `1499180309056570`
3. Ve a "Test Events" para ver eventos en tiempo real
4. Realiza acciones en el sitio y verifica que los eventos aparezcan

## Mejores Prácticas Implementadas

✅ **Carga Asíncrona**: El pixel se carga con `strategy="afterInteractive"` para no bloquear el rendering inicial

✅ **Client-Side Only**: Todos los eventos se disparan solo en el cliente (navegador)

✅ **Logging en Development**: Los eventos se registran en consola para debugging

✅ **Validación de fbq**: Se verifica que `window.fbq` exista antes de disparar eventos

✅ **Data Layer Limpia**: Solo se envían datos relevantes y no sensibles

## Eventos Futuros (Opcionales)

Si necesitas rastrear más eventos en el futuro, puedes usar:

```javascript
import { trackCustomEvent } from '@/lib/metaPixel'

// Ejemplo: Rastrear cuando alguien ve una obra
trackCustomEvent('ViewContent', {
  content_name: 'Obra de Arte',
  content_type: 'artwork',
  content_ids: ['123'],
  value: 5000,
  currency: 'MXN'
})
```

## Eventos Estándar Disponibles
- `AddPaymentInfo`
- `AddToCart`
- `AddToWishlist`
- `CompleteRegistration`
- `Contact` ✅ Implementado
- `CustomizeProduct`
- `Donate`
- `FindLocation`
- `InitiateCheckout`
- `Lead`
- `Purchase`
- `Schedule`
- `Search`
- `StartTrial`
- `SubmitApplication` ✅ Implementado
- `Subscribe`
- `ViewContent`

[Documentación completa de eventos](https://developers.facebook.com/documentation/meta-pixel/reference#standard-events)

## Troubleshooting

### El pixel no se carga
1. Verifica que el componente `<MetaPixel />` esté en el layout
2. Revisa la consola del navegador por errores
3. Verifica que no haya bloqueadores de ads/trackers activos

### Los eventos no se disparan
1. Verifica que `window.fbq` esté disponible (escribe en consola: `window.fbq`)
2. Revisa que los imports de `/lib/metaPixel.js` sean correctos
3. Verifica que las funciones se llamen después de acciones exitosas

### Eventos duplicados
1. Asegúrate de que solo hay un `<MetaPixel />` en la app
2. No llames a `trackPageView()` manualmente (se dispara automáticamente)

## Documentación Oficial
- [Meta Pixel Documentation](https://developers.facebook.com/documentation/meta-pixel/)
- [Standard Events Reference](https://developers.facebook.com/documentation/meta-pixel/reference#standard-events)
- [Next.js Script Component](https://nextjs.org/docs/pages/api-reference/components/script)
