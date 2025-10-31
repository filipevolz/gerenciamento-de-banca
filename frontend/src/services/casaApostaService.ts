import { api } from './api';

export type CasaAposta = {
  id: string;
  bancaId: string;
  nome: string;
  saldoAtual: number;
  valorUnidade: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateCasaApostaData = {
  bancaId: string;
  nome: string;
  saldoAtual?: number;
  valorUnidade?: number;
};

export const casaApostaService = {
  async create(data: CreateCasaApostaData): Promise<CasaAposta> {
    const response = await api.post<CasaAposta>('/casas-aposta', data);
    return response.data;
  },

  async getAll(bancaId?: string): Promise<CasaAposta[]> {
    const params = bancaId ? { bancaId } : {};
    const response = await api.get<CasaAposta[]>('/casas-aposta', { params });
    return response.data;
  },

  async getById(id: string): Promise<CasaAposta> {
    const response = await api.get<CasaAposta>(`/casas-aposta/${id}`);
    return response.data;
  },

  async update(id: string, data: Partial<CreateCasaApostaData>): Promise<CasaAposta> {
    const response = await api.put<CasaAposta>(`/casas-aposta/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/casas-aposta/${id}`);
  },
};

