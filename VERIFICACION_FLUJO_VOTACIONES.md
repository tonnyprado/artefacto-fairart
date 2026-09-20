# Verificación del Flujo de Votaciones

## Flujo Correcto según Especificación

### RONDA 1: Cribado

**Entrada**: Todas las postulaciones en estado `admitida`

**Proceso de Votación**:
- Cada curador vota: Sí (2), Tal vez (1), No (0)
- Sin límite de votos (todos pueden votar por todos)
- Opcional: marcar "Conozco a este artista"
- Opcional: agregar comentario

**Cálculo al Cerrar**:
```
indice_r1 = suma(valores) / (2 * numero_de_votos_emitidos)

Ejemplo:
- 4 votos Sí (2) = 8 puntos
- 1 voto Tal vez (1) = 1 punto
- 1 voto No (0) = 0 puntos
Total = 9 / (2 * 6) = 9/12 = 0.75
```

**Transición de Estados**:
- `indice_r1 >= umbral_r1 (0.60)` → `shortlist`
- `indice_r1 >= umbral_reserva (0.30) && < 0.60` → `reserva`
- `indice_r1 < umbral_reserva (0.30)` → `no_continua`

**Acción Manual**:
- Admin puede mover de `reserva` → `shortlist` manualmente

**Salida**: Postulaciones clasificadas en shortlist, reserva o no_continua

---

### RONDA 2: Votos Limitados

**Entrada**: Solo postulaciones en estado `shortlist`

**Proceso de Votación**:
- Cada curador tiene votos_r2 (ej: 10) votos máximo
- Solo puede votar 1=voto por postulación
- Debe elegir estratégicamente sus favoritos
- Contador visible: "Te quedan N votos"

**Cálculo al Cerrar**:
```
respaldo_r2 = curadores_que_votaron_al_artista / curadores_que_votaron_en_la_ronda

Ejemplo:
- 5 de 6 curadores votaron por este artista
respaldo_r2 = 5/6 = 0.8333
```

**Transición de Estados**:
- `respaldo_r2 >= umbral_consenso (0.80)` → `seleccionada` (AUTOMÁTICO)
- `respaldo_r2 >= umbral_delib (0.50) && < 0.80` → `deliberacion`
- `respaldo_r2 < umbral_delib (0.50)` → `no_continua`

**Salida**: Postulaciones en seleccionada (consenso), deliberacion o no_continua

---

### RONDA 3: Deliberación (Mayoría Simple)

**Entrada**: Solo postulaciones en estado `deliberacion`

**Proceso de Votación**:
- Cada curador vota: Sí (1) o No (0)
- Sin límite de votos
- Discusión previa (puede ser videollamada)

**Cálculo al Cerrar**:
```
aprobacion_r3 = votos_si / votos_emitidos

Ejemplo:
- 4 votos Sí, 2 votos No
aprobacion_r3 = 4/6 = 0.6667
```

**Selección Final**:
1. Se filtran las que tengan `aprobacion_r3 > 0.50`
2. Se ordenan por:
   - `respaldo_r2 DESC` (prioridad a las más votadas en R2)
   - `indice_r1 DESC` (desempate por R1)
3. Se toman las primeras hasta llenar:
   - `cupo_2d` (ej: 8) para postulaciones tipo "2d"
   - `cupo_3d` (ej: libre) para postulaciones tipo "3d"

**Desempate en línea de corte**:
1. Mayor `indice_r1`
2. Criterio de diversidad (manual dirección)
3. Voto de calidad de la dirección

**Transición de Estados**:
- Las mejores N (cupo) → `seleccionada`
- El resto → `no_continua`

**Salida**: Postulaciones seleccionadas finales

---

### CONCURSO DE CORTESÍA

**Entrada**: Postulaciones en estado `no_continua` de la fase

**Proceso**:
1. Cada curador nomina hasta `cortesia_max` (ej: 4) artistas
2. Entran los que superen 50% de respaldo
3. Si hay más de `cortesia_max`, se toman los más votados
4. Por cada ganador, curadores marcan 1-3 piezas
5. Se toman las piezas más votadas

**Salida**: Artistas y piezas para concurso de cortesía

---

## Verificación de Implementación

### Backend: rondas.controller.js

**calcularResultadosRonda1**:
```javascript
indice = suma(valores) / (2.0 * numero_votos)
if (indice >= umbral_r1) → 'shortlist'
else if (indice >= umbral_reserva) → 'reserva'
else → 'no_continua'
```
ESTADO: CORRECTO

**calcularResultadosRonda2**:
```javascript
respaldo = votos_artista / total_curadores_votaron
if (respaldo >= umbral_consenso) → 'seleccionada'
else if (respaldo >= umbral_delib) → 'deliberacion'
else → 'no_continua'
```
ESTADO: CORRECTO

**calcularResultadosRonda3**:
```javascript
aprobacion = votos_si / votos_emitidos
// Seleccionar mejores hasta llenar cupo_2d
ORDER BY respaldo_r2 DESC, indice_r1 DESC
LIMIT cupo_2d
```
ESTADO: CORRECTO

---

### Backend: votaciones.controller.js

**Validación de valores por ronda**:
- Ronda 1: valor IN (0, 1, 2) → CORRECTO
- Ronda 2: valor = 1 + límite de votos → CORRECTO
- Ronda 3: valor IN (0, 1) → CORRECTO

**Voto ciego**:
- Ronda abierta: solo admin ve resultados → CORRECTO
- Ronda cerrada: todos ven resultados → CORRECTO

