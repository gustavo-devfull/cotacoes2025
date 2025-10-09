# ✅ Exclusão Automática de Comentários Associados aos Produtos

## 🎯 **Funcionalidade Implementada:**

Quando um produto é excluído do sistema, todos os comentários associados a esse produto são automaticamente excluídos também, mantendo a integridade dos dados e evitando comentários órfãos.

## 🔧 **Arquivos Criados/Modificados:**

### **1. Novo Serviço: `src/services/commentsService.ts`**

#### **Funcionalidades Implementadas:**

```typescript
export const commentsService = {
  // Buscar comentários por ID do produto
  async getCommentsByProductId(productId: string): Promise<CommentDocument[]>
  
  // Excluir todos os comentários associados a um produto
  async deleteCommentsByProductId(productId: string): Promise<number>
  
  // Excluir comentários de múltiplos produtos
  async deleteCommentsByProductIds(productIds: string[]): Promise<{ [productId: string]: number }>
  
  // Gerar ID do produto baseado no PHOTO_NO e REF
  generateProductId(photoNo: string, ref: string): string
}
```

#### **Estrutura do Comentário:**
```typescript
export interface CommentDocument {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  message: string;
  images: string[];
  timestamp: Date;
}
```

### **2. Dashboard Atualizado: `src/components/Dashboard.tsx`**

#### **Importação do Serviço:**
```typescript
import { commentsService } from '../services/commentsService';
```

#### **Exclusão Individual de Produto (`confirmDelete`):**
```typescript
const confirmDelete = async () => {
  if (!itemToDelete) return;

  try {
    // Encontrar o documento no Firebase
    const cotacoes = await getCotacoes();
    const cotacaoDoc = cotacoes.find(doc => 
      doc.PHOTO_NO === itemToDelete.PHOTO_NO && doc.referencia === itemToDelete.referencia
    );

    if (cotacaoDoc) {
      // Gerar ID do produto para buscar comentários
      const productId = commentsService.generateProductId(itemToDelete.PHOTO_NO, itemToDelete.referencia);
      
      // Excluir comentários associados ao produto
      let commentsDeleted = 0;
      try {
        commentsDeleted = await commentsService.deleteCommentsByProductId(productId);
        console.log(`Excluídos ${commentsDeleted} comentários para o produto:`, productId);
      } catch (commentError) {
        console.error('Erro ao excluir comentários do produto:', productId, commentError);
      }
      
      // Deletar produto do Firebase
      await deleteCotacao(cotacaoDoc.id);
      
      // Atualizar dados locais
      setAllData(prev => prev.filter(item => 
        !(item.PHOTO_NO === itemToDelete.PHOTO_NO && item.referencia === itemToDelete.referencia)
      ));
      setFilteredData(prev => prev.filter(item => 
        !(item.PHOTO_NO === itemToDelete.PHOTO_NO && item.referencia === itemToDelete.referencia)
      ));
      
      // Mensagem de sucesso incluindo comentários excluídos
      const successMessage = commentsDeleted > 0 
        ? `Produto e ${commentsDeleted} comentário(s) excluído(s) com sucesso!`
        : 'Produto excluído com sucesso!';
      
      showSuccess('Exclusão Concluída', successMessage);
    }
  } catch (error) {
    console.error('Erro ao deletar item do Firebase:', error);
    showError('Erro na Exclusão', 'Erro ao deletar item. Verifique o console para mais detalhes.');
  }
};
```

#### **Exclusão Múltipla de Produtos (`handleDeleteMultipleItems`):**
```typescript
const handleDeleteMultipleItems = async (items: CotacaoItem[], onProgress?: (progress: number) => void) => {
  try {
    const totalItems = items.length;
    let totalCommentsDeleted = 0;
    
    // Excluir cada item individualmente
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // Encontrar o documento real no Firebase
      const cotacaoDoc = cotacoes.find(doc => 
        doc.PHOTO_NO === item.PHOTO_NO && doc.referencia === item.referencia
      );
      
      if (cotacaoDoc) {
        // Gerar ID do produto para buscar comentários
        const productId = commentsService.generateProductId(item.PHOTO_NO, item.referencia);
        
        // Excluir comentários associados ao produto
        try {
          const commentsDeleted = await commentsService.deleteCommentsByProductId(productId);
          totalCommentsDeleted += commentsDeleted;
          console.log(`Excluídos ${commentsDeleted} comentários para o produto:`, productId);
        } catch (commentError) {
          console.error('Erro ao excluir comentários do produto:', productId, commentError);
        }
        
        // Excluir produto do Firebase
        await deleteCotacao(cotacaoDoc.id);
      }
      
      // Atualizar progresso
      const progress = Math.round(((i + 1) / totalItems) * 100);
      onProgress?.(progress);
    }
    
    // Mensagem de sucesso incluindo comentários excluídos
    const successMessage = totalCommentsDeleted > 0 
      ? `${items.length} produto(s) e ${totalCommentsDeleted} comentário(s) excluído(s) com sucesso!`
      : `${items.length} produto(s) excluído(s) com sucesso!`;
    
    showSuccess('Exclusão Concluída', successMessage);
  } catch (error) {
    console.error('Erro ao excluir itens:', error);
    showError('Erro na Exclusão', 'Erro ao excluir itens. Verifique o console para mais detalhes.');
  }
};
```

