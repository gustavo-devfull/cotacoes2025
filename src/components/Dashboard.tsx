import React, { useState, useEffect } from 'react';
import { CotacaoItem, SortOptions } from '../types';
import { mockData } from '../data/mockData';
import SearchAndFilters from './SearchAndFilters';
import CotacoesTable from './CotacoesTable';
import EditCard from './EditCard';
import ImportComponent from './ImportComponent';
import Lightbox from './Lightbox';
import NotificationBell from './NotificationBell';
import { useComments } from '../hooks/useComments';
import { useNotifications } from '../hooks/useNotifications';
import { useUser } from '../contexts/UserContext';
import { useLightbox } from '../hooks/useLightbox';
import { useAlertModal } from '../hooks/useAlertModal';
import { useUsers } from '../contexts/UsersContext';
import { useExportedProducts } from '../contexts/ExportedProductsContext';
import { useProdutosJaExportados } from '../contexts/ProdutosJaExportadosContext';
import { useProdutosExportadosPorFabrica } from '../contexts/ProdutosExportadosPorFabricaContext';
import { BarChart3, TrendingUp, Package, Upload, Database, Camera, Edit3, Download, CheckSquare, FileSpreadsheet } from 'lucide-react';
import { formatDateTimeToBrazilian } from '../utils/dateUtils';
import { sortData, getNextSortDirection } from '../utils/sortUtils';
import { exportToExcel, formatDateForFilename, exportBaseProdutosToExcel, formatDateForBaseProdutosFilename } from '../utils/excelExport';
import { convertCotacoesToBaseProdutos, removeDuplicates, sortBaseProdutos } from '../services/baseProdutosService';
import { productSelectionService } from '../services/productSelectionService';
import { commentsService } from '../services/commentsService';
import { notificationsService } from '../services/notificationsService';
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CotacaoItem | null>(null);
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: null,
    direction: null
  });
  
  // Estados para exportação
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const { exportedProducts, setExportedProducts, addExportedProducts } = useExportedProducts();
  const { totalExportados, adicionarProdutos } = useProdutosJaExportados();
  const { adicionarProdutosParaFabricas } = useProdutosExportadosPorFabrica();
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingBaseProdutos, setIsExportingBaseProdutos] = useState(false);
  const [showOnlyExported, setShowOnlyExported] = useState(false);
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [showOnlyWithComments, setShowOnlyWithComments] = useState(false);
  
  // Hooks para comentários, notificações e usuário
  const { comments, addComment, firebaseError } = useComments();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { currentUser } = useUser();
  // Get users context with error handling
  const usersContext = useUsers();
  const { users: availableUsers, loading: usersLoading } = usersContext;
  const lightbox = useLightbox();
  const { showSuccess, showError, showWarning, showInfo } = useAlertModal();

  // Reset filtros quando o Dashboard for montado
  useEffect(() => {
    console.log('🔄 Resetando filtros do Dashboard');
    // Resetar estado de filtros ao montar o componente
    setShowOnlyExported(false);
    setShowOnlySelected(false);
    setShowOnlyWithComments(false);
    setSortOptions({ field: null, direction: null });
    
    // Garantir que todos os dados sejam exibidos
    if (allData.length > 0) {
      console.log('📊 Aplicando reset de filtros com', allData.length, 'itens');
      setFilteredData(allData);
    }
  }, []); // Executa apenas uma vez ao montar

  // Carregar dados do Firebase na inicialização
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const cotacoes = await getCotacoes();
        const cotacaoItems = cotacoes.map(convertToCotacaoItem);
        
        setAllData(cotacaoItems);
        setFilteredData(cotacaoItems);
        // Resetar filtros após carregar dados
        setShowOnlyExported(false);
        setShowOnlySelected(false);
        setShowOnlyWithComments(false);
        setSortOptions({ field: null, direction: null });
        console.log('✅ Dados carregados do Firebase:', cotacaoItems.length, 'itens');
      } catch (error) {
        console.error('❌ Erro ao carregar dados do Firebase:', error);
        
        // Verificar se é erro de permissão
        if (error instanceof Error && error.message.includes('permissions')) {
          console.warn('⚠️ Erro de permissões do Firebase. Configure as regras do Firestore.');
          console.warn('📋 Instruções: Verifique o arquivo CONFIGURAR-FIREBASE-RULES.md');
        }
        
        // Fallback para dados mock em caso de erro
        setAllData(mockData);
        setFilteredData(mockData);
        // Resetar filtros após carregar dados mock
        setShowOnlyExported(false);
        setShowOnlySelected(false);
        setShowOnlyWithComments(false);
        setSortOptions({ field: null, direction: null });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []); // Removidas dependências desnecessárias

  // Carregar estados de seleção e exportação salvos
  useEffect(() => {
    const loadSelectionStates = async () => {
      if (!currentUser?.id) return;

      try {
        console.log('🔄 Carregando estados de seleção para usuário:', currentUser.id);
        
        // Tentar carregar do Firebase primeiro
        const states = await productSelectionService.loadSelectionState(currentUser.id);
        
        // Fallback para localStorage se Firebase falhar
        if (states.selectedProducts.size === 0 && states.exportedProducts.size === 0) {
          const localSelected = localStorage.getItem(`selectedProducts_${currentUser.id}`);
          const localExported = localStorage.getItem(`exportedProducts_${currentUser.id}`);
          
          if (localSelected) {
            states.selectedProducts = new Set(JSON.parse(localSelected));
            console.log('📱 Estados carregados do localStorage (selecionados):', states.selectedProducts.size);
          }
          
          if (localExported) {
            states.exportedProducts = new Set(JSON.parse(localExported));
            console.log('📱 Estados carregados do localStorage (exportados):', states.exportedProducts.size);
          }
        }
        
        setSelectedProducts(states.selectedProducts);
        setExportedProducts(states.exportedProducts);
        
        console.log('✅ Estados de seleção carregados:', {
          selected: states.selectedProducts.size,
          exported: states.exportedProducts.size,
          selectedIds: Array.from(states.selectedProducts),
          exportedIds: Array.from(states.exportedProducts)
        });

        // Aplicar estados aos dados carregados
        if (allData.length > 0) {
          console.log('🔄 Aplicando estados aos dados carregados...');
          const updatedData = allData.map(item => {
            const itemId = `${item.PHOTO_NO}-${item.referencia}`;
            return {
              ...item,
              isSelected: states.selectedProducts.has(itemId),
              isExported: states.exportedProducts.has(itemId)
            };
          });
          
          setAllData(updatedData);
          setFilteredData(updatedData);
          console.log('✅ Estados aplicados aos dados:', updatedData.filter(item => item.isExported).length, 'produtos exportados');
        }
      } catch (error) {
        console.error('❌ Erro ao carregar estados de seleção:', error);
        
        // Fallback para localStorage em caso de erro
        if (currentUser?.id) {
          const localSelected = localStorage.getItem(`selectedProducts_${currentUser.id}`);
          const localExported = localStorage.getItem(`exportedProducts_${currentUser.id}`);
          
          if (localSelected) {
            const selectedSet = new Set(JSON.parse(localSelected));
            setSelectedProducts(selectedSet);
            console.log('📱 Estados carregados do localStorage (fallback):', selectedSet.size);
          }
          
          if (localExported) {
            const exportedSet = new Set(JSON.parse(localExported));
            setExportedProducts(exportedSet);
            console.log('📱 Estados carregados do localStorage (fallback):', exportedSet.size);
          }
        }
      }
    };

    loadSelectionStates();
  }, [currentUser?.id, allData.length]); // Adicionado allData.length como dependência

  // Escutar mudanças em tempo real do Firebase
  useEffect(() => {
    const unsubscribe = subscribeToCotacoes((cotacoes: CotacaoDocument[]) => {
      const cotacaoItems = cotacoes.map(convertToCotacaoItem);
      
      setAllData(cotacaoItems);
      console.log('🔄 Dados atualizados em tempo real:', cotacaoItems.length, 'itens');
    });

    return () => unsubscribe();
  }, []); // Removidas dependências desnecessárias

  // Reset filtros sempre que os dados forem carregados
  useEffect(() => {
    if (allData.length > 0) {
      console.log('🔄 Dados carregados, resetando filtros e exibindo todos os produtos');
      setShowOnlyExported(false);
      setShowOnlySelected(false);
      setShowOnlyWithComments(false);
      setSortOptions({ field: null, direction: null });
      setFilteredData(allData);
    }
  }, [allData]);

  // Aplicar filtros de produtos exportados, selecionados e com comentários quando o estado mudar
  useEffect(() => {
    const filteredByExported = applyExportedFilter(allData);
    const sortedData = sortData(filteredByExported, sortOptions);
    setFilteredData(sortedData);
  }, [showOnlyExported, showOnlySelected, showOnlyWithComments, exportedProducts, selectedProducts, comments, allData, sortOptions]);

  // Função para aplicar filtros
  const handleFilterChange = (newFilteredData: CotacaoItem[]) => {
    const sortedData = sortData(newFilteredData, sortOptions);
    setFilteredData(sortedData);
  };

  // Função para filtrar por REF específica
  const filterByRef = (ref: string) => {
    const filteredByRef = allData.filter(item => 
      item.referencia.toLowerCase().includes(ref.toLowerCase())
    );
    const sortedData = sortData(filteredByRef, sortOptions);
    setFilteredData(sortedData);
  };

  // Função para ordenação
  const handleSort = (field: keyof CotacaoItem) => {
    const newDirection = getNextSortDirection(sortOptions.field, sortOptions.direction, field);
    const newSortOptions: SortOptions = {
      field,
      direction: newDirection
    };
    
    setSortOptions(newSortOptions);
    
    // Aplicar ordenação aos dados filtrados
    const sortedData = sortData(filteredData, newSortOptions);
    setFilteredData(sortedData);
  };

  // Função para aplicar filtros de produtos exportados, selecionados e com comentários
  const applyExportedFilter = (data: CotacaoItem[]) => {
    let filteredData = data;
    
    if (showOnlyExported) {
      filteredData = filteredData.filter(item => {
        const productId = `${item.PHOTO_NO}-${item.referencia}`;
        return exportedProducts.has(productId);
      });
    }
    
    if (showOnlySelected) {
      filteredData = filteredData.filter(item => {
        const productId = `${item.PHOTO_NO}-${item.referencia}`;
        return selectedProducts.has(productId);
      });
    }
    
    if (showOnlyWithComments) {
      filteredData = filteredData.filter(item => {
        const productId = `${item.PHOTO_NO}-${item.referencia}`;
        return comments.some(comment => comment.productId === productId);
      });
    }
    
    return filteredData;
  };

  const handleImportComplete = async (importedData: CotacaoItem[]) => {
    try {
      setIsLoading(true);
      
      console.log('🔄 Processando importação de', importedData.length, 'itens...');
      
      // Salvar dados importados no Firebase (com validação de duplicatas)
      const savedIds = await addMultipleCotacoes(importedData);
      
      // Calcular estatísticas da importação
      const totalImported = importedData.length;
      const actuallySaved = savedIds.length;
      const duplicatesIgnored = totalImported - actuallySaved;
      
      console.log('📊 Estatísticas da importação:', {
        total: totalImported,
        salvos: actuallySaved,
        duplicatas: duplicatesIgnored
      });
      
      // Mostrar resultado da importação
      if (actuallySaved > 0 && duplicatesIgnored > 0) {
        showInfo(
          'Importação Concluída', 
          `${actuallySaved} produto(s) importado(s) com sucesso. ${duplicatesIgnored} produto(s) duplicado(s) foram ignorados.`
        );
      } else if (actuallySaved > 0) {
        showSuccess('Importação Concluída', `${actuallySaved} produto(s) importado(s) com sucesso.`);
      } else if (duplicatesIgnored > 0) {
        showWarning('Nenhum Produto Novo', `Todos os ${duplicatesIgnored} produto(s) já existem no sistema.`);
      } else {
        showWarning('Importação Vazia', 'Nenhum produto foi importado.');
      }
      
      setShowImportModal(false);
    } catch (error) {
      console.error('Erro ao salvar dados importados:', error);
      showError('Erro na Importação', 'Erro ao salvar dados importados. Verifique o console para mais detalhes.');
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
      showError('Erro na Atualização', 'Erro ao atualizar item. Verifique o console para mais detalhes.');
    }
  };

  const handleDeleteItem = async (item: CotacaoItem) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  // Função auxiliar para excluir um produto individual com tratamento de erro robusto
  const deleteSingleProduct = async (item: CotacaoItem): Promise<{
    success: boolean;
    commentsDeleted: number;
    notificationsDeleted: number;
    error?: string;
  }> => {
    try {
      const itemId = `${item.PHOTO_NO}-${item.referencia}`;
      console.log(`🗑️ Excluindo produto: ${itemId}`);
      
      // Buscar o documento no Firebase
      const cotacoes = await getCotacoes();
      const cotacaoDoc = cotacoes.find(doc => 
        doc.PHOTO_NO === item.PHOTO_NO && doc.referencia === item.referencia
      );

      if (!cotacaoDoc) {
        return {
          success: false,
          commentsDeleted: 0,
          notificationsDeleted: 0,
          error: `Documento não encontrado no Firebase: ${itemId}`
        };
      }

      // Gerar ID do produto para buscar comentários e notificações
      const productId = commentsService.generateProductId(item.PHOTO_NO, item.referencia);
      
      let commentsDeleted = 0;
      let notificationsDeleted = 0;
      
      // Excluir comentários associados ao produto
      try {
        commentsDeleted = await commentsService.deleteCommentsByProductId(productId);
        console.log(`✅ Excluídos ${commentsDeleted} comentários para: ${itemId}`);
      } catch (commentError) {
        console.error(`❌ Erro ao excluir comentários de ${itemId}:`, commentError);
        // Continuar mesmo se falhar na exclusão de comentários
      }
      
      // Excluir notificações associadas ao produto
      try {
        notificationsDeleted = await notificationsService.deleteNotificationsByProductId(productId);
        console.log(`✅ Excluídas ${notificationsDeleted} notificações para: ${itemId}`);
      } catch (notificationError) {
        console.error(`❌ Erro ao excluir notificações de ${itemId}:`, notificationError);
        // Continuar mesmo se falhar na exclusão de notificações
      }
      
      // Excluir produto do Firebase
      await deleteCotacao(cotacaoDoc.id);
      console.log(`✅ Produto excluído do Firebase: ${itemId}`);
      
      return {
        success: true,
        commentsDeleted,
        notificationsDeleted
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`❌ Erro ao excluir produto ${item.PHOTO_NO}-${item.referencia}:`, error);
      return {
        success: false,
        commentsDeleted: 0,
        notificationsDeleted: 0,
        error: errorMessage
      };
    }
  };

  const handleDeleteMultipleItems = async (items: CotacaoItem[], onProgress?: (progress: number) => void) => {
    try {
      const totalItems = items.length;
      let totalCommentsDeleted = 0;
      let totalNotificationsDeleted = 0;
      let successfullyDeleted = 0;
      let failedDeletions: string[] = [];
      
      console.log(`🔄 Iniciando exclusão de ${totalItems} produtos...`);
      
      // Excluir cada item usando a função auxiliar
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemId = `${item.PHOTO_NO}-${item.referencia}`;
        
        const result = await deleteSingleProduct(item);
        
        if (result.success) {
          successfullyDeleted++;
          totalCommentsDeleted += result.commentsDeleted;
          totalNotificationsDeleted += result.notificationsDeleted;
        } else {
          failedDeletions.push(itemId);
          console.warn(`⚠️ Falha ao excluir ${itemId}: ${result.error}`);
        }
        
        // Atualizar progresso
        const progress = Math.round(((i + 1) / totalItems) * 100);
        onProgress?.(progress);
        
        // Pequeno delay para mostrar o progresso
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      console.log(`📊 Resultado da exclusão:`, {
        total: totalItems,
        sucesso: successfullyDeleted,
        falhas: failedDeletions.length,
        comentarios: totalCommentsDeleted,
        notificacoes: totalNotificationsDeleted
      });
      
      // Atualizar os dados locais apenas para os itens que foram excluídos com sucesso
      const successfullyDeletedIds = items
        .filter(item => !failedDeletions.includes(`${item.PHOTO_NO}-${item.referencia}`))
        .map(item => `${item.PHOTO_NO}-${item.referencia}`);
      
      setAllData(prev => prev.filter(i => !successfullyDeletedIds.includes(`${i.PHOTO_NO}-${i.referencia}`)));
      setFilteredData(prev => prev.filter(i => !successfullyDeletedIds.includes(`${i.PHOTO_NO}-${i.referencia}`)));
      
      setShowEditModal(false);
      
      // Mensagem de resultado detalhada
      if (successfullyDeleted === totalItems) {
        // Todos os itens foram excluídos com sucesso
        let successMessage = `${successfullyDeleted} produto(s) excluído(s) com sucesso!`;
        const additionalItems = [];
        
        if (totalCommentsDeleted > 0) {
          additionalItems.push(`${totalCommentsDeleted} comentário(s)`);
        }
        
        if (totalNotificationsDeleted > 0) {
          additionalItems.push(`${totalNotificationsDeleted} notificação(ões)`);
        }
        
        if (additionalItems.length > 0) {
          successMessage = `${successfullyDeleted} produto(s) e ${additionalItems.join(', ')} excluído(s) com sucesso!`;
        }
        
        showSuccess('Exclusão Concluída', successMessage);
      } else if (successfullyDeleted > 0) {
        // Alguns itens foram excluídos, outros falharam
        const failedCount = failedDeletions.length;
        let message = `${successfullyDeleted} de ${totalItems} produto(s) excluído(s) com sucesso.`;
        
        if (failedCount > 0) {
          message += ` ${failedCount} produto(s) não puderam ser excluídos.`;
        }
        
        showWarning('Exclusão Parcial', message);
        
        // Log detalhado das falhas
        console.warn('Produtos que falharam na exclusão:', failedDeletions);
      } else {
        // Nenhum item foi excluído
        showError('Falha na Exclusão', 'Nenhum produto pôde ser excluído. Verifique o console para mais detalhes.');
      }
      
    } catch (error) {
      console.error('❌ Erro geral ao excluir itens:', error);
      showError('Erro na Exclusão', 'Erro ao excluir itens. Verifique o console para mais detalhes.');
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const result = await deleteSingleProduct(itemToDelete);
      
      if (result.success) {
        // Atualizar dados locais
        setAllData(prev => prev.filter(item => 
          !(item.PHOTO_NO === itemToDelete.PHOTO_NO && item.referencia === itemToDelete.referencia)
        ));
        setFilteredData(prev => prev.filter(item => 
          !(item.PHOTO_NO === itemToDelete.PHOTO_NO && item.referencia === itemToDelete.referencia)
        ));
        
        // Mensagem de sucesso incluindo comentários e notificações excluídos
        let successMessage = 'Produto excluído com sucesso!';
        const additionalItems = [];
        
        if (result.commentsDeleted > 0) {
          additionalItems.push(`${result.commentsDeleted} comentário(s)`);
        }
        
        if (result.notificationsDeleted > 0) {
          additionalItems.push(`${result.notificationsDeleted} notificação(ões)`);
        }
        
        if (additionalItems.length > 0) {
          successMessage = `Produto e ${additionalItems.join(', ')} excluído(s) com sucesso!`;
        }
        
        showSuccess('Exclusão Concluída', successMessage);
      } else {
        showError('Erro na Exclusão', `Erro ao excluir produto: ${result.error}`);
      }
      
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      showError('Erro na Exclusão', 'Erro ao excluir produto. Verifique o console para mais detalhes.');
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const handleAddComment = async (productId: string, message: string, imageUrls: string[], mentionedUsers?: string[]) => {
    if (!currentUser) {
      showWarning('Login Necessário', 'Você precisa estar logado para comentar.');
      return;
    }

    try {
      // Encontrar o produto para obter suas informações
      const product = allData.find(item => `${item.PHOTO_NO}-${item.referencia}` === productId);
      
      if (product) {
        const productInfo = {
          shopNo: product.SHOP_NO,
          ref: product.referencia,
          description: product.description
        };
        
        await addComment(productId, message, imageUrls, currentUser, productInfo, mentionedUsers);
      } else {
        // Fallback se não encontrar o produto
        await addComment(productId, message, imageUrls, currentUser, undefined, mentionedUsers);
      }
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      showError('Erro no Comentário', `Erro ao adicionar comentário: ${errorMessage}`);
    }
  };

  // Funções para gerenciar seleção de produtos
  const toggleProductSelection = async (productId: string) => {
    const newSelectedProducts = new Set(selectedProducts);
    if (newSelectedProducts.has(productId)) {
      newSelectedProducts.delete(productId);
    } else {
      newSelectedProducts.add(productId);
    }
    
    setSelectedProducts(newSelectedProducts);

    // Salvar no Firebase e localStorage
    if (currentUser?.id) {
      try {
        await productSelectionService.updateSelectedProducts(currentUser.id, newSelectedProducts);
        
        // Backup no localStorage
        localStorage.setItem(`selectedProducts_${currentUser.id}`, JSON.stringify(Array.from(newSelectedProducts)));
        console.log('💾 Estados salvos no localStorage (selecionados):', newSelectedProducts.size);
      } catch (error) {
        console.error('Erro ao salvar seleção:', error);
        
        // Fallback: salvar apenas no localStorage
        localStorage.setItem(`selectedProducts_${currentUser.id}`, JSON.stringify(Array.from(newSelectedProducts)));
        console.log('📱 Estados salvos apenas no localStorage (fallback)');
      }
    }
  };

  const selectAllProducts = async () => {
    const allProductIds = filteredData.map(item => `${item.PHOTO_NO}-${item.referencia}`);
    const newSelectedProducts = new Set(allProductIds);
    setSelectedProducts(newSelectedProducts);

    // Salvar no Firebase e localStorage
    if (currentUser?.id) {
      try {
        await productSelectionService.updateSelectedProducts(currentUser.id, newSelectedProducts);
        
        // Backup no localStorage
        localStorage.setItem(`selectedProducts_${currentUser.id}`, JSON.stringify(Array.from(newSelectedProducts)));
        console.log('💾 Estados salvos no localStorage (selecionar todos):', newSelectedProducts.size);
      } catch (error) {
        console.error('Erro ao salvar seleção:', error);
        
        // Fallback: salvar apenas no localStorage
        localStorage.setItem(`selectedProducts_${currentUser.id}`, JSON.stringify(Array.from(newSelectedProducts)));
        console.log('📱 Estados salvos apenas no localStorage (fallback)');
      }
    }
  };

  const deselectAllProducts = async () => {
    const newSelectedProducts = new Set<string>();
    setSelectedProducts(newSelectedProducts);

    // Salvar no Firebase e localStorage
    if (currentUser?.id) {
      try {
        await productSelectionService.updateSelectedProducts(currentUser.id, newSelectedProducts);
        
        // Backup no localStorage
        localStorage.setItem(`selectedProducts_${currentUser.id}`, JSON.stringify(Array.from(newSelectedProducts)));
        console.log('💾 Estados salvos no localStorage (desmarcar todos):', newSelectedProducts.size);
      } catch (error) {
        console.error('Erro ao salvar seleção:', error);
        
        // Fallback: salvar apenas no localStorage
        localStorage.setItem(`selectedProducts_${currentUser.id}`, JSON.stringify(Array.from(newSelectedProducts)));
        console.log('📱 Estados salvos apenas no localStorage (fallback)');
      }
    }
  };

  const getSelectedProductsData = (): CotacaoItem[] => {
    return filteredData.filter(item => 
      selectedProducts.has(`${item.PHOTO_NO}-${item.referencia}`)
    );
  };

  // Função para exportar produtos selecionados
  const handleExportSelectedProducts = async () => {
    const selectedData = getSelectedProductsData();
    
    if (selectedData.length === 0) {
      showWarning('Nenhuma Seleção', 'Nenhum produto selecionado para exportação.');
      return;
    }

    setIsExporting(true);
    
    try {
      const filename = formatDateForFilename();
      exportToExcel(selectedData, {
        filename,
        sheetName: 'Produtos Selecionados',
        includeHeaders: true
      });

      // Marcar produtos como exportados e desmarcar seleção
      const exportedIds = selectedData.map(item => `${item.PHOTO_NO}-${item.referencia}`);
      addExportedProducts(exportedIds);
      
      // Adicionar ao contador total de produtos já exportados
      await adicionarProdutos(selectedData.length);
      
      // Adicionar produtos aos contadores por fábrica
      const produtosPorFabrica = new Map<string, { nome: string; quantidade: number }>();
      selectedData.forEach(item => {
        const fabricaId = `${item.SHOP_NO}-${item.nomeContato}-${item.telefoneContato}`;
        const fabricaNome = item.SHOP_NO;
        
        if (produtosPorFabrica.has(fabricaId)) {
          const current = produtosPorFabrica.get(fabricaId)!;
          current.quantidade += 1;
        } else {
          produtosPorFabrica.set(fabricaId, { nome: fabricaNome, quantidade: 1 });
        }
      });
      
      await adicionarProdutosParaFabricas(produtosPorFabrica);
      
      setSelectedProducts(new Set<string>());

      // Salvar estados no Firebase
      if (currentUser?.id) {
        try {
          await productSelectionService.saveSelectionState(
            currentUser.id, 
            new Set<string>(), 
            exportedProducts
          );
        } catch (error) {
          console.error('Erro ao salvar estados de exportação:', error);
        }
      }

      // Atualizar dados locais para refletir o estado de exportação
      setAllData(prev => prev.map(item => {
        const itemId = `${item.PHOTO_NO}-${item.referencia}`;
        if (exportedIds.includes(itemId)) {
          return { ...item, isExported: true, isSelected: false };
        }
        return item;
      }));

      setFilteredData(prev => prev.map(item => {
        const itemId = `${item.PHOTO_NO}-${item.referencia}`;
        if (exportedIds.includes(itemId)) {
          return { ...item, isExported: true, isSelected: false };
        }
        return item;
      }));

      showSuccess('Exportação Concluída', `${selectedData.length} produtos exportados com sucesso!`);
    } catch (error) {
      console.error('Erro ao exportar produtos:', error);
      showError('Erro na Exportação', 'Erro ao exportar produtos. Verifique o console para mais detalhes.');
    } finally {
      setIsExporting(false);
    }
  };

  // Função para exportar base de produtos
  const handleExportBaseProdutos = async () => {
    if (allData.length === 0) {
      showWarning('Nenhum Dado', 'Nenhum produto disponível para exportação da base.');
      return;
    }

    // Filtrar apenas produtos marcados como exportados
    const exportedData = allData.filter(item => {
      const itemId = `${item.PHOTO_NO}-${item.referencia}`;
      return exportedProducts.has(itemId);
    });

    if (exportedData.length === 0) {
      showWarning('Nenhum Produto Exportado', 'Nenhum produto foi marcado como exportado. Selecione e exporte produtos primeiro.');
      return;
    }

    setIsExportingBaseProdutos(true);
    
    try {
      // Usar apenas produtos marcados como exportados
      const baseProdutos = convertCotacoesToBaseProdutos(exportedData);
      
      // Remover duplicatas baseado na referência e fabrica
      const uniqueBaseProdutos = removeDuplicates(baseProdutos);
      
      // Ordenar por fabrica e referencia
      const sortedBaseProdutos = sortBaseProdutos(uniqueBaseProdutos);
      
      const filename = formatDateForBaseProdutosFilename();
      exportBaseProdutosToExcel(sortedBaseProdutos, {
        filename,
        sheetName: 'Base de Produtos',
        includeHeaders: true
      });

      showSuccess('Base de Produtos Exportada', `${sortedBaseProdutos.length} produtos únicos de ${exportedData.length} produtos exportados com sucesso!`);
    } catch (error) {
      console.error('Erro ao exportar base de produtos:', error);
      showError('Erro na Exportação', 'Erro ao exportar base de produtos. Verifique o console para mais detalhes.');
    } finally {
      setIsExportingBaseProdutos(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header 
        className="shadow-sm border-b border-gray-200 p-2 rounded-xl"
        style={{ backgroundColor: '#0175a6af' }}
      >
        <div className="w-full max-w-[1216px] mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo e Título */}
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-primary-200 to-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-4 h-4 sm:w-4 sm:h-4 text-[#0175a6]" />
              </div>
              <div className="min-w-0 flex items-center gap-3">
                <h1 className="text-lg sm:text-xl font-light text-white truncate">
                  Gerenciar Cotações
                </h1>
              </div>
            </div>
            
            {/* Botões de Ação - Desktop */}
            <div className="hidden sm:flex items-center space-x-4">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowImportModal(true)}
                  className="btn-primary bg-[#0175a6] flex items-center gap-2 px-3 py-1.5 text-sm"
                  disabled={isLoading}
                >
                  <Upload className="w-4 h-4" />
                  {isLoading ? 'Carregando...' : 'Importar Planilha'}
                </button>
                
                <button
                  onClick={() => window.open('https://upload-imagens.onrender.com/', '_blank')}
                  className="btn-secondary flex items-center gap-2 px-3 py-1.5 text-sm"
                >
                  <Camera className="w-4 h-4" />
                  Upload Imagens
                </button>
                
                <button
                  onClick={() => setShowEditModal(true)}
                  className="btn-secondary flex items-center gap-2 px-3 py-1.5 text-sm"
                  disabled={isLoading || filteredData.length === 0}
                >
                  <Edit3 className="w-4 h-4" />
                  Excluir Produtos
                </button>

                <button
                  onClick={handleExportSelectedProducts}
                  className="btn-secondary flex items-center gap-2 px-3 py-1.5 text-sm"
                  disabled={isExporting || selectedProducts.size === 0}
                >
                  <Download className="w-4 h-4" />
                  {isExporting ? 'Exportando...' : `Marcar para a Base (${selectedProducts.size})`}
                </button>

                <button
                  onClick={handleExportBaseProdutos}
                  className="btn-primary bg-[#02618a] flex items-center gap-2 px-3 py-1.5 text-sm"
                  disabled={isExportingBaseProdutos || allData.length === 0 || exportedProducts.size === 0}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  {isExportingBaseProdutos ? 'Gerando Base...' : `Base de Produtos (${exportedProducts.size})`}
                </button>
              </div>
              
              <NotificationBell
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onFilterByRef={filterByRef}
              />
            </div>

            {/* Botões de Ação - Mobile */}
            <div className="flex sm:hidden items-center space-x-2">
              <button
                onClick={() => setShowImportModal(true)}
                className="btn-primary flex items-center gap-1 px-2 py-1.5 text-xs"
                disabled={isLoading}
              >
                <Upload className="w-3 h-3" />
                <span className="hidden xs:inline">Importar</span>
              </button>
              
              <button
                onClick={() => window.open('https://upload-imagens.onrender.com/', '_blank')}
                className="btn-secondary flex items-center gap-1 px-2 py-1.5 text-xs"
              >
                <Camera className="w-3 h-3" />
                <span className="hidden xs:inline">Imagens</span>
              </button>
              
              <button
                onClick={() => setShowEditModal(true)}
                className="btn-secondary flex items-center gap-1 px-2 py-1.5 text-xs"
                disabled={isLoading || filteredData.length === 0}
              >
                <Edit3 className="w-3 h-3" />
                <span className="hidden xs:inline">Editar</span>
              </button>

              <button
                onClick={handleExportSelectedProducts}
                className="btn-secondary flex items-center gap-1 px-2 py-1.5 text-xs"
                disabled={isExporting || selectedProducts.size === 0}
              >
                <Download className="w-3 h-3" />
                <span className="hidden xs:inline">{isExporting ? 'Exportando...' : `Exportar (${selectedProducts.size})`}</span>
              </button>
              
              <NotificationBell
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onFilterByRef={filterByRef}
              />
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

        {/* Busca e Filtros */}
        <SearchAndFilters 
          data={allData} 
          onFilterChange={handleFilterChange} 
        />
        
        {/* Controles de Seleção */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                Seleção de Produtos
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{selectedProducts.size} selecionados</span>
                <span className="text-gray-400">•</span>
                <span>{exportedProducts.size} exportados</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={selectAllProducts}
                className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                disabled={filteredData.length === 0}
              >
                Selecionar Todos
              </button>
              <button
                onClick={() => setShowOnlyExported(!showOnlyExported)}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                  showOnlyExported 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
                disabled={exportedProducts.size === 0}
              >
                {showOnlyExported ? 'Mostrar Todos' : 'Apenas Exportados'}
              </button>
              <button
                onClick={() => setShowOnlySelected(!showOnlySelected)}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                  showOnlySelected 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
                disabled={selectedProducts.size === 0}
              >
                {showOnlySelected ? 'Mostrar Todos' : 'Apenas Selecionados'}
              </button>
              <button
                onClick={deselectAllProducts}
                className="px-3 py-1.5 text-xs bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                disabled={selectedProducts.size === 0}
              >
                Desmarcar Todos
              </button>
              <button
                onClick={async () => {
                  showWarning('Confirmar Limpeza', 'Tem certeza que deseja limpar todos os estados de seleção e exportação?', { autoClose: false });
                  // Aqui você pode implementar uma confirmação customizada se necessário
                  // Por enquanto, vamos manter a funcionalidade direta
                  setSelectedProducts(new Set());
                  setExportedProducts(new Set());
                  if (currentUser?.id) {
                    try {
                      await productSelectionService.clearSelectionState(currentUser.id);
                      
                      // Limpar também do localStorage
                      localStorage.removeItem(`selectedProducts_${currentUser.id}`);
                      localStorage.removeItem(`exportedProducts_${currentUser.id}`);
                      console.log('🗑️ Estados limpos do localStorage');
                      
                      showSuccess('Estados Limpos', 'Estados limpos com sucesso!');
                    } catch (error) {
                      console.error('Erro ao limpar estados:', error);
                      
                      // Fallback: limpar apenas do localStorage
                      localStorage.removeItem(`selectedProducts_${currentUser.id}`);
                      localStorage.removeItem(`exportedProducts_${currentUser.id}`);
                      console.log('📱 Estados limpos apenas do localStorage (fallback)');
                      showSuccess('Estados Limpos', 'Estados limpos do localStorage!');
                    }
                  }
                }}
                className="px-3 py-1.5 text-xs bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
                disabled={selectedProducts.size === 0 && exportedProducts.size === 0}
              >
                Limpar Tudo
              </button>
              <button
                onClick={async () => {
                  try {
                    const deletedCount = await notificationsService.deleteAllNotifications();
                    if (deletedCount > 0) {
                      showSuccess('Notificações Zeradas', `${deletedCount} notificação(ões) excluída(s) com sucesso!`);
                    } else {
                      showInfo('Nenhuma Notificação', 'Não há notificações para excluir.');
                    }
                  } catch (error) {
                    console.error('Erro ao zerar notificações:', error);
                    showError('Erro ao Zerar', 'Erro ao excluir notificações. Verifique o console para mais detalhes.');
                  }
                }}
                className="px-3 py-1.5 text-xs bg-orange-50 text-orange-700 rounded-md hover:bg-orange-100 transition-colors"
                title="Excluir todas as notificações do sistema"
              >
                Zerar Notificações
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-light text-gray-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-primary-600" />
              Cotações ({filteredData.length} itens)
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
              <span className="text-blue-700 font-medium">ProdutosJaExportados:</span>
              <span className="text-blue-800 font-semibold">{totalExportados}</span>
            </div>
            <button
              onClick={() => setShowOnlyWithComments(!showOnlyWithComments)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                showOnlyWithComments 
                  ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
              disabled={comments.length === 0}
              title="Mostrar apenas produtos que têm comentários"
            >
              {showOnlyWithComments ? 'Todos os Produtos' : 'Produtos com Comentários'}
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            {filteredData.length !== allData.length && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TrendingUp className="w-5 h-5" />
                <span>
                  Mostrando {filteredData.length} de {allData.length} itens
                </span>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md transition-colors duration-150 flex items-center justify-center"
              title="Atualizar tabela de produtos"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
               Atualizar
            </button>
          </div>
        </div>

        {/* Tabela de Cotações */}
        <div className="cotacoes-table mb-6">
          <CotacoesTable
            data={filteredData}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            isLoading={isLoading}
            comments={comments}
            currentUser={currentUser}
            onAddComment={handleAddComment}
            lightbox={lightbox}
            sortOptions={sortOptions}
            onSort={handleSort}
            selectedProducts={selectedProducts}
            exportedProducts={exportedProducts}
            onToggleProductSelection={toggleProductSelection}
            availableUsers={availableUsers.map(user => ({
              id: user.id,
              name: user.name,
              email: user.email
            }))}
            usersLoading={usersLoading}
          />
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

      {/* Modal de Edição */}
      {showEditModal && (
        <EditCard
          data={filteredData}
          onDeleteSelected={handleDeleteMultipleItems}
          onClose={() => setShowEditModal(false)}
        />
      )}

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
      
      {/* Rodapé */}
      <footer className="bg-gray-50 border-t border-gray-200 py-4 px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Sistema de Gerenciamento de Cotações | Ravi
            </div>
            <div className="text-sm text-gray-600">
             Developed by: Gustavo Santos
            </div>
            <div className="text-sm text-gray-600">
              Última atualização: {formatDateTimeToBrazilian(new Date().toISOString())}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
