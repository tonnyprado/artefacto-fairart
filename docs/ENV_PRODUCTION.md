# Variables de Entorno para Producción

## 🚨 IMPORTANTE: Configurar en Railway/Vercel

Estas variables deben configurarse en el dashboard de deployment (Railway, Vercel, etc.) para que el sistema funcione correctamente.

---

## ✅ Variables Requeridas para Consignación

### URLs y Configuración General

```bash
PUBLIC_APP_URL=https://arte-facto.mx/consigna
INVITACION_DIAS_VIGENCIA=4
EDICION_SUFIJO=AF2
```

### Datos de Pago (Críticos para PDF)

```bash
PAGO_BENEFICIARIO=ARTE FACTO ETICAS CREATIVAS, S. de R.L. de C.V.
PAGO_BANCO=BBVA
PAGO_CLABE=012180015495173640
PAGO_CUENTA=0154951736
PAGO_PLAZOS=Feria: 15 días o 10 mar 2027; Post-evento: 15 días (hasta 6 meses)
```

### Contacto

```bash
CONTACTO_WHATSAPP=+525578363207
CONTACTO_URL=https://arte-facto.mx/#contacto
```

### S3 Configuration

```bash
S3_CONSIGNA_BUCKET=artefacto-artistas
S3_CONSIGNA_PREFIX=consigna/
FIRMA_DIRECCION_KEY=assets/firma-direccion.png
```

### Emails Admin

```bash
ADMIN_EMAILS=curatorial@arte-facto.mx
```

### Plantillas Brevo (Opcional - Configurar después)

```bash
# BREVO_TEMPLATE_CONSIGNA_INVITACION=4
# BREVO_TEMPLATE_CONSIGNA_RECHAZO=5
# BREVO_TEMPLATE_CONSIGNA_ACUERDO=6
```

---

## 📋 Checklist de Configuración

### Railway

1. Ir a: https://railway.app/project/[tu-proyecto]/variables
2. Click en "+ New Variable"
3. Agregar cada variable con su valor
4. Click en "Deploy" para aplicar cambios

```bash
# Copiar y pegar todas estas variables:
PUBLIC_APP_URL=https://arte-facto.mx/consigna
INVITACION_DIAS_VIGENCIA=4
EDICION_SUFIJO=AF2
PAGO_BENEFICIARIO=ARTE FACTO ETICAS CREATIVAS, S. de R.L. de C.V.
PAGO_BANCO=BBVA
PAGO_CLABE=012180015495173640
PAGO_CUENTA=0154951736
PAGO_PLAZOS=Feria: 15 días o 10 mar 2027; Post-evento: 15 días (hasta 6 meses)
CONTACTO_WHATSAPP=+525578363207
CONTACTO_URL=https://arte-facto.mx/#contacto
S3_CONSIGNA_BUCKET=artefacto-artistas
S3_CONSIGNA_PREFIX=consigna/
FIRMA_DIRECCION_KEY=assets/firma-direccion.png
ADMIN_EMAILS=curatorial@arte-facto.mx
```

### Vercel

1. Ir a: https://vercel.com/[tu-proyecto]/settings/environment-variables
2. Agregar cada variable en el campo correspondiente
3. Seleccionar entorno: Production
4. Click en "Save"
5. Redeploy el proyecto

---

## 🔍 Verificación

Después de configurar las variables, verificar en los logs que aparezca:

```
✅ Módulo Consigna cargado (público + admin)
✅ Configuración de Consigna validada
```

Si aparece:
```
❌ Error al cargar Consigna: Faltan variables de entorno requeridas...
```

Significa que alguna variable no fue configurada correctamente.

---

## 📝 Notas Importantes

1. **PAGO_BENEFICIARIO**: Usar razón social completa sin comillas
2. **PAGO_CLABE**: 18 dígitos (verificar con banco)
3. **PUBLIC_APP_URL**: Debe coincidir con el dominio de producción del frontend
4. **S3_CONSIGNA_BUCKET**: Puede ser el mismo bucket existente (artefacto-artistas) usando prefix diferente
5. **ADMIN_EMAILS**: Separar múltiples emails con comas (sin espacios)

---

## 🔐 Seguridad

- ⚠️ NUNCA commitear el archivo `.env` con valores reales al repositorio
- ✅ Usar variables de entorno del servicio de deployment
- ✅ Rotar claves periódicamente
- ✅ Usar buckets S3 privados para consignación

---

## 🆘 Troubleshooting

### Error: "Faltan variables de entorno"

**Solución**: Verificar que TODAS las variables requeridas estén configuradas en el dashboard de deployment.

### Error: "Cannot access S3 bucket"

**Solución**: Verificar que:
- `AWS_ACCESS_KEY_ID` y `AWS_SECRET_ACCESS_KEY` estén configuradas
- El bucket existe en la región especificada
- Las credenciales tienen permisos de lectura/escritura

### PDFs no se generan

**Solución**: Verificar que:
- `PAGO_BENEFICIARIO` y `PAGO_CLABE` estén configuradas
- `FIRMA_DIRECCION_KEY` apunte a una imagen válida en S3

---

## 📚 Referencias

- Documentación completa: `/docs/CONSIGNA.md`
- Deployment checklist: `/docs/DEPLOYMENT_CHECKLIST.md`
- Templates de email: `/docs/BREVO_TEMPLATES.md`
