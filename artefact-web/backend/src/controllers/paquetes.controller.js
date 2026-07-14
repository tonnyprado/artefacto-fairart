// TEMPORAL: Usando datos hardcodeados en lugar de PostgreSQL
// TODO: Reemplazar con queries a la base de datos cuando se configure PostgreSQL
import { paquetes, getNextId, now } from '../data/mockData.js'

export const getPaquetes = async (req, res) => {
  try {
    const sortedPaquetes = [...paquetes].sort((a, b) => a.precio - b.precio)
    res.json({ paquetes: sortedPaquetes })
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener paquetes' })
  }
}

export const getPaqueteById = async (req, res) => {
  try {
    const paquete = paquetes.find(p => p.id === parseInt(req.params.id))
    if (!paquete) {
      return res.status(404).json({ error: 'Paquete no encontrado' })
    }
    res.json(paquete)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener paquete' })
  }
}

export const createPaquete = async (req, res) => {
  try {
    const { nombre, descripcion, precio, beneficios } = req.body
    const nuevoPaquete = {
      id: getNextId.paquete(),
      nombre,
      descripcion,
      precio,
      beneficios: beneficios || [],
      activo: true,
      created_at: now(),
      updated_at: now()
    }
    paquetes.push(nuevoPaquete)
    res.status(201).json({ message: 'Paquete creado', paquete: nuevoPaquete })
  } catch (error) {
    res.status(500).json({ error: 'Error al crear paquete' })
  }
}

export const updatePaquete = async (req, res) => {
  try {
    const { nombre, descripcion, precio, beneficios } = req.body
    const index = paquetes.findIndex(p => p.id === parseInt(req.params.id))
    if (index === -1) {
      return res.status(404).json({ error: 'Paquete no encontrado' })
    }
    paquetes[index] = {
      ...paquetes[index],
      ...(nombre && { nombre }),
      ...(descripcion && { descripcion }),
      ...(precio && { precio }),
      ...(beneficios && { beneficios }),
      updated_at: now()
    }
    res.json({ message: 'Paquete actualizado', paquete: paquetes[index] })
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar paquete' })
  }
}

export const deletePaquete = async (req, res) => {
  try {
    const index = paquetes.findIndex(p => p.id === parseInt(req.params.id))
    if (index === -1) {
      return res.status(404).json({ error: 'Paquete no encontrado' })
    }
    paquetes.splice(index, 1)
    res.json({ message: 'Paquete eliminado' })
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar paquete' })
  }
}
