# 🚨 SOLUÇÃO RÁPIDA: Erro Firebase Comments

## ❌ **Erro Atual:**
```
useComments.ts:34 Erro na escuta em tempo real de comentários: FirebaseError: Missing or insufficient permissions.
```

## ✅ **Solução em 3 Passos:**

### **Passo 1: Acessar Firebase Console**
1. **Abra**: https://console.firebase.google.com/
2. **Clique**: No projeto `animagic-landing`
3. **Navegue**: Firestore Database → Rules

### **Passo 2: Cole as Regras**
**Cole EXATAMENTE este código:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /cotacoes/{document} {
      allow read, write: if true;
    }
    
    match /comments/{document} {
      allow read, write: if true;
    }
    
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### **Passo 3: Publicar**
1. **Clique**: "Publish" (botão azul)
2. **Aguarde**: Confirmação de publicação
3. **Recarregue**: A página do sistema

## 🎯 **Resultado Esperado:**
- ✅ Status: "Comentários Online" (verde)
- ✅ Comentários funcionando
- ✅ Upload de imagens funcionando

## 🔍 **Se Ainda Não Funcionar:**

### **Verificar:**
1. **Projeto correto**: `animagic-landing`
2. **Regras publicadas**: Status "Published"
3. **Conexão internet**: Estável
4. **Cache do navegador**: Limpar (Ctrl+F5)

### **Testar:**
```bash
# Verificar se o sistema está rodando
curl http://localhost:3000

# Verificar se o backend FTP está rodando
curl http://localhost:3002/api/test-ftp
```

## 📞 **Suporte:**
- **Firebase Console**: https://console.firebase.google.com/
- **Documentação**: https://firebase.google.com/docs/firestore/security/get-started
- **Logs**: Verificar console do navegador (F12)

**Configure as regras Firebase para resolver o erro! 🔧**

















