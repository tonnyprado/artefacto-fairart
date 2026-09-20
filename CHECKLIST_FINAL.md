# Checklist Final - Sistema de Votaciones

## ✅ Verificación Rápida

### Backend

- [ ] Servidor backend iniciado: `cd backend && npm start`
- [ ] Health check funciona: `curl http://localhost:4000/health`
- [ ] Base de datos conectada (ver log: "PostgreSQL conectado exitosamente")
- [ ] Rutas registradas (ver log al iniciar)

### Frontend

- [ ] Servidor frontend iniciado: `cd frontend && npm run dev`
- [ ] Aplicación carga en: `http://localhost:3000`

### Testing Curador

- [ ] Iniciar sesión como curador
- [ ] Ver panel de curador con sidebar
- [ ] Click en tab "Votar"
- [ ] Ver mensaje "No hay rondas activas" O ver PanelVotacionRondas si hay ronda abierta

### Testing Admin

- [ ] Iniciar sesión como admin
- [ ] Ver panel de admin
- [ ] Click en tab "Fases"
- [ ] Ver botón "Gestionar Rondas"
- [ ] Click en "Gestionar Rondas"
- [ ] Navegar a /admin/fases
- [ ] Ver lista de fases
- [ ] Click en "Gestionar Rondas" de una fase
- [ ] Ver PanelAdminRondas con configuración de fase
- [ ] Ver tabla de rondas (vacía si es primera vez)
- [ ] Click en "Crear Ronda"
- [ ] Ver modal de creación
- [ ] Seleccionar Ronda 1
- [ ] Click en "Crear Ronda"
- [ ] Ver ronda en la tabla
- [ ] Click en "Abrir Ronda"
- [ ] Confirmar
- [ ] Ver badge "Abierta" en la ronda

### Testing Flujo de Votación

- [ ] Como admin: Tener ronda abierta
- [ ] Como curador: Ir a tab "Votar"
- [ ] Ver PanelVotacionRondas
- [ ] Ver header con nombre de ronda
- [ ] Ver progreso "0 / X"
- [ ] Ver filtros
- [ ] Ver grid de postulaciones
- [ ] Click en una postulación
- [ ] Ver modal FichaPostulacion
- [ ] Ver galería de obras
- [ ] Ver control de votación (adaptado a ronda)
- [ ] Seleccionar voto
- [ ] (Opcional) Marcar "Conozco a este artista"
- [ ] (Opcional) Agregar comentario
- [ ] Click en "Guardar Voto"
- [ ] Modal se cierra
- [ ] Postulación muestra badge "Votado"
- [ ] Progreso actualizado "1 / X"

### Testing Cierre de Ronda

- [ ] Como admin: Ver estadísticas de ronda
- [ ] Ver participación de curadores
- [ ] Ver tabla de quién votó
- [ ] Click en "Cerrar Ronda"
- [ ] Confirmar
- [ ] Ver mensaje de éxito con estadísticas
- [ ] Ver badge "Cerrada" en la ronda
- [ ] Como curador: Intentar votar
- [ ] Ver mensaje "No hay rondas activas"

## 🔍 Verificaciones Técnicas

### Base de Datos

```sql
-- Conectar a PostgreSQL
psql "postgresql://[user]:[pass]@[host]/artefact_db"

-- Verificar tablas
\dt

-- Debería mostrar:
-- rondas
-- postulaciones
-- votaciones (modificada)
-- obras (modificada)
-- justificaciones
-- seleccion_piezas
-- log_votaciones
```

### API Endpoints

```bash
# Listar rondas de fase
curl http://localhost:4000/api/rondas/fase/1 \
  -H "Authorization: Bearer [TOKEN]"

# Crear ronda
curl -X POST http://localhost:4000/api/rondas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{"fase_id":1,"numero":1,"votos_asignados":null}'

# Abrir ronda
curl -X POST http://localhost:4000/api/rondas/[ID]/abrir \
  -H "Authorization: Bearer [TOKEN]"

# Cerrar ronda
curl -X POST http://localhost:4000/api/rondas/[ID]/cerrar \
  -H "Authorization: Bearer [TOKEN]"
```

## 🚨 Problemas Comunes

### "No se pueden ver los resultados de una ronda abierta"
✅ **Esperado** - Sistema de voto ciego activo. Solo admin puede ver resultados de ronda abierta.

### "No hay postulaciones que coincidan con los filtros"
✅ **Verificar:**
- Ronda 1: requiere postulaciones en estado "admitida"
- Ronda 2: requiere postulaciones en estado "shortlist"
- Ronda 3: requiere postulaciones en estado "deliberacion"

### "No se puede cerrar la ronda"
✅ **Verificar:**
- Que se alcanzó el quórum mínimo (config.quorum curadores votaron)

### "Error al crear votación"
✅ **Verificar:**
- Valor de voto correcto para la ronda:
  - R1: 0, 1, o 2
  - R2: 1
  - R3: 0 o 1

## 📊 Estado Final

Marcar cuando todo esté funcionando:

- [ ] ✅ Backend funcionando correctamente
- [ ] ✅ Frontend funcionando correctamente
- [ ] ✅ Curador puede acceder y votar
- [ ] ✅ Admin puede gestionar rondas
- [ ] ✅ Cálculos automáticos funcionan al cerrar ronda
- [ ] ✅ Voto ciego implementado correctamente
- [ ] ✅ Límite de votos en R2 funciona
- [ ] ✅ Estadísticas se muestran correctamente

## 🎯 Sistema Listo

Si todos los items están marcados:

**🎉 ¡FELICIDADES! El sistema de votaciones por rondas está completamente funcional.**

---

Para más detalles, consultar:
- `SISTEMA_COMPLETO_LISTO.md` - Guía de uso completa
- `TESTING_GUIDE_UI.md` - Tests detallados
- `SISTEMA_VOTACIONES_README.md` - Documentación técnica
