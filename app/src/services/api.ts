import axios, { type AxiosError, type AxiosInstance } from 'axios';
import type { ApiResponse, AuthResponse, User, Room, LeaderboardUser, WordValidationResponse } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', {
      username,
      email,
      password
    });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      password
    });
    return response.data;
  },

  getMe: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data;
  },

  logout: async (): Promise<ApiResponse<unknown>> => {
    const response = await api.post<ApiResponse<unknown>>('/auth/logout');
    return response.data;
  },

  getLeaderboard: async (page = 1, limit = 10): Promise<ApiResponse<{ users: LeaderboardUser[]; pagination: { total: number; page: number; pages: number } }>> => {
    const response = await api.get<ApiResponse<{ users: LeaderboardUser[]; pagination: { total: number; page: number; pages: number } }>>(`/auth/leaderboard?page=${page}&limit=${limit}`);
    return response.data;
  }
};

// Room API
export const roomAPI = {
  createRoom: async (data: {
    name: string;
    maxPlayers: number;
    password?: string;
    lives: number;
    timeout: number;
    gameMode: 'casual' | 'ranked';
  }): Promise<ApiResponse<{ room: Room }>> => {
    const response = await api.post<ApiResponse<{ room: Room }>>('/rooms', data);
    return response.data;
  },

  getRooms: async (page = 1, limit = 20, gameMode = 'casual'): Promise<ApiResponse<{ rooms: Room[]; pagination: { total: number; page: number; pages: number } }>> => {
    const response = await api.get<ApiResponse<{ rooms: Room[]; pagination: { total: number; page: number; pages: number } }>>(`/rooms?page=${page}&limit=${limit}&gameMode=${gameMode}`);
    return response.data;
  },

  getRoom: async (roomId: string): Promise<ApiResponse<{ room: Room }>> => {
    const response = await api.get<ApiResponse<{ room: Room }>>(`/rooms/${roomId}`);
    return response.data;
  },

  joinRoom: async (roomId: string, password?: string): Promise<ApiResponse<{ room: Room }>> => {
    const response = await api.post<ApiResponse<{ room: Room }>>(`/rooms/${roomId}/join`, { password });
    return response.data;
  },

  leaveRoom: async (roomId: string): Promise<ApiResponse<unknown>> => {
    const response = await api.post<ApiResponse<unknown>>(`/rooms/${roomId}/leave`);
    return response.data;
  },

  toggleReady: async (roomId: string, isReady: boolean): Promise<ApiResponse<{ isReady: boolean; allReady: boolean }>> => {
    const response = await api.post<ApiResponse<{ isReady: boolean; allReady: boolean }>>(`/rooms/${roomId}/ready`, { isReady });
    return response.data;
  }
};

// Word API
export const wordAPI = {
  validateWord: async (text: string): Promise<WordValidationResponse> => {
    const response = await api.get<WordValidationResponse>(`/validate?text=${encodeURIComponent(text)}`);
    return response.data;
  },

  checkWordUsed: async (matchId: string, word: string): Promise<{ success: boolean; used: boolean; word?: string }> => {
    const response = await api.get<{ success: boolean; used: boolean; word?: string }>(`/used?match=${matchId}&word=${encodeURIComponent(word)}`);
    return response.data;
  },

  getUsedWords: async (matchId: string): Promise<{ success: boolean; words: string[] }> => {
    const response = await api.get<{ success: boolean; words: string[] }>(`/used?match=${matchId}`);
    return response.data;
  }
};

export default api;
