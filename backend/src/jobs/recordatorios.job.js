/**
 * Cron Job: Recordatorios de Pre-Registro
 *
 * Se ejecuta cada hora para:
 * 1. Enviar primer recordatorio 24h después del pre-registro
 * 2. Enviar recordatorios subsiguientes cada 3 días
 * 3. Máximo 5 recordatorios por usuario
 */

import cron from 'node-cron'
import pool from '../config/database.js'
import { enviarRecordatorioPreRegistro, isBrevoConfigured } from '../services/email.service.js'

const MAX_RECORDATORIOS = parseInt(process.env.MAX_RECORDATORIOS_PREREGISTRO) || 5

/**
 * Procesar recordatorios pendientes
 */
async function procesarRecordatorios() {
  console.log('='.repeat(60))
  console.log('🔔 CRON: Iniciando proceso de recordatorios...')
  console.log('   Hora:', new Date().toISOString())
  console.log('='.repeat(60))

  if (!isBrevoConfigured()) {
    console.log('⚠️  Brevo no configurado - saltando recordatorios')
    return
  }

  try {
    // Obtener pre-registros que necesitan recordatorio
    // Criterios:
    // - Estado = pre_registrado
    // - recordatorios_enviados < MAX_RECORDATORIOS
    // - Primer recordatorio: 24h después del pre-registro
    // - Siguientes: 3 días desde el último recordatorio
    const result = await pool.query(`
      SELECT
        id, nombre, apellido, email,
        fecha_pre_registro, recordatorios_enviados,
        ultimo_recordatorio_enviado, token_acceso
      FROM artistas
      WHERE estado_registro = 'pre_registrado'
        AND recordatorios_enviados < $1
        AND (
          -- Primer recordatorio: 24h después del pre-registro
          (recordatorios_enviados = 0 AND fecha_pre_registro < NOW() - INTERVAL '24 hours')
          OR
          -- Siguientes: 3 días desde el último recordatorio
          (recordatorios_enviados > 0 AND ultimo_recordatorio_enviado < NOW() - INTERVAL '3 days')
        )
      ORDER BY fecha_pre_registro ASC
    `, [MAX_RECORDATORIOS])

    const pendientes = result.rows
    console.log(`📧 ${pendientes.length} pre-registros necesitan recordatorio`)

    if (pendientes.length === 0) {
      console.log('✅ No hay recordatorios pendientes')
      return
    }

    let enviados = 0
    let errores = 0

    for (const artista of pendientes) {
      try {
        const numeroRecordatorio = artista.recordatorios_enviados + 1

        console.log(`📨 Enviando recordatorio #${numeroRecordatorio} a ${artista.email}...`)

        await enviarRecordatorioPreRegistro(artista, numeroRecordatorio)

        // Actualizar contador en BD
        await pool.query(`
          UPDATE artistas SET
            recordatorios_enviados = $1,
            ultimo_recordatorio_enviado = NOW()
          WHERE id = $2
        `, [numeroRecordatorio, artista.id])

        enviados++
        console.log(`   ✅ Enviado correctamente`)

        // Pausa entre emails (300ms) para no saturar Brevo
        await new Promise(r => setTimeout(r, 300))

      } catch (error) {
        errores++
        console.error(`   ❌ Error enviando a ${artista.email}:`, error.message)
      }
    }

    console.log('='.repeat(60))
    console.log(`🔔 CRON: Proceso completado`)
    console.log(`   ✅ Enviados: ${enviados}`)
    console.log(`   ❌ Errores: ${errores}`)
    console.log('='.repeat(60))

  } catch (error) {
    console.error('❌ Error en proceso de recordatorios:', error)
  }
}

/**
 * Iniciar el cron job
 * Se ejecuta cada hora (minuto 0)
 */
export function iniciarCronRecordatorios() {
  // Ejecutar cada hora en el minuto 0
  cron.schedule('0 * * * *', () => {
    procesarRecordatorios()
  }, {
    timezone: 'America/Mexico_City'
  })

  console.log('🕐 Cron job de recordatorios iniciado (cada hora)')
}

// Exportar función para tests o ejecución manual
export { procesarRecordatorios }
