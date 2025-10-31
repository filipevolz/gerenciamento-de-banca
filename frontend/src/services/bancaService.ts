import { api } from './api';

export type Banca = {
  id: string;
  usuarioId: string;
  nome: string;
  saldoInicial: number;
  saldoAtual: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateBancaData = {
  nome: string;
  saldoInicial: number;
};

export const bancaService = {
  async create(data: CreateBancaData, usuarioId: string): Promise<Banca> {
    const response = await api.post<Banca>('/bancas', {
      usuarioId,
      ...data
    });
    return response.data;
  },

  async getAll(): Promise<Banca[]> {
    const response = await api.get<Banca[]>('/bancas');
    return response.data;
  },

  async getById(id: string): Promise<Banca> {
    const response = await api.get<Banca>(`/bancas/${id}`);
    return response.data;
  },

  async update(id: string, data: Partial<CreateBancaData>): Promise<Banca> {
    const response = await api.put<Banca>(`/bancas/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/bancas/${id}`);
  },
};

