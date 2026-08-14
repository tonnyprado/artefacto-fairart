import { Router } from 'express';
import {
  createOpinion,
  getRandomOpinion,
  getAllOpinions,
  deleteOpinion,
  toggleApproval
} from '../controllers/opiniones.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Rutas públicas
router.post('/', createOpinion);              // Crear opinión
router.get('/random', getRandomOpinion);      // Obtener opinión aleatoria

// Rutas protegidas (admin)
router.get('/', verifyToken, isAdmin, getAllOpinions);           // Listar todas
router.delete('/:id', verifyToken, isAdmin, deleteOpinion);      // Eliminar
router.put('/:id/toggle', verifyToken, isAdmin, toggleApproval); // Cambiar estado

export default router;
