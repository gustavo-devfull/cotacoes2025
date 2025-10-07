#!/bin/bash

# Script para instalar e executar o backend FTP
# Execute com: chmod +x setup-ftp-backend.sh && ./setup-ftp-backend.sh

echo "🚀 Configurando Backend FTP para Upload de Imagens"
echo "=================================================="

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js primeiro."
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"

# Criar diretório para o backend FTP
echo "📁 Criando diretório do backend FTP..."
mkdir -p ftp-backend
cd ftp-backend

# Copiar arquivos necessários
echo "📋 Copiando arquivos do backend..."
cp ../ftp-backend.js ./
cp ../ftp-backend-package.json ./package.json

# Instalar dependências
echo "📦 Instalando dependências do backend FTP..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependências instaladas com sucesso!"
else
    echo "❌ Erro ao instalar dependências"
    exit 1
fi

# Criar diretório para uploads temporários
echo "📁 Criando diretório para uploads temporários..."
mkdir -p temp-uploads

echo ""
echo "🎉 Backend FTP configurado com sucesso!"
echo ""
echo "📋 Para executar o backend FTP:"
echo "   cd ftp-backend"
echo "   npm start"
echo ""
echo "🌐 O backend estará disponível em:"
echo "   http://localhost:3002"
echo ""
echo "📡 Endpoints disponíveis:"
echo "   POST /api/upload-ftp - Upload de imagens"
echo "   GET  /api/test-ftp   - Teste de conexão"
echo "   GET  /api/list-ftp   - Listar arquivos"
echo ""
echo "🔗 Configuração FTP:"
echo "   Host: 46.202.90.62"
echo "   Port: 21"
echo "   User: u715606397.ideolog.ia.br"
echo "   Dir:  public_html/images/comments/"
echo ""
echo "🚀 Para iniciar o backend FTP agora, execute:"
echo "   cd ftp-backend && npm start"
