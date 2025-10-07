# ✅ Fórmulas Automáticas Implementadas!

## 🚀 Atualização Implementada:

### **1. Fórmulas Automáticas:**
- ✅ **QTY = CTNS × UNIT/CTN**: Quantidade total calculada automaticamente
- ✅ **AMOUNT = QTY × U.PRICE RMB**: Valor total calculado automaticamente
- ✅ **CBM = L × W × H ÷ 1,000,000**: Volume por caixa calculado automaticamente
- ✅ **CBM TOTAL = CTNS × CBM**: Volume total calculado automaticamente
- ✅ **T.G.W = CTNS × G.W**: Peso bruto total calculado automaticamente
- ✅ **N.W = UNIT/CTN × PESO UNITARIO**: Peso líquido por caixa calculado automaticamente
- ✅ **T.N.W = CTNS × N.W**: Peso líquido total calculado automaticamente

### **2. Campos Editáveis vs Calculados:**

**Campos Editáveis (Duplo Clique):**
- ✅ **SHOP NO**: Editável
- ✅ **NUM COTACAO**: Editável
- ✅ **REF**: Editável
- ✅ **PHOTO NO**: Editável
- ✅ **ITEM NO**: Editável
- ✅ **DESCRIPTION**: Editável
- ✅ **NAME**: Editável
- ✅ **UNIT**: Editável
- ✅ **CTNS**: Editável (afeta cálculos)
- ✅ **UNIT/CTN**: Editável (afeta cálculos)
- ✅ **U.PRICE RMB**: Editável (afeta cálculos)
- ✅ **L, W, H**: Editáveis (afetam cálculos)
- ✅ **G.W**: Editável (afeta cálculos)
- ✅ **PESO UNITARIO**: Editável (afeta cálculos)

**Campos Calculados (Somente Leitura):**
- ✅ **QTY**: Calculado automaticamente
- ✅ **AMOUNT**: Calculado automaticamente
- ✅ **CBM**: Calculado automaticamente
- ✅ **CBM TOTAL**: Calculado automaticamente
- ✅ **T.G.W**: Calculado automaticamente
- ✅ **N.W**: Calculado automaticamente
- ✅ **T.N.W**: Calculado automaticamente

### **3. Símbolo do Yuan (¥):**
- ✅ **U.PRICE RMB**: Exibe como "¥ 15.50"
- ✅ **AMOUNT**: Exibe como "¥ 7,750.00"
- ✅ **Formatação**: Espaço entre símbolo e número
- ✅ **Precisão**: 2 casas decimais para valores monetários

## 🔧 Implementação Técnica:

### **1. Função de Cálculo Automático:**

```typescript
const calculateDependentFields = (updatedItem: CotacaoItem): CotacaoItem => {
  const ctns = Number(updatedItem.ctns) || 0;
  const unitCtn = Number(updatedItem.unitCtn) || 0;
  const unitPriceRmb = Number(updatedItem.unitPriceRmb) || 0;
  const l = Number(updatedItem.l) || 0;
  const w = Number(updatedItem.w) || 0;
  const h = Number(updatedItem.h) || 0;
  const gw = Number(updatedItem.gw) || 0;
  const pesoUnitario = Number(updatedItem.pesoUnitario) || 0;

  // QTY = CTNS * UNIT/CTN
  const qty = ctns * unitCtn;

  // AMOUNT = QTY * U.PRICE RMB
  const amount = qty * unitPriceRmb;

  // CBM = L * W * H / 1000000
  const cbm = (l * w * h) / 1000000;

  // CBM TOTAL = CTNS * CBM
  const cbm_total = ctns * cbm;

  // T.G.W = CTNS * G.W
  const tgw = ctns * gw;

  // N.W = UNIT/CTN * PESO UNITARIO
  const nw = unitCtn * pesoUnitario;

  // T.N.W = CTNS * N.W
  const tnw = ctns * nw;

  return {
    ...updatedItem,
    qty,
    amount,
    cbm,
    cbm_total,
    tgw,
    nw,
    tnw
  };
};
```

**Características:**
- ✅ **Cálculo automático**: Executado sempre que um campo dependente é editado
- ✅ **Validação de números**: Converte valores para número ou usa 0 como padrão
- ✅ **Precisão**: Mantém precisão adequada para cada tipo de cálculo
- ✅ **Atualização em tempo real**: Recalcula imediatamente após edição

### **2. Campos Calculados na Tabela:**

**QTY (Quantidade Total):**
```typescript
<td className="table-cell text-center font-medium text-blue-600">
  {formatNumber(item.qty)}
</td>
```

