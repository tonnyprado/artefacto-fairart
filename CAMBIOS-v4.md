# Cambios v4 · Guía rápida para Tony

Dos cambios en esta versión:
1. El pago del 50% del paquete pasa de **24 a 48 horas**.
2. El 3% ya **no se llama "pago con tarjeta"**: ahora es **"gastos de gestión administrativa"** (indicación de la contadora).

Las rutas son relativas a la raíz del paquete. Los archivos de `shared/` existen **dos veces** y deben quedar idénticos:
- `backend/src/shared/…`
- `frontend/src/features/consigna/shared/…`

> Atajo: busca en todo el proyecto `24 h`, `24 horas`, `veinticuatro`, `tarjeta` y `TARJETA`. Al terminar no debe quedar ninguna coincidencia relacionada con el pago del paquete ni con el 3%. Las únicas que se quedan son `TarjetaObra.tsx` y la variable `tarjeta` de `tema.ts` y `PasoFiscal.tsx`: esas se refieren a la tarjeta de diseño (UI), no al pago.

---

## 1 · Plazo de 48 horas

| # | Archivo | Ubicación | Texto anterior | Texto nuevo |
|---|---|---|---|---|
| 1.1 | `shared/acuerdo.ts` (×2) | Cláusula `n: "2"` → `resumen`, 2.ª viñeta | `Al firmar, cubres el 50% de tu paquete en las siguientes 24 horas y nos envías el comprobante.` | `Al firmar, cubres el 50% de tu paquete en las siguientes 48 horas y nos envías el comprobante.` |
| 1.2 | `shared/acuerdo.ts` (×2) | Cláusula `n: "2"` → `textoLegal`, 2.º párrafo | `…a cubrir el 50% del monto de su paquete dentro de las veinticuatro horas siguientes, enviando…` | `…a cubrir el 50% del monto de su paquete dentro de las cuarenta y ocho horas siguientes, enviando…` |
| 1.3 | `shared/acuerdo.ts` (×2) | Cláusula `n: "6"` → `resumen`, 1.ª viñeta | `Tu paquete lo transfieres a la cuenta de abajo: 50% en las 24 h posteriores a tu firma y el saldo restante antes del 24 de octubre de 2026.` | `Tu paquete lo transfieres a la cuenta de abajo: 50% en las 48 h posteriores a tu firma y el saldo restante antes del 24 de octubre de 2026.` |
| 1.4 | `backend/.env.example` **y tu `.env` real** | Variable `PAGO_PLAZOS` (alimenta la tarjeta del paso 6 y el PDF) | `50% dentro de las 24 horas posteriores a la firma; saldo restante a más tardar el 24 de octubre de 2026.` | `50% dentro de las 48 horas posteriores a la firma; saldo restante a más tardar el 24 de octubre de 2026.` |
| 1.5 | `backend/src/services/ConsignaService.ts` | Método `enviar()` → correo al artista (`texto:`) | `Recuerda cubrir el 50% de tu paquete en las próximas 24 horas.` | `Recuerda cubrir el 50% de tu paquete en las próximas 48 horas.` |
| 1.6 | `frontend/src/features/consigna/componentes/pasos/PasoEnviado.tsx` | Párrafo bajo "Acuerdo recibido" | `Recuerda cubrir el 50% de tu paquete en las próximas 24 horas.` | `Recuerda cubrir el 50% de tu paquete en las próximas 48 horas.` |

---

## 2 · "Pago con tarjeta" → "Gastos de gestión administrativa"

### 2A · Textos visibles (acuerdo, app y PDF)

| # | Archivo | Ubicación | Texto anterior | Texto nuevo |
|---|---|---|---|---|
| 2.1 | `shared/acuerdo.ts` (×2) | Cláusula `n: "5"` → `resumen`, 3.ª viñeta | `…Al público se suma IVA (16%) y 3% de comisión por pago con tarjeta — lo cubre el comprador. Tú recibes tu 75% más su IVA.` | `…Al público se suma IVA (16%) y 3% por gastos de gestión administrativa — lo cubre el comprador. Tú recibes tu 75% más su IVA.` |
| 2.2 | `shared/acuerdo.ts` (×2) | Cláusula `n: "5"` → `textoLegal`, párrafo "Sobre el precio de venta…" | `Sobre el precio de venta se agrega el Impuesto al Valor Agregado (16%) y una comisión del 3% por pago con tarjeta, correspondiente al uso de la terminal bancaria. Ambos importes corren por cuenta del comprador…` | `Sobre el precio de venta se agrega el Impuesto al Valor Agregado (16%) y un 3% por concepto de gastos de gestión administrativa de la operación de venta. Ambos importes corren por cuenta del comprador…` |
| 2.3 | `frontend/…/componentes/pasos/PasoObras.tsx` | Párrafo rojo arriba de la tabla | `Edita tu precio ya considerando IVA y comisión por pago con tarjeta. Lo demás se recalcula y registramos la diferencia.` | `Edita tu precio ya considerando IVA y gastos de gestión administrativa. Lo demás se recalcula y registramos la diferencia.` |
| 2.4 | `frontend/…/componentes/obras/FormulaPrecio.tsx` | Fórmula visual | `<span>+ IVA 16% + tarjeta 3% =</span>` | `<span>+ IVA 16% + gestión administrativa 3% =</span>` |
| 2.5 | `frontend/…/componentes/obras/TablaObras.tsx` | Constante `COLUMNAS` (encabezado) | `['Tarjeta 3%']` | `['Gestión adm. 3%']` |
| 2.6 | `frontend/…/componentes/obras/TablaObras.tsx` | Nota bajo la tabla | `…IVA y tarjeta los paga el comprador; tú recibes…` | `…IVA y gestión administrativa los paga el comprador; tú recibes…` |
| 2.7 | `frontend/…/componentes/obras/TarjetaObra.tsx` | Fila del desglose (vista móvil) | `{fila('Tarjeta 3%', formatoMXN(d.tarjeta))}` | `{fila('Gestión adm. 3%', formatoMXN(d.gestionAdmin))}` |

