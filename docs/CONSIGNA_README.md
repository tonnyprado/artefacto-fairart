# Sistema de Hojas de Consignación - README

## Estado del Proyecto

✅ **IMPLEMENTACIÓN COMPLETA** - Código 100% terminado y listo para deployment.

**Fecha de finalización**: 2024-03-XX
**Versión**: 1.0.0
**Última actualización**: [Fecha actual]

---

## Resumen Ejecutivo

Se ha implementado un sistema completo de hojas de consignación para ARTE FACTO que permite:

- ✅ Generación automática de invitaciones para artistas aprobados
- ✅ Envío automático de emails con links únicos y seguros
- ✅ Formulario web de 12 pasos con firma digital
- ✅ Generación automática de PDFs con acuerdos firmados
- ✅ Panel de administración integrado en dashboard existente
- ✅ Almacenamiento seguro en S3
- ✅ Soporte para múltiples ediciones (AF2, AF3, etc.)
- ✅ Cálculo automático de precios con comisiones
- ✅ Gestión de situación fiscal de artistas

---

## Arquitectura Implementada

### Backend (Express.js + PostgreSQL)
- **Lenguaje**: JavaScript (ES6+)
- **Base de datos**: PostgreSQL con esquema aislado `consigna`
- **Almacenamiento**: AWS S3 (buckets privados)
- **Emails**: Brevo (anteriormente Sendinblue)
- **PDFs**: PDFKit
- **Seguridad**: Tokens SHA-256, rate limiting, validación exhaustiva

**Archivos creados**: 27 archivos backend
- Migraciones SQL: 3 archivos
- Servicios core: 10 archivos
- Repositorios: 5 archivos
- HTTP layer: 6 archivos
- Scripts: 3 archivos

### Frontend (Next.js 14 + React 18)
- **Lenguaje**: JavaScript (JSX)
- **Framework**: Next.js 14 con App Router
- **UI**: Componentes personalizados + shadcn/ui
- **Gestión de estado**: useReducer + Context
- **Responsive**: Optimizado para móviles (iOS/Android)

**Archivos creados**: 35 archivos frontend
- Componentes React: 32 archivos
- Rutas Next.js: 2 archivos
- API client: 1 archivo

### Documentación
- **Archivos creados**: 5 documentos
  - `CONSIGNA.md` - Documentación técnica completa (500+ líneas)
  - `BREVO_TEMPLATES.md` - Plantillas de email (3 templates)
  - `DEPLOYMENT_CHECKLIST.md` - Guía de deployment paso a paso
  - `CONSIGNA_QUICK_REFERENCE.md` - Comandos y queries útiles
  - `CONSIGNA_README.md` - Este archivo

---

## Estructura de Archivos

```
Benito-web/
├── backend/
│   ├── src/
│   │   ├── consigna/                    # Módulo completo de consignación
│   │   │   ├── config/
│   │   │   │   └── env.js
│   │   │   ├── domain/
│   │   │   │   ├── modelos.js
│   │   │   │   ├── errores.js
│   │   │   │   └── conceptoPago.js
│   │   │   ├── repositories/
│   │   │   │   └── pg/
│   │   │   │       ├── PgRegistroArtistasLectura.js
│   │   │   │       ├── PgInvitacionesRepo.js
│   │   │   │       ├── PgBorradoresRepo.js
│   │   │   │       ├── PgAcuerdosRepo.js
│   │   │   │       └── PgEventosRepo.js
│   │   │   ├── services/
│   │   │   │   ├── TokenService.js
│   │   │   │   ├── InvitacionService.js
│   │   │   │   ├── ConsignaService.js
│   │   │   │   └── EmailService.js
│   │   │   ├── infra/
│   │   │   │   ├── almacenamiento.js
│   │   │   │   └── notificaciones.js
│   │   │   ├── pdf/
│   │   │   │   ├── GeneradorPdf.js
│   │   │   │   └── PdfKitGenerador.js
│   │   │   ├── http/
│   │   │   │   ├── controller.js
│   │   │   │   ├── rutas.js
│   │   │   │   ├── validadores.js
│   │   │   │   └── manejoErrores.js
│   │   │   ├── shared/
│   │   │   │   ├── precios.js
│   │   │   │   ├── acuerdo.js
│   │   │   │   └── contratos.js
│   │   │   ├── scripts/
│   │   │   │   └── crearInvitaciones.js
│   │   │   └── contenedor.js
│   │   ├── routes/
│   │   │   └── consigna.routes.js       # Rutas admin
│   │   ├── controllers/
│   │   │   └── artistas.controller.js   # Modificado (emails automáticos)
│   │   ├── config/
│   │   │   └── migrations/
│   │   │       ├── consigna/
│   │   │       │   ├── 000_roles.sql
│   │   │       │   ├── 001_esquema_consigna.sql
│   │   │       │   └── 002_vistas_lectura.sql
│   │   │       └── runConsignaMigrations.js
│   │   ├── scripts/
│   │   │   ├── db-snapshot.js
│   │   │   └── db-restore.js
│   │   └── server.js                    # Modificado (integración módulo)
│   ├── package.json                     # Actualizado (scripts + pdfkit)
│   └── .env                             # Actualizar con variables consigna
├── frontend/
│   ├── features/
│   │   └── consigna/
│   │       ├── api/
│   │       │   └── HttpConsignaApi.js
│   │       ├── components/
│   │       │   ├── pasos/
│   │       │   │   ├── PasoBienvenida.jsx
│   │       │   │   ├── PasoClausula.jsx
│   │       │   │   ├── PasoFiscal.jsx
│   │       │   │   ├── PasoObras.jsx
│   │       │   │   ├── PasoFirma.jsx
│   │       │   │   ├── PasoRevision.jsx
│   │       │   │   └── PasoEnviado.jsx
│   │       │   ├── obras/
│   │       │   ├── firma/
│   │       │   ├── pago/
│   │       │   └── documento/
│   │       ├── hooks/
│   │       ├── shared/
│   │       ├── estado/
│   │       │   └── consignaReducer.js
│   │       ├── ConsignaPage.jsx
│   │       └── tema.js
│   ├── app/
│   │   └── consigna/
│   │       ├── [token]/
│   │       │   └── page.js
│   │       └── layout.js
│   └── components/
│       └── admin/
│           ├── ArtistasAceptados.jsx    # Nuevo componente
│           └── ArtistasTable.jsx        # Modificado (integración)
└── docs/
    ├── CONSIGNA.md                      # Documentación técnica completa
    ├── BREVO_TEMPLATES.md               # Plantillas de email
    ├── DEPLOYMENT_CHECKLIST.md          # Guía de deployment
    ├── CONSIGNA_QUICK_REFERENCE.md      # Referencia rápida
    └── CONSIGNA_README.md               # Este archivo
```

