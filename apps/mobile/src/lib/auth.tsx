import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, LoginResponse } from './api';
import { getToken, setToken, clearToken, getStoredUser, setStoredUser } from './storage';

interface AuthContextValue {
  user: LoginResponse['user'] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LoginResponse['user'] | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (token) {
        const storedUser = await getStoredUser<LoginResponse['user']>();
        setUser(storedUser);
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    })();
  }, []);

  async function login(email: string, password: string) {
    const res = await api.login(email, password);
    await setToken(res.accessToken);
    await setStoredUser(res.user);
    setUser(res.user);
    setIsAuthenticated(true);
  }

  async function logout() {
    await clearToken();
    setUser(null);
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
