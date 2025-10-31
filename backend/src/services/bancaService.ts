import { prisma } from '../utils/prisma';

export interface CreateBancaDto {
  usuarioId: string;
  nome: string;
  saldoInicial: number;
}

export class BancaService {
  async create(data: CreateBancaDto) {
    const banca = await prisma.banca.create({
      data: {
        ...data,
        saldoAtual: data.saldoInicial
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    });

    return banca;
  }

  async getAll(usuarioId?: string) {
    const where = usuarioId ? { usuarioId } : {};
    
    const bancas = await prisma.banca.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        _count: {
          select: {
            apostas: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return bancas;
  }

  async getById(id: string) {
    const banca = await prisma.banca.findUnique({
      where: { id },
      include: {
        usuario: true,
        apostas: {
          orderBy: { data: 'desc' },
          take: 50 // Últimas 50 apostas
        }
      }
    });

    if (!banca) {
      throw new Error('Banca não encontrada');
    }

    return banca;
  }

  async update(id: string, data: Partial<CreateBancaDto>) {
    const banca = await prisma.banca.findUnique({
      where: { id }
    });

    if (!banca) {
      throw new Error('Banca não encontrada');
    }

    const bancaAtualizada = await prisma.banca.update({
      where: { id },
      data
    });

    return bancaAtualizada;
  }

  async delete(id: string) {
    const banca = await prisma.banca.findUnique({
      where: { id }
    });

    if (!banca) {
      throw new Error('Banca não encontrada');
    }

    await prisma.banca.delete({
      where: { id }
    });

    return { message: 'Banca deletada com sucesso' };
  }
}

export const bancaService = new BancaService();

