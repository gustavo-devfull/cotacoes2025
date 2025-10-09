import { 
  collection, 
  query, 
  where, 
  getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
}

export const userService = {
  // Buscar todos os usuários ativos do sistema
  async getAllUsers(): Promise<User[]> {
    try {
      console.log('🔍 Buscando usuários cadastrados do Firebase...');
      
      // Buscar usuários ativos do Firebase
      const q = query(
        collection(db, 'users'),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      const users: User[] = [];
      
      console.log(`📊 Usuários cadastrados encontrados: ${querySnapshot.size}`);
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`- ${doc.id}: ${data.name || 'Sem nome'} (${data.email})`);
        
        users.push({
          id: doc.id,
          name: data.name || 'Usuário sem nome',
          email: data.email || '',
          role: data.role || 'user',
          isActive: data.isActive || false
        });
      });
      
      // Se não houver usuários cadastrados, retornar array vazio
      if (users.length === 0) {
        console.log('⚠️ Nenhum usuário cadastrado encontrado no Firebase');
        return [];
      }
      
      console.log(`✅ ${users.length} usuários cadastrados carregados:`, users.map(u => u.name));
      return users;
      
    } catch (error) {
      console.error('❌ Erro ao buscar usuários do Firebase:', error);
      console.log('⚠️ Retornando lista vazia devido ao erro');
      return [];
    }
  },

  // Buscar usuário por ID
  async getUserById(userId: string): Promise<User | null> {
    try {
      console.log('🔍 Buscando usuário por ID:', userId);
      
      const q = query(
        collection(db, 'users'),
        where('__name__', '==', userId),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log('❌ Usuário não encontrado:', userId);
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      const user: User = {
        id: doc.id,
        name: data.name || 'Usuário sem nome',
        email: data.email || '',
        role: data.role || 'user',
        isActive: data.isActive || false
      };
      
      console.log('✅ Usuário encontrado:', user.name);
      return user;
    } catch (error) {
      console.error('❌ Erro ao buscar usuário por ID:', error);
      throw error;
    }
  },

  // Buscar usuários por IDs (para notificações)
  async getUsersByIds(userIds: string[]): Promise<User[]> {
    try {
      console.log('🔍 Buscando usuários por IDs:', userIds);
      
      if (userIds.length === 0) {
        return [];
      }
      
      const users: User[] = [];
      
      // Buscar cada usuário individualmente
      for (const userId of userIds) {
        try {
          const q = query(
            collection(db, 'users'),
            where('__name__', '==', userId),
            where('isActive', '==', true)
          );
          
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const data = doc.data();
            
            users.push({
              id: doc.id,
              name: data.name || 'Usuário sem nome',
              email: data.email || '',
              role: data.role || 'user',
              isActive: data.isActive || false
            });
          }
        } catch (error) {
          console.error(`❌ Erro ao buscar usuário ${userId}:`, error);
        }
      }
      
      console.log(`✅ ${users.length} usuários encontrados por IDs:`, users.map(u => u.name));
      return users;
    } catch (error) {
      console.error('❌ Erro ao buscar usuários por IDs:', error);
      return [];
    }
  },

  // Buscar usuários por nome (busca parcial)
  async searchUsersByName(searchTerm: string): Promise<User[]> {
    try {
      console.log('🔍 Buscando usuários por nome:', searchTerm);
      
      const allUsers = await this.getAllUsers();
      
      // Filtrar usuários que contenham o termo de busca no nome
      const filteredUsers = allUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      console.log(`✅ ${filteredUsers.length} usuários encontrados para "${searchTerm}"`);
      return filteredUsers;
    } catch (error) {
      console.error('❌ Erro ao buscar usuários por nome:', error);
      throw error;
    }
  }
};
