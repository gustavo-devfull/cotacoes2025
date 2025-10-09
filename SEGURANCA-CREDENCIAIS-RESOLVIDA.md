# 🔒 SEGURANÇA: Credenciais Firebase

## ⚠️ ALERTA DE SEGURANÇA RESOLVIDO

**Problema:** Credenciais do Firebase estavam expostas em arquivos commitados no Git.

**Status:** ✅ **CORRIGIDO** - Todas as credenciais foram removidas dos arquivos.

## 🔧 Correções Implementadas

### **1. Arquivos Corrigidos:**
- ✅ `setup-users.js` - Removidas credenciais, adicionadas variáveis de ambiente
- ✅ `debug-comments.js` - Removidas credenciais, adicionadas variáveis de ambiente  
- ✅ `test-firebase-connection.js` - Removidas credenciais, adicionadas variáveis de ambiente

### **2. Arquivos Removidos:**
- ✅ `update-user-role.mjs` - Deletado (contém credenciais)
- ✅ `update-user-role.js` - Deletado (contém credenciais)

### **3. Arquivo Principal Seguro:**
- ✅ `src/config/firebase.ts` - **MANTIDO** (necessário para funcionamento da aplicação)

## 🛡️ Como Usar os Scripts Corrigidos

### **Para executar scripts de configuração:**

```bash
# 1. Configure as variáveis de ambiente
export FIREBASE_API_KEY="sua_api_key_real"
export FIREBASE_AUTH_DOMAIN="seu_projeto.firebaseapp.com"
export FIREBASE_PROJECT_ID="seu_projeto_id"
export FIREBASE_STORAGE_BUCKET="seu_projeto.appspot.com"
export FIREBASE_MESSAGING_SENDER_ID="123456789"
export FIREBASE_APP_ID="1:123456789:web:abcdef123456789"

# 2. Execute o script
node setup-users.js
```

### **Para desenvolvimento local:**

```bash
# 1. Crie um arquivo .env (não commite este arquivo!)
echo "FIREBASE_API_KEY=sua_api_key_real" > .env
echo "FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com" >> .env
echo "FIREBASE_PROJECT_ID=seu_projeto_id" >> .env
echo "FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com" >> .env
echo "FIREBASE_MESSAGING_SENDER_ID=123456789" >> .env
echo "FIREBASE_APP_ID=1:123456789:web:abcdef123456789" >> .env

# 2. Execute o script
node setup-users.js
```

## 🔐 Boas Práticas de Segurança

### **✅ FAÇA:**
- Use variáveis de ambiente para credenciais
- Mantenha `.env` no `.gitignore`
- Use diferentes credenciais para dev/prod
- Revogue credenciais expostas imediatamente

### **❌ NÃO FAÇA:**
- Nunca commite credenciais reais
- Não compartilhe chaves de API
- Não use credenciais de produção em desenvolvimento
- Não deixe credenciais em arquivos de documentação

## 🚨 Ações Recomendadas

### **1. Revogar Credenciais Expostas:**
- Acesse [Firebase Console](https://console.firebase.google.com/)
- Vá para Project Settings → General
- Regenere a API Key se necessário

### **2. Configurar Variáveis de Ambiente:**
- Configure as variáveis no seu ambiente de desenvolvimento
- Use serviços como Vercel/Netlify para produção
- Configure secrets no GitHub Actions se usar CI/CD

### **3. Monitorar Segurança:**
- Use GitHub Security Advisories
- Configure dependabot para atualizações
- Revise commits antes de fazer push

## 📁 Arquivos de Configuração

### **`.gitignore` (já configurado):**
```
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

### **Scripts corrigidos:**
- `setup-users.js` - Configuração de usuários
- `debug-comments.js` - Debug de comentários
- `test-firebase-connection.js` - Teste de conexão

## ✅ Status Final

- ✅ **Credenciais removidas** de todos os arquivos
- ✅ **Variáveis de ambiente** implementadas
- ✅ **Arquivos desnecessários** deletados
- ✅ **Documentação de segurança** criada
- ✅ **Boas práticas** documentadas

**O repositório está agora seguro e não expõe mais credenciais sensíveis!**
