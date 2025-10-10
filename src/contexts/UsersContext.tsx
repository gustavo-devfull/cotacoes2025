import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { userService, User } from '../services/userService';

interface UsersContextType {
  users: User[];
  loading: boolean;
  error: string | null;
  refreshUsers: () => Promise<void>;
  searchUsers: (searchTerm: string) => Promise<User[]>;
  getUsersByIds: (userIds: string[]) => Promise<User[]>;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

interface UsersProviderProps {
  children: ReactNode;
}

// Cache global para usuários
let usersCache: User[] | null = null;
let usersCacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const UsersProvider: React.FC<UsersProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar se há cache válido
      const now = Date.now();
      if (usersCache && (now - usersCacheTimestamp) < CACHE_DURATION) {
        console.log('📋 Usando cache de usuários (Context)');
        setUsers(usersCache);
        setLoading(false);
        return;
      }
      
      console.log('🔄 Carregando usuários do sistema (Context)...');
      const usersData = await userService.getAllUsers();
      
      // Atualizar cache
      usersCache = usersData;
      usersCacheTimestamp = now;
      
      setUsers(usersData);
      console.log(`✅ ${usersData.length} usuários carregados com sucesso (Context)`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro ao carregar usuários (Context):', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const refreshUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Atualizando lista de usuários (Context)...');
      const usersData = await userService.getAllUsers();
      
      // Atualizar cache
      usersCache = usersData;
      usersCacheTimestamp = Date.now();
      
      setUsers(usersData);
      console.log(`✅ Lista de usuários atualizada: ${usersData.length} usuários (Context)`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro ao atualizar usuários (Context):', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchUsers = useCallback(async (searchTerm: string): Promise<User[]> => {
    try {
      console.log('🔍 Buscando usuários com termo (Context):', searchTerm);
      
      // Usar cache se disponível
      if (usersCache) {
        const filteredUsers = usersCache.filter(user => 
          user.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        console.log(`✅ ${filteredUsers.length} usuários encontrados no cache para "${searchTerm}" (Context)`);
        return filteredUsers;
      }
      
      const results = await userService.searchUsersByName(searchTerm);
      console.log(`✅ ${results.length} usuários encontrados para "${searchTerm}" (Context)`);
      return results;
    } catch (err) {
      console.error('❌ Erro ao buscar usuários (Context):', err);
      return [];
    }
  }, []);

  const getUsersByIds = useCallback(async (userIds: string[]): Promise<User[]> => {
    try {
      console.log('🔍 Buscando usuários por IDs (Context):', userIds);
      
      // Usar cache se disponível
      if (usersCache) {
        const filteredUsers = usersCache.filter(user => userIds.includes(user.id));
        console.log(`✅ ${filteredUsers.length} usuários encontrados no cache por IDs (Context)`);
        return filteredUsers;
      }
      
      const results = await userService.getUsersByIds(userIds);
      console.log(`✅ ${results.length} usuários encontrados por IDs (Context)`);
      return results;
    } catch (err) {
      console.error('❌ Erro ao buscar usuários por IDs (Context):', err);
      return [];
    }
  }, []);

  const value: UsersContextType = {
    users,
    loading,
    error,
    refreshUsers,
    searchUsers,
    getUsersByIds
  };

  return (
    <UsersContext.Provider value={value}>
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = (): UsersContextType => {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error('useUsers deve ser usado dentro de um UsersProvider');
  }
  return context;
};
