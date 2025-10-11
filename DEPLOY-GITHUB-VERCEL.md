# 🚀 Deploy no GitHub + Vercel - Guia Completo

## 📋 **Passos para Deploy:**

### **1. Criar Repositório no GitHub**

#### **Via GitHub Web:**
1. Acesse [github.com](https://github.com)
2. Clique em **"New repository"**
3. **Nome**: `sistema-cotacoes` (ou nome de sua escolha)
4. **Descrição**: `Sistema profissional de gerenciamento de cotações`
5. **Visibilidade**: Public (para deploy gratuito no Vercel)
6. **NÃO** marque "Add README" (já temos um)
7. Clique em **"Create repository"**

#### **Via Terminal:**
```bash
# Criar repositório no GitHub (substitua USERNAME pelo seu usuário)
gh repo create sistema-cotacoes --public --description "Sistema profissional de gerenciamento de cotações"

# Ou se preferir criar manualmente no site
```

### **2. Conectar Repositório Local ao GitHub**

```bash
# Adicionar remote origin (substitua USERNAME pelo seu usuário)
git remote add origin https://github.com/USERNAME/sistema-cotacoes.git

# Verificar remote
git remote -v

# Push inicial
git branch -M main
git push -u origin main
```

### **3. Deploy no Vercel**

#### **Via Vercel Dashboard:**
1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"New Project"**
3. **Import Git Repository**: Selecione `sistema-cotacoes`
4. **Framework Preset**: Vite (detectado automaticamente)
5. **Root Directory**: `./` (padrão)
6. **Build Command**: `npm run build` (padrão)
7. **Output Directory**: `dist` (padrão)
8. Clique em **"Deploy"**

#### **Via Vercel CLI:**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login no Vercel
vercel login

# Deploy
vercel

# Deploy para produção
vercel --prod
```

## 🔧 **Configuração de Variáveis de Ambiente**

### **No Vercel Dashboard:**
1. Vá para **Project Settings**
2. Clique em **Environment Variables**
3. Adicione as variáveis do Firebase:

```bash
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### **Arquivo .env.local (para desenvolvimento):**
```bash
# Criar arquivo .env.local na raiz do projeto
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 📁 **Estrutura Final do Projeto**

```
sistema-cotacoes/
├── .gitignore              # Arquivos ignorados pelo Git
├── .env.local              # Variáveis de ambiente (local)
├── README.md               # Documentação do projeto
├── vercel.json             # Configuração do Vercel
├── package.json            # Dependências do projeto
├── vite.config.ts          # Configuração do Vite
├── tailwind.config.js      # Configuração do Tailwind
├── tsconfig.json           # Configuração do TypeScript
├── index.html              # HTML principal
├── src/                    # Código fonte
│   ├── components/         # Componentes React
│   ├── services/          # Serviços (Firebase, FTP)
│   ├── hooks/             # Custom hooks
│   ├── types/             # Definições TypeScript
│   ├── utils/             # Utilitários
│   └── config/            # Configurações
└── dist/                   # Build de produção (gerado)
```

## 🚀 **Comandos Úteis**

### **Desenvolvimento:**
```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

### **Git:**
```bash
# Status do repositório
git status

# Adicionar arquivos
git add .

# Commit
git commit -m "Descrição da mudança"

# Push para GitHub
git push origin main

# Pull do GitHub
git pull origin main
```

### **Vercel:**
```bash
# Deploy automático
vercel

# Deploy para produção
vercel --prod

# Ver logs
vercel logs

# Remover deploy
vercel remove
```

## 🔒 **Configuração do Firebase**

### **1. Criar Projeto Firebase:**
1. Acesse [console.firebase.google.com](https://console.firebase.google.com/)
2. Clique em **"Create a project"**
3. **Nome**: `sistema-cotacoes` (ou nome de sua escolha)
4. **Google Analytics**: Opcional
5. Clique em **"Create project"**

### **2. Configurar Firestore:**
1. No menu lateral, clique em **"Firestore Database"**
2. Clique em **"Create database"**
3. **Mode**: Start in test mode
4. **Location**: Escolha a região mais próxima
5. Clique em **"Done"**

### **3. Configurar Regras de Segurança:**
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
  }
}
```

### **4. Obter Credenciais:**
1. Clique na engrenagem ⚙️ → **"Project settings"**
2. Role para baixo até **"Your apps"**
3. Clique em **"</>"** (Web app)
4. **App nickname**: `sistema-cotacoes-web`
5. **Firebase Hosting**: Não marcar
6. Clique em **"Register app"**
7. Copie as credenciais para as variáveis de ambiente

## 🌐 **URLs do Sistema**

### **Desenvolvimento:**
- **Local**: `http://localhost:5173`
- **Preview**: `http://localhost:4173`

### **Produção:**
- **Vercel**: `https://sistema-cotacoes.vercel.app`
- **Custom Domain**: `https://seudominio.com` (se configurado)

### **Imagens:**
- **Base URL**: `https://ideolog.ia.br/images/products/`
- **Exemplo**: `https://ideolog.ia.br/images/products/T608.jpg`

## 📊 **Monitoramento**

### **Vercel Analytics:**
- **Deployments**: Histórico de deploys
- **Functions**: Logs de funções serverless
- **Analytics**: Métricas de performance

### **Firebase Console:**
- **Firestore**: Dados em tempo real
- **Authentication**: Usuários logados
- **Storage**: Arquivos armazenados

## 🔄 **Deploy Automático**

### **GitHub Actions (Opcional):**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## ✅ **Checklist de Deploy**

### **Antes do Deploy:**
- [ ] Repositório criado no GitHub
- [ ] Código commitado e enviado
- [ ] Variáveis de ambiente configuradas
- [ ] Firebase configurado
- [ ] Build local funcionando

### **Durante o Deploy:**
- [ ] Vercel conectado ao GitHub
- [ ] Framework detectado (Vite)
- [ ] Build executado com sucesso
- [ ] Deploy concluído

### **Após o Deploy:**
- [ ] Site acessível via URL do Vercel
- [ ] Firebase funcionando
- [ ] Imagens carregando
- [ ] Comentários funcionando
- [ ] Deploy automático ativo

## 🎯 **Resultado Final**

**Sistema totalmente deployado e funcionando!**

- 🌐 **URL**: `https://sistema-cotacoes.vercel.app`
- 🔄 **Deploy Automático**: Push no GitHub → Deploy no Vercel
- 🔒 **Firebase**: Banco de dados em tempo real
- 🖼️ **Imagens**: Carregando de `https://ideolog.ia.br/`
- 📱 **Responsivo**: Funcionando em todos os dispositivos
- ⚡ **Performance**: Otimizado para produção

**Sistema pronto para uso em produção! 🚀**

## 📞 **Suporte**

### **Problemas Comuns:**
1. **Build Error**: Verificar dependências e TypeScript
2. **Firebase Error**: Verificar credenciais e regras
3. **Deploy Error**: Verificar configuração do Vercel
4. **Imagens não carregam**: Verificar URLs e CORS

### **Logs e Debug:**
```bash
# Logs do Vercel
vercel logs

# Logs do Firebase
# Console do Firebase → Functions → Logs

# Build local
npm run build
```

**Sistema totalmente funcional e deployado! ✨**









