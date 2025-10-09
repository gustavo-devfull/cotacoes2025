import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';

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
