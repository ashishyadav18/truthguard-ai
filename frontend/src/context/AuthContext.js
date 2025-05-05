import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const login = async (username, password) => {
    try {
      const { data } = await axios.post('http://localhost:5000/auth/login', {
        username, password
      });
      localStorage.setItem('access_token', data.access_token);
      setUser({ username: data.username });
      setAuthModalOpen(false);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const register = async (username, password) => {
    try {
      const { data } = await axios.post('http://localhost:5000/auth/register', {
        username, password
      });
      localStorage.setItem('access_token', data.access_token);
      setUser({ username: data.username });
      setAuthModalOpen(false);
      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      authModalOpen,
      setAuthModalOpen,
      authMode,
      setAuthMode,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);