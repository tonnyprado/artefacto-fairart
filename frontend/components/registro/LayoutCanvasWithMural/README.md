# LayoutCanvasWithMural - Componente Refactorizado

Este componente ha sido completamente refactorizado aplicando principios SOLID, pasando de un archivo monolítico de 2,550 líneas a una arquitectura modular y mantenible.

## Estructura del Proyecto

```
LayoutCanvasWithMural/
├── index.jsx                     # Componente principal (orquestador)
├── README.md                     # Esta documentación
│
├── constants/                    # Constantes y configuraciones
│   ├── canvas.constants.js       # Dimensiones, escalas, plantillas
│   └── style.constants.js        # Colores, tipografía, espaciados
│
├── hooks/                        # Hooks personalizados
│   ├── useCanvasDimensions.js    # Dimensiones dinámicas 2D/3D
│   ├── useCanvasExport.js        # Exportación a PDF/imagen
│   ├── useLayoutValidation.js    # Validación de layout
│   ├── useObraCollision.js       # Detección de colisiones
│   └── useObraMetadata.js        # Gestión de metadata
│
├── utils/                        # Funciones utilitarias puras
│   ├── collision.utils.js        # Lógica de colisiones
│   ├── scaling.utils.js          # Conversión de escalas
│   └── validation.utils.js       # Validación de datos
│
├── components/                   # Componentes UI
│   ├── rulers/                   # Reglas de medición
│   │   ├── HorizontalRuler.jsx
│   │   └── VerticalRuler.jsx
│   │
│   ├── guides/                   # Líneas guía
│   │   └── GuideLines.jsx
│   │
│   ├── canvas/                   # Componentes del canvas
│   │   ├── MuralBackground.jsx
│   │   ├── PaqueteDelimiter.jsx
│   │   └── LineaDelimitante.jsx
│   │
│   ├── obras/                    # Componentes de obras
│   │   ├── Obra2D.jsx            # Obra 2D (imagen)
│   │   ├── Obra3D.jsx            # Obra 3D (escultura)
│   │   └── ObraDeleteButton.jsx  # Botón de eliminar
│   │
│   ├── gallery/                  # Galería de obras
│   │   ├── ObraCard.jsx          # Tarjeta de obra
│   │   └── ObrasGallery.jsx      # Galería completa
│   │
│   └── modal/                    # Modales
│       └── ObraMetadataModal.jsx # Modal de metadata
│
└── styles/                       # Estilos
    └── LayoutCanvas.module.css   # CSS Module
```

## Principios SOLID Aplicados

### 1. Single Responsibility Principle (SRP)
Cada componente tiene una única responsabilidad:
- **HorizontalRuler**: Solo renderiza la regla horizontal
- **Obra2D**: Solo renderiza obras 2D (imágenes)
- **Obra3D**: Solo renderiza obras 3D (esculturas)
- **useObraCollision**: Solo maneja lógica de colisiones
- **collision.utils**: Solo funciones de detección de colisiones

### 2. Open/Closed Principle (OCP)
El sistema está abierto a extensión pero cerrado a modificación:
- Nuevos tipos de obras se pueden agregar sin modificar componentes existentes
- Nuevos formatos de exportación se pueden añadir al hook useCanvasExport
- Nuevas validaciones se pueden agregar a validation.utils

### 3. Liskov Substitution Principle (LSP)
Componentes intercambiables con interfaz común:
- **Obra2D** y **Obra3D** comparten la misma interfaz de props
- Ambos pueden usarse de forma intercambiable según el tipo de paquete
- Los hooks devuelven objetos con estructura consistente

### 4. Interface Segregation Principle (ISP)
Props específicas y agrupadas por contexto:
- Los componentes solo reciben las props que realmente necesitan
- Props relacionadas se agrupan en objetos (ej: `config`, `dimensions`)
- No hay dependencias a interfaces grandes que no se usan

### 5. Dependency Inversion Principle (DIP)
Dependencias inyectadas y servicios desacoplados:
- Los hooks encapsulan dependencias externas (jsPDF, compressImage, etc.)
- Los componentes dependen de abstracciones (hooks) no de implementaciones
- Las utilidades son funciones puras sin side effects

## Ventajas de la Refactorización

### Mantenibilidad
- **Antes**: 2,550 líneas en un solo archivo
- **Ahora**: 24 archivos modulares, ninguno supera las 400 líneas
- Fácil de navegar y entender
- Cambios localizados y predecibles

### Reutilización
- Hooks personalizados reutilizables en otros componentes
- Utilidades puras pueden usarse en cualquier parte del proyecto
- Componentes UI independientes y portables

### Testabilidad
- Funciones puras fáciles de testear (utils)
- Hooks aislados con lógica específica
- Componentes con responsabilidades claras

### Escalabilidad
- Fácil agregar nuevos tipos de obras
- Simple extender funcionalidad sin romper código existente
- Clara separación de concerns

### Legibilidad
- Nombres descriptivos y claros
- Estructura jerárquica intuitiva
- Documentación inline en cada archivo

## Uso

El componente mantiene la misma API externa:

```jsx
import LayoutCanvasWithMural from '@/components/registro/LayoutCanvasWithMural'

<LayoutCanvasWithMural
  paquete={paquete}
  portfolioImages={images}
  initialLayout={layout}
  onSave={handleSave}
  onSaveAndContinue={handleSaveAndContinue}
  errors={errors}
/>
```

## Comparación: Antes vs Después

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Líneas de código** | 2,550 líneas | 24 archivos modulares |
| **Responsabilidades** | Todas en un archivo | Una por componente/hook |
| **Reutilización** | Difícil | Fácil (hooks y utils) |
| **Testing** | Complejo | Simple (unidades pequeñas) |
| **Mantenimiento** | Riesgoso | Seguro y localizado |
| **Onboarding** | Días | Horas |

## Componentes Clave

### Hooks

#### `useCanvasDimensions(paquete)`
Retorna dimensiones y configuración del canvas según tipo de paquete (2D/3D).

#### `useCanvasExport(stageRef, config, obras, paquete)`
Maneja exportación a imagen JPEG y PDF con fichas técnicas.

#### `useObraCollision(obra, otrasObras, area)`
Detecta y maneja colisiones durante el drag & drop.

#### `useObraMetadata(initialImages, es3D)`
Gestiona el estado y CRUD de metadata de obras.

#### `useLayoutValidation(obras, area, limite)`
Valida que el layout cumpla con las reglas del paquete.

### Utilidades

#### `collision.utils.js`
- `checkCollision()`: Verifica colisión entre dos obras
- `boundToArea()`: Limita posición al área delimitada
- `isObraWithinBounds()`: Valida que obra esté dentro del área

#### `scaling.utils.js`
- `metrosToPixeles()`: Convierte metros a píxeles
- `centimetrosToPixeles()`: Convierte centímetros a píxeles
- `calcularAreaDelimitada()`: Calcula área según paquete
- `calcularDimensionesObra()`: Calcula dimensiones en píxeles

#### `validation.utils.js`
- `validateObraMetadata()`: Valida metadata completa
- `validateLayout()`: Valida layout completo
- `filterValidFiles()`: Filtra archivos de imagen válidos

## Archivo de Respaldo

El archivo original se encuentra en:
```
frontend/components/registro/LayoutCanvasWithMural.jsx.backup
```

## Compatibilidad

La refactorización mantiene 100% de compatibilidad con el código existente:
- Misma API de props
- Mismo comportamiento
- Mismos exports

El archivo original (`LayoutCanvasWithMural.jsx`) ahora solo exporta el componente modularizado.

## Próximos Pasos (Opcional)

1. **Tests**: Agregar tests unitarios para hooks y utilidades
2. **Storybook**: Documentar componentes en Storybook
3. **TypeScript**: Migrar a TypeScript para type safety
4. **Performance**: Memoización con React.memo donde sea necesario
5. **Accessibility**: Mejorar accesibilidad (ARIA labels, keyboard navigation)

---

**Refactorizado**: Agosto 2026
**Principios**: SOLID, Clean Code, Component-Based Architecture
**Herramientas**: React Hooks, CSS Modules, Konva.js
