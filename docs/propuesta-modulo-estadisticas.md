# Propuesta: Módulo de Estadísticas para Panel de Administración

**Fecha:** Septiembre 2026
**Proyecto:** ARTEFACTO - Plataforma de Feria de Arte
**Versión:** 1.0

---

## Resumen Ejecutivo

Se propone desarrollar un **módulo de estadísticas y analytics** integrado al panel de administración existente. Este módulo permitirá visualizar métricas clave sobre el comportamiento de los visitantes en la plataforma, específicamente enfocado en entender el proceso de registro de artistas y la efectividad de las acciones de marketing.

---

## ¿Qué problema resuelve?

Actualmente no existe forma de saber:

- ¿Cuántas personas visitan la página?
- ¿Cuántas personas inician el proceso de registro pero no lo terminan?
- ¿En qué paso del registro se "pierden" los artistas?
- ¿Cuántas personas descargan la convocatoria?
- ¿Qué tan efectivas son las campañas de marketing?

**Sin datos, es imposible mejorar.**

---

## ¿Qué incluye esta solución?

### 1. Panel de Estadísticas en Tiempo Real

Una nueva sección en el panel de administración que muestra:

| Métrica | Descripción |
|---------|-------------|
| **Visitantes Activos** | Cuántas personas están en el sitio en este momento |
| **Visitas del Día** | Total de visitas hoy vs. ayer |
| **Registros Completados** | Artistas que terminaron su inscripción |
| **Tasa de Conversión** | % de visitantes que se convierten en registros |

### 2. Embudo de Registro Visual

Visualización clara de cuántas personas llegan a cada paso:

```
Visitan la página        → 1,000 personas (100%)
Hacen clic en Registro   →   450 personas (45%)
Llenan datos personales  →   380 personas (38%)
Seleccionan paquete      →   250 personas (25%)
Suben documentos         →   180 personas (18%)
Completan registro       →   140 personas (14%)
```

Esto permite identificar exactamente **dónde se pierden los artistas potenciales**.

### 3. Seguimiento de Acciones Clave

Se registrará automáticamente cuando alguien:

- Visite cualquier página del sitio
- Haga clic en el botón de "Inscríbete"
- Descargue la convocatoria (PDF)
- Avance en cada paso del formulario de registro
- Complete su inscripción exitosamente

### 4. Historial y Tendencias

- Gráfica de visitas de los últimos 30 días
- Comparativas: esta semana vs. semana anterior
- Identificación de días/horarios con más actividad

---

## Beneficios para el Negocio

| Beneficio | Impacto |
|-----------|---------|
| **Medir efectividad de campañas** | Saber si la publicidad está funcionando |
| **Optimizar el registro** | Identificar y arreglar los pasos donde se pierden artistas |
| **Tomar decisiones informadas** | Datos reales en lugar de suposiciones |
| **Reportes para patrocinadores** | Demostrar el alcance de la plataforma |
| **Mejorar conversión** | Más artistas inscritos con el mismo tráfico |

---

## Entregables

1. **Base de datos** configurada para almacenar eventos
2. **Sistema de tracking** invisible para los visitantes
3. **Panel de estadísticas** integrado al admin existente
4. **4 visualizaciones principales:**
   - Métricas en tiempo real
   - Embudo de registro
   - Gráfica de tendencias
   - Lista de actividad reciente

---

## Inversión

| Concepto | Monto |
|----------|-------|
| Desarrollo del módulo de estadísticas | $3,000.00 MXN |
| IVA (16%) | $480.00 MXN |
| **Total** | **$3,480.00 MXN** |

### Desglose Fiscal (Facturación)

| Concepto | Monto |
|----------|-------|
| Subtotal | $3,000.00 MXN |
| + IVA (16%) | $480.00 MXN |
| - Retención ISR (10%) | -$300.00 MXN |
| - Retención IVA (2/3) | -$320.00 MXN |
| **Neto a pagar** | **$2,860.00 MXN** |

---

## Tiempo de Entrega

El módulo estará completamente funcional en **2 días hábiles** después de la aprobación.

---

## Notas Importantes

- Los datos se almacenan en la misma base de datos del proyecto (PostgreSQL), no en servicios externos
- No se recopila información personal de los visitantes, solo estadísticas anónimas
- El sistema es ligero y no afecta el rendimiento del sitio
- Compatible con el diseño actual del panel de administración

---

## Siguiente Paso

Para proceder con el desarrollo, se requiere:

1. Aprobación de esta propuesta
2. Anticipo del 50% ($1,740 MXN)
3. Liquidación del 50% restante al entregar

---

**¿Preguntas?** Estoy disponible para aclarar cualquier duda sobre esta propuesta.
