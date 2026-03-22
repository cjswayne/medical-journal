import { createContext, useState, useMemo, useCallback } from 'react';
import { api } from '../utils/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem('wd_auth')
  );

  const login = useCallback(async (password) => {
    const data = await api.post('/auth/login', { password });
    if (data.ok) {
      localStorage.setItem('wd_auth', password);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('wd_auth');
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, login, logout }),
    [isAuthenticated, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
