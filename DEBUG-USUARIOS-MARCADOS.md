# Debug - Usuários Marcados Não Aparecem nos Comentários

## 🔍 **Logs de Debug Implementados**

### **✅ Logs Adicionados:**

**1. No carregamento de comentários:**
```javascript
console.log('🔍 Carregando nomes dos usuários marcados...');
console.log('📊 Comentários recebidos:', comments.length);
console.log(`📝 Comentário ${comment.id}:`, {
  message: comment.message,
  mentionedUsers: comment.mentionedUsers,
  hasMentionedUsers: !!(comment.mentionedUsers && comment.mentionedUsers.length > 0)
});
```

**2. No envio de comentário:**
```javascript
console.log('📤 Enviando comentário com usuários marcados:', {
  productId,
  message: newMessage.trim(),
  imageUrls,
  selectedUsers,
  hasSelectedUsers: selectedUsers.length > 0
});
```

**3. Na renderização:**
```javascript
console.log(`🏷️ Renderizando usuários marcados para comentário ${comment.id}:`, {
  cacheKey,
  userNames,
  mentionedUsers: comment.mentionedUsers
});
```

## 🧪 **Como Debugar**

### **Passo 1: Abrir Console do Navegador**
- **Chrome/Edge:** F12 → Console
- **Firefox:** F12 → Console
- **Safari:** Cmd+Option+I → Console

### **Passo 2: Testar Marcação de Usuários**
1. **Abrir comentários** de um produto
2. **Selecionar usuários** usando checkboxes
3. **Digitar mensagem**
4. **Enviar comentário**

### **Passo 3: Verificar Logs**

**Logs esperados no envio:**
```
📤 Enviando comentário com usuários marcados: {
  productId: "COPOS-REF123",
  message: "Teste de marcação",
  imageUrls: [],
  selectedUsers: ["user1", "user2"],
  hasSelectedUsers: true
}
```

**Logs esperados no carregamento:**
```
🔍 Carregando nomes dos usuários marcados...
📊 Comentários recebidos: 1
📝 Comentário abc123: {
  message: "Teste de marcação",
  mentionedUsers: ["user1", "user2"],
  hasMentionedUsers: true
}
```

**Logs esperados na renderização:**
```
🏷️ Renderizando usuários marcados para comentário abc123: {
  cacheKey: "user1,user2",
  userNames: ["Guto Santos", "Maria Silva"],
  mentionedUsers: ["user1", "user2"]
}
```

## 🔧 **Possíveis Problemas e Soluções**

### **Problema 1: Usuários não são selecionados**
**Sintoma:** `selectedUsers: []` no log de envio
**Solução:** Verificar se checkboxes estão funcionando

### **Problema 2: Usuários não são enviados**
**Sintoma:** `hasSelectedUsers: false` no log de envio
**Solução:** Verificar função `onAddComment` no Dashboard

### **Problema 3: Campo não é salvo no Firebase**
**Sintoma:** `mentionedUsers: undefined` no log de carregamento
**Solução:** Verificar `useComments.ts` e Firebase

### **Problema 4: Nomes não são carregados**
**Sintoma:** `userNames: ["user1", "user2"]` (IDs em vez de nomes)
**Solução:** Verificar `getUsersByIds` e `userService.ts`

### **Problema 5: Não renderiza na interface**
**Sintoma:** Logs de renderização não aparecem
**Solução:** Verificar condição `comment.mentionedUsers && comment.mentionedUsers.length > 0`

## 📊 **Checklist de Verificação**

### **✅ Interface de Seleção:**
- [ ] Checkboxes aparecem para usuários
- [ ] Checkboxes podem ser selecionados
- [ ] Estado `selectedUsers` é atualizado

### **✅ Envio de Comentário:**
- [ ] Função `onAddComment` recebe `mentionedUsers`
- [ ] Logs de envio mostram usuários selecionados
- [ ] Comentário é salvo no Firebase

### **✅ Carregamento de Comentários:**
- [ ] Campo `mentionedUsers` existe nos comentários
- [ ] Logs mostram `hasMentionedUsers: true`
- [ ] Função `getUsersByIds` é chamada

### **✅ Renderização:**
- [ ] Condição de exibição é verdadeira
- [ ] Logs de renderização aparecem
- [ ] Nomes dos usuários são exibidos

## 🚨 **Soluções Rápidas**

### **Se usuários não aparecem para seleção:**
```javascript
// Verificar se availableUsers está sendo passado
console.log('Usuários disponíveis:', availableUsers);
```

### **Se campo não é salvo:**
```javascript
// Verificar se mentionedUsers está sendo passado
console.log('mentionedUsers recebido:', mentionedUsers);
```

### **Se nomes não são carregados:**
```javascript
// Verificar se getUsersByIds funciona
const users = await getUsersByIds(['user1', 'user2']);
console.log('Usuários encontrados:', users);
```

## 📱 **Teste Manual**

### **1. Criar comentário com marcação:**
- Selecionar usuários
- Enviar comentário
- Verificar logs no console

### **2. Recarregar página:**
- Verificar se comentário aparece
- Verificar se usuários marcados aparecem
- Verificar logs de carregamento

### **3. Verificar Firebase:**
- Acessar Firebase Console
- Verificar coleção `comments`
- Confirmar campo `mentionedUsers`

---

**Com os logs implementados, agora é possível identificar exatamente onde está o problema no fluxo de marcação de usuários!**
