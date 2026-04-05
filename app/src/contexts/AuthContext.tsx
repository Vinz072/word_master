import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, AuthResponse } from '@/types';
import { authAPI } from '@/services/api';
import { socketService } from '@/services/socket';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (username: string, email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserPoints: (pointChange: number, newTotal: number, rank: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          // Verify token and get fresh user data
          const response = await authAPI.getMe();
          if (response.success && response.data?.user) {
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            // Connect socket and authenticate
            socketService.connect();
            socketService.authenticate(response.data.user.id, response.data.user.username);
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }

      setIsLoading(false);
    };

    initAuth();

    // Cleanup socket on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await authAPI.login(email, password);
      
      if (response.success && response.data) {
        const { token, user } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        
        // Connect socket and authenticate
        socketService.connect();
        socketService.authenticate(user.id, user.username);
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  const register = useCallback(async (username: string, email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await authAPI.register(username, email, password);
      
      if (response.success && response.data) {
        const { token, user } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        
        // Connect socket and authenticate
        socketService.connect();
        socketService.authenticate(user.id, user.username);
      }
      
      return response;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      socketService.disconnect();
    }
  }, []);

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const response = await authAPI.getMe();
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  }, []);

  const updateUserPoints = useCallback((pointChange: number, newTotal: number, rank: string): void => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      
      const updatedUser = {
        ...prevUser,
        rankPoints: newTotal,
        rank,
        matchesPlayed: pointChange < 0 
          ? prevUser.matchesPlayed 
          : prevUser.matchesPlayed + 1,
        matchesWon: pointChange > 0 
          ? prevUser.matchesWon + 1 
          : prevUser.matchesWon,
        matchesLost: pointChange < 0 
          ? prevUser.matchesLost + 1 
          : prevUser.matchesLost
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    updateUserPoints
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
