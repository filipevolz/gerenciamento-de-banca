import { Response } from 'express';
import { casaApostaService } from '../services/casaApostaService';
import { AuthRequest } from '../middleware/authMiddleware';
import { bancaService } from '../services/bancaService';

export class CasaApostaController {
  async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      const data = req.body;
      
      // Verificar se a banca pertence ao usuário
      if (data.bancaId) {
        const banca = await bancaService.getById(data.bancaId);
        if (banca.usuarioId !== userId) {
          return res.status(403).json({ error: 'Acesso negado' });
        }
      }
      
      const casa = await casaApostaService.create(data);
      res.status(201).json(casa);
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Erro ao criar casa de aposta' 
      });
    }
  }

  async getAll(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      const bancaId = req.query.bancaId as string | undefined;
      
      // Se bancaId for fornecido, verificar se pertence ao usuário
      if (bancaId) {
        const banca = await bancaService.getById(bancaId);
        if (banca.usuarioId !== userId) {
          return res.status(403).json({ error: 'Acesso negado' });
        }
      }
      
      const casas = await casaApostaService.getAll(bancaId);
      res.json(casas);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Erro ao buscar casas de aposta' 
      });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const casa = await casaApostaService.getById(id);
      
      // Verificar se a casa pertence a uma banca do usuário
      const banca = await bancaService.getById(casa.bancaId);
      if (banca.usuarioId !== userId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      
      res.json(casa);
    } catch (error) {
      res.status(404).json({ 
        error: error instanceof Error ? error.message : 'Casa de aposta não encontrada' 
      });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      
      // Verificar se a casa pertence ao usuário
      const casa = await casaApostaService.getById(id);
      const banca = await bancaService.getById(casa.bancaId);
      if (banca.usuarioId !== userId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      
      const data = req.body;
      const casaAtualizada = await casaApostaService.update(id, data);
      res.json(casaAtualizada);
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Erro ao atualizar casa de aposta' 
      });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      
      // Verificar se a casa pertence ao usuário
      const casa = await casaApostaService.getById(id);
      const banca = await bancaService.getById(casa.bancaId);
      if (banca.usuarioId !== userId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      
      const result = await casaApostaService.delete(id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Erro ao deletar casa de aposta' 
      });
    }
  }
}

export const casaApostaController = new CasaApostaController();

