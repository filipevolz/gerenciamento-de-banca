import { prisma } from '../utils/prisma';

export interface CreateCasaApostaDto {
  bancaId: string;
  nome: string;
  saldoAtual?: number;
  valorUnidade?: number;
}

export class CasaApostaService {
  async create(data: CreateCasaApostaDto) {
    // Verificar se a banca existe
    const banca = await prisma.banca.findUnique({
      where: { id: data.bancaId }
    });

    if (!banca) {
      throw new Error('Banca não encontrada');
    }

    // Verificar se já existe uma casa com esse nome na mesma banca
    const casaExistente = await prisma.casaAposta.findFirst({
      where: {
        bancaId: data.bancaId,
        nome: data.nome
      }
    });

    if (casaExistente) {
      throw new Error('Já existe uma casa de aposta com esse nome nesta banca');
    }

    const casa = await prisma.casaAposta.create({
      data: {
        nome: data.nome,
        bancaId: data.bancaId,
        saldoAtual: data.saldoAtual || 0,
        valorUnidade: data.valorUnidade || 0
      },
      include: {
        banca: {
          select: {
            id: true,
            nome: true,
            saldoAtual: true
          }
        }
      }
    });

    return casa;
  }

  async getAll(bancaId?: string) {
    const where = bancaId ? { bancaId } : {};
    
    const casas = await prisma.casaAposta.findMany({
      where,
      include: {
        banca: {
          select: {
            id: true,
            nome: true
          }
        },
        _count: {
          select: {
            apostas: true
          }
        }
      },
      orderBy: { nome: 'asc' }
    });

    return casas;
  }

  async getById(id: string) {
    const casa = await prisma.casaAposta.findUnique({
      where: { id },
      include: {
        banca: true,
        apostas: {
          orderBy: { data: 'desc' },
          take: 50 // Últimas 50 apostas
        }
      }
    });

    if (!casa) {
      throw new Error('Casa de aposta não encontrada');
    }

    return casa;
  }

  async update(id: string, data: Partial<CreateCasaApostaDto>) {
    const casa = await prisma.casaAposta.findUnique({
      where: { id }
    });

    if (!casa) {
      throw new Error('Casa de aposta não encontrada');
    }

    // Se estiver mudando o nome, verificar se não existe outro com o mesmo nome
    if (data.nome && data.nome !== casa.nome) {
      const casaExistente = await prisma.casaAposta.findFirst({
        where: {
          bancaId: casa.bancaId,
          nome: data.nome,
          NOT: { id: id }
        }
      });

      if (casaExistente) {
        throw new Error('Já existe uma casa de aposta com esse nome nesta banca');
      }
    }

    const casaAtualizada = await prisma.casaAposta.update({
      where: { id },
      data
    });

    return casaAtualizada;
  }

  async delete(id: string) {
    const casa = await prisma.casaAposta.findUnique({
      where: { id }
    });

    if (!casa) {
      throw new Error('Casa de aposta não encontrada');
    }

    await prisma.casaAposta.delete({
      where: { id }
    });

    return { message: 'Casa de aposta deletada com sucesso' };
  }

  async updateSaldo(casaId: string, valor: number) {
    const casa = await prisma.casaAposta.findUnique({
      where: { id: casaId }
    });

    if (!casa) {
      throw new Error('Casa de aposta não encontrada');
    }

    await prisma.casaAposta.update({
      where: { id: casaId },
      data: {
        saldoAtual: casa.saldoAtual + valor
      }
    });
  }
}

export const casaApostaService = new CasaApostaService();

