import { api } from './api';

export type StatusAposta = 'pendente' | 'green' | 'red' | 'reembolso';

export type Aposta = {
  id: string;
  bancaId: string;
  casaApostaId?: string;
  dataAposta: string;
  modalidade: string;
  mercado: string;
  descricao?: string;
  odd: number;
  unidades: number;
  stake: number;
  status: StatusAposta;
  casaApostaNome?: string;
  valorRetorno?: number;
  lucro?: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateApostaData = {
  bancaId: string;
  casaApostaId?: string;
  dataAposta?: string;
  modalidade: string;
  mercado: string;
  descricao?: string;
  odd: number;
  unidades: number;
  status?: string;
};

export type UpdateApostaStatusData = {
  status: StatusAposta;
};

export type UpdateApostaData = {
  casaApostaId?: string;
  dataAposta?: string;
  modalidade?: string;
  mercado?: string;
  descricao?: string;
  odd?: number;
  unidades?: number;
  status?: string;
};

export const apostaService = {
  async create(data: CreateApostaData): Promise<Aposta> {
    const response = await api.post<Aposta>('/apostas', data);
    return response.data;
  },

  async getAll(bancaId?: string): Promise<Aposta[]> {
    const params = bancaId ? { bancaId } : {};
    const response = await api.get<Aposta[]>('/apostas', { params });
    return response.data;
  },

  async getById(id: string): Promise<Aposta> {
    const response = await api.get<Aposta>(`/apostas/${id}`);
    return response.data;
  },

  async update(id: string, data: UpdateApostaData): Promise<Aposta> {
    const response = await api.put<Aposta>(`/apostas/${id}`, data);
    return response.data;
  },

  async updateStatus(id: string, data: UpdateApostaStatusData): Promise<Aposta> {
    const response = await api.patch<Aposta>(`/apostas/${id}/status`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/apostas/${id}`);
  },

  async getEstatisticas(bancaId?: string): Promise<any> {
    const params = bancaId ? { bancaId } : {};
    const response = await api.get('/apostas/estatisticas', { params });
    return response.data;
  },

  async getMercados(bancaId?: string): Promise<string[]> {
    const params = bancaId ? { bancaId } : {};
    const response = await api.get<string[]>('/apostas/mercados', { params });
    return response.data;
  },
};