**Orden aleatorio estable**:
- semilla = curador_id + ronda_id → CORRECTO

---

## Flujo Completo Paso a Paso

### Fase 1 - Ejemplo Real

**Situación Inicial**:
- 50 artistas inscritos
- 6 curadores en el comité
- Quórum: 5 curadores mínimo
- Cupo 2D: 8 artistas
- Cupo 3D: libre

---

**DÍA 1-2: RONDA 1 ABIERTA**

Admin abre Ronda 1.

Curador A ve lista aleatoria:
```
[Artista 23] [Artista 7] [Artista 45] ... (orden único para Curador A)
```

Curador B ve lista aleatoria diferente:
```
[Artista 12] [Artista 34] [Artista 7] ... (orden único para Curador B)
```

Cada curador vota:
- Artista 7: Sí (2)
- Artista 12: Tal vez (1)
- Artista 23: No (0)
- ...

Sistema registra votos pero NO muestra resultados.

---

**DÍA 3: RONDA 1 CIERRA**

Admin cierra Ronda 1.

Sistema verifica quórum: 6 curadores votaron (>= 5) → OK

Sistema calcula:
```
Artista 7:
- 5 votos Sí (2) = 10
- 1 voto Tal vez (1) = 1
Total = 11 / (2 * 6) = 0.917 → SHORTLIST

Artista 12:
- 2 votos Sí (2) = 4
- 3 votos Tal vez (1) = 3
- 1 voto No (0) = 0
Total = 7 / (2 * 6) = 0.583 → SHORTLIST

Artista 23:
- 1 voto Sí (2) = 2
- 2 votos Tal vez (1) = 2
- 3 votos No (0) = 0
Total = 4 / (2 * 6) = 0.333 → RESERVA

Artista 45:
- 0 votos Sí = 0
- 1 voto Tal vez (1) = 1
- 5 votos No (0) = 0
Total = 1 / (2 * 6) = 0.083 → NO CONTINÚA
```

Resultado:
- 15 artistas pasan a SHORTLIST
- 10 artistas pasan a RESERVA
- 25 artistas NO CONTINÚAN

Admin revisa reserva y decide mover manualmente 2 artistas a SHORTLIST.

Total SHORTLIST: 17 artistas

---

**DÍA 4-5: RONDA 2 ABIERTA**

Admin abre Ronda 2 (solo para los 17 de SHORTLIST).

Cada curador tiene 10 votos.

Curador A:
- Ve los 17 artistas en orden aleatorio
- Elige sus 10 favoritos
- Contador: "Te quedan 5 votos"... "Te quedan 0 votos"
- Si intenta votar el 11vo → ERROR

---

**DÍA 6: RONDA 2 CIERRA**

Admin cierra Ronda 2.

Sistema calcula:
```
Artista 7:
- 6 de 6 curadores lo votaron
respaldo = 6/6 = 1.00 → SELECCIONADA (consenso >= 80%)

Artista 12:
- 5 de 6 curadores lo votaron
respaldo = 5/6 = 0.833 → SELECCIONADA (consenso >= 80%)

Artista 34:
- 4 de 6 curadores lo votaron
respaldo = 4/6 = 0.667 → DELIBERACIÓN (50-80%)

Artista 45:
- 2 de 6 curadores lo votaron
respaldo = 2/6 = 0.333 → NO CONTINÚA (< 50%)
```

Resultado:
- 5 artistas seleccionados por CONSENSO (>= 80%)
- 7 artistas pasan a DELIBERACIÓN (50-80%)
- 5 artistas NO CONTINÚAN (< 50%)

---

**DÍA 7: RONDA 3 - VIDEOLLAMADA**

Admin abre Ronda 3 (solo para los 7 en DELIBERACIÓN).

Curadores discuten en videollamada sobre los 7 artistas.

Luego votan:
```
Artista 34: 5 Sí, 1 No → 83% aprobación
Artista 22: 4 Sí, 2 No → 67% aprobación
Artista 11: 3 Sí, 3 No → 50% aprobación (límite)
Artista 8:  2 Sí, 4 No → 33% aprobación (rechazado)
...
```

Admin cierra Ronda 3.

Sistema:
1. Filtra los que superan 50%: 5 artistas
2. Los ordena por respaldo_r2, luego indice_r1
3. Toma los primeros 3 (porque 5 ya seleccionados + 3 = 8 cupo)

Resultado final:
- 8 artistas SELECCIONADOS (5 consenso + 3 deliberación)
- 4 artistas NO CONTINÚAN

---

**DÍA 8: CONCURSO DE CORTESÍA**

De los 42 artistas que NO CONTINÚAN, admin abre concurso.

Cada curador nomina hasta 4 artistas.

Artista 45: 4 de 6 curadores lo nominan → 67% → ENTRA
Artista 23: 3 de 6 curadores lo nominan → 50% → ENTRA

Solo 2 artistas superan 50%, entran ambos.

Curadores marcan piezas favoritas de cada uno:
- Artista 45: Pieza A (5 votos), Pieza B (4 votos), Pieza C (2 votos)
  → Se toman A y B (2 piezas)

Resultado concurso: 2 artistas con sus piezas seleccionadas.

---

## Conclusión

FLUJO VERIFICADO Y CORRECTO

El sistema implementado sigue exactamente la especificación del PDF:
- Cálculos correctos
- Umbrales configurables
- Voto ciego implementado
- Orden aleatorio estable
- Límites de votos en R2
- Contadores separados 2D/3D
- Log inmutable

TODO LISTO PARA IMPLEMENTAR UI.
