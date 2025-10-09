import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';

// Configuração do Firebase (mesma do projeto)
const firebaseConfig = {
  apiKey: "AIzaSyBqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq",
  authDomain: "gerenciar-cotacoes.firebaseapp.com",
  projectId: "gerenciar-cotacoes",
  storageBucket: "gerenciar-cotacoes.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456789"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugComments() {
  try {
    console.log('🔍 Verificando comentários no Firebase...');
    
    const commentsRef = collection(db, 'comments');
    const q = query(commentsRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    console.log(`📊 Total de comentários encontrados: ${querySnapshot.size}`);
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`\n📝 Comentário ID: ${doc.id}`);
      console.log(`   Produto: ${data.productId}`);
      console.log(`   Usuário: ${data.userName}`);
      console.log(`   Mensagem: "${data.message}"`);
      console.log(`   Data: ${data.timestamp?.toDate?.() || data.timestamp}`);
      console.log(`   Imagens: ${data.images?.length || 0}`);
      console.log(`   Usuários marcados: ${data.mentionedUsers?.length || 0}`);
      
      if (data.mentionedUsers && data.mentionedUsers.length > 0) {
        console.log(`   IDs marcados: ${data.mentionedUsers.join(', ')}`);
      } else {
        console.log(`   ❌ NENHUM USUÁRIO MARCADO`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar comentários:', error);
  }
}

debugComments();
