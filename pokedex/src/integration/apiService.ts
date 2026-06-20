//Aqui onde fica a API do professor
import axios from 'axios';

// Endereço da api/base
const BASE_URL = 'https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon';

// Faz a conexão com a API
const api = axios.create({ baseURL: BASE_URL });

// ENDPOINT - Funções da API
// Autenticação e Registro de Usuário
export type AuthResponse = {
  userId: string;
  token?: string;
  username?: string;
};

// Cadastrar
export const register = async (username: string, password: string): Promise<AuthResponse> => {
  const response = await api.post('/auth/v1/register', { username, password }); // o que a api recebe 
  return response.data; // consulta no banco
};

// Login
export const loginApi = async (username: string, password: string): Promise<AuthResponse> => {
  const response = await api.post('/auth/v1/login', { username, password });
  return response.data;
};


// Informação do Perfil
export type UserStats = {
  userId: string;
  username?: string;
  level: string;
  vitorias: string;
  derrotas: string;
};

export const getStats = async (userId: string): Promise<UserStats> => {
  const response = await api.get(`/auth/v1/stats/${userId}`);
  return response.data;
};

export const updateStats = async (
  userId: string,
  stats: { level: string; vitorias: string; derrotas: string }
): Promise<UserStats> => {
  const response = await api.put(`/auth/v1/stats/${userId}`, stats);
  return response.data;
};


// Parte de time
export const getTeam = async (userId: string): Promise<number[]> => {
  const response = await api.get(`/pokemon/v1/team?user-id=${userId}`);
  return response.data;
};

export const updateTeam = async (
  userId: string,
  removedPokemon: number,
  newPokemon: number
): Promise<void> => {
  await api.put(
    `/pokemon/v1/team?user-id=${userId}&removed-pokemon=${removedPokemon}&new-pokemon=${newPokemon}`
  );
};

// Processo de captura de pokemons

/** Normaliza a resposta da API, que pode vir como array, string JSON ou objeto { body: ... } */
function parseIds(data: unknown): number[] {
  if (!data) return [];
  // AWS Lambda às vezes retorna { body: "[1,2,3]" }
  if (typeof data === 'object' && !Array.isArray(data) && (data as any).body !== undefined) {
    data = (data as any).body;
  }
  // Corpo pode vir como string JSON serializada
  if (typeof data === 'string') {
    try { data = JSON.parse(data as string); } catch (_e) { return []; }
  }
  if (!Array.isArray(data)) return [];
  // Normaliza para number (API pode retornar strings "1", "025" etc.)
  return (data as unknown[]).map(Number).filter((n) => !isNaN(n));
}

export const getCaptured = async (userId: string): Promise<number[]> => {
  const response = await api.get(`/pokemon/v1/captured?user-id=${userId}`);
  return parseIds(response.data);
};

export const addCaptured = async (userId: string, pokemonId: number): Promise<void> => {
  await api.put(`/pokemon/v1/captured?user-id=${userId}&pokemon-id=${pokemonId}`);
};

export const removeCaptured = async (userId: string, pokemonId: number): Promise<void> => {
  await api.delete(`/pokemon/v1/captured?user-id=${userId}&pokemon-id=${pokemonId}`);
};