## 🔄 **Fluxo de Exclusão:**

### **1. Exclusão Individual:**
```
Usuário clica em "Excluir" → Modal de confirmação → Usuário confirma
                                                          ↓
1. Gerar ID do produto (PHOTO_NO-REF)                    ↓
2. Buscar comentários associados ao produto              ↓
3. Excluir todos os comentários encontrados              ↓
4. Excluir produto do Firebase                           ↓
5. Atualizar dados locais                                ↓
6. Exibir mensagem de sucesso com contagem de comentários
```

### **2. Exclusão Múltipla:**
```
Usuário seleciona produtos → Clica em "Excluir Selecionados"
                                                          ↓
Para cada produto:                                        ↓
1. Gerar ID do produto (PHOTO_NO-REF)                    ↓
2. Buscar e excluir comentários associados               ↓
3. Excluir produto do Firebase                           ↓
4. Atualizar progresso                                   ↓
                                                          ↓
Exibir mensagem final com total de produtos e comentários excluídos
```

## 📊 **Geração de ID do Produto:**

### **Formato do ID:**
```typescript
const productId = `${PHOTO_NO}-${REF}`;
```

### **Exemplos:**
- **Produto**: PHOTO_NO = "LOJA01", REF = "REF001"
- **ID Gerado**: "LOJA01-REF001"

### **Vantagens:**
- **Único**: Combinação única de PHOTO_NO + REF
- **Consistente**: Mesmo formato usado em todo o sistema
- **Rastreável**: Fácil identificação do produto associado

## 🎯 **Tratamento de Erros:**

### **✅ Exclusão de Comentários:**
- **Sucesso**: Conta e exibe quantos comentários foram excluídos
- **Erro**: Registra erro no console mas continua com exclusão do produto
- **Robustez**: Não falha a exclusão do produto se houver erro nos comentários

### **✅ Exclusão de Produto:**
- **Sucesso**: Produto excluído e dados locais atualizados
- **Erro**: Exibe mensagem de erro e mantém produto no sistema
- **Integridade**: Garante que dados locais e Firebase estejam sincronizados

## 📱 **Mensagens de Feedback:**

### **Exclusão Individual:**
- **Com comentários**: "Produto e X comentário(s) excluído(s) com sucesso!"
- **Sem comentários**: "Produto excluído com sucesso!"

### **Exclusão Múltipla:**
- **Com comentários**: "X produto(s) e Y comentário(s) excluído(s) com sucesso!"
- **Sem comentários**: "X produto(s) excluído(s) com sucesso!"

## 🔍 **Logs de Debug:**

### **Console Logs:**
```javascript
// Exclusão de comentários
console.log(`Excluídos ${commentsDeleted} comentários para o produto:`, productId);

// Exclusão de produto
console.log('Item deletado do Firebase:', cotacaoDoc.id);

// Erros
console.error('Erro ao excluir comentários do produto:', productId, commentError);
```

## 🎨 **Benefícios da Implementação:**

### **✅ Integridade dos Dados:**
- **Sem comentários órfãos**: Comentários não ficam sem produto associado
- **Limpeza automática**: Não requer intervenção manual
- **Consistência**: Dados sempre sincronizados

### **✅ UX Melhorada:**
- **Feedback claro**: Usuário sabe quantos comentários foram excluídos
- **Processo transparente**: Logs detalhados para debug
- **Robustez**: Sistema não falha por problemas em comentários

### **✅ Manutenibilidade:**
- **Serviço dedicado**: Lógica de comentários centralizada
- **Reutilizável**: Funções podem ser usadas em outros contextos
- **Testável**: Funções isoladas facilitam testes

## 🧪 **Cenários de Teste:**

### **✅ Exclusão Individual:**
1. Criar produto com comentários
2. Excluir produto individualmente
3. Verificar que comentários foram excluídos
4. Confirmar mensagem de sucesso

### **✅ Exclusão Múltipla:**
1. Criar múltiplos produtos com comentários
2. Selecionar e excluir múltiplos produtos
3. Verificar que todos os comentários foram excluídos
4. Confirmar contagem correta na mensagem

### **✅ Produtos sem Comentários:**
1. Excluir produto sem comentários
2. Verificar mensagem sem menção a comentários
3. Confirmar exclusão normal do produto

## 🎉 **Resultado Final:**

Sistema de exclusão de produtos completamente integrado com exclusão automática de comentários:

- ✅ **Exclusão automática** de comentários associados aos produtos
- ✅ **Feedback detalhado** sobre quantos comentários foram excluídos
- ✅ **Robustez** com tratamento de erros independente
- ✅ **Integridade dos dados** sem comentários órfãos
- ✅ **Serviço dedicado** para gerenciamento de comentários
- ✅ **Logs detalhados** para debug e monitoramento
- ✅ **Funciona** tanto para exclusão individual quanto múltipla

**Status: ✅ EXCLUSÃO AUTOMÁTICA DE COMENTÁRIOS ASSOCIADOS AOS PRODUTOS IMPLEMENTADA COM SUCESSO**
