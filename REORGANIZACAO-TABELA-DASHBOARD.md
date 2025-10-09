# ✅ Reorganização da Tabela do Dashboard

## 🎯 **Mudanças Implementadas:**

Reorganizada a estrutura da tabela do dashboard conforme solicitado:
- ✅ **PHOTO** movida para depois de **SHOP NO**
- ✅ **NUM COTAÇÃO** ocultada da tabela
- ✅ **SEGMENTO** adicionada depois de **REF**

## 🔧 **Arquivo Modificado:**

### **`src/components/CotacoesTable.tsx`:**

#### **1. Cabeçalho da Tabela (thead):**

##### **Antes:**
```tsx
<SortableHeader field="SHOP_NO" sortOptions={sortOptions} onSort={onSort} className="text-left w-[190px]">
  SHOP NO
</SortableHeader>
<SortableHeader field="NUM_COTACAO" sortOptions={sortOptions} onSort={onSort} className="text-left w-[190px]">
  NUM COTAÇÃO
</SortableHeader>
<SortableHeader field="referencia" sortOptions={sortOptions} onSort={onSort} className="text-left w-[150px]">
  REF
</SortableHeader>
<SortableHeader field="description" sortOptions={sortOptions} onSort={onSort} className="text-left w-[190px]">
  DESCRIPTION
</SortableHeader>
<SortableHeader field="obs" sortOptions={sortOptions} onSort={onSort} className="text-left w-[400px]">
  OBS
</SortableHeader>
<SortableHeader field="MOQ" sortOptions={sortOptions} onSort={onSort} className="text-center w-[100px]">
  MOQ
</SortableHeader>
<th className="table-cell text-center w-[100px] border-r border-gray-200">PHOTO</th>
```

##### **Depois:**
```tsx
<SortableHeader field="SHOP_NO" sortOptions={sortOptions} onSort={onSort} className="text-left w-[190px]">
  SHOP NO
</SortableHeader>
<th className="table-cell text-center w-[100px] border-r border-gray-200">PHOTO</th>
<SortableHeader field="referencia" sortOptions={sortOptions} onSort={onSort} className="text-left w-[150px]">
  REF
</SortableHeader>
<SortableHeader field="segmento" sortOptions={sortOptions} onSort={onSort} className="text-left w-[150px]">
  SEGMENTO
</SortableHeader>
<SortableHeader field="description" sortOptions={sortOptions} onSort={onSort} className="text-left w-[190px]">
  DESCRIPTION
</SortableHeader>
<SortableHeader field="obs" sortOptions={sortOptions} onSort={onSort} className="text-left w-[400px]">
  OBS
</SortableHeader>
<SortableHeader field="MOQ" sortOptions={sortOptions} onSort={onSort} className="text-center w-[100px]">
  MOQ
</SortableHeader>
```

#### **2. Linhas da Tabela (tbody):**

##### **Antes:**
```tsx
<td className="table-cell font-medium text-primary-800 border-r border-gray-200 w-[190px]">
  {/* SHOP NO */}
</td>
<td className="table-cell font-medium text-purple-600 border-r border-gray-200 w-[190px]">
  {/* NUM COTAÇÃO */}
</td>
<td className="table-cell font-medium text-blue-600 border-r border-gray-200 w-[150px]">
  {/* REF */}
</td>
<td className="table-cell border-r border-gray-200 w-[190px]">
  {/* DESCRIPTION */}
</td>
{/* ... outras colunas ... */}
<td className="table-cell text-center border-r border-gray-200 w-[100px]">
  {/* PHOTO */}
</td>
```

##### **Depois:**
```tsx
<td className="table-cell font-medium text-primary-800 border-r border-gray-200 w-[190px]">
  {/* SHOP NO */}
</td>
{/* PHOTO */}
<td className="table-cell text-center border-r border-gray-200 w-[100px]">
  <ProductImage 
    productRef={item.referencia} 
    description={item.description}
    onImageClick={(imageUrl, title) => {
      lightbox.openLightbox([imageUrl], 0, title);
    }}
  />
</td>
<td className="table-cell font-medium text-blue-600 border-r border-gray-200 w-[150px]">
  {/* REF */}
</td>
<td className="table-cell border-r border-gray-200 w-[150px]">
  {/* SEGMENTO */}
</td>
<td className="table-cell border-r border-gray-200 w-[190px]">
  {/* DESCRIPTION */}
</td>
```

#### **3. Função scrollToPhoto:**

##### **Antes:**
```tsx
const scrollToPhoto = () => {
  if (scrollContainerRef.current) {
    // Calcular a posição aproximada da coluna PHOTO
    // SHOP NO (190px) + NUM COTAÇÃO (190px) + REF (190px) + DESCRIPTION (190px) + OBS (400px) + MOQ (100px) = 1260px
    const photoColumnPosition = 1260;
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

## 📊 **Nova Estrutura da Tabela:**

### **Ordem das Colunas:**

| Posição | Campo | Largura | Tipo | Descrição |
|---------|-------|---------|------|-----------|
| 1 | SEL | 60px | Toggle | Seleção para exportação |
| 2 | SHOP NO | 190px | Texto | Número da loja |
| 3 | **PHOTO** | 100px | Imagem | **Nova posição** |
| 4 | REF | 150px | Texto | Referência do produto |
| 5 | **SEGMENTO** | 150px | Texto | **Nova coluna** |
| 6 | DESCRIPTION | 190px | Texto | Descrição do produto |
| 7 | OBS | 400px | Texto | Observações |
| 8 | MOQ | 100px | Número | Quantidade mínima |
| 9 | CTNS | 100px | Número | Caixas |
| 10 | UNIT/CTN | 100px | Número | Unidades por caixa |
| ... | ... | ... | ... | ... |

### **Colunas Removidas:**
- ❌ **NUM COTAÇÃO** (190px) - Ocultada conforme solicitado

### **Colunas Adicionadas:**
- ✅ **SEGMENTO** (150px) - Nova coluna após REF

### **Colunas Movidas:**
- ✅ **PHOTO** - Movida de posição 8 para posição 3 (após SHOP NO)

## 🎨 **Resultado Visual:**

### **Antes:**
```
┌─────┬─────────┬─────────────┬─────┬─────────────┬─────┬─────┬───────┐
│ SEL │SHOP NO  │NUM COTAÇÃO  │ REF │DESCRIPTION  │ OBS │ MOQ │ PHOTO │
├─────┼─────────┼─────────────┼─────┼─────────────┼─────┼─────┼───────┤
│ ☐   │  LOJA01 │  2024-001   │REF01│Produto A    │Obs1 │ 100 │  📷   │
└─────┴─────────┴─────────────┴─────┴─────────────┴─────┴─────┴───────┘
```

### **Depois:**
```
┌─────┬─────────┬───────┬─────┬──────────┬─────────────┬─────┬─────┐
│ SEL │SHOP NO  │ PHOTO │ REF │SEGMENTO  │DESCRIPTION  │ OBS │ MOQ │
├─────┼─────────┼───────┼─────┼──────────┼─────────────┼─────┼─────┤
│ ☐   │  LOJA01 │  📷   │REF01│ELETRÔNICO│Produto A    │Obs1 │ 100 │
└─────┴─────────┴───────┴─────┴──────────┴─────────────┴─────┴─────┘
```

## 🎯 **Benefícios da Reorganização:**

### **✅ Melhor Visualização:**
- **PHOTO mais próxima**: Imagem aparece logo após SHOP NO
- **Informações agrupadas**: REF e SEGMENTO juntos
- **Fluxo lógico**: Dados principais no início da tabela

### **✅ Funcionalidade Mantida:**
- **Edição inline**: Todos os campos editáveis preservados
- **Ordenação**: SortableHeader mantido em campos apropriados
- **Seleção**: Sistema de seleção para exportação preservado
- **Lightbox**: Visualização de imagens funcionando

### **✅ Scroll Otimizado:**
- **Botão PHOTO**: Posição atualizada para nova localização
- **Navegação**: Scroll para PHOTO agora vai para posição 250px
- **Performance**: Menos colunas para navegar

## 🔧 **Funcionalidades Preservadas:**

### **✅ Edição de Campos:**
- **SHOP NO**: Editável com EditableCell
- **REF**: Editável com EditableCell
- **SEGMENTO**: Editável com EditableCell
- **PHOTO**: Visualização com ProductImage

### **✅ Ordenação:**
- **SHOP NO**: SortableHeader mantido
- **REF**: SortableHeader mantido
- **SEGMENTO**: SortableHeader adicionado
- **PHOTO**: Não ordenável (apenas visualização)

### **✅ Seleção e Exportação:**
- **Toggle de seleção**: Funcionando normalmente
- **Estados visuais**: Selecionado/exportado preservados
- **Exportação Excel**: Funcionalidade mantida

## 📱 **Impacto em Diferentes Dispositivos:**

### **Desktop:**
- **Melhor organização**: Informações principais mais visíveis
- **Scroll otimizado**: PHOTO mais acessível
- **Workflow melhorado**: Fluxo de trabalho mais eficiente

### **Mobile:**
- **Informações essenciais**: SHOP NO e PHOTO no início
- **Menos scroll**: Campos importantes mais próximos
- **Melhor UX**: Navegação mais intuitiva

## 🎉 **Resultado Final:**

Tabela reorganizada com:

- ✅ **PHOTO** posicionada após **SHOP NO**
- ✅ **NUM COTAÇÃO** ocultada da visualização
- ✅ **SEGMENTO** adicionada após **REF**
- ✅ **Funcionalidades preservadas** (edição, ordenação, seleção)
- ✅ **Scroll otimizado** para nova posição da PHOTO
- ✅ **Interface melhorada** e mais intuitiva

**Status: ✅ REORGANIZAÇÃO DA TABELA IMPLEMENTADA COM SUCESSO**
