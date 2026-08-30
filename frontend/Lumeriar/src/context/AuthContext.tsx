// context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { API_BASE } from '../api/client';  // ✅ import the base URL

interface AuthContextType {
  token: string | null;
  role: 'admin' | 'judge' | 'coach' | null;
  userId: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ role: 'admin' | 'judge' | 'coach'; userId: number }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [role, setRole] = useState<'admin' | 'judge' | 'coach' | null>(localStorage.getItem('role') as any);
  const [userId, setUserId] = useState<number | null>(Number(localStorage.getItem('userId')) || null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // ✅ Use API_BASE to build the full URL
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message);
    }
    const data = await res.json();
    setToken(data.token);
    setRole(data.role);
    setUserId(data.userId);
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('userId', String(data.userId));
    return { role: data.role, userId: data.userId };
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setUserId(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
  };

  const isAuthenticated = !!token && !!role;

  return (
    <AuthContext.Provider value={{ token, role, userId, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};