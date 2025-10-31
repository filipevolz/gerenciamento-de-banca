import { Router } from 'express';
import { bancaController } from '../controllers/bancaController';

const router = Router();

router.post('/', bancaController.create.bind(bancaController));
router.get('/', bancaController.getAll.bind(bancaController));
router.get('/:id', bancaController.getById.bind(bancaController));
router.put('/:id', bancaController.update.bind(bancaController));
router.delete('/:id', bancaController.delete.bind(bancaController));

export default router;

