import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Building2, Phone, Calendar, BarChart3, Package, DollarSign, TrendingUp, ChevronDown, ChevronUp, Eye, Loader2 } from 'lucide-react';
import { LojaFabrica, CotacaoItem } from '../types';
import { LojaFabricaService } from '../services/lojaFabricaService';
import { getCotacoes, convertToCotacaoItem, CotacaoDocument } from '../services/cotacaoService';
import { ftpImageService } from '../services/ftpImageService';
import { useLightbox } from '../hooks/useLightbox';
import Lightbox from './Lightbox';
import { mockData } from '../data/mockData';

// Componente para exibir imagem do produto (150px)
const ProductImageLarge: React.FC<{ 
  productRef: string; 
  description: string;
  onImageClick?: (imageUrl: string, title: string) => void;
}> = ({ productRef, description, onImageClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar imagem do FTP baseada na REF
  useEffect(() => {
    const loadImage = async () => {
      if (!productRef) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setImageError(false);
      setImageLoaded(false);

      try {
        // Construir URL diretamente para melhor performance
        const cleanRef = productRef.trim().toUpperCase();
        const directUrl = `https://ideolog.ia.br/images/products/${cleanRef}.jpg`;
        
        // Verificar cache primeiro
        const cachedUrl = ftpImageService.getCacheStats().keys.includes(cleanRef) 
          ? directUrl 
          : null;
        
        if (cachedUrl) {
          setImageUrl(cachedUrl);
          setIsLoading(false);
          return;
        }

        // Tentar obter URL do serviço
        const url = await ftpImageService.getImageUrl(productRef);
        if (url) {
          setImageUrl(url);
        } else {
          // Se o serviço não encontrou, tentar URL direta
          setImageUrl(directUrl);
        }
      } catch (error) {
        console.error(`Erro ao carregar imagem para REF ${productRef}:`, error);
        // Em caso de erro, tentar URL direta
        const cleanRef = productRef.trim().toUpperCase();
        setImageUrl(`https://ideolog.ia.br/images/products/${cleanRef}.jpg`);
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [productRef]);

  const handleImageClick = () => {
    if (onImageClick && imageLoaded && !imageError && imageUrl) {
      onImageClick(imageUrl, description);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  if (isLoading) {
    return (
      <div className="w-[150px] h-[150px] bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (imageError || !imageUrl) {
    return (
      <div className="w-[150px] h-[150px] bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
        <Eye className="w-8 h-8 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative w-[150px] h-[150px]">
      <img
        src={imageUrl}
        alt={description}
        className="w-[150px] h-[150px] object-cover rounded-lg border border-gray-200 transition-all duration-200 cursor-pointer hover:opacity-80 hover:scale-105"
        onLoad={handleImageLoad}
        onError={handleImageError}
        onClick={handleImageClick}
        loading="lazy"
        title={`REF: ${productRef} - Clique para ampliar`}
      />
    </div>
  );
};

const LojaFabricaManagement: React.FC = () => {
  const [lojas, setLojas] = useState<LojaFabrica[]>([]);
  const [cotacoes, setCotacoes] = useState<CotacaoItem[]>([]);
  const [cotacoesDocuments, setCotacoesDocuments] = useState<CotacaoDocument[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [segmentoFilter, setSegmentoFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [editingLoja, setEditingLoja] = useState<LojaFabrica | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    nomeContato: '',
    telefone: '',
    segmento: '',
    dataCotacao: ''
  });

  // Hook do lightbox
  const lightbox = useLightbox();

  // Carregar dados reais das cotações
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Tentar carregar dados do Firebase
        const cotacoesFirebase = await getCotacoes();
        const cotacaoItems = cotacoesFirebase.map(convertToCotacaoItem);
        
        setCotacoes(cotacaoItems);
        setCotacoesDocuments(cotacoesFirebase); // Manter documentos originais com IDs
        
        // Extrair lojas únicas dos dados de cotação
        const lojasExtraidas = LojaFabricaService.extractLojasFromCotacoes(cotacaoItems);
        setLojas(lojasExtraidas);
        
        console.log('✅ Dados carregados:', {
          cotacoes: cotacaoItems.length,
          lojas: lojasExtraidas.length
        });
        
      } catch (error) {
        console.error('❌ Erro ao carregar dados do Firebase:', error);
        
        // Fallback para dados mock
        setCotacoes(mockData);
        setCotacoesDocuments([]); // Mock data não tem IDs do Firebase
        const lojasMock = LojaFabricaService.extractLojasFromCotacoes(mockData);
        setLojas(lojasMock);
        
        console.log('📋 Usando dados mock:', {
          cotacoes: mockData.length,
          lojas: lojasMock.length
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredLojas = LojaFabricaService.filterLojas(lojas, {
    searchTerm,
    segmento: segmentoFilter || undefined
  });

  // Obter segmentos únicos para o filtro
  const segmentosUnicos = LojaFabricaService.getSegmentosUnicos(cotacoes);

  const handleOpenModal = (loja?: LojaFabrica) => {
    if (loja) {
      setEditingLoja(loja);
      setFormData({
        nome: loja.nome,
        nomeContato: loja.nomeContato,
        telefone: loja.telefone,
        segmento: loja.segmento,
        dataCotacao: loja.dataCotacao
      });
    } else {
      setEditingLoja(null);
      setFormData({
        nome: '',
        nomeContato: '',
        telefone: '',
        segmento: '',
        dataCotacao: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLoja(null);
    setFormData({
      nome: '',
      nomeContato: '',
      telefone: '',
      segmento: '',
      dataCotacao: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      if (editingLoja) {
        // Verificar se houve mudanças no nome ou segmento
        const mudancas = {
          nome: formData.nome !== editingLoja.nome ? formData.nome : undefined,
          segmento: formData.segmento !== editingLoja.segmento ? formData.segmento : undefined
        };
        
        // Se houve mudanças no nome ou segmento, atualizar produtos associados
        if (mudancas.nome || mudancas.segmento) {
          console.log('🔄 Atualizando produtos associados devido a mudanças na loja');
          await LojaFabricaService.updateProdutosAssociados(editingLoja.id, cotacoesDocuments, mudancas);
          
          // Recarregar dados do Firebase após atualização
          console.log('🔄 Recarregando dados após atualização dos produtos');
          const cotacoesAtualizadas = await getCotacoes();
          const cotacaoItemsAtualizados = cotacoesAtualizadas.map(convertToCotacaoItem);
          setCotacoes(cotacaoItemsAtualizados);
          setCotacoesDocuments(cotacoesAtualizadas); // Atualizar documentos também
          
          // Re-extrair lojas com dados atualizados
          const lojasAtualizadas = LojaFabricaService.extractLojasFromCotacoes(cotacaoItemsAtualizados);
          setLojas(lojasAtualizadas);
          
          console.log('✅ Dados recarregados após atualização');
        }
        
        // Editar loja existente
        const updatedLoja: LojaFabrica = {
          ...editingLoja,
          ...formData,
          updatedAt: new Date()
        };
        setLojas(lojas.map(loja => loja.id === editingLoja.id ? updatedLoja : loja));
      } else {
        // Criar nova loja
        const newLoja: LojaFabrica = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setLojas([...lojas, newLoja]);
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('❌ Erro ao salvar loja:', error);
      // Aqui você pode adicionar um toast de erro se tiver
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta loja/fábrica?')) {
      setLojas(lojas.filter(loja => loja.id !== id));
    }
  };

  const toggleCardExpansion = (lojaId: string) => {
    setExpandedCard(expandedCard === lojaId ? null : lojaId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lojas e Fábricas</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gerencie as informações das lojas e fábricas parceiras
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="mt-4 sm:mt-0 btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Loja/Fábrica
        </button>
      </div>

      {/* Search e Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por nome, contato ou segmento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <select
          value={segmentoFilter}
          onChange={(e) => setSegmentoFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Todos os segmentos</option>
          {segmentosUnicos.map(segmento => (
            <option key={segmento} value={segmento}>{segmento}</option>
          ))}
        </select>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLojas.map((loja) => {
          const stats = LojaFabricaService.getLojaStats(loja.id, cotacoes);
          return (
            <div key={loja.id} className="card hover:shadow-lg transition-shadow duration-200 p-6">
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{loja.nome}</h3>
                    <p className="text-sm text-gray-500">{loja.segmento}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(loja)}
                    className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(loja.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card Content */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{loja.nomeContato} - {loja.telefone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {loja.dataCotacao ? new Date(loja.dataCotacao + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-1">
                    <BarChart3 className="w-3 h-3" />
                    Cotações
                  </div>
                  <div className="text-lg font-semibold text-gray-900">{stats.totalCotacoes}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-1">
                    <Package className="w-3 h-3" />
                    Itens
                  </div>
                  <div className="text-lg font-semibold text-gray-900">{stats.totalItens}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-1">
                    <DollarSign className="w-3 h-3" />
                    Valor Total
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    R$ {stats.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-1">
                    <TrendingUp className="w-3 h-3" />
                    CBM Total
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {stats.cbmTotal.toFixed(3)} m³
                  </div>
                </div>
              </div>

              {/* Botão para expandir/colapsar */}
              <div className="flex justify-center">
                <button
                  onClick={() => toggleCardExpansion(loja.id)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  {expandedCard === loja.id ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Ocultar Produtos
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Ver Produtos ({stats.totalCotacoes})
                    </>
                  )}
                </button>
              </div>

              {/* Lista de Produtos (expandida) */}
              {expandedCard === loja.id && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Produtos desta Loja/Fábrica</h4>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {LojaFabricaService.getLojaProdutos(loja.id, cotacoes).map((produto, index) => (
                      <div key={index} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                        {/* Imagem do produto - lado esquerdo */}
                        <div className="flex-shrink-0">
                          <ProductImageLarge 
                            productRef={produto.referencia} 
                            description={produto.description}
                            onImageClick={(imageUrl, title) => {
                              lightbox.openLightbox([imageUrl], 0, title);
                            }}
                          />
                        </div>
                        
                        {/* Informações do produto - lado direito */}
                        <div className="flex-1 min-w-0">
                          <div className="space-y-2">
                            {/* REF */}
                            <div>
                              <div className="text-xs text-gray-500 uppercase tracking-wide">REF</div>
                              <div className="font-semibold text-gray-900 text-lg">{produto.referencia}</div>
                            </div>
                            
                            {/* Description */}
                            <div>
                              <div className="text-xs text-gray-500 uppercase tracking-wide">Description</div>
                              <div className="text-gray-700">{produto.description}</div>
                            </div>
                            
                            {/* U.PRICE RMB */}
                            <div>
                              <div className="text-xs text-gray-500 uppercase tracking-wide">U.PRICE RMB</div>
                              <div className="text-xl font-bold text-gray-900">
                                ¥{produto.unitPriceRmb.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados das lojas e fábricas...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredLojas.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || segmentoFilter ? 'Nenhuma loja encontrada' : 'Nenhuma loja cadastrada'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || segmentoFilter
              ? 'Tente ajustar os termos de busca ou filtros' 
              : 'Importe dados de cotações para ver as lojas e fábricas automaticamente'
            }
          </p>
          {!searchTerm && !segmentoFilter && (
            <button
              onClick={() => handleOpenModal()}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Nova Loja/Fábrica
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingLoja ? 'Editar Loja/Fábrica' : 'Nova Loja/Fábrica'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Loja/Fábrica *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Contato *
                  </label>
                  <input
                    type="text"
                    value={formData.nomeContato}
                    onChange={(e) => setFormData({ ...formData, nomeContato: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Segmento *
                  </label>
                  <input
                    type="text"
                    value={formData.segmento}
                    onChange={(e) => setFormData({ ...formData, segmento: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data da Cotação *
                  </label>
                  <input
                    type="date"
                    value={formData.dataCotacao}
                    onChange={(e) => setFormData({ ...formData, dataCotacao: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Salvando...
                      </div>
                    ) : (
                      editingLoja ? 'Salvar Alterações' : 'Criar Loja/Fábrica'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
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
    </div>
  );
};

export default LojaFabricaManagement;
