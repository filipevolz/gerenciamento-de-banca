import { prisma } from '../utils/prisma';
import { calcularLucro, calcularEstatisticas, calcularROI } from '../utils/formulas';

export interface CreateApostaDto {
  bancaId: string;
  casaApostaId?: string;
  dataAposta?: Date | string;
  modalidade: string;
  mercado: string;
  descricao?: string;
  odd: number;
  unidades: number;
  status?: string;
}

export interface UpdateApostaStatusDto {
  status: 'pendente' | 'green' | 'red' | 'reembolso';
}

export interface UpdateApostaDto {
  casaApostaId?: string;
  dataAposta?: Date | string;
  modalidade?: string;
  mercado?: string;
  descricao?: string;
  odd?: number;
  unidades?: number;
  status?: string;
}

export class ApostaService {
  async create(dto: CreateApostaDto) {
    // Verificar se a banca existe
    const banca = await prisma.banca.findUnique({
      where: { id: dto.bancaId }
    });

    if (!banca) {
      throw new Error('Banca não encontrada');
    }

    // Buscar casa de aposta se informada
    let casaApostaNome = null;
    let valorUnidade = 0;
    
    if (dto.casaApostaId) {
      const casaAposta = await prisma.casaAposta.findUnique({
        where: { id: dto.casaApostaId }
      });

      if (casaAposta) {
        casaApostaNome = casaAposta.nome;
        valorUnidade = casaAposta.valorUnidade;
      }
    }

    // Calcular stake baseado nas unidades
    const stake = dto.unidades * valorUnidade;

    // Converter dataAposta para Date se for string
    let dataApostaDate = new Date();
    if (dto.dataAposta) {
      if (dto.dataAposta instanceof Date) {
        dataApostaDate = dto.dataAposta;
      } else {
        // Se for string "YYYY-MM-DD", criar Date no timezone local
        const [year, month, day] = dto.dataAposta.split('-').map(Number);
        dataApostaDate = new Date(year, month - 1, day);
      }
    }

    // Calcular lucro se não for pendente
    let lucro = 0;
    let valorRetorno = 0;
    const status = dto.status || 'pendente';
    
    if (status === 'green') {
      valorRetorno = stake * dto.odd;
      lucro = valorRetorno - stake;
    } else if (status === 'red') {
      lucro = -stake;
    } else if (status === 'reembolso') {
      lucro = 0;
      valorRetorno = stake;
    }

    const aposta = await prisma.aposta.create({
      data: {
        bancaId: dto.bancaId,
        casaApostaId: dto.casaApostaId || null,
        dataAposta: dataApostaDate,
        modalidade: dto.modalidade,
        mercado: dto.mercado,
        descricao: dto.descricao,
        odd: dto.odd,
        unidades: dto.unidades,
        stake,
        status,
        lucro,
        valorRetorno,
        casaApostaNome
      },
      include: {
        banca: {
          select: {
            id: true,
            nome: true,
            saldoAtual: true
          }
        },
        casaAposta: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    // Atualizar saldo da banca se não for pendente
    if (status !== 'pendente') {
      await this.atualizarSaldoBanca(dto.bancaId, lucro);
      // Se tiver casa de aposta, atualizar o saldo dela também
      if (dto.casaApostaId) {
        await this.atualizarSaldoCasaAposta(dto.casaApostaId, lucro);
      }
    }

    return aposta;
  }

  async getAll(bancaId?: string) {
    const where = bancaId ? { bancaId } : {};
    
    const apostas = await prisma.aposta.findMany({
      where,
      orderBy: { dataAposta: 'desc' },
      include: {
        banca: {
          select: {
            id: true,
            nome: true,
            saldoAtual: true
          }
        },
        casaAposta: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });
    
    return apostas;
  }

  async getMercadosUnicos(bancaId?: string) {
    const where = bancaId ? { bancaId } : {};
    
    // Buscar todas as apostas e extrair mercados únicos
    const apostas = await prisma.aposta.findMany({
      where,
      select: { mercado: true },
    });
    
    // Extrair mercados únicos e ordenar
    const mercadosSet = new Set<string>();
    for (const aposta of apostas) {
      if (aposta.mercado) {
        mercadosSet.add(aposta.mercado);
      }
    }
    
    return Array.from(mercadosSet).sort();
  }

  async getById(id: string) {
    const aposta = await prisma.aposta.findUnique({
      where: { id },
      include: {
        banca: true,
        casaAposta: true
      }
    });

    if (!aposta) {
      throw new Error('Aposta não encontrada');
    }

    return aposta;
  }

  async updateStatus(id: string, data: UpdateApostaStatusDto) {
    // Buscar aposta
    const aposta = await prisma.aposta.findUnique({
      where: { id }
    });

    if (!aposta) {
      throw new Error('Aposta não encontrada');
    }

    // Calcular lucro baseado no status
    let lucro = 0;
    let valorRetorno = 0;

    if (data.status === 'green') {
      valorRetorno = aposta.stake * aposta.odd;
      lucro = valorRetorno - aposta.stake;
    } else if (data.status === 'red') {
      lucro = -aposta.stake;
    } else if (data.status === 'reembolso') {
      lucro = 0;
      valorRetorno = aposta.stake;
    } else {
      lucro = 0;
      valorRetorno = 0;
    }

    // Atualizar aposta
    const apostaAtualizada = await prisma.aposta.update({
      where: { id },
      data: {
        status: data.status,
        lucro,
        valorRetorno
      }
    });

    // Atualizar saldo da banca se não for pendente
    if (data.status !== 'pendente') {
      // Verificar se já tinha lucro anterior para reverter
      const lucroAnterior = aposta.lucro || 0;
      const lucroNovo = lucro;
      const diferenca = lucroNovo - lucroAnterior;
      
      if (diferenca !== 0) {
        await this.atualizarSaldoBanca(aposta.bancaId, diferenca);
        // Se tiver casa de aposta, atualizar o saldo dela também
        if (aposta.casaApostaId) {
          await this.atualizarSaldoCasaAposta(aposta.casaApostaId, diferenca);
        }
      }
    }

    return apostaAtualizada;
  }

  async update(id: string, dto: UpdateApostaDto) {
    // Buscar aposta
    const aposta = await prisma.aposta.findUnique({
      where: { id }
    });

    if (!aposta) {
      throw new Error('Aposta não encontrada');
    }

    // Se estiver mudando a casa de aposta, buscar informações dela
    let valorUnidade = aposta.stake / aposta.unidades; // Calcular valor atual
    let casaApostaNome = aposta.casaApostaNome;
    
    if (dto.casaApostaId && dto.casaApostaId !== aposta.casaApostaId) {
      const casaAposta = await prisma.casaAposta.findUnique({
        where: { id: dto.casaApostaId }
      });

      if (casaAposta) {
        casaApostaNome = casaAposta.nome;
        valorUnidade = casaAposta.valorUnidade;
      }
    } else if (aposta.casaApostaId) {
      const casaAposta = await prisma.casaAposta.findUnique({
        where: { id: aposta.casaApostaId }
      });
      if (casaAposta) {
        valorUnidade = casaAposta.valorUnidade;
      }
    }

    // Calcular novo stake se unidades ou casa mudaram
    const unidades = dto.unidades !== undefined ? dto.unidades : aposta.unidades;
    const stake = unidades * valorUnidade;
    const odd = dto.odd !== undefined ? dto.odd : aposta.odd;

    // Converter dataAposta para Date se for string
    let dataApostaDate = aposta.dataAposta;
    if (dto.dataAposta) {
      if (dto.dataAposta instanceof Date) {
        dataApostaDate = dto.dataAposta;
      } else {
        // Se for string "YYYY-MM-DD", criar Date no timezone local
        const [year, month, day] = dto.dataAposta.split('-').map(Number);
        dataApostaDate = new Date(year, month - 1, day);
      }
    }

    // Calcular lucro conforme o status
    let lucro = aposta.lucro;
    let valorRetorno = aposta.valorRetorno;
    const status = dto.status !== undefined ? dto.status : aposta.status;
    
    if (status === 'pendente') {
      // Se voltar para pendente, zerar lucro e valor retorno
      lucro = null;
      valorRetorno = null;
    } else if (status === 'green') {
      valorRetorno = stake * odd;
      lucro = valorRetorno - stake;
    } else if (status === 'red') {
      lucro = -stake;
      valorRetorno = 0;
    } else if (status === 'reembolso') {
      lucro = 0;
      valorRetorno = stake;
    }

    // Atualizar aposta
    const apostaAtualizada = await prisma.aposta.update({
      where: { id },
      data: {
        casaApostaId: dto.casaApostaId !== undefined ? dto.casaApostaId : aposta.casaApostaId,
        dataAposta: dataApostaDate,
        modalidade: dto.modalidade !== undefined ? dto.modalidade : aposta.modalidade,
        mercado: dto.mercado !== undefined ? dto.mercado : aposta.mercado,
        descricao: dto.descricao !== undefined ? dto.descricao : aposta.descricao,
        odd,
        unidades,
        stake,
        status,
        lucro,
        valorRetorno,
        casaApostaNome
      },
      include: {
        banca: {
          select: {
            id: true,
            nome: true,
            saldoAtual: true
          }
        },
        casaAposta: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    // Atualizar saldos: sempre calcular a diferença entre o lucro anterior e o novo
    const lucroAnterior = aposta.lucro || 0;
    const lucroNovo = lucro || 0;
    const diferenca = lucroNovo - lucroAnterior;
    
    if (diferenca !== 0) {
      await this.atualizarSaldoBanca(aposta.bancaId, diferenca);
      if (aposta.casaApostaId) {
        await this.atualizarSaldoCasaAposta(aposta.casaApostaId, diferenca);
      }
    }

    return apostaAtualizada;
  }

  async delete(id: string) {
    const aposta = await prisma.aposta.findUnique({
      where: { id }
    });

    if (!aposta) {
      throw new Error('Aposta não encontrada');
    }

    // Se a aposta tinha lucro, reverter na banca e na casa de aposta
    if (aposta.lucro !== null && aposta.lucro !== undefined) {
      await this.atualizarSaldoBanca(aposta.bancaId, -aposta.lucro);
      if (aposta.casaApostaId) {
        await this.atualizarSaldoCasaAposta(aposta.casaApostaId, -aposta.lucro);
      }
    }

    await prisma.aposta.delete({
      where: { id }
    });

    return { message: 'Aposta deletada com sucesso' };
  }

  async getEstatisticas(bancaId?: string) {
    const where = bancaId ? { bancaId } : {};
    
    const apostas = await prisma.aposta.findMany({
      where,
      select: {
        stake: true,
        odd: true,
        status: true,
        lucro: true,
        dataAposta: true,
        unidades: true
      }
    });

    const estatisticas = calcularEstatisticas(apostas);
    
    // Calcular estatísticas mensais
    const agora = new Date();
    const mesAtual = agora.getMonth();
    const anoAtual = agora.getFullYear();
    
    // Apostas do mês atual
    const apostasMesAtual = apostas.filter(aposta => {
      const dataAposta = new Date(aposta.dataAposta);
      return dataAposta.getMonth() === mesAtual && 
             dataAposta.getFullYear() === anoAtual &&
             aposta.lucro !== null;
    });
    
    // Apostas do mês anterior
    const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
    const anoAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual;
    const apostasMesAnterior = apostas.filter(aposta => {
      const dataAposta = new Date(aposta.dataAposta);
      return dataAposta.getMonth() === mesAnterior && 
             dataAposta.getFullYear() === anoAnterior &&
             aposta.lucro !== null;
    });
    
    const lucroMesAtual = apostasMesAtual.reduce((sum, a) => sum + (a.lucro || 0), 0);
    const lucroMesAnterior = apostasMesAnterior.reduce((sum, a) => sum + (a.lucro || 0), 0);
    
    // Calcular ROI mensal: lucro / unidades utilizadas no mês
    const unidadesMesAtual = apostasMesAtual.reduce((sum, a) => sum + a.unidades, 0);
    const roiMensal = unidadesMesAtual > 0 ? (lucroMesAtual / unidadesMesAtual) : 0;
    
    // Calcular ROI total: lucro total / unidades totais utilizadas
    const apostasFinalizadas = apostas.filter(a => a.lucro !== null);
    const unidadesTotais = apostasFinalizadas.reduce((sum, a) => sum + a.unidades, 0);
    const lucroTotal = apostasFinalizadas.reduce((sum, a) => sum + (a.lucro || 0), 0);
    const roiTotal = unidadesTotais > 0 ? (lucroTotal / unidadesTotais) : 0;
    
    return {
      ...estatisticas,
      lucroMesAtual: Number(lucroMesAtual.toFixed(2)),
      lucroMesAnterior: Number(lucroMesAnterior.toFixed(2)),
      roiMensal: Number(roiMensal.toFixed(2)),
      roi: Number(roiTotal.toFixed(2))
    };
  }

  private async atualizarSaldoBanca(bancaId: string, lucro: number) {
    const banca = await prisma.banca.findUnique({
      where: { id: bancaId }
    });

    if (banca) {
      await prisma.banca.update({
        where: { id: bancaId },
        data: {
          saldoAtual: banca.saldoAtual + lucro
        }
      });
    }
  }

  private async atualizarSaldoCasaAposta(casaApostaId: string, lucro: number) {
    const casa = await prisma.casaAposta.findUnique({
      where: { id: casaApostaId }
    });

    if (casa) {
      await prisma.casaAposta.update({
        where: { id: casaApostaId },
        data: {
          saldoAtual: casa.saldoAtual + lucro
        }
      });
    }
  }
}

export const apostaService = new ApostaService();
