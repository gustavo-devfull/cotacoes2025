// Mapeamento de campos da planilha para o sistema
// Baseado na estrutura da planilha "cotação (20250820)"

export interface SpreadsheetRow {
  // Campos da planilha original - usando any para flexibilidade
  [key: string]: any;
}

export interface FieldMapping {
  spreadsheetField: string;
  systemField: keyof import('../types').CotacaoItem;
  required: boolean;
  transform?: (value: any) => any;
}

// Mapeamento dos campos da planilha para o sistema
export const FIELD_MAPPING: FieldMapping[] = [
  {
    spreadsheetField: 'REF',
    systemField: 'referencia',
    required: true,
    transform: (value: any) => (value && typeof value === 'string') ? value.trim() : ''
  },
  {
    spreadsheetField: 'REF',
    systemField: 'PHOTO_NO',
    required: true,
    transform: (value: any) => (value && typeof value === 'string') ? value.trim() : ''
  },
  {
    spreadsheetField: 'REF',
    systemField: 'ITEM_NO',
    required: true,
    transform: (value: any) => (value && typeof value === 'string') ? value.trim() : ''
  },
  {
    spreadsheetField: 'DESCRIPTION',
    systemField: 'description',
    required: true,
    transform: (value: any) => (value && typeof value === 'string') ? value.trim() : ''
  },
  {
    spreadsheetField: 'NAME',
    systemField: 'name',
    required: true,
    transform: (value: any) => (value && typeof value === 'string') ? value.trim() : ''
  },
  {
    spreadsheetField: 'REMARK',
    systemField: 'remark',
    required: false,
    transform: (value: any) => (value && typeof value === 'string') ? value.trim() || '' : ''
  },
  {
    spreadsheetField: 'OBS',
    systemField: 'obs',
    required: false,
    transform: (value: any) => (value && typeof value === 'string') ? value.trim() || '' : ''
  },
  {
    spreadsheetField: 'NCM',
    systemField: 'ncm',
    required: false,
    transform: (value: any) => (value && typeof value === 'string') ? value.trim() || '' : ''
  },
  {
    spreadsheetField: 'English Description',
    systemField: 'engdesciption',
    required: false,
    transform: (value: any) => (value && typeof value === 'string') ? value.trim() || '' : ''
  },
  {
    spreadsheetField: 'PHOTO',
    systemField: 'photo',
    required: false,
    transform: (value: any) => (value && typeof value === 'string') ? value.trim() || '' : ''
  },
  {
    spreadsheetField: 'CTNS',
    systemField: 'ctns',
    required: true,
    transform: (value: any) => parseFloat(value) || 0
  },
  {
    spreadsheetField: 'UNIT/CTN',
    systemField: 'unitCtn',
    required: true,
    transform: (value: any) => parseFloat(value) || 0
  },
  {
    spreadsheetField: 'QTY',
    systemField: 'qty',
    required: true,
    transform: (value: any) => parseFloat(value) || 0
  },
  {
    spreadsheetField: 'U.PRICE',
    systemField: 'unitPriceRmb',
    required: true,
    transform: (value: any) => {
      // Remove símbolos de moeda e converte para número
      const cleanValue = String(value).replace(/[¥$,]/g, '').trim();
      return parseFloat(cleanValue) || 0;
    }
  },
  {
    spreadsheetField: 'UNIT',
    systemField: 'unit',
    required: true,
    transform: (value: any) => (value && typeof value === 'string') ? value.trim() || 'PC' : 'PC'
  },
  {
    spreadsheetField: 'AMOUNT',
    systemField: 'amount',
    required: true,
    transform: (value: any) => {
      // Remove símbolos de moeda e converte para número
      const cleanValue = String(value).replace(/[¥$,]/g, '').trim();
      return parseFloat(cleanValue) || 0;
    }
  },
  {
    spreadsheetField: 'L',
    systemField: 'l',
    required: true,
    transform: (value: any) => parseFloat(value) || 0
  },
  {
    spreadsheetField: 'W',
    systemField: 'w',
    required: true,
    transform: (value: any) => parseFloat(value) || 0
  },
  {
    spreadsheetField: 'H',
    systemField: 'h',
    required: true,
    transform: (value: any) => parseFloat(value) || 0
  },
  {
    spreadsheetField: 'CBM',
    systemField: 'cbm',
    required: true,
    transform: (value: any) => parseFloat(value) || 0
  },
  {
    spreadsheetField: 'CBM TOTAL',
    systemField: 'cbm_total',
    required: true,
    transform: (value: any) => parseFloat(value) || 0
  },
  {
    spreadsheetField: 'G.W',
    systemField: 'gw',
    required: false,
    transform: (value: any) => parseFloat(value) || 0
  },
  {
    spreadsheetField: 'T.G.W',
    systemField: 'tgw',
    required: false,
    transform: (value: any) => parseFloat(value) || 0
  },
  {
    spreadsheetField: 'N.W',
    systemField: 'nw',
    required: false,
    transform: (value: any) => parseFloat(value) || 0
  },
  {
    spreadsheetField: 'T.N.W',
    systemField: 'tnw',
    required: false,
    transform: (value: any) => parseFloat(value) || 0
  },
  {
    spreadsheetField: 'Peso Unitário(g)',
    systemField: 'pesoUnitario',
    required: true,
    transform: (value: any) => parseFloat(value) || 0
  }
];

