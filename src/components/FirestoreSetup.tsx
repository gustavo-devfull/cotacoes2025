import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Copy, ExternalLink, RefreshCw } from 'lucide-react';

const FirestoreSetup: React.FC = () => {
  const [copied, setCopied] = useState('');

  const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras para usuários
    match /users/{userId} {
      // Usuário pode ler/escrever seus próprios dados
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Admins podem ler/escrever todos os usuários
      allow read, write: if request.auth != null && 
        exists(/databases/\$(database)/documents/users/\$(request.auth.uid)) &&
        get(/databases/\$(database)/documents/users/\$(request.auth.uid)).data.role == 'admin';
    }
    
    // Regras para cotações
    match /cotacoes/{document} {
      // Usuários autenticados podem ler/escrever cotações
      allow read, write: if request.auth != null;
    }
    
    // Regras para comentários
    match /comments/{document} {
      // Usuários autenticados podem ler/escrever comentários
      allow read, write: if request.auth != null;
    }
    
    // Regra geral - usuários autenticados podem ler/escrever
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`;

  const tempRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-6 h-6 text-red-500" />
        <h2 className="text-xl font-bold text-gray-900">🔧 Configuração do Firestore Necessária</h2>
      </div>

      <div className="space-y-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">❌ Erro de Permissões Detectado</h3>
          <p className="text-red-700 text-sm mb-2">
            O usuário está autenticado mas não tem permissão para acessar a coleção 'users' no Firestore.
          </p>
          <p className="text-red-700 text-sm">
            <strong>UID do usuário:</strong> PTVKPenImgbnPJZmtcWRsbRksLZ2
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">📋 Passos para Corrigir:</h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">1</span>
              <div>
                <p className="font-medium text-gray-900">Acesse o Firebase Console</p>
                <a 
                  href="https://console.firebase.google.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                >
                  https://console.firebase.google.com/
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">2</span>
              <div>
                <p className="font-medium text-gray-900">Selecione seu projeto</p>
                <p className="text-gray-600 text-sm">Projeto: <code className="bg-gray-100 px-1 rounded">animagic-landing</code></p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">3</span>
              <div>
                <p className="font-medium text-gray-900">Vá para Firestore Database</p>
                <p className="text-gray-600 text-sm">Clique na aba "Rules"</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">4</span>
              <div>
                <p className="font-medium text-gray-900">Substitua as regras atuais</p>
                <p className="text-gray-600 text-sm">Cole uma das regras abaixo</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">5</span>
              <div>
                <p className="font-medium text-gray-900">Publique as regras</p>
                <p className="text-gray-600 text-sm">Clique em "Publish"</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">6</span>
              <div>
                <p className="font-medium text-gray-900">Recarregue a página</p>
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors mt-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Recarregar Agora
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">🔧 Regras Recomendadas:</h3>
          
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Regras Temporárias (Para Teste Rápido)</h4>
                <button
                  onClick={() => copyToClipboard(tempRules, 'temp')}
                  className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-sm hover:bg-yellow-200 transition-colors"
                >
                  {copied === 'temp' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied === 'temp' ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                <code>{tempRules}</code>
              </pre>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Regras Completas (Recomendado)</h4>
                <button
                  onClick={() => copyToClipboard(rules, 'complete')}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                >
                  {copied === 'complete' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied === 'complete' ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                <code>{rules}</code>
              </pre>
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">💡 Dica</h3>
          <p className="text-blue-700 text-sm">
            Use as regras temporárias primeiro para testar rapidamente. Depois configure as regras completas para maior segurança.
          </p>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">✅ Após Configurar</h3>
          <p className="text-green-700 text-sm">
            Recarregue a página e o sistema deve funcionar normalmente. O usuário poderá acessar seu perfil e o sistema criará automaticamente os dados necessários.
          </p>
        </div>

        <div className="text-center">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Recarregar Página
          </button>
        </div>
      </div>
    </div>
  );
};

export default FirestoreSetup;