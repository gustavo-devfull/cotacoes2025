import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { FirebaseUser } from '../config/firebase';

interface UserContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role?: 'admin' | 'user') => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  hasPermissionError: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPermissionError, setHasPermissionError] = useState(false);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      console.log('Auth state changed:', user);
      setFirebaseUser(user);
      setHasPermissionError(false);
      
      if (user) {
        try {
          const userProfile = await authService.getUserProfile(user.uid);
          setCurrentUser(userProfile);
        } catch (error) {
          console.error('Erro ao carregar perfil do usuário:', error);
          console.log('Tipo do erro:', typeof error);
          console.log('Erro completo:', error);
          
          // Verificar se é erro de permissão - versão mais robusta
          const errorMessage = error instanceof Error ? error.message : String(error);
          const isPermissionError = errorMessage.includes('permissions') || 
                                  errorMessage.includes('Missing or insufficient permissions') ||
                                  errorMessage.includes('FirebaseError') ||
                                  (error as any)?.code === 'permission-denied';
          
          if (isPermissionError) {
            console.log('✅ Erro de permissão detectado, mostrando configuração do Firestore');
            setHasPermissionError(true);
            setCurrentUser(null);
          } else {
            console.log('❌ Erro não relacionado a permissões');
            setCurrentUser(null);
          }
        }
      } else {
        setCurrentUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const user = await authService.signIn(email, password);
      setCurrentUser(user);
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, role: 'admin' | 'user' = 'user') => {
    try {
      setLoading(true);
      const user = await authService.signUp(email, password, name, role);
      setCurrentUser(user);
    } catch (error) {
      console.error('Erro no cadastro:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      setCurrentUser(null);
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  const value: UserContextType = {
    currentUser,
    firebaseUser,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
    hasPermissionError
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};





