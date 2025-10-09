import { 
  auth, 
  db, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  query,
  orderBy,
  FirebaseUser
} from '../config/firebase';
import { User, UserProfile } from '../types';

class AuthService {
  /**
   * Fazer login com email e senha
   */
  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Buscar perfil do usuário no Firestore
      const userProfile = await this.getUserProfile(user.uid);
      
      // Atualizar último login
      await this.updateLastLogin(user.uid);
      
      return userProfile;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  }

  /**
   * Criar nova conta
   */
  async signUp(email: string, password: string, name: string, role: 'admin' | 'user' = 'user'): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Criar perfil do usuário no Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        name,
        email,
        role,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=ffffff`,
        createdAt: new Date(),
        lastLogin: new Date(),
        isActive: true
      };
      
      await setDoc(doc(db, 'users', user.uid), userProfile);
      
      return {
        id: user.uid,
        name: userProfile.name,
        email: userProfile.email,
        avatar: userProfile.avatar,
        role: userProfile.role,
        createdAt: userProfile.createdAt,
        lastLogin: userProfile.lastLogin,
        isActive: userProfile.isActive
      };
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      throw error;
    }
  }

  /**
   * Fazer logout
   */
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  }

  /**
   * Obter perfil do usuário
   */
  async getUserProfile(uid: string): Promise<User> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (!userDoc.exists()) {
        // Se não existe perfil, criar um básico
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
          const basicProfile: UserProfile = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'Usuário',
            email: firebaseUser.email || '',
            role: 'user',
            avatar: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(firebaseUser.displayName || 'U')}&background=3b82f6&color=ffffff`,
            createdAt: new Date(),
            lastLogin: new Date(),
            isActive: true
          };
          
          try {
            await setDoc(doc(db, 'users', uid), basicProfile);
          } catch (setError) {
            console.warn('Não foi possível criar perfil no Firestore:', setError);
            // Retornar perfil básico mesmo se não conseguir salvar
          }
          
          return {
            id: basicProfile.uid,
            name: basicProfile.name,
            email: basicProfile.email,
            avatar: basicProfile.avatar,
            role: basicProfile.role,
            createdAt: basicProfile.createdAt,
            lastLogin: basicProfile.lastLogin,
            isActive: basicProfile.isActive
          };
        }
        throw new Error('Usuário Firebase não encontrado');
      }
      
      const userData = userDoc.data() as UserProfile;
      
      return {
        id: userData.uid,
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar,
        role: userData.role,
        createdAt: userData.createdAt && typeof userData.createdAt === 'object' && 'toDate' in userData.createdAt 
          ? (userData.createdAt as any).toDate() 
          : new Date(userData.createdAt),
        lastLogin: userData.lastLogin && typeof userData.lastLogin === 'object' && 'toDate' in userData.lastLogin 
          ? (userData.lastLogin as any).toDate() 
          : (userData.lastLogin ? new Date(userData.lastLogin) : undefined),
        isActive: userData.isActive
      };
    } catch (error) {
      console.error('Erro ao obter perfil do usuário:', error);
      
      // Se der erro de permissão, re-lançar o erro para ser tratado pelo contexto
      if (error instanceof Error && (
        error.message.includes('permissions') || 
        error.message.includes('Missing or insufficient permissions') ||
        error.message.includes('FirebaseError')
      )) {
        console.log('Erro de permissão detectado no authService, re-lançando erro');
        throw error; // Re-lançar para ser tratado pelo UserContext
      }
      
      // Para outros erros, criar perfil básico localmente
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        console.log('Criando perfil básico local devido a erro não relacionado a permissões');
        const basicProfile: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Usuário',
          email: firebaseUser.email || '',
          avatar: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(firebaseUser.displayName || 'U')}&background=3b82f6&color=ffffff`,
          role: 'user',
          createdAt: new Date(),
          lastLogin: new Date(),
          isActive: true
        };
        return basicProfile;
      }
      
      throw error;
    }
  }

  /**
   * Atualizar último login
   */
  async updateLastLogin(uid: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        lastLogin: new Date()
      });
    } catch (error) {
      console.error('Erro ao atualizar último login:', error);
    }
  }

  /**
   * Atualizar data de criação do usuário
   */
  async updateCreatedAt(uid: string, newDate: Date): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        createdAt: newDate
      });
    } catch (error) {
      console.error('Erro ao atualizar data de criação:', error);
    }
  }

  /**
   * Atualizar todas as datas de um usuário
   */
  async updateUserDates(uid: string, lastLogin?: Date, createdAt?: Date): Promise<void> {
    try {
      const updateData: any = {};
      
      if (lastLogin) {
        updateData.lastLogin = lastLogin;
      }
      
      if (createdAt) {
        updateData.createdAt = createdAt;
      }
      
      if (Object.keys(updateData).length > 0) {
        await updateDoc(doc(db, 'users', uid), updateData);
      }
    } catch (error) {
      console.error('Erro ao atualizar datas do usuário:', error);
    }
  }

  /**
   * Obter todos os usuários (apenas para admins)
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(usersQuery);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data() as UserProfile;
        return {
          id: data.uid,
          name: data.name,
          email: data.email,
          avatar: data.avatar,
          role: data.role,
          createdAt: data.createdAt && typeof data.createdAt === 'object' && 'toDate' in data.createdAt 
            ? (data.createdAt as any).toDate() 
            : new Date(data.createdAt),
          lastLogin: data.lastLogin && typeof data.lastLogin === 'object' && 'toDate' in data.lastLogin 
            ? (data.lastLogin as any).toDate() 
            : (data.lastLogin ? new Date(data.lastLogin) : undefined),
          isActive: data.isActive
        };
      });
    } catch (error) {
      console.error('Erro ao obter usuários:', error);
      throw error;
    }
  }

  /**
   * Atualizar perfil do usuário
   */
  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), updates);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  }

  /**
   * Ativar/desativar usuário
   */
  async toggleUserStatus(uid: string, isActive: boolean): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), { isActive });
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      throw error;
    }
  }

  /**
   * Alterar role do usuário
   */
  async updateUserRole(uid: string, role: 'admin' | 'user'): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), { role });
    } catch (error) {
      console.error('Erro ao alterar role do usuário:', error);
      throw error;
    }
  }

  /**
   * Escutar mudanças no estado de autenticação
   */
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Obter usuário atual
   */
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }
}

// Instância singleton do serviço
export const authService = new AuthService();
