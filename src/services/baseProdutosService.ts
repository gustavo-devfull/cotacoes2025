import { CotacaoItem } from '../types';

export interface BaseProdutoItem {
  linhaCotacoes: string;
  referencia: string;
  fabrica: string;
  itemNo: string;
  description: string;
  name: string;
  remark: string;
  obs: string;
  moq: number;
  unitCtn: number;
  unitPriceRmb: number;
  unit: string;
  l: number;
  w: number;
  h: number;
  cbm: number;
  gw: number;
  nw: number;
  pesoUnitario: number;
  marca: string;
  codRavi: string;
  ean: string;
  dun: string;
  nomeInvoiceEn: string;
  nomeDiNb: string;
  nomeRaviProfit: string;
  qtMinVenda: number;
  ncm: string;
  cest: string;
  valorInvoiceUsd: number;
  obsPedido: string;
}

/**
 * Converte um item de cotação para o formato da base de produtos
 */
export const convertToBaseProduto = (cotacaoItem: CotacaoItem): BaseProdutoItem => {
  return {
    linhaCotacoes: cotacaoItem.dataCotacao || '',
    referencia: cotacaoItem.referencia || '',
    fabrica: cotacaoItem.SHOP_NO || '',
    itemNo: cotacaoItem.PHOTO_NO || '',
    description: cotacaoItem.description || '',
    name: cotacaoItem.name || '',
    remark: cotacaoItem.remark || '',
    obs: cotacaoItem.obs || '',
    moq: Number(cotacaoItem.MOQ) || 0,
    unitCtn: Number(cotacaoItem.unitCtn) || 0,
    unitPriceRmb: Number(cotacaoItem.unitPriceRmb) || 0,
    unit: cotacaoItem.unit || '',
    l: Number(cotacaoItem.l) || 0,
    w: Number(cotacaoItem.w) || 0,
    h: Number(cotacaoItem.h) || 0,
    cbm: Number(cotacaoItem.cbm) || 0,
    gw: Number(cotacaoItem.gw) || 0,
    nw: Number(cotacaoItem.nw) || 0,
    pesoUnitario: Number(cotacaoItem.pesoUnitario) || 0,
    marca: '', // Campo não disponível na interface atual
    codRavi: '', // Campo não disponível na interface atual
    ean: '', // Campo não disponível na interface atual
    dun: '', // Campo não disponível na interface atual
    nomeInvoiceEn: cotacaoItem.engdesciption || '',
    nomeDiNb: '', // Campo não disponível na interface atual
    nomeRaviProfit: '', // Campo não disponível na interface atual
    qtMinVenda: 0, // Campo não disponível na interface atual
    ncm: cotacaoItem.ncm || '',
    cest: '', // Campo não disponível na interface atual
    valorInvoiceUsd: 0, // Campo não disponível na interface atual
    obsPedido: '' // Campo não disponível na interface atual
  };
};

/**
 * Converte uma lista de itens de cotação para o formato da base de produtos
 */
export const convertCotacoesToBaseProdutos = (cotacoes: CotacaoItem[]): BaseProdutoItem[] => {
  return cotacoes.map(convertToBaseProduto);
};

/**
 * Remove duplicatas baseado na referência e fabrica
 */
export const removeDuplicates = (baseProdutos: BaseProdutoItem[]): BaseProdutoItem[] => {
  const seen = new Set<string>();
  return baseProdutos.filter(item => {
    const key = `${item.referencia}-${item.fabrica}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

/**
 * Ordena a base de produtos por fabrica e depois por referencia
 */
export const sortBaseProdutos = (baseProdutos: BaseProdutoItem[]): BaseProdutoItem[] => {
  return [...baseProdutos].sort((a, b) => {
    // Primeiro ordena por fabrica
    const fabricaComparison = a.fabrica.localeCompare(b.fabrica);
    if (fabricaComparison !== 0) {
      return fabricaComparison;
    }
    // Depois ordena por referencia
    return a.referencia.localeCompare(b.referencia);
  });
};