**AMOUNT (Valor Total):**
```typescript
<td className="table-cell text-right font-semibold text-green-600">
  ¥ {formatNumber(item.amount, 2)}
</td>
```

**CBM (Volume por Caixa):**
```typescript
<td className="table-cell text-right font-medium text-blue-600">
  {formatNumber(item.cbm, 4)}
</td>
```

**CBM TOTAL (Volume Total):**
```typescript
<td className="table-cell text-right font-semibold text-blue-700">
  {formatNumber(item.cbm_total, 4)}
</td>
```

**T.G.W (Peso Bruto Total):**
```typescript
<td className="table-cell text-right font-medium text-purple-600">
  {formatNumber(item.tgw, 2)}
</td>
```

**N.W (Peso Líquido por Caixa):**
```typescript
<td className="table-cell text-right font-medium text-orange-600">
  {formatNumber(item.nw, 2)}
</td>
```

**T.N.W (Peso Líquido Total):**
```typescript
<td className="table-cell text-right font-semibold text-orange-700">
  {formatNumber(item.tnw, 2)}
</td>
```

## 🎯 Como Funciona:

### **1. Fluxo de Cálculo:**

**Passo 1**: Usuário edita um campo dependente (ex: CTNS)
**Passo 2**: Sistema detecta a mudança
**Passo 3**: Função `calculateDependentFields` é executada
**Passo 4**: Todos os campos calculados são atualizados automaticamente
**Passo 5**: Interface é atualizada em tempo real

### **2. Exemplo Prático:**

**Dados de Entrada:**
- CTNS: 10
- UNIT/CTN: 50
- U.PRICE RMB: 15.50
- L: 15.5, W: 8.0, H: 1.2
- G.W: 18.00
- PESO UNITARIO: 25

**Cálculos Automáticos:**
- QTY = 10 × 50 = 500
- AMOUNT = 500 × 15.50 = ¥ 7,750.00
- CBM = (15.5 × 8.0 × 1.2) ÷ 1,000,000 = 0.0015
- CBM TOTAL = 10 × 0.0015 = 0.015
- T.G.W = 10 × 18.00 = 180.00
- N.W = 50 × 25 = 1,250.00
- T.N.W = 10 × 1,250.00 = 12,500.00

## 🎨 Design e Estilos:

### **1. Campos Calculados:**

**QTY:**
- ✅ **Cor azul**: text-blue-600
- ✅ **Peso da fonte**: font-medium
- ✅ **Alinhamento**: text-center
- ✅ **Indicação visual**: Cor diferente para destacar como calculado

**AMOUNT:**
- ✅ **Cor verde**: text-green-600
- ✅ **Peso da fonte**: font-semibold
- ✅ **Símbolo yuan**: ¥ prefix
- ✅ **Alinhamento**: text-right

**CBM:**
- ✅ **Cor azul**: text-blue-600
- ✅ **Peso da fonte**: font-medium
- ✅ **Precisão**: 4 casas decimais
- ✅ **Alinhamento**: text-right

**CBM TOTAL:**
- ✅ **Cor azul escura**: text-blue-700
- ✅ **Peso da fonte**: font-semibold
- ✅ **Precisão**: 4 casas decimais
- ✅ **Alinhamento**: text-right

**T.G.W:**
- ✅ **Cor roxa**: text-purple-600
- ✅ **Peso da fonte**: font-medium
- ✅ **Precisão**: 2 casas decimais
- ✅ **Alinhamento**: text-right

**N.W:**
- ✅ **Cor laranja**: text-orange-600
- ✅ **Peso da fonte**: font-medium
- ✅ **Precisão**: 2 casas decimais
- ✅ **Alinhamento**: text-right

**T.N.W:**
- ✅ **Cor laranja escura**: text-orange-700
- ✅ **Peso da fonte**: font-semibold
- ✅ **Precisão**: 2 casas decimais
- ✅ **Alinhamento**: text-right

### **2. Símbolo do Yuan:**

**U.PRICE RMB:**
```typescript
¥ ${formatNumber(item.unitPriceRmb, 2)}
```

**AMOUNT:**
```typescript
¥ {formatNumber(item.amount, 2)}
```

**Características:**
- ✅ **Símbolo**: ¥ (yuan chinês)
- ✅ **Espaçamento**: Espaço entre símbolo e número
- ✅ **Precisão**: 2 casas decimais
- ✅ **Formatação**: Números com separadores de milhares

## 📊 Benefícios:

### **1. Precisão:**
- ✅ **Cálculos automáticos**: Elimina erros manuais
- ✅ **Consistência**: Sempre usa as mesmas fórmulas
- ✅ **Validação**: Converte valores para números automaticamente
- ✅ **Precisão adequada**: Diferentes precisões para diferentes tipos

