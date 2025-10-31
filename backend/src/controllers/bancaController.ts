import { Request, Response } from 'express';
import { bancaService } from '../services/bancaService';

export class BancaController {
  async create(req: Request, res: Response) {
    try {
      const data = req.body;
      const banca = await bancaService.create(data);
      res.status(201).json(banca);
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Erro ao criar banca' 
      });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const usuarioId = req.query.usuarioId as string | undefined;
      const bancas = await bancaService.getAll(usuarioId);
      res.json(bancas);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Erro ao buscar bancas' 
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const banca = await bancaService.getById(id);
      res.json(banca);
    } catch (error) {
      res.status(404).json({ 
        error: error instanceof Error ? error.message : 'Banca não encontrada' 
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      const banca = await bancaService.update(id, data);
      res.json(banca);
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Erro ao atualizar banca' 
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
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

