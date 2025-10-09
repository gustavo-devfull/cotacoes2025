import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, getDocs, collection, query, where } from 'firebase/firestore';

// Configuração do Firebase (mesma do seu projeto)
const firebaseConfig = {
  apiKey: "AIzaSyBQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ",
  authDomain: "gerenciar-cotacoes.firebaseapp.com",
  projectId: "gerenciar-cotacoes",
  storageBucket: "gerenciar-cotacoes.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnop"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateUserRole(email, newRole) {
  try {
    console.log(`🔍 Procurando usuário com email: ${email}`);
    
    // Buscar usuário por email na coleção users
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('❌ Usuário não encontrado na coleção users');
      return;
    }
    
    // Atualizar cada documento encontrado
    const updatePromises = querySnapshot.docs.map(async (userDoc) => {
      const userData = userDoc.data();
      console.log(`📝 Usuário encontrado:`, {
        id: userDoc.id,
        name: userData.name,
        email: userData.email,
        role: userData.role
      });
      
      // Atualizar o role
      await updateDoc(doc(db, 'users', userDoc.id), {
        role: newRole,
        updatedAt: new Date()
      });
      
      console.log(`✅ Role atualizado para: ${newRole}`);
    });
    
    await Promise.all(updatePromises);
    console.log(`🎉 Usuário ${email} promovido a ${newRole} com sucesso!`);
    
  } catch (error) {
    console.error('❌ Erro ao atualizar role:', error);
  }
}

// Executar a atualização
updateUserRole('gutopc@me.com', 'admin');

