# Cron Jobs en Fly.io

Fly.io no tiene cron nativo, pero hay 2 opciones simples:

## Opción 1: GitHub Actions (Recomendado - GRATIS)

Crear `.github/workflows/cron-recordatorios.yml`:

```yaml
name: Cron - Recordatorios

on:
  schedule:
    - cron: '0 * * * *'  # Cada hora
  workflow_dispatch:  # Permite ejecución manual

jobs:
  trigger-cron:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger recordatorios
        run: |
          curl -X POST https://artefacto-backend.fly.dev/api/cron/recordatorios \
            -H "Content-Type: application/json" \
            -H "X-Cron-Secret: ${{ secrets.CRON_SECRET }}"
```

**Setup:**
1. Ir a tu repo en GitHub
2. Settings → Secrets and variables → Actions
3. New repository secret: `CRON_SECRET` = (valor secreto)
4. Crear el archivo workflow
5. ¡Listo! GitHub ejecutará cada hora

**Ventajas:**
- ✅ Completamente gratis
- ✅ Súper confiable
- ✅ Fácil de configurar
- ✅ Logs en GitHub Actions

## Opción 2: EasyCron (Servicio Externo)

1. Crear cuenta en https://www.easycron.com (gratis hasta 250 tareas/mes)
2. Crear cron job:
   - URL: `https://artefacto-backend.fly.dev/api/cron/recordatorios`
   - Method: POST
   - Headers: `X-Cron-Secret: tu_secreto`
   - Interval: Every hour
3. ¡Listo!

## Opción 3: Fly Machines (Avanzado)

Crear una Fly Machine dedicada para cron:

```bash
# Crear script
cat > cron-worker.js << 'EOF'
const https = require('https');

function triggerCron() {
  const options = {
    hostname: 'artefacto-backend.fly.dev',
    path: '/api/cron/recordatorios',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Cron-Secret': process.env.CRON_SECRET
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
  });

  req.on('error', (e) => {
    console.error(`Error: ${e.message}`);
  });

  req.end();
}

// Ejecutar cada hora
setInterval(triggerCron, 60 * 60 * 1000);
triggerCron(); // Ejecutar inmediatamente
EOF

# Deploy como worker
fly deploy --config fly.worker.toml
```

## Recomendación

**Usa GitHub Actions (Opción 1)** - Es gratis, confiable y fácil de mantener.

## Proteger el Endpoint de Cron

En tu backend, verificar el header:

```javascript
// src/routes/cron.routes.js
router.post('/recordatorios', (req, res) => {
  const cronSecret = req.headers['x-cron-secret'];

  if (cronSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // ... ejecutar cron
});
```
