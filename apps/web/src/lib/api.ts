const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const TOKEN_KEY = 'school_monitor_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
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
  regionId?: string;
}

export interface PriorityEntry {
  institutionId: string;
  institutionName: string;
  regionId: string | null;
  score: number;
  reasons: string[];
  openIncidentCount: number;
  criticalFacilityCount: number;
  activeInterventionCount: number;
}

export interface DashboardSummary {
  totalInstitutions: number;
  criticalPriorityCount: number;
  openSecurityIncidents: number;
  activeInterventions: number;
  facilitiesNeedingAttention: number;
}

export interface Intervention {
  id: string;
  institutionId: string;
  type: string;
  description?: string;
  status: string;
  priority: string;
  budget?: number;
  createdAt: string;
  institution?: { id: string; name: string };
}

export interface SecurityIncident {
  id: string;
  institutionId: string;
  type: string;
  severity: string;
  description?: string;
  occurredAt: string;
  status: string;
  institution?: { id: string; name: string };
}

export interface AdminRegion {
  id: string;
  name: string;
  level: number;
  parentId?: string | null;
}

export const api = {
  login: (email: string, password: string) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getSummary: () => request<DashboardSummary>('/dashboard/summary'),

  getPriorityRanking: (regionId?: string) =>
    request<PriorityEntry[]>(`/dashboard/priority${regionId ? `?regionId=${regionId}` : ''}`),

  getInstitutions: () => request<Institution[]>('/institutions'),

  createInstitution: (data: {
    name: string;
    type: string;
    ownership: string;
    lat: number;
    lng: number;
    address?: string;
    regionId?: string;
  }) =>
    request<Institution>('/institutions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getInterventions: () => request<Intervention[]>('/interventions'),

  updateInterventionStatus: (id: string, status: string) =>
    request<Intervention>(`/interventions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  getIncidents: () => request<SecurityIncident[]>('/security-incidents'),

  updateIncidentStatus: (id: string, status: string, responseNotes?: string) =>
    request<SecurityIncident>(`/security-incidents/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, responseNotes }),
    }),

  getRegions: () => request<AdminRegion[]>('/admin-regions'),
};
