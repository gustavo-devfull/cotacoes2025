// Exemplo de como integrar dados reais de uma planilha CSV/Excel
// Este arquivo demonstra como você pode adaptar o sistema para seus dados

import { CotacaoItem } from '../types';

// Função para converter dados de CSV/Excel para o formato do sistema
export const convertCSVToCotacaoData = (csvData: any[]): CotacaoItem[] => {
  return csvData.map((row) => ({
    SHOP_NO: row['SHOP NO'] || row['SHOP_NO'] || '',
    NUM_COTACAO: row['NUM_COTACAO'] || '',
    referencia: row['REF'] || '',
    PHOTO_NO: row['PHOTO NO'] || row['PHOTO_NO'] || '',
    ITEM_NO: row['ITEM NO'] || row['ITEM_NO'] || '',
    description: row['DESCRIPTION'] || '',
    name: row['NAME'] || '',
    remark: row['REMARK'] || '',
    obs: row['OBS'] || '',
    ncm: row['NCM'] || '',
    engdesciption: row['English Description'] || '',
    photo: '', // Será preenchido automaticamente pelo sistema
    MOQ: parseFloat(row['MOQ']) || 0,
    ctns: parseFloat(row['CTNS']) || 0,
    unitCtn: parseFloat(row['UNIT/CTN']) || parseFloat(row['UNIT_CTN']) || 0,
    qty: parseFloat(row['QTY']) || 0,
    unitPriceRmb: parseFloat(row['U.PRICE']) || parseFloat(row['PRICE']) || 0,
    unit: row['UNIT'] || '',
    amount: parseFloat(row['AMOUNT']) || 0,
    l: parseFloat(row['L']) || 0,
    w: parseFloat(row['W']) || 0,
    h: parseFloat(row['H']) || 0,
    cbm: parseFloat(row['CBM']) || 0,
    cbm_total: parseFloat(row['CBM TOTAL']) || parseFloat(row['CBM_TOTAL']) || 0,
    gw: parseFloat(row['G.W']) || parseFloat(row['GW']) || 0,
    tgw: parseFloat(row['T.G.W']) || parseFloat(row['TGW']) || 0,
    nw: parseFloat(row['N.W']) || parseFloat(row['NW']) || 0,
    tnw: parseFloat(row['T.N.W']) || parseFloat(row['TNW']) || 0,
    pesoUnitario: parseFloat(row['Peso Unitário(g)']) || parseFloat(row['PESO_UNITARIO']) || 0,
    OBSERVATIONS_EXTRA: row['OBSERVATIONS_EXTRA'] || '',
    nomeContato: row['nomeContato'] || row['NOME_CONTATO'] || '',
    telefoneContato: row['telefoneContato'] || row['TELEFONE_CONTATO'] || '',
    dataCotacao: row['dataCotacao'] || row['DATA_COTACAO'] || ''
  }));
};

// Função para gerar URLs de imagens baseadas no PHOTO NO
// Adapte esta função para seu sistema de armazenamento de imagens
export const generateImageUrl = (photoNo: string, baseUrl?: string): string => {
  if (baseUrl) {
    // Para URLs personalizadas (ex: AWS S3, Google Cloud Storage, etc.)
    return `${baseUrl}/${photoNo}.jpg`;
  }
  
  // Para URLs locais ou de CDN
  return `/images/products/${photoNo}.jpg`;
};

