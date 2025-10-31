import { prisma } from '../utils/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface RegisterDto {
  nome: string;
  email: string;
  senha: string;
}

export interface LoginDto {
  email: string;
  senha: string;
}

export class AuthService {
  async register(data: RegisterDto) {
    // Verificar se email já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: data.email }
    });

    if (usuarioExistente) {
      throw new Error('Email já está em uso');
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(data.senha, 10);

    // Criar usuário
    const usuario = await prisma.usuario.create({
      data: {
        nome: data.nome,
        email: data.email,
        senha: senhaHash
      },
      select: {
        id: true,
        nome: true,
        email: true,
        createdAt: true
      }
    });

    // Gerar token JWT
    const token = this.generateToken(usuario.id);

    return {
      usuario,
      token
    };
  }

  async login(data: LoginDto) {
    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email: data.email }
    });

    if (!usuario) {
      throw new Error('Email ou senha incorretos');
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(data.senha, usuario.senha);

    if (!senhaValida) {
      throw new Error('Email ou senha incorretos');
    }

    // Gerar token JWT
    const token = this.generateToken(usuario.id);

    return {
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        createdAt: usuario.createdAt
      },
      token
    };
  }

  async validateToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      return decoded.userId;
    } catch {
      throw new Error('Token inválido');
    }
  }

  async getUserById(id: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        createdAt: true
      }
    });

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    return usuario;
  }

  private generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }
}

export const authService = new AuthService();

