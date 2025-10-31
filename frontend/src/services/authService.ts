import { api } from './api';

export type LoginData = {
  email: string;
  senha: string;
};

export type RegisterData = {
  nome: string;
  email: string;
  senha: string;
};

export type User = {
  id: string;
  nome: string;
  email: string;
  createdAt: string;
};

export type AuthResponse = {
  usuario: User;
  token: string;
};

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async me(): Promise<{ usuario: User }> {
    const response = await api.get<{ usuario: User }>('/auth/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  getStoredToken(): string | null {
    return localStorage.getItem('token');
  },
};

