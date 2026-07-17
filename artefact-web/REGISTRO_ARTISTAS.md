# REGISTRO DE ARTISTAS - Documentación Completa

Sistema de registro multi-step para artistas que desean participar en la feria ARTEFACT.

---

## 📋 COMPONENTES CREADOS

### UI Components
- ✅ **ProgressBar** - Barra de progreso para multi-step form
- ✅ **Select** - Dropdown select reutilizable
- ✅ **FileUpload** - Componente de upload con drag & drop
- ✅ (Ya existían) Button, Input, Textarea, Card

### Formulario Multi-Step (4 Pasos)
1. ✅ **Step1DatosPersonales** - Información personal del artista
2. ✅ **Step2InfoArtistica** - Categoría, bio, redes sociales
3. ✅ **Step3Documentos** - Upload de CV, portfolio, ID, foto
4. ✅ **Step4Confirmacion** - Resumen y términos

### Página Principal
- ✅ **app/registro/page.js** - Página completa con navegación entre steps

---

## 🗂 ESTRUCTURA DE DATOS

### Datos del Formulario

```javascript
{
  // PASO 1: Datos Personales
  nombre: string,           // VARCHAR(255) NOT NULL
  apellido: string,         // VARCHAR(255) NOT NULL
  email: string,            // VARCHAR(255) UNIQUE NOT NULL
  telefono: string,         // VARCHAR(20)
  fecha_nacimiento: date,   // DATE
  pais: string,             // VARCHAR(100)
  ciudad: string,           // VARCHAR(100)
  codigo_postal: string,    // VARCHAR(10)
  direccion: string,        // TEXT

  // PASO 2: Información Artística
  categoria: string,        // VARCHAR(100) NOT NULL
  bio: string,              // TEXT (min 200 caracteres)
  redes_sociales: {         // JSONB
    instagram: string,
    facebook: string,
    website: string,
    portfolio: string
  },

  // PASO 3: Documentos
  foto: File,               // Archivo (imagen)
  documentos: {             // JSONB después de subir a Cloudinary
    cv: File,               // PDF/DOC
    portfolio: File,        // PDF/Imágenes
    identificacion: File    // Imagen/PDF
  }
}
```

---

## 💾 BASE DE DATOS

### Tabla: artistas

```sql
CREATE TABLE IF NOT EXISTS artistas (
  id SERIAL PRIMARY KEY,

  -- Datos Personales (Paso 1)
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  fecha_nacimiento DATE,
  pais VARCHAR(100),
  ciudad VARCHAR(100),
  codigo_postal VARCHAR(10),
  direccion TEXT,

  -- Información Artística (Paso 2)
  categoria VARCHAR(100) NOT NULL,
  bio TEXT,
  redes_sociales JSONB DEFAULT '{}',

  -- Documentos (Paso 3) - URLs de Cloudinary
  foto VARCHAR(500),
  documentos JSONB DEFAULT '{}', -- {cv_url, portfolio_url, identificacion_url}

  -- Estado y Control
  slug VARCHAR(255) UNIQUE NOT NULL,
  estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
  notas_admin TEXT,
  activo BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_artistas_email ON artistas(email);
CREATE INDEX idx_artistas_categoria ON artistas(categoria);
CREATE INDEX idx_artistas_estado ON artistas(estado);
CREATE INDEX idx_artistas_created_at ON artistas(created_at DESC);
```

### Tabla: inscripciones_fases (Auto-creada al registrarse)

```sql
CREATE TABLE IF NOT EXISTS inscripciones_fases (
  id SERIAL PRIMARY KEY,
  artista_id INTEGER NOT NULL REFERENCES artistas(id) ON DELETE CASCADE,
  fase_id INTEGER NOT NULL REFERENCES fases(id) ON DELETE CASCADE,
  estado VARCHAR(50) DEFAULT 'pendiente',
  fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(artista_id, fase_id)
);
```

---

## 🔄 FLUJO DEL PROCESO

### 1. Usuario Completa Formulario
```
Paso 1: Datos Personales
  ↓
Paso 2: Información Artística
  ↓
Paso 3: Upload de Documentos
  ↓
Paso 4: Confirmar y Aceptar Términos
  ↓
Click "Enviar Inscripción"
```

