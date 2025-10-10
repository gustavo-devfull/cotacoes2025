import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, Download } from 'lucide-react';
import { CotacaoItem } from '../types';
import { convertSpreadsheetRowToCotacao, validateImportedData, SpreadsheetRow } from '../utils/spreadsheetMapping';
import { checkDuplicates } from '../services/cotacaoService';
import { useAlertModal } from '../hooks/useAlertModal';

interface ImportComponentProps {
  onImportComplete: (data: CotacaoItem[]) => void;
  onClose: () => void;
}

type ImportType = 'standard' | 'line2-headers';

const ImportComponent: React.FC<ImportComponentProps> = ({ onImportComplete, onClose }) => {
  const { showError, showWarning } = useAlertModal();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shopNo, setShopNo] = useState<string>('');
  const [nomeContato, setNomeContato] = useState<string>('');
  const [telefoneContato, setTelefoneContato] = useState<string>('');
  const [dataCotacao, setDataCotacao] = useState<string>('');
  const [segmento, setSegmento] = useState<string>('');
  const [importType, setImportType] = useState<ImportType>('standard');
  const [importResult, setImportResult] = useState<{
    total: number;
    valid: number;
    invalid: number;
    errors: { item: CotacaoItem; errors: string[] }[];
    validData: CotacaoItem[];
    duplicates?: CotacaoItem[];
    duplicateReferences?: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!['csv', 'xlsx', 'xls'].includes(fileExtension || '')) {
      showError('Formato Inválido', 'Por favor, selecione um arquivo CSV ou Excel (.csv, .xlsx, .xls)');
      return;
    }

    if (!shopNo || (typeof shopNo === 'string' && !shopNo.trim())) {
      showWarning('Campo Obrigatório', 'Por favor, preencha o campo SHOP NO antes de importar a planilha');
      return;
    }

    if (!nomeContato || (typeof nomeContato === 'string' && !nomeContato.trim())) {
      showWarning('Campo Obrigatório', 'Por favor, preencha o campo Nome do Contato antes de importar a planilha');
      return;
    }

    if (!telefoneContato || (typeof telefoneContato === 'string' && !telefoneContato.trim())) {
      showWarning('Campo Obrigatório', 'Por favor, preencha o campo Telefone do Contato antes de importar a planilha');
      return;
    }

    if (!dataCotacao || (typeof dataCotacao === 'string' && !dataCotacao.trim())) {
      showWarning('Campo Obrigatório', 'Por favor, preencha o campo Data da Cotação antes de importar a planilha');
      return;
    }

    if (!segmento || (typeof segmento === 'string' && !segmento.trim())) {
      showWarning('Campo Obrigatório', 'Por favor, preencha o campo Segmento antes de importar a planilha');
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
        
        if (importType === 'standard') {
          // Importação padrão: Linha 1 (título), Linha 2 (vazia), Linha 3 (cabeçalhos), Linha 4+ (dados)
          Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              rawData = results.data as SpreadsheetRow[];
              console.log('Dados CSV após processamento padrão:', rawData);
              console.log('Cabeçalhos disponíveis:', Object.keys(rawData[0] || {}));
            },
            error: (error: any) => {
              throw new Error(`Erro ao processar CSV: ${error.message}`);
            }
          });
        } else {
          // Importação com cabeçalhos na linha 2: Linha 1 (título), Linha 2 (cabeçalhos), Linha 3+ (dados)
          Papa.parse(text, {
            header: false,
            skipEmptyLines: false,
            complete: (results) => {
              const allRows = results.data as string[][];
              if (allRows.length < 2) {
                throw new Error('CSV deve ter pelo menos 2 linhas (título + cabeçalhos)');
              }
              
              // Usar linha 2 (índice 1) como cabeçalhos
              const headers = allRows[1];
              const dataRows = allRows.slice(2); // Dados começam da linha 3
              
              console.log('Headers da linha 2:', headers);
              console.log('Dados a partir da linha 3:', dataRows);
              
              // Converter para objetos com cabeçalhos corretos
              rawData = dataRows.map(row => {
                const obj: any = {};
                headers.forEach((header, index) => {
                  if (header && typeof header === 'string' && header.trim() !== '') {
                    obj[header] = row[index];
                  }
                });
                return obj;
              });
              
              console.log('Dados CSV após processamento linha 2:', rawData);
              console.log('Cabeçalhos disponíveis:', Object.keys(rawData[0] || {}));
            },
            error: (error: any) => {
              throw new Error(`Erro ao processar CSV: ${error.message}`);
            }
          });
        }
      } else {
        // Processar Excel
        const XLSX = await import('xlsx');
        const workbook = XLSX.read(await file.arrayBuffer());
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        if (importType === 'standard') {
          // Importação padrão: Linha 1 (título), Linha 2 (vazia), Linha 3 (cabeçalhos), Linha 4+ (dados)
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
          
          console.log('Headers brutos (padrão):', headers);
          
          // Converter para objetos com cabeçalhos corretos
          rawData = dataRows.map(row => {
            const obj: any = {};
            headers.forEach((header, index) => {
              if (header && typeof header === 'string' && header.trim() !== '') {
                obj[header] = row[index];
              }
            });
            return obj;
          });
          
          console.log('Dados Excel após processamento padrão:', rawData);
        } else {
          // Importação com cabeçalhos na linha 2: Linha 1 (título), Linha 2 (cabeçalhos), Linha 3+ (dados)
          const allData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1, // Usar números como cabeçalhos
            range: 1 // Começar da linha 2 (índice 1) - onde estão os cabeçalhos
          }) as any[][];
          
          if (allData.length < 2) {
            throw new Error('Planilha Excel deve ter pelo menos 3 linhas (título + cabeçalho + dados)');
          }
          
          // Usar a primeira linha do resultado como cabeçalhos (que é a linha 2 da planilha)
          const headers = allData[0];
          const dataRows = allData.slice(1); // Dados começam da linha 3 da planilha
          
          console.log('Headers da linha 2 (Excel):', headers);
          console.log('Dados a partir da linha 3 (Excel):', dataRows);
          
          // Converter para objetos com cabeçalhos corretos
          rawData = dataRows.map(row => {
            const obj: any = {};
            headers.forEach((header, index) => {
              if (header && typeof header === 'string' && header.trim() !== '') {
                obj[header] = row[index];
              }
            });
            return obj;
          });
          
          console.log('Dados Excel após processamento linha 2:', rawData);
        }
        
        console.log('Cabeçalhos disponíveis:', Object.keys(rawData[0] || {}));
      }

      // Converter dados para formato do sistema
      console.log('Dados brutos da planilha:', rawData);
      console.log('Primeira linha:', rawData[0]);
      console.log('Campos disponíveis:', Object.keys(rawData[0] || {}));
      
      const convertedData = rawData.map(row => {
        console.log('Linha original:', row);
        const converted = convertSpreadsheetRowToCotacao(row, shopNo || 'IMPORTED', nomeContato, telefoneContato, dataCotacao, segmento);
        console.log('Linha convertida:', converted);
        return converted;
      });
      
      console.log('Dados convertidos:', convertedData);
      
      // Validar dados
      const validation = validateImportedData(convertedData);
      
      // Verificar duplicatas no sistema
      const duplicateCheck = await checkDuplicates(validation.valid);
      
      console.log('📊 Resultado da validação:', {
        total: convertedData.length,
        valid: validation.valid.length,
        invalid: validation.invalid.length,
        duplicates: duplicateCheck.duplicates.length,
        newItems: duplicateCheck.newItems.length
      });

      setImportResult({
        total: convertedData.length,
        valid: validation.valid.length,
        invalid: validation.invalid.length,
        errors: validation.invalid,
        validData: validation.valid,
        duplicates: duplicateCheck.duplicates,
        duplicateReferences: duplicateCheck.duplicateReferences
      });

      // Se todos os dados são válidos e não há duplicatas, aplicar automaticamente
      if (validation.invalid.length === 0 && duplicateCheck.duplicates.length === 0) {
        onImportComplete(duplicateCheck.newItems);
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
      
      showError('Erro no Processamento', errorMessage);
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
      // Filtrar apenas os dados que não são duplicatas
      const newData = importResult.validData.filter(item => 
        !importResult.duplicates?.some(dup => dup.referencia === item.referencia)
      );
      
      console.log('📊 Aplicando dados:', {
        total: importResult.validData.length,
        novos: newData.length,
        duplicatas: importResult.validData.length - newData.length
      });
      
      onImportComplete(newData);
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
              {/* Tipo de Importação */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipo de Importação <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      id="standard"
                      type="radio"
                      name="importType"
                      value="standard"
                      checked={importType === 'standard'}
                      onChange={(e) => setImportType(e.target.value as ImportType)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <label htmlFor="standard" className="ml-3 text-sm text-gray-700">
                      <span className="font-medium">Padrão</span> - Linha 1 (título), Linha 2 (vazia), Linha 3 (cabeçalhos), Linha 4+ (dados)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="line2-headers"
                      type="radio"
                      name="importType"
                      value="line2-headers"
                      checked={importType === 'line2-headers'}
                      onChange={(e) => setImportType(e.target.value as ImportType)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <label htmlFor="line2-headers" className="ml-3 text-sm text-gray-700">
                      <span className="font-medium">Cabeçalhos na Linha 2</span> - Linha 1 (título), Linha 2 (cabeçalhos), Linha 3+ (dados)
                    </label>
                  </div>
                </div>
              </div>

              {/* Campo SHOP NO */}
              <div className="mb-6">
                <label htmlFor="shopNo" className="block text-sm font-medium text-gray-700 mb-2">
                  SHOP NO <span className="text-red-500">*</span>
                </label>
                <input
                  id="shopNo"
                  type="text"
                  value={shopNo}
                  onChange={(e) => setShopNo(e.target.value)}
                  placeholder="Digite o número da loja"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Este número será aplicado a todos os itens importados desta planilha
                </p>
              </div>

              {/* Campos de Contato */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="nomeContato" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Contato <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="nomeContato"
                    type="text"
                    value={nomeContato}
                    onChange={(e) => setNomeContato(e.target.value)}
                    placeholder="Digite o nome do contato"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="telefoneContato" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone do Contato <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="telefoneContato"
                    type="tel"
                    value={telefoneContato}
                    onChange={(e) => setTelefoneContato(e.target.value)}
                    placeholder="Digite o telefone do contato"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>

              {/* Campos Data da Cotação e Segmento na mesma linha */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Campo Data da Cotação */}
                <div>
                  <label htmlFor="dataCotacao" className="block text-sm font-medium text-gray-700 mb-2">
                    Data da Cotação <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="dataCotacao"
                    type="date"
                    value={dataCotacao}
                    onChange={(e) => {
                      setDataCotacao(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Esta data será usada como NUM_COTACAO para todos os itens importados
                  </p>
                </div>

                {/* Campo Segmento */}
                <div>
                  <label htmlFor="segmento" className="block text-sm font-medium text-gray-700 mb-2">
                    Segmento <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="segmento"
                    type="text"
                    value={segmento}
                    onChange={(e) => setSegmento(e.target.value)}
                    placeholder="Digite o segmento"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Este segmento será aplicado a todos os itens importados desta planilha
                  </p>
                </div>
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

              {/* Download Template - Movido para abaixo da área de upload */}
              <div className="mt-6 text-center">
                <button
                  onClick={downloadTemplate}
                  className="btn-secondary flex items-center gap-2 mx-auto"
                >
                  <Download className="w-4 h-4" />
                  Baixar Template CSV
                </button>
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
              <div className="grid grid-cols-4 gap-4">
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
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{importResult.duplicates?.length || 0}</p>
                  <p className="text-sm text-yellow-600">Duplicatas</p>
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
                      <div key={`import-error-${index}-${error.item.PHOTO_NO}`} className="bg-red-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-red-800">
                          REF: {error.item.PHOTO_NO}
                        </p>
                        <ul className="text-xs text-red-600 mt-1">
                          {error.errors.map((err, errIndex) => (
                            <li key={`error-detail-${index}-${errIndex}`}>• {err}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Duplicatas */}
              {importResult.duplicates && importResult.duplicates.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                    Referências Duplicadas
                  </h4>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {importResult.duplicateReferences?.map((ref, index) => (
                      <div key={`duplicate-${index}-${ref}`} className="bg-yellow-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-yellow-800">
                          REF: {ref}
                        </p>
                        <p className="text-xs text-yellow-600 mt-1">
                          Esta referência já existe no sistema e será ignorada
                        </p>
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
                    Aplicar Dados Novos ({importResult.valid - (importResult.duplicates?.length || 0)})
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
