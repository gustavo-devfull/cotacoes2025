# 🔥 Regras de Firestore para Sistema de Autenticação

## ❌ **Problema Identificado:**

```
FirebaseError: Missing or insufficient permissions.
```

O usuário está autenticado mas não tem permissão para acessar a coleção `users` no Firestore.

## ✅ **Solução: Configurar Regras de Firestore**

### **1. Acesse o Firebase Console:**
```
1. Vá para https://console.firebase.google.com/
2. Selecione seu projeto: animagic-landing
3. Clique em "Firestore Database"
4. Clique na aba "Rules"
```

### **2. Substitua as regras atuais por:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras para usuários
    match /users/{userId} {
      // Usuário pode ler/escrever seus próprios dados
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Admins podem ler/escrever todos os usuários
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
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
}
```

### **3. Clique em "Publish" para aplicar as regras**

## 🔧 **Alternativa: Regras Temporárias Mais Permissivas**

Se você quiser testar rapidamente, use estas regras temporárias:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🚀 **Correção no Código**

Vou também ajustar o código para lidar melhor com erros de permissão:

