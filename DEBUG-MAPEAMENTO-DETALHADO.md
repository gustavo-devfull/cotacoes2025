# 🔍 Debug de Mapeamento de Campos - Problema Identificado!

## 🚨 Problema Atual:

**Logs de Debug Mostram:**
```
Campos disponíveis na linha: Array(2)
REF encontrado: UNKNOWN
Mapeando campo: REF -> referencia, valor: undefined
Mapeando campo: CBM TOTAL -> cbm_total, valor: undefined
Mapeando campo: G.W -> gw, valor: undefined
```

**Causa Identificada**: O processamento Excel está criando apenas 2 campos na linha, indicando que há um problema na conversão dos dados.

## 🔧 Correções Implementadas:

### **1. Logs de Debug Melhorados:**

**ImportComponent.tsx:**
```javascript
console.log('Dados Excel após processamento correto:', rawData);
console.log('Cabeçalhos disponíveis:', Object.keys(rawData[0] || {}));
console.log('Primeira linha de dados:', rawData[0]);
console.log('Estrutura completa da primeira linha:', JSON.stringify(rawData[0], null, 2));
```

**spreadsheetMapping.ts:**
```javascript
console.log('=== CONVERSÃO DE LINHA ===');
console.log('Campos disponíveis na linha:', Object.keys(row));
console.log('REF encontrado:', ref);
console.log('Linha completa:', JSON.stringify(row, null, 2));
```

### **2. Função findFieldInRow Melhorada:**

```javascript
const findFieldInRow = (row: SpreadsheetRow, targetField: string): any => {
  const normalizedTarget = normalizeFieldName(targetField);
  
  console.log(`Procurando campo: "${targetField}" (normalizado: "${normalizedTarget}")`);
  console.log('Campos disponíveis:', Object.keys(row));
  
  // Primeiro, tentar encontrar exatamente
  if (row[targetField] !== undefined) {
    console.log(`Campo encontrado exatamente: "${targetField}" = ${row[targetField]}`);
    return row[targetField];
  }
  
  // Depois, tentar encontrar com nomes normalizados
  for (const [key, value] of Object.entries(row)) {
    const normalizedKey = normalizeFieldName(key);
    console.log(`Comparando: "${normalizedKey}" com "${normalizedTarget}"`);
    if (normalizedKey === normalizedTarget) {
      console.log(`Campo encontrado por normalização: "${key}" = ${value}`);
      return value;
    }
  }
  
  console.log(`Campo não encontrado: "${targetField}"`);
  return undefined;
};
```

### **3. Arquivo de Teste Criado:**

**teste_debug.csv** - Arquivo CSV simples para testar:
```csv
REF,DESCRIPTION,NAME,REMARK,OBS,NCM,English Description,PHOTO,CTNS,UNIT/CTN,QTY,U.PRICE,UNIT,AMOUNT,L,W,H,CBM,CBM TOTAL,G.W,T.G.W,N.W,T.N.W,Peso Unitário(g)
T608,Carrinho de carga,拉杆车,高品质,Alta qualidade,8716.80.00,High quality cart,PH001,10,50,500,15.50,PC,7750.00,15.5,8.0,1.2,0.0015,0.015,18.00,1512.00,17.40,1461.60,25
106-6S,Carrinho de carga,拉杆车,高品质,Alta qualidade,8716.80.00,High quality cart,PH002,5,20,100,89.99,PC,8999.00,20.0,15.0,8.0,0.0024,0.012,21.40,1797.60,20.40,1713.60,180
```

## 🔍 Próximos Passos para Debug:

### **1. Testar com Arquivo CSV:**
- Use o arquivo `teste_debug.csv` criado
- Verifique os logs no console do navegador
- Compare com o processamento Excel

### **2. Verificar Logs Esperados:**

**Para CSV (deve funcionar):**
```
Dados CSV após pular 1 linha de dados: [{REF: 'T608', DESCRIPTION: 'Carrinho de carga', ...}, ...]
Cabeçalhos disponíveis: ['REF', 'DESCRIPTION', 'NAME', 'REMARK', 'OBS', 'NCM', 'English Description', 'PHOTO', 'CTNS', 'UNIT/CTN', 'QTY', 'U.PRICE', 'UNIT', 'AMOUNT', 'L', 'W', 'H', 'CBM', 'CBM TOTAL', 'G.W', 'T.G.W', 'N.W', 'T.N.W', 'Peso Unitário(g)']
```

**Para Excel (problema atual):**
```
Campos disponíveis na linha: Array(2)
REF encontrado: UNKNOWN
```

### **3. Possíveis Causas do Problema Excel:**

**A. Estrutura da Planilha:**
- Primeira linha pode ter conteúdo diferente do esperado
- Cabeçalhos podem estar em linha diferente
- Formato da planilha pode ser diferente

**B. Processamento XLSX:**
- `range: 1` pode não estar funcionando corretamente
- `header: 1` pode estar causando problemas
- Conversão para objetos pode estar falhando

**C. Dados da Planilha:**
- Campos podem estar vazios
- Estrutura pode ser diferente do esperado
- Encoding pode estar causando problemas

## 🚀 Sistema Pronto para Debug:

### **Funcionalidades Implementadas:**
- ✅ **Logs detalhados**: Para identificar problemas
- ✅ **Função findFieldInRow melhorada**: Com debug completo
- ✅ **Arquivo de teste**: CSV simples para comparação
- ✅ **Debug estruturado**: Logs organizados por etapa

### **Como Testar:**

**1. Teste com CSV:**
- Importe `teste_debug.csv`
- Verifique logs no console
- Deve mostrar todos os campos corretamente

**2. Teste com Excel:**
- Importe arquivo Excel
- Compare logs com CSV
- Identifique onde está o problema

**3. Análise dos Logs:**
- Verifique "Campos disponíveis na linha"
- Compare com cabeçalhos esperados
- Identifique campos faltando

## 📊 Status Atual:

**Sistema**: ✅ Funcionando (http://localhost:3000)
**Debug**: ✅ Implementado
**Logs**: ✅ Detalhados
**Teste**: ✅ Arquivo criado
**Próximo**: 🔍 Testar e analisar logs

**Sistema pronto para debug detalhado - logs implementados para identificar o problema! 🔍**

**Acesse**: http://localhost:3000 e teste a importação para ver os logs detalhados.

**Debug implementado - aguardando testes para identificar a causa raiz! ✨**