// Função para validar dados antes da importação
export const validateImportedData = (data: CotacaoItem[]): {
  valid: CotacaoItem[];
  invalid: { item: CotacaoItem; errors: string[] }[];
} => {
  const valid: CotacaoItem[] = [];
  const invalid: { item: CotacaoItem; errors: string[] }[] = [];

  data.forEach((item) => {
    const errors: string[] = [];

    // Validações básicas
    if (!item.SHOP_NO?.trim()) errors.push('SHOP NO é obrigatório');
    if (!item.referencia?.trim()) errors.push('REF é obrigatório');
    if (!item.description?.trim()) errors.push('DESCRIPTION é obrigatório');
    if (!item.name?.trim()) errors.push('NAME é obrigatório');

    // Validações numéricas
    if (item.MOQ < 0) errors.push('MOQ deve ser maior ou igual a zero');
    if (item.ctns < 0) errors.push('CTNS deve ser maior ou igual a zero');
    if (item.unitCtn < 0) errors.push('UNIT/CTN deve ser maior ou igual a zero');
    if (item.unitPriceRmb < 0) errors.push('U.PRICE deve ser maior ou igual a zero');

    if (errors.length === 0) {
      valid.push(item);
    } else {
      invalid.push({ item, errors });
    }
  });

  return { valid, invalid };
};

// Função para calcular estatísticas dos dados importados
export const calculateImportStats = (data: CotacaoItem[]) => {
  const totalItems = data.length;
  const totalValue = data.reduce((sum, item) => sum + item.amount, 0);
  const totalCBM = data.reduce((sum, item) => sum + item.cbm_total, 0);
  const averagePrice = totalItems > 0 ? totalValue / totalItems : 0;

  return {
    totalItems,
    totalValue,
    totalCBM,
    averagePrice
  };
};

// Função para filtrar dados por critérios específicos
export const filterDataByCriteria = (
  data: CotacaoItem[],
  criteria: {
    shopNo?: string;
    minPrice?: number;
    maxPrice?: number;
    minCBM?: number;
    maxCBM?: number;
  }
): CotacaoItem[] => {
  return data.filter((item) => {
    if (criteria.shopNo && !item.SHOP_NO.toLowerCase().includes(criteria.shopNo.toLowerCase())) {
      return false;
    }
    if (criteria.minPrice && item.unitPriceRmb < criteria.minPrice) {
      return false;
    }
    if (criteria.maxPrice && item.unitPriceRmb > criteria.maxPrice) {
      return false;
    }
    if (criteria.minCBM && item.cbm < criteria.minCBM) {
      return false;
    }
    if (criteria.maxCBM && item.cbm > criteria.maxCBM) {
      return false;
    }
    return true;
  });
};

// Função para exportar dados para CSV
export const exportToCSV = (data: CotacaoItem[]): string => {
  const headers = [
    'SHOP NO', 'NUM COTAÇÃO', 'REF', 'PHOTO NO', 'ITEM NO', 'DESCRIPTION', 'NAME',
    'REMARK', 'OBS', 'NCM', 'English Description', 'MOQ', 'CTNS', 'UNIT/CTN',
    'QTY', 'U.PRICE RMB', 'UNIT', 'AMOUNT', 'L', 'W', 'H', 'CBM', 'CBM TOTAL',
    'G.W', 'T.G.W', 'N.W', 'T.N.W', 'Peso Unitário (kg)', 'OBSERVATIONS EXTRA',
    'NOME CONTATO', 'TELEFONE CONTATO', 'DATA COTAÇÃO'
  ];

  const csvContent = [
    headers.join(','),
    ...data.map(item => [
      item.SHOP_NO,
      item.NUM_COTACAO,
      item.referencia,
      item.PHOTO_NO,
      item.ITEM_NO,
      item.description,
      item.name,
      item.remark,
      item.obs,
      item.ncm,
      item.engdesciption,
      item.MOQ,
      item.ctns,
      item.unitCtn,
      item.qty,
      item.unitPriceRmb,
      item.unit,
      item.amount,
      item.l,
      item.w,
      item.h,
      item.cbm,
      item.cbm_total,
      item.gw,
      item.tgw,
      item.nw,
      item.tnw,
      item.pesoUnitario,
      item.OBSERVATIONS_EXTRA,
      item.nomeContato,
      item.telefoneContato,
      item.dataCotacao
    ].join(','))
  ].join('\n');

  return csvContent;
};