import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBvQZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8Q",
  authDomain: "animagic-landing.firebaseapp.com",
  projectId: "animagic-landing",
  storageBucket: "animagic-landing.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function setupUsers() {
  try {
    console.log('🔍 Verificando usuários existentes no Firebase...');
    
    // Verificar se já existem usuários
    const q = query(collection(db, 'users'));
    const querySnapshot = await getDocs(q);
    
    console.log(`📊 Usuários existentes: ${querySnapshot.size}`);
    
    if (querySnapshot.size === 0) {
      console.log('❌ Nenhum usuário encontrado. Criando usuários de exemplo...');
      
      // Criar usuários de exemplo
      const exampleUsers = [
        {
          name: 'Guto Santos',
          email: 'guto@email.com',
          role: 'admin',
          isActive: true,
          createdAt: new Date(),
          lastLogin: new Date()
        },
        {
          name: 'Maria Silva',
          email: 'maria@email.com',
          role: 'user',
          isActive: true,
          createdAt: new Date(),
          lastLogin: new Date()
        },
        {
          name: 'João Costa',
          email: 'joao@email.com',
          role: 'user',
          isActive: true,
          createdAt: new Date(),
          lastLogin: new Date()
        },
        {
          name: 'Ana Oliveira',
          email: 'ana@email.com',
          role: 'user',
          isActive: true,
          createdAt: new Date(),
          lastLogin: new Date()
        },
        {
          name: 'Pedro Santos',
          email: 'pedro@email.com',
          role: 'user',
          isActive: true,
          createdAt: new Date(),
          lastLogin: new Date()
        }
      ];
      
      for (const user of exampleUsers) {
        try {
          const docRef = await addDoc(collection(db, 'users'), user);
          console.log(`✅ Usuário criado: ${user.name} (ID: ${docRef.id})`);
        } catch (error) {
          console.error(`❌ Erro ao criar usuário ${user.name}:`, error);
        }
      }
      
      console.log('🎉 Usuários de exemplo criados com sucesso!');
    } else {
      console.log('✅ Usuários já existem:');
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`- ${data.name} (${data.email}) - ${data.role} - Ativo: ${data.isActive}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

setupUsers();
