import { createContext, useContext, useState, ReactNode } from 'react';
import { api, getToken, setToken, clearToken, LoginResponse } from './api';

interface AuthContextValue {
  user: LoginResponse['user'] | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LoginResponse['user'] | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());

  async function login(email: string, password: string) {
    const res = await api.login(email, password);
    setToken(res.accessToken);
    setUser(res.user);
    setIsAuthenticated(true);
  }

  function logout() {
    clearToken();
    setUser(null);
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
