// TEMPORAL: Usando datos hardcodeados en lugar de PostgreSQL
// TODO: Reemplazar con queries a la base de datos cuando se configure PostgreSQL
import { obras, getNextId, now } from '../data/mockData.js'

export const getObras = async (req, res) => {
  try {
    const sortedObras = [...obras].sort((a, b) =>
      new Date(b.created_at) - new Date(a.created_at)
    )
    res.json({ obras: sortedObras })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Error al obtener obras' })
  }
}

export const getObraById = async (req, res) => {
  try {
    const obra = obras.find(o => o.id === parseInt(req.params.id))
    if (!obra) {
      return res.status(404).json({ error: 'Obra no encontrada' })
    }
    res.json(obra)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener obra' })
  }
}

export const getObrasByArtista = async (req, res) => {
  try {
    const obrasArtista = obras.filter(o => o.artista_id === parseInt(req.params.artistaId))
    res.json({ obras: obrasArtista })
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener obras' })
  }
}

export const createObra = async (req, res) => {
  try {
    const { titulo, descripcion, artista_id, precio, categoria, imagen, dimensiones, año } = req.body
    const nuevaObra = {
      id: getNextId.obra(),
      titulo,
      descripcion,
      artista_id,
      precio,
      categoria,
      imagen: imagen || null,
      dimensiones: dimensiones || null,
      año: año || null,
      disponible: true,
      created_at: now(),
      updated_at: now()
    }
    obras.push(nuevaObra)
    res.status(201).json({ message: 'Obra creada', obra: nuevaObra })
  } catch (error) {
    res.status(500).json({ error: 'Error al crear obra' })
  }
}

export const updateObra = async (req, res) => {
  try {
    const { titulo, descripcion, precio, categoria, imagen } = req.body
    const index = obras.findIndex(o => o.id === parseInt(req.params.id))
    if (index === -1) {
      return res.status(404).json({ error: 'Obra no encontrada' })
    }
    obras[index] = {
      ...obras[index],
      ...(titulo && { titulo }),
      ...(descripcion && { descripcion }),
      ...(precio && { precio }),
      ...(categoria && { categoria }),
      ...(imagen && { imagen }),
      updated_at: now()
    }
    res.json({ message: 'Obra actualizada', obra: obras[index] })
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar obra' })
  }
}

export const deleteObra = async (req, res) => {
  try {
    const index = obras.findIndex(o => o.id === parseInt(req.params.id))
    if (index === -1) {
      return res.status(404).json({ error: 'Obra no encontrada' })
    }
    obras.splice(index, 1)
    res.json({ message: 'Obra eliminada' })
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar obra' })
  }
}
