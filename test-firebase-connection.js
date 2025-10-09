// Script para testar conexão Firebase
// Execute no console do navegador (F12)

console.log('🔥 Testando conexão Firebase...');

// Importar Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

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

try {
  // Inicializar Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  console.log('✅ Firebase inicializado com sucesso');
  
  // Testar acesso à coleção comments
  const commentsRef = collection(db, 'comments');
  console.log('✅ Referência da coleção comments criada');
  
  // Tentar ler documentos
  getDocs(commentsRef).then((snapshot) => {
    console.log('✅ Leitura de comentários bem-sucedida');
    console.log(`📊 Documentos encontrados: ${snapshot.docs.length}`);
    
    if (snapshot.docs.length > 0) {
      console.log('📝 Primeiro comentário:', snapshot.docs[0].data());
    }
  }).catch((error) => {
    console.error('❌ Erro ao ler comentários:', error);
    console.log('🔧 Solução: Configure as regras Firebase');
    console.log('📋 Acesse: https://console.firebase.google.com/');
    console.log('📋 Projeto: animagic-landing');
    console.log('📋 Firestore Database → Rules');
  });
  
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase:', error);
}

console.log('🔧 Para resolver o erro:');
console.log('1. Acesse: https://console.firebase.google.com/');
console.log('2. Projeto: animagic-landing');
console.log('3. Firestore Database → Rules');
console.log('4. Cole as regras e publique');






