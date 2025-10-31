import { Request, Response } from 'express';
import { casaApostaService } from '../services/casaApostaService';

export class CasaApostaController {
  async create(req: Request, res: Response) {
    try {
      const data = req.body;
      const casa = await casaApostaService.create(data);
      res.status(201).json(casa);
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Erro ao criar casa de aposta' 
      });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const bancaId = req.query.bancaId as string | undefined;
      const casas = await casaApostaService.getAll(bancaId);
      res.json(casas);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Erro ao buscar casas de aposta' 
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const casa = await casaApostaService.getById(id);
      res.json(casa);
    } catch (error) {
      res.status(404).json({ 
        error: error instanceof Error ? error.message : 'Casa de aposta não encontrada' 
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      const casa = await casaApostaService.update(id, data);
      res.json(casa);
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Erro ao atualizar casa de aposta' 
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
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

