import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
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

// Função auxiliar para baixar imagem e converter para buffer
const fetchImageAsBuffer = async (url: string): Promise<ArrayBuffer | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.arrayBuffer();
  } catch (error) {
    console.error(`Erro ao baixar imagem ${url}:`, error);
    return null;
  }
};

export const exportBaseProdutosToExcel = async (
  data: BaseProdutoItem[],
  options: ExportOptions = {}
): Promise<void> => {
  const {
    filename = 'base_produtos.xlsx',
    sheetName = 'Base de Produtos'
  } = options;

  // Criar workbook com ExcelJS
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // Definir cabeçalhos com cores (formatação igual ao exporta_planilha)
  const headers = [
    'Foto',
    'Linha Cotacoes',
    'Referencia',
    'Fabrica',
    'Item No',
    'Description',
    'Name',
    'Remark',
    'OBS',
    'MOQ',
    'Unit/Ctn',
    'Unit Price RMB',
    'Unit',
    'L',
    'W',
    'H',
    'CBM',
    'G.W',
    'N.W',
    'Peso Unitario (kg)',
    'Marca',
    'Cod Ravi',
    'EAN',
    'DUN',
    'Nome Invoice EN',
    'Nome DI NB',
    'Nome Ravi Profit',
    'Qt Min Venda',
    'NCM',
    'CEST',
    'Valor Invoice USD',
    'OBS Pedido'
  ];

  // Adicionar linha de cabeçalho com formatação
  const headerRow = worksheet.addRow(headers);
  
  // Aplicar formatação no cabeçalho (cores e estilo)
  headerRow.eachCell((cell, colNumber) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' } // Azul similar ao exporta_planilha
    };
    cell.font = {
      color: { argb: 'FFFFFFFF' }, // Texto branco
      bold: true,
      size: 11
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Ajustar altura da linha do cabeçalho
  headerRow.height = 25;

  // Adicionar dados
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const row = worksheet.addRow([
      '', // Foto - será preenchida depois
      item.linhaCotacoes || '',
      item.referencia || '',
      item.fabrica || '',
      item.itemNo || '',
      item.description || '',
      item.name || '',
      item.remark || '',
      item.obs || '',
      item.moq || 0,
      item.unitCtn || 0,
      item.unitPriceRmb || 0,
      item.unit || '',
      item.l || 0,
      item.w || 0,
      item.h || 0,
      item.cbm || 0,
      item.gw || 0,
      item.nw || 0,
      item.pesoUnitario || 0,
      item.marca || '',
      item.codRavi || '',
      item.ean || '',
      item.dun || '',
      item.nomeInvoiceEn || '',
      item.nomeDiNb || '',
      item.nomeRaviProfit || '',
      item.qtMinVenda || 0,
      item.ncm || '',
      item.cest || '',
      item.valorInvoiceUsd || 0,
      item.obsPedido || ''
    ]);

    // Aplicar formatação nas células numéricas
    const numericColumns = [9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 27, 30]; // Índices das colunas numéricas (0-based)
    numericColumns.forEach(colIndex => {
      const cell = row.getCell(colIndex + 1); // ExcelJS usa 1-based
      if (typeof cell.value === 'number') {
        if (colIndex === 9 || colIndex === 10 || colIndex === 27) { // MOQ, Unit/Ctn, Qt Min Venda
          cell.numFmt = '#,##0';
        } else if (colIndex === 11 || colIndex === 13 || colIndex === 14 || colIndex === 15 || colIndex === 17 || colIndex === 18 || colIndex === 30) { // Preços, dimensões, pesos, valores
          cell.numFmt = '#,##0.00';
        } else if (colIndex === 16 || colIndex === 19) { // CBM, Peso Unitario
          cell.numFmt = '#,##0.000';
        }
      }
    });

    // Adicionar imagem na primeira coluna (Foto)
    if (item.referencia) {
      const cleanRef = item.referencia.trim().toUpperCase();
      const imageUrl = `https://ideolog.ia.br/images/products/${cleanRef}.jpg`;
      
      try {
        const imageBuffer = await fetchImageAsBuffer(imageUrl);
        if (imageBuffer) {
          // ExcelJS aceita ArrayBuffer diretamente
          const imageId = workbook.addImage({
            buffer: imageBuffer,
            extension: 'jpeg'
          });
          
          // Inserir imagem na célula (coluna A, linha i+2 porque linha 1 é cabeçalho)
          worksheet.addImage(imageId, {
            tl: { col: 0, row: i + 1 },
            ext: { width: 100, height: 100 }
          });
          
          // Ajustar altura da linha para acomodar a imagem
          row.height = 100;
        }
      } catch (error) {
        console.error(`Erro ao adicionar imagem para ${item.referencia}:`, error);
      }
    }

    // Aplicar bordas nas células
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'left',
        wrapText: true
      };
    });
  }

  // Ajustar larguras das colunas
  worksheet.columns = [
    { width: 15 }, // Foto
    { width: 18 }, // Linha Cotacoes
    { width: 15 }, // Referencia
    { width: 20 }, // Fabrica
    { width: 12 }, // Item No
    { width: 35 }, // Description
    { width: 25 }, // Name
    { width: 30 }, // Remark
    { width: 25 }, // OBS
    { width: 10 }, // MOQ
    { width: 12 }, // Unit/Ctn
    { width: 15 }, // Unit Price RMB
    { width: 10 }, // Unit
    { width: 10 }, // L
    { width: 10 }, // W
    { width: 10 }, // H
    { width: 10 }, // CBM
    { width: 10 }, // G.W
    { width: 10 }, // N.W
    { width: 18 }, // Peso Unitario (kg)
    { width: 15 }, // Marca
    { width: 15 }, // Cod Ravi
    { width: 18 }, // EAN
    { width: 18 }, // DUN
    { width: 30 }, // Nome Invoice EN
    { width: 18 }, // Nome DI NB
    { width: 20 }, // Nome Ravi Profit
    { width: 15 }, // Qt Min Venda
    { width: 12 }, // NCM
    { width: 12 }, // CEST
    { width: 18 }, // Valor Invoice USD
    { width: 25 }  // OBS Pedido
  ];

  // Congelar primeira linha (cabeçalho)
  worksheet.views = [
    {
      state: 'frozen',
      ySplit: 1
    }
  ];

  // Gerar buffer e fazer download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};
