import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, useGetMe } from '@workspace/api-client-react';
import { setAuthTokenGetter } from '@workspace/api-client-react';

setAuthTokenGetter(() => localStorage.getItem('africa_travel_token'));

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('africa_travel_user');
    return saved ? JSON.parse(saved) : null;
  });

  const { data: me, isLoading, isError } = useGetMe({
    query: {
      retry: false,
      refetchOnWindowFocus: false,
    }
  });

  useEffect(() => {
    if (me) {
      setUser(me);
      localStorage.setItem('africa_travel_user', JSON.stringify(me));
    } else if (isError) {
      setUser(null);
      localStorage.removeItem('africa_travel_user');
      localStorage.removeItem('africa_travel_token');
    }
  }, [me, isError]);

  const login = (token: string, userData: User) => {
    localStorage.setItem('africa_travel_token', token);
    localStorage.setItem('africa_travel_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('africa_travel_token');
    localStorage.removeItem('africa_travel_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
