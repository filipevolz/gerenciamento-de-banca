import { Router } from 'express';
import { casaApostaController } from '../controllers/casaApostaController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Todas as rotas de casas de aposta requerem autenticação
router.use(authMiddleware);

router.post('/', casaApostaController.create.bind(casaApostaController));
router.get('/', casaApostaController.getAll.bind(casaApostaController));
router.get('/:id', casaApostaController.getById.bind(casaApostaController));
router.put('/:id', casaApostaController.update.bind(casaApostaController));
router.delete('/:id', casaApostaController.delete.bind(casaApostaController));

export default router;

