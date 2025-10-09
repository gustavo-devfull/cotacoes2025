// Script para testar conexão Firebase
// Execute no console do navegador (F12)

console.log('🔥 Testando conexão Firebase...');

// Importar Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBySY8xhJFEkCk54oiL5Ktv6Hkl5TweqLM",
  authDomain: "animagic-landing.firebaseapp.com",
  projectId: "animagic-landing",
  storageBucket: "animagic-landing.firebasestorage.app",
  messagingSenderId: "171274238722",
  appId: "1:171274238722:web:81d791da7219d10715a01b"
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






