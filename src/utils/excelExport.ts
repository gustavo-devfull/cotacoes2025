import * as XLSX from 'xlsx';
import { CotacaoItem } from '../types';

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
