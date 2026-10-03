# Migraciones de Base de Datos

Este directorio contiene las migraciones de la base de datos para el proyecto ARTE FACTO.

## Estructura

Cada migración tiene un número secuencial y un nombre descriptivo:
- `001_nombre_descriptivo.sql`
- `002_otro_cambio.sql`
- etc.

## Cómo ejecutar una migración específica

Para ejecutar una migración individual, usa el script de ejecución:

```bash
# Desde el directorio backend
node run-migration-005.js
```

## Migraciones Disponibles

### 001_ediciones_fases.sql
Crea las tablas de ediciones y fases del concurso.

### 002_artistas.sql
Crea la tabla de artistas y campos relacionados.

### 003_usuarios_curadores.sql
Crea las tablas de usuarios y curadores.

### 004_mejoras_obras_y_folio.sql
Mejoras en la tabla obras y sistema de folios.

### 005_obras_3d_dimensiones.sql ⚠️ PENDIENTE EN PRODUCCIÓN
Agrega campos para obras 3D:
- `largo_cm`: Largo de la base (para esculturas)
- `tipo_obra`: Tipo de obra (2D o 3D)

**Ejecutar con:**
```bash
node run-migration-005.js
```

### 006_votaciones.sql
Sistema de votaciones.

### 007_favoritos.sql
Sistema de favoritos.

### 008_artistas_fases_workflow.sql
Workflow de artistas por fase.

### 009_fotos_detalle_obras.sql
Fotos de detalle para obras.

### 010_pre_registro.sql
Sistema de pre-registro.

### 011_token_acceso.sql
Tokens de acceso.

### 012_fix_folio_race_condition.sql
Fix para condiciones de carrera en folios.

### 013_agregar_layout_canvas_pdf.sql
Layout y canvas para PDFs.

### 014_agregar_desglose_precios_obras.sql
Desglose de precios en obras.

### 015_agregar_nombre_artistico_y_referencia.sql
Nombre artístico y referencias.

## Verificar estado de la base de datos

Puedes verificar qué columnas tiene actualmente la tabla `obras`:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'obras'
ORDER BY ordinal_position;
```

## Notas

- Las migraciones están diseñadas para ser **idempotentes**: verifican si el cambio ya existe antes de aplicarlo.
- Siempre haz un backup antes de ejecutar migraciones en producción.
- Las migraciones se ejecutan directamente contra la base de datos especificada en `DATABASE_URL`.
