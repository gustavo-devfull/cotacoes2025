import * as XLSX from 'xlsx';
import { CotacaoItem } from '../types';
import { BaseProdutoItem } from '../services/baseProdutosService';

export interface ExportOptions {
  filename?: string;
  sheetName?: string;
  includeHeaders?: boolean;
}

export const exportToExcel = (
  data: CotacaoItem[],
  options: ExportOptions = {}
): void => {
  const {
    filename = 'produtos_selecionados.xlsx',
    sheetName = 'Produtos'
  } = options;

  // Preparar dados para exportação
  const exportData = data.map(item => {
    // Construir URL da imagem baseada na REF
    const cleanRef = item.referencia.trim().toUpperCase();
    const imageUrl = `https://ideolog.ia.br/images/products/${cleanRef}.jpg`;
    
    return {
      'SHOP NO': item.SHOP_NO,
      'NUM COTAÇÃO': item.NUM_COTACAO,
      'REF': item.referencia,
      'PHOTO NO': imageUrl, // Incluir link da imagem
      'ITEM NO': item.ITEM_NO,
      'DESCRIPTION': item.description,
      'NAME': item.name,
      'REMARK': item.remark,
      'OBS': item.obs,
      'NCM': item.ncm,
      'ENG DESCRIPTION': item.engdesciption,
      'MOQ': item.MOQ,
      'CTNS': item.ctns,
      'UNIT/CTN': item.unitCtn,
      'QTY': item.qty,
      'U.PRICE RMB': item.unitPriceRmb,
      'UNIT': item.unit,
      'AMOUNT': item.amount,
      'L (cm)': item.l,
      'W (cm)': item.w,
      'H (cm)': item.h,
      'CBM': item.cbm,
      'CBM TOTAL': item.cbm_total,
      'G.W': item.gw,
      'T.G.W': item.tgw,
      'N.W': item.nw,
      'T.N.W': item.tnw,
      'PESO UNIT (kg)': item.pesoUnitario,
      'OBSERVATIONS EXTRA': item.OBSERVATIONS_EXTRA,
      'NOME CONTATO': item.nomeContato,
      'TELEFONE CONTATO': item.telefoneContato,
      'DATA COTAÇÃO': item.dataCotacao,
      'SEGMENTO': item.segmento
    };
  });

  // Criar workbook
  const workbook = XLSX.utils.book_new();
  
  // Criar worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Configurar larguras das colunas
  const columnWidths = [
    { wch: 12 }, // SHOP NO
    { wch: 15 }, // NUM COTAÇÃO
    { wch: 12 }, // REF
    { wch: 50 }, // PHOTO NO (URL da imagem)
    { wch: 12 }, // ITEM NO
    { wch: 25 }, // DESCRIPTION
    { wch: 20 }, // NAME
    { wch: 20 }, // REMARK
    { wch: 30 }, // OBS
    { wch: 12 }, // NCM
    { wch: 25 }, // ENG DESCRIPTION
    { wch: 8 },  // MOQ
    { wch: 8 },  // CTNS
    { wch: 10 }, // UNIT/CTN
    { wch: 8 },  // QTY
    { wch: 12 }, // U.PRICE RMB
    { wch: 8 },  // UNIT
    { wch: 12 }, // AMOUNT
    { wch: 8 },  // L (cm)
    { wch: 8 },  // W (cm)
    { wch: 8 },  // H (cm)
    { wch: 8 },  // CBM
    { wch: 12 }, // CBM TOTAL
    { wch: 8 },  // G.W
    { wch: 8 },  // T.G.W
    { wch: 8 },  // N.W
    { wch: 8 },  // T.N.W
    { wch: 12 }, // PESO UNIT (kg)
    { wch: 25 }, // OBSERVATIONS EXTRA
    { wch: 20 }, // NOME CONTATO
    { wch: 15 }, // TELEFONE CONTATO
    { wch: 12 }, // DATA COTAÇÃO
    { wch: 15 }  // SEGMENTO
  ];

  worksheet['!cols'] = columnWidths;

  // Adicionar worksheet ao workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Gerar arquivo e fazer download
  XLSX.writeFile(workbook, filename);
};

export const formatDateForFilename = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  return `produtos_exportados_${year}${month}${day}_${hours}${minutes}.xlsx`;
};

export const formatDateForBaseProdutosFilename = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  return `base_produtos_${year}${month}${day}_${hours}${minutes}.xlsx`;
};

export const exportBaseProdutosToExcel = (
  data: BaseProdutoItem[],
  options: ExportOptions = {}
): void => {
  const {
    filename = 'base_produtos.xlsx',
    sheetName = 'Base de Produtos'
  } = options;

  // Preparar dados para exportação
  const exportData = data.map(item => ({
    'linhaCotacoes': item.linhaCotacoes,
    'referencia': item.referencia,
    'fabrica': item.fabrica,
    'itemNo': item.itemNo,
    'description': item.description,
    'name': item.name,
    'remark': item.remark,
    'obs': item.obs,
    'moq': item.moq,
    'unitCtn': item.unitCtn,
    'unitPriceRmb': item.unitPriceRmb,
    'unit': item.unit,
    'l': item.l,
    'w': item.w,
    'h': item.h,
    'cbm': item.cbm,
    'gw': item.gw,
    'nw': item.nw,
    'pesoUnitario': item.pesoUnitario,
    'marca': item.marca,
    'codRavi': item.codRavi,
    'ean': item.ean,
    'dun': item.dun,
    'nomeInvoiceEn': item.nomeInvoiceEn,
    'nomeDiNb': item.nomeDiNb,
    'nomeRaviProfit': item.nomeRaviProfit,
    'qtMinVenda': item.qtMinVenda,
    'ncm': item.ncm,
    'cest': item.cest,
    'valorInvoiceUsd': item.valorInvoiceUsd,
    'obsPedido': item.obsPedido
  }));

  // Criar workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);

  // Ajustar largura das colunas
  const colWidths = [
    { wch: 15 }, // Linha Cotações
    { wch: 12 }, // Referência
    { wch: 20 }, // Fábrica
    { wch: 12 }, // Item No
    { wch: 30 }, // Description
    { wch: 20 }, // Name
    { wch: 30 }, // Remark
    { wch: 20 }, // OBS
    { wch: 8 },  // MOQ
    { wch: 10 }, // Unit/Ctn
    { wch: 12 }, // Unit Price RMB
    { wch: 8 },  // Unit
    { wch: 8 },  // L
    { wch: 8 },  // W
    { wch: 8 },  // H
    { wch: 8 },  // CBM
    { wch: 8 },  // G.W
    { wch: 8 },  // N.W
    { wch: 12 }, // Peso Unitário
    { wch: 15 }, // Marca
    { wch: 12 }, // Cod Ravi
    { wch: 15 }, // EAN
    { wch: 15 }, // DUN
    { wch: 25 }, // Nome Invoice EN
    { wch: 15 }, // Nome DI NB
    { wch: 15 }, // Nome Ravi Profit
    { wch: 12 }, // Qt Min Venda
    { wch: 12 }, // NCM
    { wch: 12 }, // CEST
    { wch: 15 }, // Valor Invoice USD
    { wch: 20 }  // OBS Pedido
  ];
  ws['!cols'] = colWidths;

  // Adicionar worksheet ao workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Salvar arquivo
  XLSX.writeFile(wb, filename);
};