### 2. Procesamiento en Frontend
```javascript
// 1. Validar todos los campos
if (!validateStep(currentStep)) return

// 2. Preparar FormData
const formDataToSend = new FormData()
formDataToSend.append('nombre', formData.nombre)
formDataToSend.append('apellido', formData.apellido)
// ... todos los campos de texto

// 3. Agregar archivos
formDataToSend.append('foto', formData.foto)
formDataToSend.append('cv', formData.documentos.cv)
formDataToSend.append('portfolio', formData.documentos.portfolio)
formDataToSend.append('identificacion', formData.documentos.identificacion)

// 4. Enviar a API
const response = await fetch('/api/artistas', {
  method: 'POST',
  body: formDataToSend
})
```

### 3. Procesamiento en Backend

```javascript
// backend/src/controllers/artistas.controller.js

export const crearArtista = async (req, res) => {
  try {
    // 1. Validar datos
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    // 2. Upload de archivos a Cloudinary
    const fotoUrl = await cloudinary.uploader.upload(req.files.foto[0].path)
    const cvUrl = await cloudinary.uploader.upload(req.files.cv[0].path)
    const portfolioUrl = await cloudinary.uploader.upload(req.files.portfolio[0].path)
    const idUrl = await cloudinary.uploader.upload(req.files.identificacion[0].path)

    // 3. Generar slug único
    const slug = generateSlug(req.body.nombre, req.body.apellido)

    // 4. Crear artista en DB
    const artista = await ArtistaModel.create({
      ...req.body,
      foto: fotoUrl.secure_url,
      documentos: {
        cv_url: cvUrl.secure_url,
        portfolio_url: portfolioUrl.secure_url,
        identificacion_url: idUrl.secure_url
      },
      slug,
      estado: 'pendiente'
    })

    // 5. Obtener fase activa
    const faseActiva = await FaseModel.getFaseActiva()

    // 6. Inscribir a fase activa automáticamente
    if (faseActiva) {
      await InscripcionFaseModel.create({
        artista_id: artista.id,
        fase_id: faseActiva.id,
        estado: 'pendiente'
      })
    }

    // 7. Enviar email de confirmación al artista
    await emailService.enviarConfirmacionRegistro(artista.email, {
      nombre: artista.nombre,
      fase: faseActiva?.nombre
    })

    // 8. Notificar a admin (WebSocket/Email)
    await notificationService.notifyNewArtist(artista)

    // 9. Responder
    res.status(201).json({
      success: true,
      message: 'Registro completado exitosamente',
      data: artista
    })

  } catch (error) {
    console.error('Error creating artista:', error)
    res.status(500).json({ error: 'Error al procesar registro' })
  }
}
```

### 4. Después del Registro

```
✅ Artista recibe email de confirmación
   ↓
✅ Admin recibe notificación en panel
   ↓
✅ Artista aparece en lista del admin
   ↓
✅ Artista queda inscrito en fase activa
   ↓
⏳ Espera a que cierre inscripciones
   ↓
⏳ Curadores votan
   ↓
🎯 Resultados se envían por email
```

---

## 📬 EMAILS

### 1. Email de Confirmación al Artista

**Asunto:** Confirmación de Registro - ARTEFACT 2027

```
Hola [Nombre],

¡Gracias por registrarte a ARTEFACT 2027!

Tu inscripción ha sido recibida exitosamente y has sido registrado
en la [Fase X].

Detalles de tu registro:
- Nombre: [Nombre Apellido]
- Email: [email]
- Categoría: [categoria]
- Fecha de registro: [fecha]

¿Qué sigue?

1. Tu información será revisada por nuestro equipo de curaduría
2. Las votaciones se realizarán entre [fecha inicio] y [fecha fin]
3. Los resultados se notificarán por email al cierre de la fase
4. Aproximadamente el 20% de artistas inscritos serán seleccionados

Puedes consultar el estado de tu inscripción en cualquier momento
contactando a info@artefact.com.mx

¡Mucha suerte!

Equipo ARTEFACT
```

### 2. Notificación al Admin

**Asunto:** Nuevo Artista Registrado

```
Nuevo artista registrado en la plataforma:

Nombre: [Nombre Apellido]
Email: [email]
Categoría: [categoria]
Fase: [Fase X]
Fecha: [fecha y hora]

Ver en panel: [URL]
```

---

## 🎨 VALIDACIONES

### Frontend (Antes de enviar)

