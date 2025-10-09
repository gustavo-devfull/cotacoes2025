import { useState, useEffect } from 'react';
import { userService, User } from '../services/userService';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Carregando usuários do sistema...');
        const usersData = await userService.getAllUsers();
        
        setUsers(usersData);
        console.log(`✅ ${usersData.length} usuários carregados com sucesso`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        console.error('❌ Erro ao carregar usuários:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const refreshUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Atualizando lista de usuários...');
      const usersData = await userService.getAllUsers();
      
      setUsers(usersData);
      console.log(`✅ Lista de usuários atualizada: ${usersData.length} usuários`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro ao atualizar usuários:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (searchTerm: string): Promise<User[]> => {
    try {
      console.log('🔍 Buscando usuários com termo:', searchTerm);
      const results = await userService.searchUsersByName(searchTerm);
      console.log(`✅ ${results.length} usuários encontrados para "${searchTerm}"`);
      return results;
    } catch (err) {
      console.error('❌ Erro ao buscar usuários:', err);
      return [];
    }
  };

  const getUsersByIds = async (userIds: string[]): Promise<User[]> => {
    try {
      console.log('🔍 Buscando usuários por IDs:', userIds);
      const results = await userService.getUsersByIds(userIds);
      console.log(`✅ ${results.length} usuários encontrados por IDs`);
      return results;
    } catch (err) {
      console.error('❌ Erro ao buscar usuários por IDs:', err);
      return [];
    }
  };

  return {
    users,
    loading,
    error,
    refreshUsers,
    searchUsers,
    getUsersByIds
  };
};
