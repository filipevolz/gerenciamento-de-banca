import type { Response } from 'express';
import { apostaService } from '../services/apostaService';
import type { AuthRequest } from '../middleware/authMiddleware';
import { bancaService } from '../services/bancaService';

export class ApostaController {
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
      
      const aposta = await apostaService.create(data);
      res.status(201).json(aposta);
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Erro ao criar aposta' 
      });
    }
  }

  async getAll(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      const bancaId = req.query?.bancaId as string | undefined;
      
      // Se bancaId for fornecido, verificar se pertence ao usuário
      if (bancaId) {
        const banca = await bancaService.getById(bancaId);
        if (banca.usuarioId !== userId) {
          return res.status(403).json({ error: 'Acesso negado' });
        }
      }
      
      const apostas = await apostaService.getAll(bancaId);
      res.json(apostas);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Erro ao buscar apostas' 
      });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const aposta = await apostaService.getById(id);
      
      // Verificar se a aposta pertence a uma banca do usuário
      const banca = await bancaService.getById(aposta.bancaId);
      if (banca.usuarioId !== userId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      
      res.json(aposta);
    } catch (error) {
      res.status(404).json({ 
        error: error instanceof Error ? error.message : 'Aposta não encontrada' 
      });
    }
  }

  async updateStatus(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      
      // Verificar se a aposta pertence ao usuário
      const aposta = await apostaService.getById(id);
      const banca = await bancaService.getById(aposta.bancaId);
      if (banca.usuarioId !== userId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      
      const data = req.body;
      const apostaAtualizada = await apostaService.updateStatus(id, data);
      res.json(apostaAtualizada);
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Erro ao atualizar aposta' 
      });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      
      // Verificar se a aposta pertence ao usuário
      const aposta = await apostaService.getById(id);
      const banca = await bancaService.getById(aposta.bancaId);
      if (banca.usuarioId !== userId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      
      const data = req.body;
      const apostaAtualizada = await apostaService.update(id, data);
      res.json(apostaAtualizada);
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Erro ao atualizar aposta' 
      });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      
      // Verificar se a aposta pertence ao usuário
      const aposta = await apostaService.getById(id);
      const banca = await bancaService.getById(aposta.bancaId);
      if (banca.usuarioId !== userId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      
      const result = await apostaService.delete(id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Erro ao deletar aposta' 
      });
    }
  }

  async getEstatisticas(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      const bancaId = req.query?.bancaId as string | undefined;
      
      // Se bancaId for fornecido, verificar se pertence ao usuário
      if (bancaId) {
        const banca = await bancaService.getById(bancaId);
        if (banca.usuarioId !== userId) {
          return res.status(403).json({ error: 'Acesso negado' });
        }
      }
      
      const estatisticas = await apostaService.getEstatisticas(bancaId);
      res.json(estatisticas);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Erro ao buscar estatísticas' 
      });
    }
  }

  async getMercados(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      const bancaId = req.query?.bancaId as string | undefined;
      
      // Se bancaId for fornecido, verificar se pertence ao usuário
      if (bancaId) {
        const banca = await bancaService.getById(bancaId);
        if (banca.usuarioId !== userId) {
          return res.status(403).json({ error: 'Acesso negado' });
        }
      }
      
      const mercados = await apostaService.getMercadosUnicos(bancaId);
      res.json(mercados);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Erro ao buscar mercados' 
      });
    }
  }
}

export const apostaController = new ApostaController();

