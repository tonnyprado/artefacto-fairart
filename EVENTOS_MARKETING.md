# 📊 Guía de Eventos de Analytics para Marketing

## 🎯 Evento de Conversión Principal: Registro Completado

### Resumen Ejecutivo

El evento que representa un **registro exitoso** de artista tiene **diferentes nombres según la plataforma**:

| Plataforma | Nombre del Evento | Ubicación |
|------------|-------------------|-----------|
| **Meta Pixel** (Facebook Ads) | `SubmitApplication` | Meta Events Manager |
| **Google Analytics 4** | `purchase` | GA4 → Reports → Events |
| **Sistema Interno** | `registro_complete` | Base de datos |

---

## 📱 Meta Pixel (Facebook Ads)

### Nombre del Evento: `SubmitApplication`

**¿Dónde verlo?**
1. Ve a [Meta Events Manager](https://business.facebook.com/events_manager2)
2. Selecciona el Pixel ID: `1499180309056570`
3. Ve a **Events** o **Test Events**
4. Busca: `SubmitApplication`

**Datos incluidos:**
- `content_name`: "Registro Artista ARTEFACTO 2027"
- `status`: "completed"
- `folio`: Folio único del registro (ej: "ART-2027-001")

**Cómo usarlo:**
- ✅ Optimización de campañas de conversión
- ✅ Crear Custom Audiences de artistas registrados
- ✅ Crear Lookalike Audiences
- ✅ Medir ROI de campañas de Facebook/Instagram

**IMPORTANTE:** Este evento se dispara **SOLO** cuando un artista completa exitosamente el registro y recibe confirmación del backend.

---

## 📈 Google Analytics 4

### Nombre del Evento: `purchase`

**¿Dónde verlo?**
1. Ve a [Google Analytics](https://analytics.google.com)
2. Selecciona la propiedad: `G-26E0P736NG`
3. Ve a **Reports → Engagement → Events**
4. Busca: `purchase`

**Datos incluidos:**
- `currency`: "MXN"
- `value`: Precio del paquete seleccionado
- `transaction_id`: Folio único del registro
- `items`: Array con detalles del paquete (tipo, precio, etc.)

**Por qué se llama "purchase":**
- GA4 usa `purchase` como evento estándar de conversión
- Aunque no es una compra tradicional, representa el "valor" del registro
- Permite usar las herramientas de e-commerce de GA4

**Cómo usarlo:**
- ✅ Medir tasa de conversión del funnel
- ✅ Analizar valor por fuente de tráfico
- ✅ Crear audiencias de remarketing
- ✅ Análisis de atribución multi-canal

---

## 🔄 ¿Por qué nombres diferentes?

Cada plataforma tiene sus propios **eventos estándar** optimizados para sus algoritmos:

- **Meta Pixel** prefiere `SubmitApplication` porque:
  - Es específico para formularios de aplicación
  - Optimiza mejor las campañas de generación de leads
  - Es el evento recomendado por Facebook para este tipo de conversión

- **Google Analytics 4** usa `purchase` porque:
  - Es un evento de conversión estándar
  - Tiene integración automática con herramientas de e-commerce
  - Permite tracking de valor monetario

**Nuestro sistema unifica ambos**: Cuando un registro se completa, se dispara automáticamente a ambas plataformas con el nombre correspondiente.

---

## 🎨 Flujo Completo del Evento

```
Usuario completa registro
        ↓
Backend confirma exitoso (200 OK)
        ↓
Frontend dispara 3 eventos simultáneamente:
        ↓
        ├─→ Meta Pixel: SubmitApplication
        ├─→ Google Analytics: purchase
        └─→ Base de datos: registro_complete
```

---

## 📊 Dónde ver los números más confiables

### Para validar registros REALES:

**Opción 1: Base de Datos (100% confiable)**
- Tabla: `artistas`
- Contacto: Equipo de desarrollo
- Sin bloqueos de ad-blockers

**Opción 2: Sistema Interno de Analytics**
- Tabla: `analytics_events`
- Filtro: `event_type = 'form_submit'` o `event_type = 'registro_complete'`
- Menos afectado por ad-blockers que Meta/GA4

**Opción 3: Meta Events Manager**
- Evento: `SubmitApplication`
- Puede tener discrepancias por ad-blockers (~10-20% menos)

**Opción 4: Google Analytics 4**
- Evento: `purchase`
- Similar precisión a Meta

### ⚠️ Importante sobre discrepancias

Es **NORMAL** que los números no coincidan exactamente entre plataformas por:
- **Ad blockers**: ~15-30% de usuarios tienen extensiones que bloquean trackers
- **Delay de reporting**: Meta y GA4 pueden tardar minutos/horas en procesar
- **Modo incógnito**: Algunos navegadores bloquean cookies
- **Errores de red**: Timeouts, conexiones lentas, etc.

**Recomendación**: Usa la **base de datos** como fuente de verdad y las plataformas de analytics para tendencias y optimización.

---

## 🚀 Casos de Uso para Marketing

### 1. Optimización de Campañas de Meta Ads

**Evento a usar**: `SubmitApplication`

**Cómo:**
1. En Ads Manager, crea una campaña con objetivo "Conversiones"
2. Selecciona el evento `SubmitApplication`
3. El algoritmo de Meta optimizará para maximizar este evento

### 2. Custom Audiences de Artistas Registrados

**Evento a usar**: `SubmitApplication`

**Cómo:**
1. Ve a Audiences → Create Custom Audience
2. Selecciona "Website Traffic"
3. Regla: `SubmitApplication` en los últimos X días
4. Úsala para remarketing de próximas ediciones

### 3. Lookalike Audiences

**Basado en**: Custom Audience de `SubmitApplication`

**Beneficio**: Encontrar nuevos artistas similares a los que ya se registraron

### 4. Análisis de Funnel en GA4

**Eventos a usar**:
- `page_view` (página /registro)
- `form_start`
- `begin_checkout` (selección de paquete)
- `purchase` (registro completado)

**Cómo:**
1. GA4 → Explore → Funnel exploration
2. Configura los pasos del funnel
3. Identifica dónde hay más abandono

### 5. Atribución Multi-Canal

**Evento final**: `purchase` en GA4

**Beneficio**: Ver qué canales (Instagram, Google, orgánico) generan más conversiones

---

## ✅ Checklist de Verificación

Antes de lanzar una campaña, verifica:

- [ ] Meta Pixel está cargando correctamente (usa Facebook Pixel Helper)
- [ ] GA4 está recibiendo eventos (ve a Realtime → Events)
- [ ] El evento `SubmitApplication` aparece en Meta Test Events
- [ ] El evento `purchase` aparece en GA4 Realtime
- [ ] Los números coinciden aproximadamente entre plataformas (±20%)

---

## 🆘 Troubleshooting

### "No veo el evento SubmitApplication en Meta"

**Posibles causas:**
1. **No ha habido registros** - El evento solo se dispara con registros exitosos
2. **Ad blocker activo** - Prueba en modo incógnito sin extensiones
3. **Delay de reporting** - Espera 5-10 minutos
4. **Filtros incorrectos** - Revisa el rango de fechas en Events Manager

**Cómo verificar:**
1. Completa un registro de prueba
2. Abre la consola del navegador (F12)
3. Busca: `📊 Meta Pixel: SubmitApplication tracked`
4. Si aparece, el evento se disparó (puede tardar en aparecer en Meta)

### "Los números no coinciden entre Meta y GA4"

**Esto es normal**. Causas comunes:
- Ad blockers (bloquean más Meta que GA4)
- Diferentes ventanas de atribución
- Procesamiento asíncrono

**Solución**: Usa la base de datos como fuente de verdad.

---

## 📞 Contacto

**Para soporte técnico de analytics:**
- Equipo de desarrollo

**Para acceso a dashboards:**
- Meta Events Manager: [Solicitar acceso]
- Google Analytics: [Solicitar acceso]

---

**Última actualización**: 2026-11-05
**Pixel ID**: `1499180309056570`
**GA4 ID**: `G-26E0P736NG`
