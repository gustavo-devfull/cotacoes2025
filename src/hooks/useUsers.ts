// Cache global para usuários
let usersCache: User[] | null = null;
let usersCacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Verificar se há cache válido
        const now = Date.now();
        if (usersCache && (now - usersCacheTimestamp) < CACHE_DURATION) {
          console.log('📋 Usando cache de usuários');
          setUsers(usersCache);
          setLoading(false);
          return;
        }
        
        console.log('🔄 Carregando usuários do sistema...');
        const usersData = await userService.getAllUsers();
        
        // Atualizar cache
        usersCache = usersData;
        usersCacheTimestamp = now;
        
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
      
      // Atualizar cache
      usersCache = usersData;
      usersCacheTimestamp = Date.now();
      
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
      
      // Usar cache se disponível
      if (usersCache) {
        const filteredUsers = usersCache.filter(user => 
          user.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        console.log(`✅ ${filteredUsers.length} usuários encontrados no cache para "${searchTerm}"`);
        return filteredUsers;
      }
      
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
      
      // Usar cache se disponível
      if (usersCache) {
        const filteredUsers = usersCache.filter(user => userIds.includes(user.id));
        console.log(`✅ ${filteredUsers.length} usuários encontrados no cache por IDs`);
        return filteredUsers;
      }
      
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