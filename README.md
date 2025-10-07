# 🚀 Sistema de Gerenciamento de Cotações

Sistema profissional de gerenciamento de cotações com design moderno inspirado em dashboards B2B, desenvolvido em React + TypeScript.

## ✨ Funcionalidades

### 📊 Dashboard Principal
- **Tabela de Produtos**: Visualização completa dos produtos com estrutura da planilha original
- **Cards de Resumo**: Total de itens, valor total e CBM total
- **Busca Inteligente**: Filtros por REF, descrição, nome ou loja
- **Design Responsivo**: Interface moderna com azul profissional

### 🖼️ Sistema de Imagens
- **Imagens de Produtos**: Carregamento automático baseado na REF do produto
- **URL Base**: `https://ideolog.ia.br/images/products/`
- **Lightbox**: Visualização em tela cheia com navegação
- **Cache Inteligente**: Performance otimizada

### 📥 Importação de Dados
- **Suporte CSV/Excel**: Importação de planilhas de cotações
- **Mapeamento Automático**: Campos da planilha mapeados para o sistema
- **Validação de Dados**: Verificação de campos obrigatórios
- **Estrutura Flexível**: Suporte a diferentes formatos de planilha

### ✏️ Edição Inline
- **Edição Direta**: Clique duplo para editar campos
- **Cálculos Automáticos**: Fórmulas para QTY, AMOUNT, CBM, etc.
- **Salvamento Automático**: Mudanças salvas automaticamente
- **Validação em Tempo Real**: Verificação de dados durante edição

### 💬 Sistema de Comentários
- **Comentários por Produto**: Conversas salvas por produto
- **Upload de Imagens**: Envio de imagens nos comentários
- **Usuários**: Sistema de autenticação simples
- **Firebase**: Sincronização em tempo real

### 🔄 Integração Firebase
- **Firestore**: Banco de dados em tempo real
- **CRUD Completo**: Criar, ler, atualizar e deletar produtos
- **Sincronização**: Mudanças refletidas instantaneamente
- **Modo Offline**: Fallback para desenvolvimento

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Database**: Firebase Firestore
- **Icons**: Lucide React
- **Parsing**: Papa Parse (CSV) + XLSX (Excel)

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/sistema-cotacoes.git
cd sistema-cotacoes

# Instale as dependências
npm install

# Execute o projeto
npm run dev
```

### Build para Produção
```bash
npm run build
npm run preview
```

## 🔧 Configuração

### Firebase
1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative o Firestore Database
3. Configure as regras de segurança (veja `CONFIGURAR-FIREBASE-RULES.md`)
4. Copie as credenciais para `src/config/firebase.ts`

### FTP (Opcional)
Para upload de imagens nos comentários:
```bash
# Configure o backend FTP
./setup-ftp-backend.sh
cd ftp-backend
npm start
```

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── Dashboard.tsx    # Dashboard principal
│   ├── CotacoesTable.tsx # Tabela de produtos
│   ├── CommentsComponent.tsx # Sistema de comentários
│   ├── Lightbox.tsx     # Visualizador de imagens
│   └── ...
├── services/           # Serviços
│   ├── cotacaoService.ts # Firebase CRUD
│   ├── ftpImageService.ts # Carregamento de imagens
│   └── uploadService.ts  # Upload de arquivos
├── hooks/              # Custom hooks
│   ├── useComments.ts  # Hook para comentários
│   └── useLightbox.ts  # Hook para lightbox
├── types/              # Definições TypeScript
├── utils/              # Utilitários
└── config/             # Configurações
```

## 🌐 Deploy no Vercel

### Configuração Automática
1. Conecte o repositório GitHub ao Vercel
2. Configure as variáveis de ambiente:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

### Build Settings
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## 📊 Funcionalidades Detalhadas

### Importação de Planilhas
- **Formatos**: CSV e Excel (.xlsx)
- **Estrutura**: Primeira linha título, segunda vazia, terceira cabeçalhos
- **Campos Suportados**: REF, DESCRIPTION, NAME, OBS, CTNS, UNIT/CTN, etc.
- **Validação**: Verificação de campos obrigatórios

### Cálculos Automáticos
- **QTY**: CTNS × UNIT/CTN
- **AMOUNT**: QTY × U.PRICE RMB
- **CBM**: L × W × H ÷ 1,000,000
- **CBM TOTAL**: CTNS × CBM
- **T.G.W**: CTNS × G.W
- **N.W**: UNIT/CTN × PESO UNITARIO
- **T.N.W**: CTNS × N.W

### Sistema de Imagens
- **Carregamento**: Baseado na REF do produto
- **Formato**: JPG
- **URL**: `https://ideolog.ia.br/images/products/{REF}.jpg`
- **Fallback**: Ícone padrão se imagem não encontrada

## 🔒 Segurança

### Firebase Rules
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

## 📈 Performance

- **Lazy Loading**: Componentes carregados sob demanda
- **Cache de Imagens**: URLs encontradas são armazenadas
- **Otimização**: Build otimizado para produção
- **CDN**: Imagens servidas via CDN Hostinger

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte, abra uma issue no GitHub ou entre em contato através do email.

---

**Desenvolvido com ❤️ para gerenciamento profissional de cotações**