// Campos que serão preenchidos automaticamente pelo sistema
export const SYSTEM_FIELDS = {
  SHOP_NO: 'IMPORTED', // Será definido durante a importação
  NUM_COTACAO: 'COT-IMPORTED', // Número da cotação padrão
  MOQ: 1, // Quantidade mínima padrão
  photo: '', // Será preenchido automaticamente usando PHOTO_NO
  OBSERVATIONS_EXTRA: '' // Campo adicional para observações extras
};

// Função para gerar NUM_COTACAO automaticamente baseado no REF
const generateNumCotacao = (ref: string): string => {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const refShort = ref.substring(0, 6).toUpperCase();
  return `COT-${timestamp}-${refShort}`;
};

// Função para normalizar nomes de campos (remover espaços, converter para maiúscula, etc.)
const normalizeFieldName = (fieldName: any): string => {
  if (!fieldName || typeof fieldName !== 'string') {
    return '';
  }
  
  return fieldName
    .trim()
    .replace(/\s+/g, ' ') // Normalizar espaços múltiplos
    .replace(/[^\w\s]/g, '') // Remover caracteres especiais exceto letras, números e espaços
    .replace(/\s/g, '_') // Substituir espaços por underscore
    .toUpperCase();
};

// Função para encontrar campo na planilha com base no nome normalizado
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

// Função para converter uma linha da planilha para o formato do sistema
export const convertSpreadsheetRowToCotacao = (
  row: SpreadsheetRow, 
  shopNo: string = 'IMPORTED',
  nomeContato: string = '',
  telefoneContato: string = '',
  dataCotacao: string = '',
  segmento: string = ''
): import('../types').CotacaoItem => {
  // Primeiro, obter o REF para gerar NUM_COTACAO
  const refValue = findFieldInRow(row, 'REF');
  const ref = (refValue && typeof refValue === 'string') ? refValue.trim() : 'UNKNOWN';
  
    console.log('=== CONVERSÃO DE LINHA ===');
    console.log('Campos disponíveis na linha:', Object.keys(row));
    console.log('REF encontrado:', ref);
    console.log('Linha completa:', JSON.stringify(row, null, 2));
  
  const cotacaoItem: any = {
    SHOP_NO: shopNo,
    NUM_COTACAO: dataCotacao || generateNumCotacao(ref),
    MOQ: SYSTEM_FIELDS.MOQ,
    photo: '',
    OBSERVATIONS_EXTRA: SYSTEM_FIELDS.OBSERVATIONS_EXTRA,
    nomeContato: nomeContato,
    telefoneContato: telefoneContato,
    dataCotacao: dataCotacao,
    segmento: segmento,
    // Campos de peso com valores padrão
    gw: 0,
    tgw: 0,
    nw: 0,
    tnw: 0
  };

  // Aplicar mapeamento de campos
  FIELD_MAPPING.forEach(mapping => {
    const rawValue = findFieldInRow(row, mapping.spreadsheetField);

    console.log(`Mapeando campo: ${mapping.spreadsheetField} -> ${mapping.systemField}, valor:`, rawValue);

    if (rawValue !== undefined && rawValue !== null && rawValue !== '') {
      cotacaoItem[mapping.systemField] = mapping.transform
        ? mapping.transform(rawValue)
        : rawValue;
    } else if (mapping.required) {
      // Campo obrigatório vazio - usar valor padrão baseado no tipo
      if (mapping.systemField.includes('PRICE') || mapping.systemField.includes('AMOUNT') ||
          mapping.systemField.includes('QTY') || mapping.systemField.includes('CTNS') ||
          mapping.systemField.includes('UNIT_CTN') || mapping.systemField.includes('CBM') ||
          mapping.systemField.includes('UNIT_WEIGHT') || mapping.systemField.includes('L') ||
          mapping.systemField.includes('W') || mapping.systemField.includes('H') ||
          mapping.systemField.includes('G_W') || mapping.systemField.includes('T_G_W') ||
          mapping.systemField.includes('N_W') || mapping.systemField.includes('T_N_W')) {
        cotacaoItem[mapping.systemField] = 0;
      } else {
        cotacaoItem[mapping.systemField] = mapping.transform
          ? mapping.transform('')
          : '';
      }
    }
  });

  return cotacaoItem as import('../types').CotacaoItem;
};

// Função para validar dados importados
export const validateImportedData = (data: import('../types').CotacaoItem[]): {
  valid: import('../types').CotacaoItem[];
  invalid: { item: import('../types').CotacaoItem; errors: string[] }[];
} => {
  const valid: import('../types').CotacaoItem[] = [];
  const invalid: { item: import('../types').CotacaoItem; errors: string[] }[] = [];

  data.forEach((item) => {
    const errors: string[] = [];

        // Validações obrigatórias - mais flexíveis
        if (!item.referencia || (typeof item.referencia === 'string' && item.referencia.trim() === '')) errors.push('REF é obrigatório');
        if (!item.description || (typeof item.description === 'string' && item.description.trim() === '')) errors.push('DESCRIPTION é obrigatório');
        if (!item.name || (typeof item.name === 'string' && item.name.trim() === '')) errors.push('NAME é obrigatório');

        // Validações numéricas - permitir 0 como valor válido para alguns campos
        if (item.unitPriceRmb < 0) errors.push('U.PRICE não pode ser negativo');
        if (item.qty < 0) errors.push('QTY não pode ser negativo');
        if (item.ctns < 0) errors.push('CTNS não pode ser negativo');
        if (item.unitCtn < 0) errors.push('UNIT/CTN não pode ser negativo');

    // Se não há erros críticos, considerar válido
    if (errors.length === 0) {
      valid.push(item);
    } else {
      invalid.push({ item, errors });
    }
  });

  return { valid, invalid };
};
