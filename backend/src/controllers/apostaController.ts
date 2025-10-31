import { Request, Response } from 'express';
import { apostaService } from '../services/apostaService';

export class ApostaController {
  async create(req: Request, res: Response) {
    try {
      const data = req.body;
      const aposta = await apostaService.create(data);
      res.status(201).json(aposta);
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Erro ao criar aposta' 
      });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const bancaId = req.query.bancaId as string | undefined;
      const apostas = await apostaService.getAll(bancaId);
      res.json(apostas);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Erro ao buscar apostas' 
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const aposta = await apostaService.getById(id);
      res.json(aposta);
    } catch (error) {
      res.status(404).json({ 
        error: error instanceof Error ? error.message : 'Aposta não encontrada' 
      });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      const aposta = await apostaService.updateStatus(id, data);
      res.json(aposta);
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Erro ao atualizar aposta' 
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      const aposta = await apostaService.update(id, data);
      res.json(aposta);
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Erro ao atualizar aposta' 
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await apostaService.delete(id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Erro ao deletar aposta' 
      });
    }
  }

  async getEstatisticas(req: Request, res: Response) {
    try {
      const bancaId = req.query.bancaId as string | undefined;
      const estatisticas = await apostaService.getEstatisticas(bancaId);
      res.json(estatisticas);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Erro ao buscar estatísticas' 
      });
    }
  }

  async getMercados(req: Request, res: Response) {
    try {
      const bancaId = req.query.bancaId as string | undefined;
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

