import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { AuthRequest } from '../middleware/authMiddleware';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { nome, email, senha } = req.body;

      if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
      }

      if (senha.length < 6) {
        return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
      }

      const result = await authService.register({ nome, email, senha });
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Erro ao criar conta' 
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
      }

      const result = await authService.login({ email, senha });
      res.json(result);
    } catch (error) {
      res.status(401).json({ 
        error: error instanceof Error ? error.message : 'Erro ao fazer login' 
      });
    }
  }

  async me(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Não autenticado' });
      }

      const usuario = await authService.getUserById(userId);
      res.json({ usuario });
    } catch (error) {
      res.status(401).json({ 
        error: error instanceof Error ? error.message : 'Erro ao buscar usuário' 
      });
    }
  }
}

export const authController = new AuthController();

