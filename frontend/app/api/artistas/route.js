import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * POST /api/artistas
 *
 * Crear un nuevo registro de artista
 * Recibe un FormData con:
 * - Datos personales (nombre, apellido, email, etc.)
 * - Redes sociales
 * - Archivos (foto, CV, portfolio, identificación)
 */
export async function POST(request) {
  try {
    const formData = await request.formData();

    // Extraer datos del formulario
    const artistaData = {
      nombre: formData.get('nombre'),
      apellido: formData.get('apellido'),
      email: formData.get('email')?.toLowerCase(),
      telefono: formData.get('telefono'),
      fecha_nacimiento: formData.get('fecha_nacimiento'),
      pais: formData.get('pais'),
      ciudad: formData.get('ciudad'),
      codigo_postal: formData.get('codigo_postal'),
      direccion: formData.get('direccion'),
      categoria: formData.get('categoria'),
      bio: formData.get('bio'),
    };

    // Validar campos requeridos
    const requiredFields = [
      'nombre',
      'apellido',
      'email',
      'telefono',
      'fecha_nacimiento',
      'pais',
      'ciudad',
      'direccion',
      'categoria',
      'bio',
    ];

    for (const field of requiredFields) {
      if (!artistaData[field]) {
        return NextResponse.json(
          { error: `El campo ${field} es requerido` },
          { status: 400 }
        );
      }
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(artistaData.email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const existingArtist = await query(
      'SELECT id FROM artistas WHERE email = $1',
      [artistaData.email]
    );

    if (existingArtist.rows.length > 0) {
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 409 }
      );
    }

    // Redes sociales (JSONB)
    const redesSociales = {
      instagram: formData.get('instagram') || '',
      facebook: formData.get('facebook') || '',
      website: formData.get('website') || '',
      portfolio: formData.get('portfolio_web') || '',
    };

    // TODO: Subir archivos a Cloudinary
    // Por ahora guardamos null, esto se debe implementar
    const archivos = {
      foto: formData.get('foto'),
      cv: formData.get('cv'),
      portfolio: formData.get('portfolio'),
      identificacion: formData.get('identificacion'),
    };

    // URLs temporales (reemplazar con URLs reales de Cloudinary)
    let fotoUrl = null;
    let cvUrl = null;
    let portfolioUrl = null;
    let identificacionUrl = null;

    // NOTA: Aquí deberías implementar la lógica de subida a Cloudinary
    // Ejemplo:
    // if (archivos.foto) {
    //   fotoUrl = await uploadToCloudinary(archivos.foto, 'artistas/fotos');
    // }
    // ... similar para otros archivos

    // Insertar artista en la base de datos
    const insertQuery = `
      INSERT INTO artistas (
        nombre, apellido, email, telefono, fecha_nacimiento,
        pais, ciudad, codigo_postal, direccion,
        categoria, bio, redes_sociales,
        foto_perfil, cv_url, portfolio_url, identificacion_url,
        estado
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9,
        $10, $11, $12,
        $13, $14, $15, $16,
        'pendiente'
      )
      RETURNING id, email, nombre, apellido
    `;

    const values = [
      artistaData.nombre,
      artistaData.apellido,
      artistaData.email,
      artistaData.telefono,
      artistaData.fecha_nacimiento,
      artistaData.pais,
      artistaData.ciudad,
      artistaData.codigo_postal,
      artistaData.direccion,
      artistaData.categoria,
      artistaData.bio,
      JSON.stringify(redesSociales),
      fotoUrl,
      cvUrl,
      portfolioUrl,
      identificacionUrl,
    ];

    const result = await query(insertQuery, values);
    const nuevoArtista = result.rows[0];

    // Inscribir automáticamente en la fase activa
    const faseActivaResult = await query(
      'SELECT id FROM fases WHERE activa = true LIMIT 1'
    );

    if (faseActivaResult.rows.length > 0) {
      const faseActiva = faseActivaResult.rows[0];

      await query(
        `INSERT INTO inscripciones_fases (artista_id, fase_id, estado)
         VALUES ($1, $2, 'pendiente')`,
        [nuevoArtista.id, faseActiva.id]
      );
    }

    // TODO: Enviar email de confirmación
    // TODO: Notificar a admin

    return NextResponse.json(
      {
        success: true,
        message: 'Registro exitoso',
        data: {
          id: nuevoArtista.id,
          email: nuevoArtista.email,
          nombre: nuevoArtista.nombre,
          apellido: nuevoArtista.apellido,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al registrar artista:', error);

    return NextResponse.json(
      {
        error: 'Error al procesar el registro',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/artistas
 *
 * Obtener lista de artistas (para admin)
 * Query params opcionales:
 * - estado: filtrar por estado
 * - fase_id: filtrar por fase
 * - limit: límite de resultados
 * - offset: paginación
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    const faseId = searchParams.get('fase_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let queryText = `
      SELECT
        a.*,
        i.fase_id,
        i.estado as estado_inscripcion,
        i.votos,
        f.nombre as fase_nombre
      FROM artistas a
      LEFT JOIN inscripciones_fases i ON a.id = i.artista_id
      LEFT JOIN fases f ON i.fase_id = f.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    if (estado) {
      paramCount++;
      queryText += ` AND a.estado = $${paramCount}`;
      params.push(estado);
    }

    if (faseId) {
      paramCount++;
      queryText += ` AND i.fase_id = $${paramCount}`;
      params.push(faseId);
    }

    queryText += ` ORDER BY a.created_at DESC`;

    paramCount++;
    queryText += ` LIMIT $${paramCount}`;
    params.push(limit);

    paramCount++;
    queryText += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await query(queryText, params);

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rowCount,
    });
  } catch (error) {
    console.error('Error al obtener artistas:', error);

    return NextResponse.json(
      {
        error: 'Error al obtener artistas',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
