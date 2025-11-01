import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { authAPI, setAuthToken, removeAuthToken, getAuthToken } from '../services/api';

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  experience?: string;
  resume?: {
    filename: string;
    originalName: string;
    path: string;
    uploadDate: string;
  };
  hasProfile?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  socialLogin: (provider: string, socialData: any) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      console.log('🔐 useAuth - initAuth called, token exists:', !!token);
      if (token) {
        try {
          const response = await authAPI.getCurrentUser();
          console.log('🔐 useAuth - getCurrentUser response:', response);
          setUser(response.user);
          console.log('🔐 useAuth - User set from getCurrentUser:', response.user);
        } catch (error) {
          console.error('Auth initialization error:', error);
          removeAuthToken();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.signin({ email, password });
      console.log('🔐 useAuth - Login response:', response);
      setAuthToken(response.token);
      setUser(response.user);
      console.log('🔐 useAuth - User set after login:', response.user);
    } catch (error) {
      throw error;
    }
  };

  const signup = async (userData: any) => {
    try {
      const response = await authAPI.signup(userData);
      setAuthToken(response.token);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const socialLogin = async (provider: string, socialData: any) => {
    try {
      const response = await authAPI.socialAuth({
        provider,
        ...socialData
      });
      setAuthToken(response.token);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    console.log('🔄 useAuth - updateUser called with:', userData);
    setUser(prev => {
      const newUser = prev ? { ...prev, ...userData } : null;
      console.log('🔄 useAuth - Updated user state:', newUser);
      console.log('🔄 useAuth - New hasProfile value:', newUser?.hasProfile);
      return newUser;
    });
  };

  const value = {
    user,
    loading,
    login,
    signup,
    socialLogin,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};