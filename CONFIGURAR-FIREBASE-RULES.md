# 🔧 Configuração das Regras de Segurança do Firebase

## ⚠️ Erro Atual:
```
FirebaseError: Missing or insufficient permissions.
```

Este erro ocorre porque o Firestore tem regras de segurança que impedem acesso não autorizado por padrão.

## 🚀 Solução: Configurar Regras do Firestore

### **Passo 1: Acessar o Console do Firebase**

1. **Acesse**: https://console.firebase.google.com/
2. **Selecione o projeto**: `animagic-landing`
3. **Navegue para**: Firestore Database → Rules

### **Passo 2: Configurar Regras de Segurança**

**Para Desenvolvimento (Temporário):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura e escrita para todos os documentos na coleção 'cotacoes'
    match /cotacoes/{document} {
      allow read, write: if true;
    }
    
    // Permitir leitura e escrita para todos os documentos na coleção 'comments'
    match /comments/{document} {
      allow read, write: if true;
    }
    
    // Bloquear acesso a outras coleções
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Para Produção (Recomendado):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acesso apenas à coleção 'cotacoes'
    match /cotacoes/{document} {
      // Permitir leitura e escrita para todos os usuários autenticados
      allow read, write: if request.auth != null;
      
      // OU permitir acesso público (menos seguro)
      // allow read, write: if true;
    }
    
    // Permitir acesso apenas à coleção 'comments'
    match /comments/{document} {
      // Permitir leitura e escrita para todos os usuários autenticados
      allow read, write: if request.auth != null;
      
      // OU permitir acesso público (menos seguro)
      // allow read, write: if true;
    }
    
    // Bloquear acesso a outras coleções
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### **Passo 3: Aplicar as Regras**

1. **Cole o código** das regras no editor
2. **Clique em**: "Publish" (Publicar)
3. **Aguarde**: A confirmação de que as regras foram aplicadas

### **Passo 4: Verificar a Configuração**

Após aplicar as regras, o sistema deve funcionar normalmente. Você verá:
- ✅ **Status**: "Firebase Conectado" (verde)
- ✅ **Dados**: Carregados do Firebase
- ✅ **Operações**: CRUD funcionando normalmente

## 🔒 Opções de Segurança:

### **Opção 1: Acesso Público (Desenvolvimento)**
```javascript
match /cotacoes/{document} {
  allow read, write: if true;
}
```
**Uso**: Desenvolvimento e testes
**Segurança**: Baixa (qualquer pessoa pode acessar)

### **Opção 2: Acesso Autenticado (Produção)**
```javascript
match /cotacoes/{document} {
  allow read, write: if request.auth != null;
}
```
**Uso**: Produção com usuários autenticados
**Segurança**: Alta (apenas usuários logados)

### **Opção 3: Acesso por IP (Empresarial)**
```javascript
match /cotacoes/{document} {
  allow read, write: if request.auth != null && 
    request.auth.token.admin == true;
}
```
**Uso**: Ambiente empresarial
**Segurança**: Muito alta (apenas administradores)

## 🛠️ Configuração Alternativa: Modo Offline

Se você preferir não configurar as regras agora, o sistema já tem fallback para modo offline:

```typescript
// O sistema automaticamente usa dados mock quando o Firebase falha
catch (error) {
  console.error('Erro ao carregar dados do Firebase:', error);
  // Fallback para dados mock em caso de erro
  setAllData(mockData);
  setFilteredData(mockData);
  setIsConnected(false);
}
```

## 📋 Checklist de Configuração:

- [ ] **Acessar**: https://console.firebase.google.com/
- [ ] **Selecionar projeto**: `animagic-landing`
- [ ] **Navegar para**: Firestore Database → Rules
- [ ] **Aplicar regras**: Cole o código das regras
- [ ] **Publicar**: Clique em "Publish"
- [ ] **Verificar**: Sistema funcionando com Firebase conectado
- [ ] **Testar**: Importar, editar e deletar cotações

## 🔍 Troubleshooting:

### **Erro Persiste:**
1. **Verifique**: Se o projeto correto está selecionado
2. **Confirme**: Se as regras foram publicadas com sucesso
3. **Aguarde**: Alguns minutos para propagação das regras
4. **Teste**: Recarregue a página do sistema

### **Regras Não Aplicam:**
1. **Verifique sintaxe**: Use o validador do Firebase Console
2. **Confirme estrutura**: `match /cotacoes/{document}`
3. **Teste regras**: Use o simulador do Firebase Console

### **Acesso Negado:**
1. **Verifique permissões**: Usuário tem acesso ao projeto?
2. **Confirme coleção**: Nome exato é "cotacoes"?
3. **Teste manual**: Tente criar documento manualmente no console

## 🚀 Próximos Passos:

Após configurar as regras:

1. **Teste completo**: Importar, editar, deletar cotações
2. **Verifique sincronização**: Mudanças em tempo real
3. **Monitore logs**: Console do navegador para erros
4. **Configure produção**: Regras mais restritivas para produção

## 📞 Suporte:

Se precisar de ajuda adicional:
- **Firebase Docs**: https://firebase.google.com/docs/firestore/security/get-started
- **Console Firebase**: https://console.firebase.google.com/
- **Logs do Sistema**: Verifique o console do navegador

**Configure as regras do Firestore para resolver o erro de permissões! 🔧**
