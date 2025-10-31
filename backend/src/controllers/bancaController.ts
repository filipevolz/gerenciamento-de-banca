import { Response } from 'express';
import { bancaService } from '../services/bancaService';
import { AuthRequest } from '../middleware/authMiddleware';

export class BancaController {
  async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }
      const data = { ...req.body, usuarioId: userId };
      const banca = await bancaService.create(data);
      res.status(201).json(banca);
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Erro ao criar banca' 
      });
    }
  }

  async getAll(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }
      const bancas = await bancaService.getAll(userId);
      res.json(bancas);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Erro ao buscar bancas' 
      });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      const banca = await bancaService.getById(id);
      
      // Verificar se a banca pertence ao usuário
      if (banca.usuarioId !== userId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      
      res.json(banca);
    } catch (error) {
      res.status(404).json({ 
        error: error instanceof Error ? error.message : 'Banca não encontrada' 
      });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      
      // Verificar se a banca pertence ao usuário
      const banca = await bancaService.getById(id);
      if (banca.usuarioId !== userId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      
      const data = req.body;
      const bancaAtualizada = await bancaService.update(id, data);
      res.json(bancaAtualizada);
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Erro ao atualizar banca' 
      });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      
      // Verificar se a banca pertence ao usuário
      const banca = await bancaService.getById(id);
      if (banca.usuarioId !== userId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      
      const result = await bancaService.delete(id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Erro ao deletar banca' 
      });
    }
  }
}

export const bancaController = new BancaController();