### **2. Produtividade:**
- ✅ **Edição rápida**: Apenas campos necessários são editáveis
- ✅ **Atualização automática**: Campos calculados se atualizam sozinhos
- ✅ **Interface limpa**: Campos calculados não podem ser editados acidentalmente
- ✅ **Feedback visual**: Cores diferentes indicam campos calculados

### **3. Usabilidade:**
- ✅ **Interface intuitiva**: Campos editáveis têm cursor pointer
- ✅ **Cálculos em tempo real**: Mudanças imediatas
- ✅ **Símbolos monetários**: Yuan (¥) para valores em RMB
- ✅ **Formatação consistente**: Números formatados adequadamente

## 🔍 Detalhes Técnicos:

### **1. Triggers de Cálculo:**

**Campos que Disparam Cálculos:**
- ✅ **CTNS**: Afeta QTY, AMOUNT, CBM TOTAL, T.G.W, T.N.W
- ✅ **UNIT/CTN**: Afeta QTY, AMOUNT, N.W, T.N.W
- ✅ **U.PRICE RMB**: Afeta AMOUNT
- ✅ **L, W, H**: Afetam CBM, CBM TOTAL
- ✅ **G.W**: Afeta T.G.W
- ✅ **PESO UNITARIO**: Afeta N.W, T.N.W

### **2. Precisão dos Cálculos:**

**Volume (CBM):**
- ✅ **Precisão**: 4 casas decimais
- ✅ **Fórmula**: (L × W × H) ÷ 1,000,000
- ✅ **Unidade**: Metros cúbicos

**Valores Monetários:**
- ✅ **Precisão**: 2 casas decimais
- ✅ **Símbolo**: ¥ (yuan)
- ✅ **Formatação**: Separadores de milhares

**Pesos:**
- ✅ **Precisão**: 2 casas decimais
- ✅ **Unidade**: Gramas
- ✅ **Formatação**: Números com separadores

**Quantidades:**
- ✅ **Precisão**: Números inteiros
- ✅ **Formatação**: Separadores de milhares
- ✅ **Unidade**: Peças

## 🚀 Sistema Atualizado:

**Fórmulas Implementadas:**
- ✅ **QTY = CTNS × UNIT/CTN**: Quantidade total
- ✅ **AMOUNT = QTY × U.PRICE RMB**: Valor total
- ✅ **CBM = L × W × H ÷ 1,000,000**: Volume por caixa
- ✅ **CBM TOTAL = CTNS × CBM**: Volume total
- ✅ **T.G.W = CTNS × G.W**: Peso bruto total
- ✅ **N.W = UNIT/CTN × PESO UNITARIO**: Peso líquido por caixa
- ✅ **T.N.W = CTNS × N.W**: Peso líquido total

**Campos Editáveis:**
- ✅ **SHOP NO**: Editável
- ✅ **NUM COTACAO**: Editável
- ✅ **REF**: Editável
- ✅ **PHOTO NO**: Editável
- ✅ **ITEM NO**: Editável
- ✅ **DESCRIPTION**: Editável
- ✅ **NAME**: Editável
- ✅ **UNIT**: Editável
- ✅ **CTNS**: Editável (afeta cálculos)
- ✅ **UNIT/CTN**: Editável (afeta cálculos)
- ✅ **U.PRICE RMB**: Editável (afeta cálculos)
- ✅ **L, W, H**: Editáveis (afetam cálculos)
- ✅ **G.W**: Editável (afeta cálculos)
- ✅ **PESO UNITARIO**: Editável (afeta cálculos)

**Campos Calculados:**
- ✅ **QTY**: Calculado automaticamente
- ✅ **AMOUNT**: Calculado automaticamente
- ✅ **CBM**: Calculado automaticamente
- ✅ **CBM TOTAL**: Calculado automaticamente
- ✅ **T.G.W**: Calculado automaticamente
- ✅ **N.W**: Calculado automaticamente
- ✅ **T.N.W**: Calculado automaticamente

**Símbolos Monetários:**
- ✅ **U.PRICE RMB**: ¥ prefix
- ✅ **AMOUNT**: ¥ prefix
- ✅ **Formatação**: Espaço entre símbolo e número
- ✅ **Precisão**: 2 casas decimais

**Sistema de fórmulas automáticas implementado - cálculos em tempo real! 🎉**

**Acesse**: http://localhost:3000 e teste editando os campos dependentes.

**Fórmulas automáticas ativas - edite CTNS, UNIT/CTN, U.PRICE RMB, dimensões e pesos! ✨**

