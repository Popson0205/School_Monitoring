import Constants from 'expo-constants';
import { getToken } from './storage';

const API_URL: string =
  (Constants.expoConfig?.extra?.apiUrl as string) || 'http://localhost:3000/api/v1';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.message || message;
    } catch {
      // ignore parse failure
    }
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface LoginResponse {
  accessToken: string;
  user: { id: string; email: string; fullName: string; role: string; tenantId: string };
}

export interface Institution {
  id: string;
  name: string;
  type: 'PRIMARY' | 'SECONDARY' | 'UNIVERSITY';
  ownership: 'GOVERNMENT' | 'PRIVATE';
  lat: number;
  lng: number;
  address?: string;
}

export interface CreateInstitutionInput {
  name: string;
  type: string;
  ownership: string;
  lat: number;
  lng: number;
  address?: string;
}

export interface CreateFacilityInput {
  institutionId: string;
  category: string;
  condition: string;
  notes?: string;
}

export const api = {
  login: (email: string, password: string) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getInstitutions: () => request<Institution[]>('/institutions'),

  createInstitution: (data: CreateInstitutionInput) =>
    request<Institution>('/institutions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createFacility: (data: CreateFacilityInput) =>
    request('/facilities', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
