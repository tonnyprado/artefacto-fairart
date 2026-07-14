// TEMPORAL: Usando datos hardcodeados en lugar de PostgreSQL
// TODO: Reemplazar con queries a la base de datos cuando se configure PostgreSQL
import { eventos, getNextId, now } from '../data/mockData.js'

export const getEventos = async (req, res) => {
  try {
    const sortedEventos = [...eventos].sort((a, b) =>
      new Date(b.fecha_inicio) - new Date(a.fecha_inicio)
    )
    res.json({ eventos: sortedEventos })
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener eventos' })
  }
}

export const getEventoById = async (req, res) => {
  try {
    const evento = eventos.find(e => e.id === parseInt(req.params.id))
    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' })
    }
    res.json(evento)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener evento' })
  }
}

export const getEventoBySlug = async (req, res) => {
  try {
    const evento = eventos.find(e => e.slug === req.params.slug)
    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' })
    }
    res.json(evento)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener evento' })
  }
}

export const getProximosEventos = async (req, res) => {
  try {
    const ahora = new Date()
    const proximosEventos = eventos
      .filter(e => new Date(e.fecha_inicio) >= ahora)
      .sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio))
    res.json({ eventos: proximosEventos })
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener eventos' })
  }
}

export const createEvento = async (req, res) => {
  try {
    const { nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, imagen } = req.body
    const slug = nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

    const nuevoEvento = {
      id: getNextId.evento(),
      nombre,
      descripcion,
      fecha_inicio,
      fecha_fin,
      ubicacion,
      imagen: imagen || null,
      slug,
      activo: true,
      created_at: now(),
      updated_at: now()
    }

    eventos.push(nuevoEvento)
    res.status(201).json({ message: 'Evento creado', evento: nuevoEvento })
  } catch (error) {
    res.status(500).json({ error: 'Error al crear evento' })
  }
}

export const updateEvento = async (req, res) => {
  try {
    const { nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, imagen } = req.body
    const index = eventos.findIndex(e => e.id === parseInt(req.params.id))

    if (index === -1) {
      return res.status(404).json({ error: 'Evento no encontrado' })
    }

    eventos[index] = {
      ...eventos[index],
      ...(nombre && { nombre }),
      ...(descripcion && { descripcion }),
      ...(fecha_inicio && { fecha_inicio }),
      ...(fecha_fin && { fecha_fin }),
      ...(ubicacion && { ubicacion }),
      ...(imagen && { imagen }),
      updated_at: now()
    }

    res.json({ message: 'Evento actualizado', evento: eventos[index] })
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar evento' })
  }
}

export const deleteEvento = async (req, res) => {
  try {
    const index = eventos.findIndex(e => e.id === parseInt(req.params.id))

    if (index === -1) {
      return res.status(404).json({ error: 'Evento no encontrado' })
    }

    eventos.splice(index, 1)
    res.json({ message: 'Evento eliminado' })
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar evento' })
  }
}
