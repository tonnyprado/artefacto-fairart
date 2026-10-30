# 📊 Google Analytics 4 - Guía de Configuración

## Resumen Ejecutivo

ARTEFACTO ahora tiene integración completa con **Google Analytics 4 (GA4)**, el sistema de analytics de Google. Los eventos se envían automáticamente tanto a nuestro sistema interno como a GA4 y Meta Pixel.

**Ventajas de GA4:**
- 📈 **Dashboard profesional** con informes visuales
- 🎯 **Segmentación avanzada** de audiencias
- 📊 **Embudo de conversión** visual
- 🌍 **Datos demográficos** de usuarios (edad, género, ubicación)
- 📱 **Análisis cross-device** (mismo usuario en móvil y desktop)
- 🔄 **Integración con Google Ads** para optimizar campañas
- 📉 **Predicciones de ML** (probabilidad de conversión, churn)
- 🆓 **100% Gratis** (hasta 10M eventos/mes)

---

## Configuración Inicial (15 minutos)

### Paso 1: Crear Propiedad GA4

1. Ve a [Google Analytics](https://analytics.google.com)
2. Inicia sesión con tu cuenta de Google
3. Click en **Admin** (ícono de engrane en la esquina inferior izquierda)
4. En la columna **Account**, haz click en **+ Create Account** (si no tienes una cuenta) o selecciona una existente
5. En la columna **Property**, haz click en **+ Create Property**

**Configuración de la propiedad:**
- **Property name:** ARTEFACTO
- **Reporting time zone:** (GMT-06:00) Central Time - Mexico City
- **Currency:** Mexican Peso (MXN)
- Click **Next**

**Información del negocio:**
- **Industry category:** Arts & Entertainment
- **Business size:** Small (1-10 employees) o el que aplique
- **Business objectives:** Selecciona:
  - ✅ Get baseline reports
  - ✅ Measure customer engagement
  - ✅ Drive online sales
- Click **Create**

6. Acepta los términos de servicio
7. **¡IMPORTANTE!** Copia el **Measurement ID** que aparece (formato: `G-XXXXXXXXXX`)

---

### Paso 2: Agregar Measurement ID al Proyecto

1. Abre el archivo `.env.local` en la raíz del proyecto frontend:
```bash
nano frontend/.env.local
```

2. Agrega la siguiente línea (reemplaza con tu ID real):
```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

3. Guarda el archivo

4. **En desarrollo local:** Reinicia el servidor
```bash
cd frontend
npm run dev
```

5. **En producción (Railway):** Agrega la variable de entorno:
   - Ve a tu proyecto en Railway
   - Click en **Variables**
   - Click **+ New Variable**
   - Name: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - Value: `G-XXXXXXXXXX` (tu Measurement ID)
   - Click **Add**
   - Railway automáticamente redeplegará la app

---

### Paso 3: Verificar que Funciona

1. **Verificación en tiempo real:**
   - Ve a [Google Analytics](https://analytics.google.com)
   - Selecciona tu propiedad ARTEFACTO
   - En el menú izquierdo: **Reports → Realtime**
   - Abre tu sitio en otra pestaña: https://arte-facto.mx
   - En GA4 deberías ver **1 user active** en tiempo real
   - Navega por el sitio y verás las páginas que visitas

2. **Verificación con extensión:**
   - Instala [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna) en Chrome
   - Activa la extensión (ícono azul)
   - Abre DevTools (F12) → Console
   - Verás logs de eventos enviados a GA4

3. **Verificación en consola del navegador:**
   - Abre DevTools (F12) → Console
   - Navega por el sitio
   - Busca mensajes: `📊 GA4: page_view` y `📊 GA4: purchase`

---

## Eventos que se Trackean Automáticamente

### 1. **Pageviews** (Automático)
Cada vez que el usuario navega a una nueva página.

**En GA4:** Evento `page_view`

**Parámetros:**
- `page_location`: URL completa
- `page_title`: Título de la página

---

### 2. **Registro Completado**
Cuando un artista completa el registro con pago.

**En GA4:** Evento `purchase` (e-commerce)

**Parámetros:**
- `currency`: MXN
- `value`: Precio del paquete (ej. 850)
- `transaction_id`: Folio del registro (ej. REG-2027-001)
- `items`:
  - `item_id`: ID del paquete
  - `item_name`: Tipo de paquete (básico/premium/VIP)
  - `price`: Precio
  - `quantity`: 1

**Uso:**
- Ver revenue total en GA4
- Calcular Average Order Value (AOV)
- Crear audiencias de "compradores"

---

### 3. **Contacto Enviado**
Usuario envía formulario de contacto.

**En GA4:** Evento `generate_lead`

**Parámetros:**
- `currency`: MXN
- `value`: 0

**Uso:**
- Medir leads calificados
- Tasa de conversión Lead → Registro

---

### 4. **Paquete Seleccionado**
Usuario selecciona un paquete (Paso 5 del registro).

**En GA4:** Evento `begin_checkout`

**Parámetros:**
- `currency`: MXN
- `value`: Precio del paquete
- `items`: Detalles del paquete

**Uso:**
- Identificar carritos abandonados
- Remarketing a usuarios que casi compran

---

### 5. **Formulario Iniciado**
Usuario comienza el formulario de registro.

**En GA4:** Evento `generate_lead`

**Parámetros:**
- `form_name`: "registro_artista"
- `lead_type`: "form_start"

**Uso:**
- Tasa de conversión Visita → Form Start

---

### 6. **Formulario Abandonado**
Usuario abandona el formulario antes de completar.

**En GA4:** Evento `generate_lead`

**Parámetros:**
- `form_name`: "registro_artista"
- `step`: Paso donde abandonó (1-5)
- `lead_type`: "form_abandon"

**Uso:**
- Identificar en qué paso se pierden usuarios
- Optimizar UX del formulario

---

### 7. **Clicks en Botones**
Clicks en CTAs importantes.

**En GA4:** Evento `select_content`

**Parámetros:**
- `content_type`: "button"
- `item_id`: ID del botón

---

### 8. **Scroll Depth**
Usuario hace scroll en la página.

**En GA4:** Evento `scroll`

**Parámetros:**
- `percent_scrolled`: 25, 50, 75, o 100

---

## Dashboards y Reportes en GA4

### Dashboard de Tiempo Real

**Ubicación:** Reports → Realtime

**Qué puedes ver:**
- Usuarios activos en este momento
- Páginas que están viendo
- Eventos que están generando
- Ubicación geográfica
- Dispositivos que usan

**Uso:**
- Monitorear lanzamientos o campañas en vivo
- Ver si un anuncio está generando tráfico

---

### Dashboard de Adquisición

**Ubicación:** Reports → Acquisition → Traffic acquisition

**Qué puedes ver:**
- De dónde vienen tus usuarios:
  - **Organic Social:** Instagram, Facebook, Twitter
  - **Direct:** Directo (escriben URL)
  - **Referral:** Otros sitios web
  - **Organic Search:** Google, Bing
  - **Paid Search/Social:** Anuncios de Google/Meta

**Uso:**
- Identificar qué canal trae más tráfico
- Calcular ROI por canal
- **CRÍTICO:** Asegúrate de usar UTM parameters en tus anuncios

---

### Dashboard de Conversiones

**Ubicación:** Reports → Monetization → Overview

**Qué puedes ver:**
- Total revenue (suma de todos los `purchase`)
- Total purchases (número de registros)
- Average purchase revenue (AOV)
- Purchase rate (% de visitantes que compran)

**Uso:**
- Medir revenue total del mes
- Calcular ROI de campañas de marketing

---

### Embudo de Conversión Personalizado

**Cómo crear:**

1. Ve a **Explore** (menú izquierdo)
2. Click en **Blank** (template vacío)
3. En **Techniques**, selecciona **Funnel exploration**
4. Agrega los pasos:

```
Paso 1: page_view (página: /registro)
  ↓
Paso 2: generate_lead (lead_type: form_start)
  ↓
Paso 3: begin_checkout (paquete_selected)
  ↓
Paso 4: purchase (registro_complete)
```

5. Click **Apply**
6. Verás un embudo visual con tasas de conversión entre pasos

**Uso:**
- Identificar el "paso de la muerte" (mayor drop-off)
- Optimizar el paso problemático
- A/B testing de cambios

---

### Crear Audiencias para Remarketing

**Ejemplo: Abandonos de formulario**

1. Ve a **Admin → Audiences**
2. Click **+ New audience**
3. Configuración:
   - **Name:** Abandonos Registro
   - **Description:** Usuarios que iniciaron formulario pero no completaron
   - **Conditions:**
     - Include: `generate_lead` where `lead_type = form_start`
     - Exclude: `purchase`
     - Time window: Last 30 days

4. Click **Save**
5. Esta audiencia se puede usar en Google Ads y Display & Video 360

**Otros ejemplos:**
- Usuarios que vieron paquetes pero no compraron
- Usuarios que completaron registro (para lookalikes)
- Usuarios de Instagram vs Facebook (comparar calidad)

---

## Integración con Google Ads

**Paso 1: Vincular GA4 con Google Ads**

1. En GA4: **Admin → Google Ads links**
2. Click **Link**
3. Selecciona tu cuenta de Google Ads
4. Activa estas opciones:
   - ✅ Enable personalized advertising
   - ✅ Auto-tagging
5. Click **Submit**

**Paso 2: Importar conversiones a Google Ads**

1. En Google Ads: **Tools → Conversions**
2. Click **+ New conversion action**
3. Selecciona **Import → Google Analytics 4 → Web**
4. Marca estas conversiones:
   - ✅ `purchase` (registro completado)
   - ✅ `begin_checkout` (paquete seleccionado)
   - ✅ `generate_lead` (contacto/form start)
5. Click **Import and continue**

**Resultado:**
- Campañas optimizan automáticamente para conversiones
- Puedes hacer bid adjustments por conversión
- Smart Bidding funciona mejor con datos de GA4

---

## Eventos Personalizados (Futuro)

Si quieres trackear eventos adicionales:

```javascript
import { trackGA4Event } from '@/components/analytics/GoogleAnalytics'

// Ejemplo: Click en Instagram
trackGA4Event('social_click', {
  platform: 'instagram',
  location: 'footer'
})

// Ejemplo: Descarga de PDF
trackGA4Event('file_download', {
  file_name: 'convocatoria_2027.pdf',
  file_type: 'pdf'
})

// Ejemplo: Video play
trackGA4Event('video_start', {
  video_title: 'ARTEFACTO 2026 Recap',
  video_duration: 120
})
```

---

## Configuración de Conversiones en GA4

**Marcar eventos como conversiones:**

1. En GA4: **Admin → Events**
2. Encuentra estos eventos y márcalos como conversión:
   - `purchase` ✅ (ya viene marcado por defecto)
   - `generate_lead` ✅
   - `begin_checkout` ✅

3. Ve a **Admin → Conversions**
4. Verás tus conversiones listadas

**Beneficios:**
- Aparecen en reportes de conversión
- Se pueden importar a Google Ads
- Tracking más preciso del funnel

---

## Comparación: Analytics Interno vs GA4 vs Meta Pixel

| Característica | Analytics Interno | GA4 | Meta Pixel |
|----------------|-------------------|-----|------------|
| **Dashboard visual** | ✅ Custom | ✅ Profesional | ✅ Ads Manager |
| **Datos demográficos** | ❌ | ✅ | ✅ (limitado) |
| **UTM tracking** | ✅ | ✅ | ❌ |
| **Device info** | ✅ | ✅ | ✅ |
| **Funnel visualización** | ✅ Básico | ✅ Avanzado | ✅ (solo ads) |
| **Exportar datos** | ✅ PDF/Excel | ✅ CSV/BigQuery | ❌ |
| **Custom queries** | ✅ SQL directo | ❌ (UI only) | ❌ |
| **Costo** | Gratis | Gratis | Gratis |
| **Retención de datos** | 90 días | 14 meses | 180 días |
| **Optimización de ads** | ❌ | ✅ Google Ads | ✅ Meta Ads |

**Estrategia recomendada:** Usar los 3 en paralelo
- **Analytics Interno:** Control total, datos raw, queries custom
- **GA4:** Dashboard profesional, predicciones ML, Google Ads
- **Meta Pixel:** Optimización de campañas de Facebook/Instagram

---

## Preguntas Frecuentes

### ¿Por qué no veo datos en GA4?

**Checklist:**
1. ✅ ¿Agregaste `NEXT_PUBLIC_GA_MEASUREMENT_ID` a `.env.local`?
2. ✅ ¿Reiniciaste el servidor después de agregar la variable?
3. ✅ ¿El Measurement ID tiene formato `G-XXXXXXXXXX`?
4. ✅ ¿Probaste en modo incógnito? (bloqueadores de ads pueden bloquear GA4)
5. ✅ ¿Esperaste 24-48 horas? (datos demográficos tardan)

### ¿GA4 ralentiza mi sitio?

No. El script de GA4 se carga con `strategy="afterInteractive"`, lo que significa que no bloquea el contenido principal. Además, los eventos se envían de forma asíncrona.

**Impacto de performance:** < 50ms

### ¿Puedo ver datos en tiempo real?

Sí. Ve a **Reports → Realtime** en GA4. Los datos aparecen instantáneamente (< 1 segundo).

Para datos históricos (informes), hay un delay de 24-48 horas.

### ¿Qué pasa si no configuro GA4?

El sistema seguirá funcionando normalmente. GA4 es opcional. Si no configuras el Measurement ID, simplemente no se enviará nada a Google Analytics.

Verás un warning en la consola:
```
⚠️ Google Analytics 4 no configurado. Agrega NEXT_PUBLIC_GA_MEASUREMENT_ID a .env.local
```

### ¿Cómo exporto datos de GA4?

**Opción 1: Exportación manual (CSV)**
1. En cualquier reporte, click en el ícono de compartir (arriba a la derecha)
2. Selecciona **Download file**
3. Elige formato CSV

**Opción 2: BigQuery (para grandes volúmenes)**
1. **Admin → BigQuery links**
2. Link con tu proyecto de Google Cloud
3. GA4 exporta automáticamente todos los eventos
4. Puedes hacer queries SQL complejas

### ¿GA4 cumple con GDPR?

Sí, si:
1. Agregues un banner de cookies pidiendo consentimiento
2. Solo inicialices GA4 después de que el usuario acepte
3. Configures data retention a 14 meses (default)

**Implementación de consent mode:** (futuro)
```javascript
// Cargar GA4 solo si el usuario acepta cookies
if (hasUserConsent) {
  <GoogleAnalytics />
}
```

---

## Métricas Clave a Monitorear

### Diariamente:
1. **Users activos** (Realtime)
2. **Conversion rate** (Purchases / Sessions)
3. **Abandonos de formulario** por paso

### Semanalmente:
1. **Fuentes de tráfico** (Acquisition)
2. **Top páginas** más visitadas
3. **Device breakdown** (mobile vs desktop)
4. **Embudo de conversión** (% por paso)

### Mensualmente:
1. **Total revenue** del mes
2. **Average order value** (AOV)
3. **User demographics** (edad, género, ubicación)
4. **Retention cohorts** (usuarios que regresan)

---

## Próximos Pasos

1. ✅ **Configurar GA4** (seguir Paso 1-3 arriba)
2. ✅ **Verificar datos en tiempo real**
3. ✅ **Crear embudo de conversión personalizado**
4. ✅ **Vincular con Google Ads** (si tienes campañas)
5. ✅ **Marcar eventos como conversiones**
6. ⚠️ **Configurar alertas** (si conversiones bajan)
7. ⚠️ **Exportar a BigQuery** (opcional, para análisis avanzados)
8. ⚠️ **Implementar consent mode** (GDPR compliance)

---

## Soporte

Si tienes problemas con la configuración:

1. **Revisa la consola del navegador** (F12) para ver logs
2. **Verifica que el Measurement ID** sea correcto
3. **Prueba en modo incógnito** (bloqueadores de ads pueden interferir)
4. **Consulta la documentación oficial:** [GA4 Help Center](https://support.google.com/analytics/answer/10089681)

---

**Última actualización:** 29 de Octubre, 2026
**Autor:** Claude (ARTEFACTO Analytics Team)
