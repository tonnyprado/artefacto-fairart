import { NextResponse } from 'next/server'

/**
 * API Route para registro de artistas
 *
 * Proxy al backend real de Railway que maneja:
 * - Subida de archivos a AWS S3
 * - Guardado en PostgreSQL RDS
 * - Inscripcion a fase activa
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60 // 60 segundos para archivos grandes

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export async function POST(request) {
  try {
    // Obtener el FormData de la request
    const formData = await request.formData()

    // Log para debugging
    console.log('=== REGISTRO: Enviando al backend ===')
    console.log('Backend URL:', BACKEND_URL)
    console.log('Campos recibidos:', [...formData.keys()])

    // Enviar al backend real
    const response = await fetch(`${BACKEND_URL}/registro`, {
      method: 'POST',
      body: formData,
      // No establecer Content-Type, fetch lo hace automaticamente con FormData
    })

    const data = await response.json()

    console.log('=== REGISTRO: Respuesta del backend ===')
    console.log('Status:', response.status)
    console.log('Data:', JSON.stringify(data, null, 2))

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: 201 })

  } catch (error) {
    console.error('Error al procesar registro:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al conectar con el servidor',
      message: error.message
    }, { status: 500 })
  }
}

export async function GET(request) {
  return NextResponse.json({
    status: 'API de artistas activa',
    backend: BACKEND_URL,
    version: '2.0.0'
  })
}