### 2B · Código (identificadores)

| # | Archivo | Texto anterior | Texto nuevo |
|---|---|---|---|
| 2.8 | `shared/precios.ts` (×2) | `export const TARJETA = 0.03;    // siempre incluido en el precio público` | `export const GESTION_ADMIN = 0.03; // gastos de gestión administrativa (siempre incluido)` |
| 2.9 | `shared/precios.ts` (×2), interfaz `Desglose` | `tarjeta: number;        // 3% sobre (venta + IVA)` | `gestionAdmin: number;   // 3% gastos de gestión administrativa sobre (venta + IVA)` |
| 2.10 | `shared/precios.ts` (×2), `desglosar()` | `const tarjeta = (precioVenta + iva) * TARJETA;` | `const gestionAdmin = (precioVenta + iva) * GESTION_ADMIN;` |
| 2.11 | `shared/precios.ts` (×2), `return` de `desglosar()` | `tarjeta: r2(tarjeta),` / `precioPublico: r2(precioVenta + iva + tarjeta),` | `gestionAdmin: r2(gestionAdmin),` / `precioPublico: r2(precioVenta + iva + gestionAdmin),` |
| 2.12 | `shared/precios.ts` (×2), `gananciaDesdePublico()` | `((1 + IVA) * (1 + TARJETA))` | `((1 + IVA) * (1 + GESTION_ADMIN))` |
| 2.13 | `frontend/…/componentes/obras/FilaObra.tsx` | `formatoMXN(d.tarjeta)` | `formatoMXN(d.gestionAdmin)` |
| 2.14 | `backend/src/shared/precios.test.ts` | `expect(d.tarjeta)` | `expect(d.gestionAdmin)` |
| 2.15 | `backend/src/repositories/pg/PgConsignaRepos.ts`, `PgAcuerdosRepo.crear()` | Lista de columnas: `… precio_venta, iva, tarjeta, precio_publico)` · Valores: `d.tarjeta` | `… precio_venta, iva, gastos_admin, precio_publico)` · `d.gestionAdmin` |

### 2C · Base de datos

| # | Archivo | Texto anterior | Texto nuevo |
|---|---|---|---|
| 2.16 | `backend/migrations/001_esquema_consigna.sql`, tabla `consigna.acuerdo_obras` | `tarjeta            numeric(12,2) NOT NULL,` | `gastos_admin       numeric(12,2) NOT NULL,  -- 3% gastos de gestión administrativa` |

**Si ya corriste la migración 001:** ejecuta esto una vez. Solo toca el esquema nuevo `consigna`; no afecta artistas, fases ni curadores.
```sql
ALTER TABLE consigna.acuerdo_obras RENAME COLUMN tarjeta TO gastos_admin;
```

---

## 3 · Versión del acuerdo

| Archivo | Texto anterior | Texto nuevo |
|---|---|---|
| `shared/acuerdo.ts` (×2) | `export const VERSION_ACUERDO = 'AF2-consigna-v3';` | `export const VERSION_ACUERDO = 'AF2-consigna-v4';` |

---

## 4 · Verificación rápida
1. `diff -r backend/src/shared frontend/src/features/consigna/shared`: solo debe diferir el `.test.ts`.
2. `cd backend && npm test`: las pruebas de precios deben pasar.
3. Recorrido en la app:
   - **Paso 2:** dice "48 horas".
   - **Paso 5:** dice "gastos de gestión administrativa".
   - **Paso 6:** la tarjeta de pago dice "48 h".
   - **Paso 10:** la columna dice "Gestión adm. 3%".
   - **PDF:** cláusulas 2 y 5 actualizadas.
   - **Correo:** dice "48 horas".
4. Busca `tarjeta` en el PDF generado: no debe aparecer.

El texto legal completo y actualizado también viene en `docs/Acuerdo-texto-legal-v4.docx`, y el prototipo de referencia en `referencia/prototipo-aprobado.html`.
