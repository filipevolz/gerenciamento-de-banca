import { Router } from 'express';
import { bancaController } from '../controllers/bancaController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Todas as rotas de bancas requerem autenticação
router.use(authMiddleware);

router.post('/', bancaController.create.bind(bancaController));
router.get('/', bancaController.getAll.bind(bancaController));
router.get('/:id', bancaController.getById.bind(bancaController));
router.put('/:id', bancaController.update.bind(bancaController));
router.delete('/:id', bancaController.delete.bind(bancaController));

export default router;

