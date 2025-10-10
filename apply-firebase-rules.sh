#!/bin/bash

# Script para aplicar regras do Firebase
# Certifique-se de ter o Firebase CLI instalado e configurado

echo "🔒 Aplicando regras do Firebase..."

# Verificar se o Firebase CLI está instalado (local ou global)
if ! command -v firebase &> /dev/null && ! command -v npx firebase &> /dev/null; then
    echo "❌ Firebase CLI não encontrado. Instale com: npm install firebase-tools --save-dev"
    exit 1
fi

# Usar npx se firebase não estiver disponível globalmente
FIREBASE_CMD="firebase"
if ! command -v firebase &> /dev/null; then
    FIREBASE_CMD="npx firebase"
fi

# Verificar se está logado no Firebase
if ! $FIREBASE_CMD projects:list &> /dev/null; then
    echo "❌ Não está logado no Firebase. Execute: $FIREBASE_CMD login"
    exit 1
fi

# Aplicar regras do Firestore
echo "📝 Aplicando regras do Firestore..."
$FIREBASE_CMD deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo "✅ Regras do Firebase aplicadas com sucesso!"
    echo "📊 Coleção 'produtosJaExportados' agora tem permissões de leitura e escrita para usuários autenticados"
else
    echo "❌ Erro ao aplicar regras do Firebase"
    exit 1
fi
