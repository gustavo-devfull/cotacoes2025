import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';

// ⚠️ IMPORTANTE: Configure as variáveis de ambiente antes de executar
// export FIREBASE_API_KEY="sua_api_key_aqui"
// export FIREBASE_AUTH_DOMAIN="seu_dominio_aqui"
// export FIREBASE_PROJECT_ID="seu_project_id_aqui"
// export FIREBASE_STORAGE_BUCKET="seu_storage_bucket_aqui"
// export FIREBASE_MESSAGING_SENDER_ID="seu_sender_id_aqui"
// export FIREBASE_APP_ID="seu_app_id_aqui"

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "CONFIGURE_SUAS_VARIAVEIS_DE_AMBIENTE",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "CONFIGURE_SUAS_VARIAVEIS_DE_AMBIENTE",
  projectId: process.env.FIREBASE_PROJECT_ID || "CONFIGURE_SUAS_VARIAVEIS_DE_AMBIENTE",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "CONFIGURE_SUAS_VARIAVEIS_DE_AMBIENTE",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "CONFIGURE_SUAS_VARIAVEIS_DE_AMBIENTE",
  appId: process.env.FIREBASE_APP_ID || "CONFIGURE_SUAS_VARIAVEIS_DE_AMBIENTE"
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
