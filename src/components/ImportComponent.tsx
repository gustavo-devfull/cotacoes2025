import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, Download } from 'lucide-react';
import { CotacaoItem } from '../types';
import { convertSpreadsheetRowToCotacao, validateImportedData, SpreadsheetRow } from '../utils/spreadsheetMapping';

interface ImportComponentProps {
  onImportComplete: (data: CotacaoItem[]) => void;
  onClose: () => void;
}

const ImportComponent: React.FC<ImportComponentProps> = ({ onImportComplete, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{
    total: number;
    valid: number;
    invalid: number;
    errors: { item: CotacaoItem; errors: string[] }[];
    validData: CotacaoItem[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!['csv', 'xlsx', 'xls'].includes(fileExtension || '')) {
      alert('Por favor, selecione um arquivo CSV ou Excel (.csv, .xlsx, .xls)');
      return;
    }

    processFile(file);
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setImportResult(null);

    try {
      let rawData: SpreadsheetRow[] = [];

      if (file.name.endsWith('.csv')) {
        // Processar CSV
        const Papa = await import('papaparse');
        const text = await file.text();
        
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            // Estrutura CSV: Linha 1 (título), Linha 2 (vazia), Linha 3 (cabeçalhos), Linha 4+ (dados)
            // O Papa.parse com header: true usa a primeira linha não vazia como cabeçalho
            // Como temos título na linha 1 e linha vazia na linha 2, a linha 3 será usada como cabeçalho
            rawData = results.data as SpreadsheetRow[];
            console.log('Dados CSV após processamento:', rawData);
            console.log('Cabeçalhos disponíveis:', Object.keys(rawData[0] || {}));
          },
          error: (error: any) => {
            throw new Error(`Erro ao processar CSV: ${error.message}`);
          }
        });
      } else {
        // Processar Excel
        const XLSX = await import('xlsx');
        const workbook = XLSX.read(await file.arrayBuffer());
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Converter para JSON com cabeçalhos personalizados
        // Estrutura da planilha: Linha 1 (título), Linha 2 (vazia), Linha 3 (cabeçalhos), Linha 4+ (dados)
        const allData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1, // Usar números como cabeçalhos
          range: 2 // Começar da linha 3 (índice 2) - onde estão os cabeçalhos
        }) as any[][];
        
        if (allData.length < 2) {
          throw new Error('Planilha Excel deve ter pelo menos 4 linhas (título + vazia + cabeçalho + dados)');
        }
        
        // Usar a primeira linha do resultado como cabeçalhos (que é a linha 3 da planilha)
        const headers = allData[0];
        const dataRows = allData.slice(1); // Dados começam da linha 4 da planilha
        
        console.log('Headers brutos:', headers);
        console.log('Tipo dos headers:', typeof headers);
        console.log('Headers é array?', Array.isArray(headers));
        console.log('Primeiro header:', headers[0], 'Tipo:', typeof headers[0]);
        
        // Converter para objetos com cabeçalhos corretos
        rawData = dataRows.map(row => {
          const obj: any = {};
          headers.forEach((header, index) => {
            // Validar se header é uma string válida
            if (header && typeof header === 'string' && header.trim() !== '') {
              obj[header] = row[index];
            }
          });
          return obj;
        });
        
        console.log('Dados Excel após processamento correto:', rawData);
        console.log('Cabeçalhos disponíveis:', Object.keys(rawData[0] || {}));
        console.log('Primeira linha de dados:', rawData[0]);
        console.log('Estrutura completa da primeira linha:', JSON.stringify(rawData[0], null, 2));
      }

      // Converter dados para formato do sistema
      console.log('Dados brutos da planilha:', rawData);
      console.log('Primeira linha:', rawData[0]);
      console.log('Campos disponíveis:', Object.keys(rawData[0] || {}));
      
      const convertedData = rawData.map(row => {
        console.log('Linha original:', row);
        const converted = convertSpreadsheetRowToCotacao(row);
        console.log('Linha convertida:', converted);
        return converted;
      });
      
      console.log('Dados convertidos:', convertedData);
      
      // Validar dados
      const validation = validateImportedData(convertedData);

      setImportResult({
        total: convertedData.length,
        valid: validation.valid.length,
        invalid: validation.invalid.length,
        errors: validation.invalid,
        validData: validation.valid
      });

      // Se todos os dados são válidos, aplicar automaticamente
      if (validation.invalid.length === 0) {
        onImportComplete(validation.valid);
      }

      } catch (error: any) {
      console.error('Erro ao processar arquivo:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A');
      
      let errorMessage = `Erro ao processar arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
      
      // Mensagens de erro mais específicas
      if (error instanceof Error && error.message.includes('header.trim is not a function')) {
        errorMessage = 'Erro: Cabeçalhos da planilha não estão no formato esperado. Verifique se a primeira linha contém os nomes das colunas.';
      } else if (error instanceof Error && error.message.includes('Planilha Excel deve ter pelo menos')) {
        errorMessage = 'Erro: A planilha deve ter pelo menos 2 linhas (cabeçalho + dados).';
      }
      
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const applyValidData = () => {
    if (importResult && importResult.validData.length > 0) {
      onImportComplete(importResult.validData);
    }
  };

  const downloadTemplate = () => {
    // Criar template CSV com cabeçalhos corretos
    const headers = [
      'REF',
      'DESCRIPTION', 
      'NAME',
      'REMARK',
      'OBS',
      'NCM',
      'English Description',
      'PHOTO',
      'CTNS',
      'UNIT/CTN',
      'QTY',
      'U.PRICE',
      'UNIT',
      'AMOUNT',
      'L',
      'W',
      'H',
      'CBM',
      'CBM TOTAL',
      'G.W',
      'T.G.W',
      'N.W',
      'T.N.W',
      'Peso Unitário(g)'
    ];

    const csvContent = headers.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_cotacao.csv';
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Upload className="w-6 h-6 text-primary-600" />
            Importar Planilha de Cotação
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {!importResult ? (
            <>
              {/* Instruções */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Instruções de Importação</h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li>• Formatos suportados: CSV, Excel (.xlsx, .xls)</li>
                    <li>• A planilha deve conter as colunas conforme o modelo fornecido</li>
                    <li>• <strong>Importante:</strong> Os dados serão lidos a partir da quarta linha (linhas 1-3 serão ignoradas)</li>
                    <li>• <strong>NUM_COTACAO:</strong> Será gerado automaticamente baseado no REF e poderá ser editado depois</li>
                    <li>• Campos obrigatórios: REF, DESCRIPTION, NAME, CTNS, UNIT/CTN, QTY, U.PRICE, UNIT, AMOUNT, L, W, H, CBM, CBM TOTAL, Peso Unitário(g)</li>
                    <li>• Campos opcionais: G.W, T.G.W, N.W, T.N.W</li>
                    <li>• O campo REF será usado como PHOTO_NO para buscar imagens</li>
                  </ul>
                </div>
              </div>

              {/* Download Template */}
              <div className="mb-6">
                <button
                  onClick={downloadTemplate}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Baixar Template CSV
                </button>
              </div>

              {/* Área de Upload */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {isProcessing ? (
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600">Processando arquivo...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Arraste e solte sua planilha aqui
                    </p>
                    <p className="text-gray-600 mb-4">ou</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-primary"
                    >
                      Selecionar Arquivo
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                  </>
                )}
              </div>
            </>
          ) : (
            /* Resultado da Importação */
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-green-100">
                  <FileText className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Importação Concluída
                </h3>
                <p className="text-gray-600">
                  Processados {importResult.total} itens da planilha
                </p>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{importResult.total}</p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{importResult.valid}</p>
                  <p className="text-sm text-green-600">Válidos</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{importResult.invalid}</p>
                  <p className="text-sm text-red-600">Inválidos</p>
                </div>
              </div>

              {/* Erros */}
              {importResult.errors.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    Erros Encontrados
                  </h4>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="bg-red-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-red-800">
                          REF: {error.item.PHOTO_NO}
                        </p>
                        <ul className="text-xs text-red-600 mt-1">
                          {error.errors.map((err, errIndex) => (
                            <li key={errIndex}>• {err}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="flex gap-3">
                {importResult.valid > 0 && (
                  <button
                    onClick={applyValidData}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Aplicar Dados Válidos ({importResult.valid})
                  </button>
                )}
                <button
                  onClick={() => {
                    setImportResult(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="btn-secondary flex-1"
                >
                  Importar Outro Arquivo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportComponent;
