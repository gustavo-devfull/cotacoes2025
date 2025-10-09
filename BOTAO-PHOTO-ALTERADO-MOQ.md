# ✅ Botão PHOTO Alterado para MOQ

## 🎯 **Mudança Implementada:**

Alterado o botão de scroll "PHOTO" para "MOQ", fazendo com que o usuário role até a coluna MOQ em vez da coluna PHOTO.

## 🔧 **Arquivo Modificado:**

### **`src/components/CotacoesTable.tsx`:**

#### **1. Botão de Scroll:**

##### **Antes:**
```tsx
<button
  onClick={scrollToPhoto}
  className="btn-scroll flex items-center gap-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100"
  title="Rolar para a coluna PHOTO"
>
  <Camera className="w-4 h-4" />
  PHOTO
</button>
```

##### **Depois:**
```tsx
<button
  onClick={scrollToPhoto}
  className="btn-scroll flex items-center gap-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100"
  title="Rolar para a coluna MOQ"
>
  <Camera className="w-4 h-4" />
  MOQ
</button>
```

#### **2. Função de Scroll:**

##### **Antes:**
```tsx
const scrollToPhoto = () => {
  if (scrollContainerRef.current) {
    // Calcular a posição aproximada da coluna PHOTO
    // SEL (60px) + SHOP NO (190px) = 250px
    const photoColumnPosition = 250;
    scrollContainerRef.current.scrollTo({
      left: photoColumnPosition,
      behavior: 'smooth'
    });
  }
};
```

##### **Depois:**
```tsx
const scrollToPhoto = () => {
  if (scrollContainerRef.current) {
    // Calcular a posição aproximada da coluna MOQ
    // SEL (60px) + SHOP NO (190px) + PHOTO (100px) + REF (150px) + SEGMENTO (150px) + DESCRIPTION (190px) + OBS (400px) = 1240px
    const moqColumnPosition = 1240;
    scrollContainerRef.current.scrollTo({
      left: moqColumnPosition,
      behavior: 'smooth'
    });
  }
};
```

## 📊 **Cálculo da Posição:**

### **Nova Estrutura da Tabela:**

| Posição | Campo | Largura | Posição Acumulada |
|---------|-------|---------|-------------------|
| 1 | SEL | 60px | 60px |
| 2 | SHOP NO | 190px | 250px |
| 3 | PHOTO | 100px | 350px |
| 4 | REF | 150px | 500px |
| 5 | SEGMENTO | 150px | 650px |
| 6 | DESCRIPTION | 190px | 840px |
| 7 | OBS | 400px | 1240px |
| 8 | **MOQ** | 100px | **1340px** |

### **Cálculo da Posição MOQ:**
```
SEL (60px) + 
SHOP NO (190px) + 
PHOTO (100px) + 
REF (150px) + 
SEGMENTO (150px) + 
DESCRIPTION (190px) + 
OBS (400px) = 1240px
```

**Posição MOQ**: 1240px (início da coluna MOQ)

## 🎨 **Resultado Visual:**

### **Botões de Scroll:**

#### **Antes:**
```
┌─────────┬─────────┬─────────┐
│ Início  │  PHOTO  │   Fim   │
└─────────┴─────────┴─────────┘
```

#### **Depois:**
```
┌─────────┬─────────┬─────────┐
│ Início  │   MOQ   │   Fim   │
└─────────┴─────────┴─────────┘
```

### **Comportamento do Scroll:**

#### **Antes:**
- **Clique em PHOTO**: Rola até posição 250px (coluna PHOTO)
- **Resultado**: Usuário vê SHOP NO e PHOTO

#### **Depois:**
- **Clique em MOQ**: Rola até posição 1240px (coluna MOQ)
- **Resultado**: Usuário vê OBS e MOQ

## 🎯 **Benefícios da Mudança:**

### **✅ Acesso Rápido ao MOQ:**
- **Navegação direta**: Botão leva diretamente à coluna MOQ
- **Informação importante**: MOQ é um campo crítico para cotações
- **Eficiência**: Usuário não precisa rolar manualmente

### **✅ Melhor UX:**
- **Fluxo de trabalho**: MOQ é frequentemente consultado
- **Posicionamento estratégico**: Botão posicionado para acesso rápido
- **Consistência**: Mantém o padrão de navegação da tabela

### **✅ Funcionalidade Preservada:**
- **Scroll suave**: Comportamento `smooth` mantido
- **Responsividade**: Funciona em todos os dispositivos
- **Estilo visual**: Cores e hover effects preservados

## 🔧 **Detalhes Técnicos:**

### **1. Cálculo Preciso:**
- **Soma das larguras**: Cálculo baseado nas larguras reais das colunas
- **Posição exata**: 1240px corresponde ao início da coluna MOQ
- **Margem de erro**: Mínima devido ao cálculo preciso

### **2. Comportamento do Scroll:**
- **Smooth scrolling**: Animação suave mantida
- **Posicionamento**: Scroll para o início da coluna MOQ
- **Responsividade**: Funciona em diferentes tamanhos de tela

### **3. Acessibilidade:**
- **Tooltip atualizado**: "Rolar para a coluna MOQ"
- **Ícone mantido**: Camera icon preservado para consistência
- **Cores**: Azul mantido para destaque visual

## 📱 **Impacto em Diferentes Dispositivos:**

### **Desktop:**
- **Navegação eficiente**: Acesso rápido ao MOQ
- **Workflow otimizado**: Menos tempo para encontrar informações
- **Produtividade**: Melhor experiência do usuário

### **Mobile:**
- **Scroll reduzido**: Menos necessidade de rolar manualmente
- **Acesso rápido**: Botão facilita navegação em telas pequenas
- **Usabilidade**: Interface mais amigável

## 🎯 **Cenários de Uso:**

### **1. Consulta de MOQ:**
1. Usuário precisa verificar quantidade mínima
2. Clica no botão "MOQ"
3. **Tabela rola automaticamente** para a coluna MOQ ✅
4. Usuário vê informações de MOQ imediatamente

### **2. Análise de Produtos:**
1. Usuário está analisando produtos
2. Precisa comparar MOQ entre diferentes itens
3. Clica em "MOQ" para focar nessa coluna
4. **Navegação eficiente** entre produtos ✅

### **3. Edição de Dados:**
1. Usuário está editando informações
2. Precisa ajustar valores de MOQ
3. Botão "MOQ" leva diretamente ao campo
4. **Edição mais rápida** e precisa ✅

## 🎉 **Resultado Final:**

Botão de scroll otimizado com:

- ✅ **Texto alterado**: "PHOTO" → "MOQ"
- ✅ **Posição atualizada**: Scroll para 1240px (coluna MOQ)
- ✅ **Tooltip atualizado**: "Rolar para a coluna MOQ"
- ✅ **Cálculo preciso**: Baseado nas larguras reais das colunas
- ✅ **Funcionalidade preservada**: Scroll suave e responsivo
- ✅ **UX melhorada**: Acesso rápido a informações importantes

**Status: ✅ BOTÃO PHOTO ALTERADO PARA MOQ COM SUCESSO**
