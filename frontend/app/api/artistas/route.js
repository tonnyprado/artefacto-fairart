import { NextResponse } from 'next/server'

/**
 * API Route para registro de artistas
 *
 * Este endpoint recibe los datos del formulario de registro
 * y los procesa/guarda en la base de datos
 */

export async function POST(request) {
  try {
    const formData = await request.formData()

    // Extraer datos del formulario
    const artistaData = {
      // Datos personales
      nombre: formData.get('nombre'),
      apellido: formData.get('apellido'),
      email: formData.get('email'),
      telefono: formData.get('telefono'),
      fecha_nacimiento: formData.get('fecha_nacimiento'),
      pais: formData.get('pais'),
      ciudad: formData.get('ciudad'),
      codigo_postal: formData.get('codigo_postal'),
      direccion: formData.get('direccion'),

      // Información artística
      categoria: formData.get('categoria'),
      bio: formData.get('bio'),
      instagram: formData.get('instagram'),
      website: formData.get('website'),

      // Paquete seleccionado
      paquete_id: formData.get('paquete_id'),

      // Archivos
      foto: formData.get('foto'),
      cv: formData.get('cv'),
      portfolio: formData.get('portfolio'),
      identificacion: formData.get('identificacion'),

      // Capacidad de facturación
      puede_facturar: formData.get('puede_facturar'),

      // Canvas y obras del lienzo
      layout_canvas_image: formData.get('layout_canvas_image'),
      layout_canvas_data: formData.get('layout_canvas_data'),

      // Obras del lienzo (con metadata)
      obras_lienzo: []
    }

    // Procesar obras del lienzo
    const obrasCount = parseInt(formData.get('obras_lienzo_count') || '0')
    for (let i = 0; i < obrasCount; i++) {
      artistaData.obras_lienzo.push({
        file: formData.get(`obra_lienzo_${i}`),
        titulo: formData.get(`obra_lienzo_${i}_titulo`),
        alto_cm: formData.get(`obra_lienzo_${i}_alto_cm`),
        ancho_cm: formData.get(`obra_lienzo_${i}_ancho_cm`)
      })
    }

    // Log para debugging (en producción, guardarías esto en DB)
    console.log('Registro de artista recibido:', {
      nombre: artistaData.nombre,
      email: artistaData.email,
      categoria: artistaData.categoria,
      paquete_id: artistaData.paquete_id,
      puede_facturar: artistaData.puede_facturar,
      obras_count: artistaData.obras_lienzo.length
    })

    // TODO: Aquí deberías:
    // 1. Subir archivos a Cloudinary o S3
    // 2. Guardar datos en base de datos (Supabase/PostgreSQL)
    // 3. Enviar email de confirmación
    // 4. Crear registro en sistema de votación/curaduría

    // Por ahora, simulamos éxito
    return NextResponse.json({
      success: true,
      message: 'Registro recibido exitosamente',
      data: {
        artista_id: `TEMP-${Date.now()}`,
        nombre: artistaData.nombre,
        email: artistaData.email,
        obras_registradas: artistaData.obras_lienzo.length
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error al procesar registro:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al procesar el registro',
      message: error.message
    }, { status: 500 })
  }
}

// Método GET para consultar status (opcional)
export async function GET(request) {
  return NextResponse.json({
    status: 'API de artistas activa',
    version: '1.0.0'
  })
}
