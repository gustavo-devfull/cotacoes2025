import React, { useState, useEffect } from 'react';
import { CotacaoItem } from '../types';
import { mockData } from '../data/mockData';
import SearchAndFilters from './SearchAndFilters';
import CotacoesTable from './CotacoesTable';
import ImportComponent from './ImportComponent';
import LoginComponent from './LoginComponent';
import Lightbox from './Lightbox';
import { useComments } from '../hooks/useComments';
import { useUser } from '../contexts/UserContext';
import { useLightbox } from '../hooks/useLightbox';
import { BarChart3, TrendingUp, Package, Upload, Database, Cloud } from 'lucide-react';
import { 
  getCotacoes, 
  updateCotacao, 
  deleteCotacao, 
  addMultipleCotacoes,
  subscribeToCotacoes,
  convertToCotacaoItem,
  CotacaoDocument 
} from '../services/cotacaoService';

const Dashboard: React.FC = () => {
  const [allData, setAllData] = useState<CotacaoItem[]>([]);
  const [filteredData, setFilteredData] = useState<CotacaoItem[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CotacaoItem | null>(null);
  
  // Hooks para comentários e usuário
  const { comments, addComment, isOfflineMode: commentsOfflineMode, firebaseError } = useComments();
  const { currentUser } = useUser();
  const lightbox = useLightbox();

  // Carregar dados do Firebase na inicialização
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const cotacoes = await getCotacoes();
        const cotacaoItems = cotacoes.map(convertToCotacaoItem);
        
        setAllData(cotacaoItems);
        setFilteredData(cotacaoItems);
        setIsConnected(true);
        console.log('Dados carregados do Firebase:', cotacaoItems.length, 'itens');
      } catch (error) {
        console.error('Erro ao carregar dados do Firebase:', error);
        
        // Verificar se é erro de permissão
        if (error instanceof Error && error.message.includes('permissions')) {
          console.warn('⚠️ Erro de permissões do Firebase. Configure as regras do Firestore.');
          console.warn('📋 Instruções: Verifique o arquivo CONFIGURAR-FIREBASE-RULES.md');
        }
        
        // Fallback para dados mock em caso de erro
        setAllData(mockData);
        setFilteredData(mockData);
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Escutar mudanças em tempo real do Firebase
  useEffect(() => {
    const unsubscribe = subscribeToCotacoes((cotacoes: CotacaoDocument[]) => {
      const cotacaoItems = cotacoes.map(convertToCotacaoItem);
      setAllData(cotacaoItems);
      setFilteredData(cotacaoItems);
      setIsConnected(true);
    });

    return () => unsubscribe();
  }, []);


  const handleFilterChange = (newFilteredData: CotacaoItem[]) => {
    setFilteredData(newFilteredData);
  };

  const handleImportComplete = async (importedData: CotacaoItem[]) => {
    try {
      setIsLoading(true);
      // Salvar dados importados no Firebase
      await addMultipleCotacoes(importedData);
      console.log('Dados importados salvos no Firebase:', importedData.length, 'itens');
      setShowImportModal(false);
    } catch (error) {
      console.error('Erro ao salvar dados importados:', error);
      alert('Erro ao salvar dados importados. Verifique o console para mais detalhes.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateItem = async (item: CotacaoItem, field: keyof CotacaoItem, value: string | number) => {
    // Função para calcular campos dependentes
    const calculateDependentFields = (updatedItem: CotacaoItem): CotacaoItem => {
      const ctns = Number(updatedItem.ctns) || 0;
      const unitCtn = Number(updatedItem.unitCtn) || 0;
      const unitPriceRmb = Number(updatedItem.unitPriceRmb) || 0;
      const l = Number(updatedItem.l) || 0;
      const w = Number(updatedItem.w) || 0;
      const h = Number(updatedItem.h) || 0;
      const gw = Number(updatedItem.gw) || 0;
      const pesoUnitario = Number(updatedItem.pesoUnitario) || 0;

      // QTY = CTNS * UNIT/CTN
      const qty = ctns * unitCtn;

      // AMOUNT = QTY * U.PRICE RMB
      const amount = qty * unitPriceRmb;

      // CBM = L * W * H / 1000000
      const cbm = (l * w * h) / 1000000;

      // CBM TOTAL = CTNS * CBM
      const cbm_total = ctns * cbm;

      // T.G.W = CTNS * G.W
      const tgw = ctns * gw;

      // N.W = UNIT/CTN * PESO UNITARIO
      const nw = (unitCtn * pesoUnitario) / 1000;

      // T.N.W = CTNS * N.W
      const tnw = ctns * nw;

      return {
        ...updatedItem,
        qty,
        amount,
        cbm,
        cbm_total,
        tgw,
        nw,
        tnw
      };
    };

    try {
      // Encontrar o documento no Firebase pelo PHOTO_NO e referencia
      const cotacoes = await getCotacoes();
      const cotacaoDoc = cotacoes.find(doc => 
        doc.PHOTO_NO === item.PHOTO_NO && doc.referencia === item.referencia
      );

      if (cotacaoDoc) {
        // Calcular campos dependentes
        const updatedItem = { ...item, [field]: value };
        const calculatedItem = calculateDependentFields(updatedItem);
        
        // Atualizar no Firebase
        await updateCotacao(cotacaoDoc.id, calculatedItem);
        console.log('Item atualizado no Firebase:', cotacaoDoc.id);
      } else {
        console.error('Documento não encontrado no Firebase para atualização');
      }
    } catch (error) {
      console.error('Erro ao atualizar item no Firebase:', error);
      alert('Erro ao atualizar item. Verifique o console para mais detalhes.');
    }
  };

  const handleDeleteItem = async (item: CotacaoItem) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      // Encontrar o documento no Firebase pelo PHOTO_NO e referencia
      const cotacoes = await getCotacoes();
      const cotacaoDoc = cotacoes.find(doc => 
        doc.PHOTO_NO === itemToDelete.PHOTO_NO && doc.referencia === itemToDelete.referencia
      );

      if (cotacaoDoc) {
        // Deletar do Firebase
        await deleteCotacao(cotacaoDoc.id);
        console.log('Item deletado do Firebase:', cotacaoDoc.id);
      } else {
        console.error('Documento não encontrado no Firebase para exclusão');
      }
    } catch (error) {
      console.error('Erro ao deletar item do Firebase:', error);
      alert('Erro ao deletar item. Verifique o console para mais detalhes.');
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const handleAddComment = async (productId: string, message: string, imageUrls: string[]) => {
    if (!currentUser) {
      alert('Você precisa estar logado para comentar.');
      return;
    }

    try {
      await addComment(productId, message, imageUrls, currentUser);
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      alert(`Erro ao adicionar comentário: ${errorMessage}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="w-full max-w-[1216px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Gerenciar Cotações</h1>
                <p className="text-sm text-gray-600">Sistema Profissional de Gestão</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Status do Firebase */}
              <div className="flex items-center gap-4">
                {/* Status das Cotações */}
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <Cloud className="w-4 h-4" />
                      <span className="text-sm font-medium">Cotações Online</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-600">
                      <Database className="w-4 h-4" />
                      <span className="text-sm font-medium">Cotações Offline</span>
                      <span className="text-xs text-red-500 ml-1">(Configure regras Firebase)</span>
                    </div>
                  )}
                </div>

                {/* Status dos Comentários */}
                <div className="flex items-center gap-2">
                  {firebaseError ? (
                    <div className="flex items-center gap-1 text-red-600">
                      <Database className="w-4 h-4" />
                      <span className="text-sm font-medium">Erro Firebase</span>
                      <span className="text-xs text-red-500 ml-1">(Configure regras Firebase)</span>
                    </div>
                  ) : commentsOfflineMode ? (
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Database className="w-4 h-4" />
                      <span className="text-sm font-medium">Comentários Offline</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-green-600">
                      <Cloud className="w-4 h-4" />
                      <span className="text-sm font-medium">Comentários Online</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setShowImportModal(true)}
                className="btn-primary flex items-center gap-2"
                disabled={isLoading}
              >
                <Upload className="w-4 h-4" />
                {isLoading ? 'Carregando...' : 'Importar Planilha'}
              </button>
              
              <LoginComponent />
              
              <div className="text-right">
                <p className="text-sm text-gray-600">Última atualização</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date().toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-[1216px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Banner de erro Firebase */}
        {firebaseError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                <Database className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Erro de Conexão Firebase
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  Configure as regras de segurança do Firebase para usar comentários online.
                </p>
                <div className="mt-2 text-xs text-red-600">
                  <strong>Passos:</strong> Acesse <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline">console.firebase.google.com</a> → Projeto "animagic-landing" → Firestore Database → Rules
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Tabela de Cotações - Fora do container principal para centralização perfeita */}
      <div className="mb-2">
        <div className="w-full max-w-[1216px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-primary-600" />
              Cotações ({filteredData.length} itens)
            </h2>
            
            {filteredData.length !== allData.length && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TrendingUp className="w-5 h-5" />
                <span>
                  Mostrando {filteredData.length} de {allData.length} itens
                </span>
              </div>
            )}
          </div>
          
          {/* Busca e Filtros */}
          <SearchAndFilters 
            data={allData} 
            onFilterChange={handleFilterChange} 
          />
        </div>
        
            <CotacoesTable
              data={filteredData}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
              isLoading={isLoading}
              comments={comments}
              currentUser={currentUser}
              onAddComment={handleAddComment}
              lightbox={lightbox}
            />
      </div>

      {/* Footer com informações adicionais */}
      <main className="w-full max-w-[1216px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Sistema de Imagens</h3>
              <p className="text-xs text-gray-500">
                As imagens são carregadas automaticamente usando o PHOTO NO como referência
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Tooltips Informativos</h3>
              <p className="text-xs text-gray-500">
                Passe o mouse sobre os campos REMARK, OBS e OBSERVATIONS EXTRA para ver detalhes completos
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Imagens clicáveis</h3>
              <p className="text-xs text-gray-500">
                Interface otimizada para desktop, tablet e dispositivos móveis
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Firebase Database</h3>
              <p className="text-xs text-gray-500">
                {isConnected 
                  ? "Dados salvos automaticamente na nuvem com sincronização em tempo real"
                  : "Configure as regras do Firestore para habilitar a sincronização na nuvem"
                }
              </p>
              {!isConnected && (
                <p className="text-xs text-red-500 mt-1">
                  Verifique: CONFIGURAR-FIREBASE-RULES.md
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Importação */}
      {showImportModal && (
        <ImportComponent
          onImportComplete={handleImportComplete}
          onClose={() => setShowImportModal(false)}
        />
      )}

      {/* Lightbox */}
      <Lightbox
        isOpen={lightbox.isOpen}
        onClose={lightbox.closeLightbox}
        images={lightbox.images}
        currentIndex={lightbox.currentIndex}
        onNavigate={lightbox.navigateTo}
        title={lightbox.title}
      />

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && itemToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmar Exclusão
              </h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir o produto <strong>"{itemToDelete.description}"</strong> (REF: <strong>{itemToDelete.referencia}</strong>)?
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
