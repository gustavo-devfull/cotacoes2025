// Script para promover gutopc@me.com a admin
// Execute este código no console do navegador (F12 -> Console)

async function promoteGutopcToAdmin() {
  try {
    console.log('🔍 Iniciando promoção do usuário gutopc@me.com...');
    
    // Importar Firebase (se não estiver disponível)
    if (typeof window.firebase === 'undefined') {
      console.log('❌ Firebase não encontrado. Execute este script na página do sistema.');
      return;
    }
    
    // Usar o authService do sistema
    const { authService } = window;
    if (!authService) {
      console.log('❌ authService não encontrado. Execute este script na página do sistema.');
      return;
    }
    
    // Buscar todos os usuários
    console.log('📋 Buscando todos os usuários...');
    const users = await authService.getAllUsers();
    console.log('Usuários encontrados:', users);
    
    // Encontrar gutopc@me.com
    const gutopcUser = users.find(user => user.email === 'gutopc@me.com');
    
    if (!gutopcUser) {
      console.log('❌ Usuário gutopc@me.com não encontrado!');
      console.log('Usuários disponíveis:', users.map(u => u.email));
      return;
    }
    
    console.log('✅ Usuário encontrado:', gutopcUser);
    
    // Promover a admin
    console.log('🚀 Promovendo usuário a admin...');
    await authService.updateUserRole(gutopcUser.id, 'admin');
    
    console.log('🎉 Usuário gutopc@me.com promovido a admin com sucesso!');
    console.log('🔄 Recarregue a página para ver as mudanças na navegação.');
    
    // Verificar se funcionou
    const updatedUsers = await authService.getAllUsers();
    const updatedGutopc = updatedUsers.find(user => user.email === 'gutopc@me.com');
    console.log('✅ Verificação - Role atual:', updatedGutopc?.role);
    
  } catch (error) {
    console.error('❌ Erro ao promover usuário:', error);
  }
}

// Executar a função
promoteGutopcToAdmin();
