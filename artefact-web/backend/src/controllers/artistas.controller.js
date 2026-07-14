// TEMPORAL: Usando datos hardcodeados en lugar de PostgreSQL
// TODO: Reemplazar con queries a la base de datos cuando se configure PostgreSQL
import { artistas, obras, getNextId, now } from '../data/mockData.js'

/**
 * Obtener todos los artistas
 */
export const getArtistas = async (req, res) => {
  try {
    const { categoria, search, limit = 50, offset = 0 } = req.query

    let filteredArtistas = [...artistas]

    // Filtrar por categoría
    if (categoria) {
      filteredArtistas = filteredArtistas.filter(a => a.categoria === categoria)
    }

    // Filtrar por búsqueda
    if (search) {
      const searchLower = search.toLowerCase()
      filteredArtistas = filteredArtistas.filter(a =>
        a.nombre.toLowerCase().includes(searchLower) ||
        (a.bio && a.bio.toLowerCase().includes(searchLower))
      )
    }

    // Ordenar por fecha de creación (más recientes primero)
    filteredArtistas.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    // Paginación
    const startIndex = parseInt(offset)
    const endIndex = startIndex + parseInt(limit)
    const paginatedArtistas = filteredArtistas.slice(startIndex, endIndex)

    res.json({
      artistas: paginatedArtistas,
      total: filteredArtistas.length
    })
  } catch (error) {
    console.error('Error al obtener artistas:', error)
    res.status(500).json({ error: 'Error al obtener artistas' })
  }
}

/**
 * Obtener artista por ID
 */
export const getArtistaById = async (req, res) => {
  try {
    const { id } = req.params
    const artistaId = parseInt(id)

    const artista = artistas.find(a => a.id === artistaId)

    if (!artista) {
      return res.status(404).json({ error: 'Artista no encontrado' })
    }

    // Obtener obras del artista
    const obrasArtista = obras.filter(o => o.artista_id === artistaId)

    res.json({
      artista,
      obras: obrasArtista
    })
  } catch (error) {
    console.error('Error al obtener artista:', error)
    res.status(500).json({ error: 'Error al obtener artista' })
  }
}

/**
 * Obtener artista por slug
 */
export const getArtistaBySlug = async (req, res) => {
  try {
    const { slug } = req.params

    const artista = artistas.find(a => a.slug === slug)

    if (!artista) {
      return res.status(404).json({ error: 'Artista no encontrado' })
    }

    res.json(artista)
  } catch (error) {
    console.error('Error al obtener artista:', error)
    res.status(500).json({ error: 'Error al obtener artista' })
  }
}

/**
 * Crear nuevo artista
 */
export const createArtista = async (req, res) => {
  try {
    const { nombre, email, bio, categoria, foto, redes_sociales } = req.body

    // Generar slug
    const slug = nombre.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    const nuevoArtista = {
      id: getNextId.artista(),
      nombre,
      email,
      bio,
      categoria,
      foto: foto || null,
      slug,
      redes_sociales: redes_sociales || {},
      activo: true,
      created_at: now(),
      updated_at: now()
    }

    artistas.push(nuevoArtista)

    res.status(201).json({
      message: 'Artista creado exitosamente',
      artista: nuevoArtista
    })
  } catch (error) {
    console.error('Error al crear artista:', error)
    res.status(500).json({ error: 'Error al crear artista' })
  }
}

/**
 * Actualizar artista
 */
export const updateArtista = async (req, res) => {
  try {
    const { id } = req.params
    const artistaId = parseInt(id)
    const { nombre, email, bio, categoria, foto, redes_sociales } = req.body

    const index = artistas.findIndex(a => a.id === artistaId)

    if (index === -1) {
      return res.status(404).json({ error: 'Artista no encontrado' })
    }

    // Actualizar solo los campos proporcionados
    artistas[index] = {
      ...artistas[index],
      ...(nombre && { nombre }),
      ...(email && { email }),
      ...(bio && { bio }),
      ...(categoria && { categoria }),
      ...(foto && { foto }),
      ...(redes_sociales && { redes_sociales }),
      updated_at: now()
    }

    res.json({
      message: 'Artista actualizado exitosamente',
      artista: artistas[index]
    })
  } catch (error) {
    console.error('Error al actualizar artista:', error)
    res.status(500).json({ error: 'Error al actualizar artista' })
  }
}

/**
 * Eliminar artista
 */
export const deleteArtista = async (req, res) => {
  try {
    const { id } = req.params
    const artistaId = parseInt(id)

    const index = artistas.findIndex(a => a.id === artistaId)

    if (index === -1) {
      return res.status(404).json({ error: 'Artista no encontrado' })
    }

    // Eliminar artista del array
    artistas.splice(index, 1)

    // También eliminar todas las obras del artista
    const obrasIndexes = []
    obras.forEach((obra, idx) => {
      if (obra.artista_id === artistaId) {
        obrasIndexes.push(idx)
      }
    })
    // Eliminar de atrás hacia adelante para no afectar los índices
    obrasIndexes.reverse().forEach(idx => obras.splice(idx, 1))

    res.json({
      message: 'Artista eliminado exitosamente'
    })
  } catch (error) {
    console.error('Error al eliminar artista:', error)
    res.status(500).json({ error: 'Error al eliminar artista' })
  }
}