---

## Estado de Implementación

### ✅ Completado (100%)

#### Backend
- [x] Migraciones SQL (esquema `consigna` aislado)
- [x] Repositorios PostgreSQL (5 implementaciones)
- [x] Servicios de negocio (Token, Invitación, Consigna, Email)
- [x] Generador de PDFs (PDFKit)
- [x] Adaptador Brevo (reemplaza SES)
- [x] Almacenamiento S3
- [x] Contenedor de dependencias
- [x] Controller + Rutas HTTP
- [x] Validadores y manejo de errores
- [x] Integración en server.js
- [x] Rutas admin (/api/admin/consigna/*)
- [x] Emails automáticos (aprobar/rechazar artista)
- [x] Scripts de utilidad (snapshot, restore, invitaciones)

#### Frontend
- [x] 32 componentes React (TSX → JSX)
- [x] Formulario de 12 pasos
- [x] Lienzo de firma digital
- [x] Upload de archivos (constancia fiscal)
- [x] Cálculo de precios con desglose
- [x] Vista previa de PDF
- [x] Rutas públicas Next.js (/consigna/[token])
- [x] Layout sin navegación principal
- [x] API client (HttpConsignaApi)
- [x] Componente admin (ArtistasAceptados)
- [x] Integración en panel admin existente

#### Documentación
- [x] Documentación técnica completa
- [x] Guía de deployment
- [x] Plantillas de email Brevo
- [x] Referencia rápida de comandos
- [x] README general

### ⏳ Pendiente (Tareas de Deployment)

- [ ] Crear snapshot de producción
- [ ] Ejecutar migraciones en staging
- [ ] Ejecutar migraciones en producción
- [ ] Crear templates en Brevo (3 plantillas)
- [ ] Configurar bucket S3 staging
- [ ] Configurar bucket S3 producción
- [ ] Subir firma-direccion.png a S3
- [ ] Testing end-to-end en staging
- [ ] Testing en dispositivos móviles (iOS/Android)
- [ ] Deploy a producción

---

## Documentación

| Documento | Descripción | Cuándo usar |
|-----------|-------------|-------------|
| [CONSIGNA.md](./CONSIGNA.md) | Documentación técnica completa del sistema | Para entender arquitectura, flujos, API |
| [BREVO_TEMPLATES.md](./BREVO_TEMPLATES.md) | Plantillas de email con HTML completo | Al configurar templates en Brevo |
| [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) | Guía paso a paso de deployment | Durante deployment a staging/producción |
| [CONSIGNA_QUICK_REFERENCE.md](./CONSIGNA_QUICK_REFERENCE.md) | Comandos y queries comunes | Operaciones diarias, troubleshooting |
| [CONSIGNA_README.md](./CONSIGNA_README.md) | Este archivo - resumen general | Punto de partida, índice de documentos |

---

## Comandos Rápidos

```bash
# Instalar dependencias
npm install

# Crear snapshot de base de datos
npm run db:snapshot

# Ejecutar migraciones
npm run consigna:migrate

# Generar invitaciones
npm run consigna:invitaciones AF2

# Desarrollo
npm run dev

# Producción
npm start
```

---

## Próximos Pasos

### 1. Pre-Deployment (Preparación)
- [ ] Leer `DEPLOYMENT_CHECKLIST.md` completo
- [ ] Verificar acceso a todos los servicios (Brevo, S3, servidores)
- [ ] Crear templates en Brevo usando `BREVO_TEMPLATES.md`
- [ ] Actualizar `.env` con datos reales de producción

### 2. Deployment a Staging
- [ ] Crear snapshot de BD staging
- [ ] Ejecutar migraciones en staging
- [ ] Configurar S3 bucket de staging
- [ ] Deploy de código a staging
- [ ] Testing end-to-end completo
- [ ] Testing en móviles (iOS + Android)

### 3. Deployment a Producción
- [ ] **CRÍTICO**: Crear snapshot de BD producción
- [ ] Ejecutar migraciones en producción
- [ ] Configurar S3 bucket de producción
- [ ] Deploy de código a producción
- [ ] Verificar endpoints funcionan
- [ ] Smoke tests básicos
- [ ] Monitoreo activo primeras 24h

### 4. Post-Deployment
- [ ] Aprobar primer artista de prueba
- [ ] Verificar email se envía correctamente
- [ ] Completar formulario completo
- [ ] Verificar PDF se genera y envía
- [ ] Verificar panel admin muestra datos
- [ ] Documentar cualquier issue encontrado

---

## Características Principales

### Seguridad
- 🔒 Tokens únicos SHA-256 hashed (nunca almacenados en texto plano)
- 🔒 Esquema de BD aislado con permisos restrictivos
- 🔒 Bucket S3 privado con URLs prefirmadas (15 min)
- 🔒 Rate limiting (60 requests/min)
- 🔒 Validación exhaustiva server-side
- 🔒 Cálculo de precios siempre en backend (no confiar en cliente)

### Usabilidad
- 📱 Responsive design (desktop + móvil)
- 📱 Firma táctil optimizada (iOS/Android)
- 💾 Auto-guardado de borradores
- 📄 Vista previa de PDF antes de enviar
- ✉️ Emails automáticos en aprobar/rechazar
- 📊 Panel admin con estadísticas en tiempo real

### Escalabilidad
- ⚡ Arquitectura modular con inyección de dependencias
- ⚡ Separación clara de responsabilidades (SOLID)
- ⚡ Fácil agregar nuevas ediciones (AF3, AF4...)
- ⚡ Soporte para múltiples artistas simultáneos
- ⚡ PDFs generados bajo demanda (no bloquean otros procesos)

---

## Tecnologías Utilizadas

### Backend
- **Express.js 4.x** - Framework web
- **PostgreSQL 14+** - Base de datos relacional
- **AWS S3 SDK v3** - Almacenamiento de archivos
- **PDFKit 0.15** - Generación de PDFs
- **Brevo API** - Envío de emails transaccionales
- **bcryptjs** - Hashing (tokens)
- **express-validator** - Validación de inputs
- **express-rate-limit** - Rate limiting
- **multer** - Upload de archivos

### Frontend
- **Next.js 14** - Framework React con App Router
- **React 18** - Librería UI
- **shadcn/ui** - Componentes UI base
- **lucide-react** - Iconos
- **React Hook Form** - Manejo de formularios
- **Canvas API** - Firma digital

### DevOps
- **PM2** - Process manager
- **PostgreSQL Client Tools** - pg_dump, psql
- **AWS CLI** - Gestión de S3

---

## Métricas y KPIs

### Métricas del Sistema
- **Tasa de conversión**: % de invitaciones que se completan
- **Tiempo promedio de completado**: Desde apertura hasta envío
- **Tasa de expiración**: % de tokens que expiran sin uso
- **Errores de generación PDF**: Cantidad de fallos al generar PDF
- **Tiempo de generación PDF**: Promedio de segundos por PDF

### Queries para Métricas

Ver `CONSIGNA_QUICK_REFERENCE.md` sección "SQL Queries Útiles" para queries específicos.

---

## Contacto y Soporte

### Documentación
- **Técnica**: `/docs/CONSIGNA.md`
- **Deployment**: `/docs/DEPLOYMENT_CHECKLIST.md`
- **Operaciones**: `/docs/CONSIGNA_QUICK_REFERENCE.md`

### Código
- **Backend**: `/backend/src/consigna/`
- **Frontend**: `/frontend/features/consigna/`

### Troubleshooting
Ver sección "Troubleshooting" en `CONSIGNA_QUICK_REFERENCE.md`

---

## Changelog

### v1.0.0 (2024-03-XX) - Implementación Inicial
- ✅ Sistema completo de consignación
- ✅ Integración con Brevo para emails
- ✅ Generación automática de PDFs
- ✅ Panel admin integrado
- ✅ Soporte para múltiples ediciones
- ✅ Documentación completa

---

## Licencia

Código propietario de ARTE FACTO. Todos los derechos reservados.

---

**Última actualización**: 2024-03-XX
**Versión de este README**: 1.0.0
