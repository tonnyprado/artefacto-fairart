/**
 * Controlador de Configuración del Sitio
 * Maneja la configuración global del sitio (contacto, redes sociales, etc)
 */

import { configuracionSitio } from '../data/mockData.js'

/**
 * GET /api/configuracion
 * Obtener la configuración del sitio
 * PÚBLICO - No requiere autenticación
 */
export const getConfiguracion = async (req, res) => {
  try {
    res.json({
      success: true,
      data: configuracionSitio
    })
  } catch (error) {
    console.error('Error al obtener configuración:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener configuración del sitio'
    })
  }
}

/**
 * PUT /api/configuracion
 * Actualizar la configuración del sitio (Solo admin)
 */
export const updateConfiguracion = async (req, res) => {
  try {
    const {
      nombre_sitio,
      logo_url,
      descripcion,
      email_contacto,
      telefono_contacto,
      whatsapp,
      direccion_completa,
      instagram,
      facebook,
      twitter,
      linkedin,
      copyright_text
    } = req.body

    // Actualizar configuración (singleton - solo hay un registro)
    Object.assign(configuracionSitio, {
      ...(nombre_sitio && { nombre_sitio }),
      ...(logo_url !== undefined && { logo_url }),
      ...(descripcion !== undefined && { descripcion }),
      ...(email_contacto && { email_contacto }),
      ...(telefono_contacto && { telefono_contacto }),
      ...(whatsapp && { whatsapp }),
      ...(direccion_completa && { direccion_completa }),
      ...(instagram !== undefined && { instagram }),
      ...(facebook !== undefined && { facebook }),
      ...(twitter !== undefined && { twitter }),
      ...(linkedin !== undefined && { linkedin }),
      ...(copyright_text && { copyright_text }),
      updated_at: new Date().toISOString()
    })

    res.json({
      success: true,
      data: configuracionSitio,
      message: 'Configuración actualizada exitosamente'
    })
  } catch (error) {
    console.error('Error al actualizar configuración:', error)
    res.status(500).json({
      success: false,
      error: 'Error al actualizar configuración'
    })
  }
}
