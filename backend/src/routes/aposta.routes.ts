import { Router } from 'express';
import { apostaController } from '../controllers/apostaController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Todas as rotas de apostas requerem autenticação
router.use(authMiddleware);

router.post('/', apostaController.create.bind(apostaController));
router.get('/', apostaController.getAll.bind(apostaController));
router.get('/estatisticas', apostaController.getEstatisticas.bind(apostaController));
router.get('/mercados', apostaController.getMercados.bind(apostaController));
router.get('/:id', apostaController.getById.bind(apostaController));
router.put('/:id', apostaController.update.bind(apostaController));
router.patch('/:id/status', apostaController.updateStatus.bind(apostaController));
router.delete('/:id', apostaController.delete.bind(apostaController));

export default router;