```javascript
// Paso 1: Datos Personales
✓ Nombre (requerido, string)
✓ Apellido (requerido, string)
✓ Email (requerido, email válido)
✓ Teléfono (requerido, formato válido)
✓ Fecha de Nacimiento (requerido, mayor de 18 años)
✓ País (requerido)
✓ Ciudad (requerida)
✓ Dirección (requerida)

// Paso 2: Información Artística
✓ Categoría (requerida)
✓ Bio (requerida, mínimo 200 caracteres)
○ Redes sociales (opcional)

// Paso 3: Documentos
✓ Foto de perfil (requerida, max 5MB, solo imágenes)
✓ CV Artístico (requerido, max 10MB, PDF/DOC)
✓ Portfolio (requerido, max 20MB, PDF/Imágenes)
✓ Identificación (requerida, max 5MB, imagen/PDF)

// Paso 4: Confirmación
✓ Aceptar términos y condiciones (requerido)
✓ Aceptar aviso de privacidad (requerido)
```

### Backend (Al recibir)

```javascript
import { body } from 'express-validator'

export const validateArtista = [
  body('nombre').trim().notEmpty().withMessage('Nombre requerido'),
  body('apellido').trim().notEmpty().withMessage('Apellido requerido'),
  body('email').isEmail().withMessage('Email inválido')
    .custom(async (email) => {
      const exists = await ArtistaModel.findByEmail(email)
      if (exists) throw new Error('Email ya registrado')
    }),
  body('telefono').isMobilePhone().withMessage('Teléfono inválido'),
  body('fecha_nacimiento').isDate().withMessage('Fecha inválida')
    .custom((date) => {
      const age = calculateAge(date)
      if (age < 18) throw new Error('Debes ser mayor de 18 años')
      return true
    }),
  body('categoria').trim().notEmpty().withMessage('Categoría requerida'),
  body('bio').trim().isLength({ min: 200 })
    .withMessage('Biografía debe tener al menos 200 caracteres'),

  // Validación de archivos (con multer)
  // files.foto, files.cv, files.portfolio, files.identificacion
]
```

---

## 🔐 SEGURIDAD

### Cloudinary Setup

```javascript
// backend/src/config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export const uploadFile = async (file, folder) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: `artefact/${folder}`,
      resource_type: 'auto',
      transformation: folder === 'fotos' ? [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' }
      ] : undefined
    })
    return result.secure_url
  } catch (error) {
    throw new Error('Error uploading file')
  }
}
```

### Rate Limiting

```javascript
// Limitar a 5 registros por IP por hora
import rateLimit from 'express-rate-limit'

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5,
  message: 'Demasiados registros desde esta IP'
})

router.post('/artistas', registerLimiter, validateArtista, crearArtista)
```

---

## 📱 RESPONSIVE DESIGN

El formulario es completamente responsive:
- ✅ Mobile-first design
- ✅ Touch-friendly file upload
- ✅ Navegación adaptativa
- ✅ Progress bar visible en todos los dispositivos
- ✅ Formulario optimizado para pantallas pequeñas

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Frontend ✅ COMPLETO
- [x] ProgressBar component
- [x] Select component
- [x] FileUpload component
- [x] Step 1: Datos Personales
- [x] Step 2: Información Artística
- [x] Step 3: Documentos
- [x] Step 4: Confirmación
- [x] Página principal /registro
- [x] Validación de formularios
- [x] Pantalla de éxito
- [x] Responsive design

### Backend - Por Implementar
- [ ] Endpoint POST /api/artistas
- [ ] Middleware multer para archivos
- [ ] Integración con Cloudinary
- [ ] Model ArtistaModel.create()
- [ ] Validación de datos
- [ ] Generación de slug único
- [ ] Inscripción automática a fase activa
- [ ] Servicio de email
- [ ] Notificaciones a admin

### Base de Datos - Por Implementar
- [ ] Ejecutar schema actualizado
- [ ] Seeds de fases iniciales
- [ ] Testing de constraints

---

## 🚀 PRÓXIMOS PASOS

1. **Conectar con Backend** (siguiendo MIGRATION_GUIDE.md)
2. **Implementar Upload a Cloudinary**
3. **Sistema de Emails** (confirmación)
4. **Notificaciones en tiempo real** (WebSocket para admin)
5. **Panel de Admin** para ver artistas registrados

---

**Fecha:** Julio 2026
**Estado:** Frontend Completo ✅ | Backend Pendiente ⏳
