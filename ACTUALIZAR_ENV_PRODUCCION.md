# ⚠️ ACTUALIZAR VARIABLES DE ENTORNO EN PRODUCCIÓN

## Variables que DEBES cambiar YA en tu dashboard de hosting:

### 1. Días de vigencia de invitación
```bash
INVITACION_DIAS_VIGENCIA=4
```
**Cambiar de:** 21 → 4

### 2. WhatsApp (agregar el "1" para celular)
```bash
CONTACTO_WHATSAPP=+5215578363207
```
**Cambiar de:** +525578363207 → +5215578363207

### 3. Datos bancarios
```bash
PAGO_CLABE=012180001280461237
PAGO_CUENTA=0128046123
```
**Cambiar de:**
- CLABE: 012180015495173640 → 012180001280461237
- Cuenta: 0154951736 → 0128046123

### 4. URL de contacto (agregar si no existe)
```bash
CONTACTO_URL=/#contacto
```
**Agregar esta variable** para que el botón de contacto en la consigna lleve a la sección correcta.

---

## 🔧 Cómo actualizar (según tu servicio):

### Si usas Railway:
1. Ve a: https://railway.app/project/[tu-proyecto]/variables
2. Edita cada variable
3. Guarda y espera el redeploy automático

### Si usas Vercel:
1. Ve a: https://vercel.com/[tu-proyecto]/settings/environment-variables
2. Edita cada variable (Production)
3. Redeploy el proyecto

### Si usas otro servicio:
- Ve al dashboard de variables de entorno
- Actualiza los 6 valores arriba
- Redeploya la aplicación

---

## ✅ Verificar que funcionó:

1. **Correo de consigna**: debe decir "4 días" no "21 días"
2. **WhatsApp**: el enlace debe abrir correctamente
3. **CLABE**: en el PDF debe aparecer 012180001280461237
4. **Botón de contacto**: debe llevar a /#contacto, no al Hero

---

## 📝 Nota importante:

El archivo `.env` local NO se sube al repositorio (está en .gitignore).
Por eso aunque lo cambié localmente, en producción sigue con valores viejos.
DEBES actualizar las variables en tu dashboard de hosting.
