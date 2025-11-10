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
import { TrendingUp, Package, Upload, Database, Camera, Edit3, Download, CheckSquare, FileSpreadsheet, ChevronDown, ChevronRight } from 'lucide-react';
import { formatDateTimeToBrazilian } from '../utils/dateUtils';
import { sortData, getNextSortDirection } from '../utils/sortUtils';
import { exportBaseProdutosToExcel, formatDateForBaseProdutosFilename } from '../utils/excelExport';
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
  const [isAjustesExpanded, setIsAjustesExpanded] = useState(false);
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
  const { adicionarProdutos } = useProdutosJaExportados();
  const { adicionarProdutosParaFabricas } = useProdutosExportadosPorFabrica();
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingBaseProdutos, setIsExportingBaseProdutos] = useState(false);
  const [showOnlyExported, setShowOnlyExported] = useState(false);
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
        const states = await productSelectionService.loadSelectionState(currentUser.id);
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
      setSortOptions({ field: null, direction: null });
      setFilteredData(allData);
    }
  }, [allData]);

  // Aplicar filtro de produtos exportados quando o estado mudar
  useEffect(() => {
    let filteredData = applyExportedFilter(allData);
    
    // Aplicar filtro de comentários
    if (showOnlyWithComments) {
      filteredData = filteredData.filter(item => {
        const productId = `${item.PHOTO_NO}-${item.referencia}`;
        return comments.some(comment => comment.productId === productId);
      });
    }
    
    const sortedData = sortData(filteredData, sortOptions);
    setFilteredData(sortedData);
  }, [showOnlyExported, exportedProducts, allData, sortOptions, showOnlyWithComments, comments]);

  // Função para aplicar filtros
  const handleFilterChange = (newFilteredData: CotacaoItem[]) => {
    let filteredData = newFilteredData;
    
    // Aplicar filtro de comentários
    if (showOnlyWithComments) {
      filteredData = filteredData.filter(item => {
        const productId = `${item.PHOTO_NO}-${item.referencia}`;
        return comments.some(comment => comment.productId === productId);
      });
    }
    
    const sortedData = sortData(filteredData, sortOptions);
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

  // Função para aplicar filtro de produtos exportados
  const applyExportedFilter = (data: CotacaoItem[]) => {
    if (showOnlyExported) {
      return data.filter(item => {
        const productId = `${item.PHOTO_NO}-${item.referencia}`;
        return exportedProducts.has(productId);
      });
    }
    return data;
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

    // Salvar no Firebase
    if (currentUser?.id) {
      try {
        await productSelectionService.updateSelectedProducts(currentUser.id, newSelectedProducts);
      } catch (error) {
        console.error('Erro ao salvar seleção:', error);
      }
    }
  };

  const selectAllProducts = async () => {
    const allProductIds = filteredData.map(item => `${item.PHOTO_NO}-${item.referencia}`);
    const newSelectedProducts = new Set(allProductIds);
    setSelectedProducts(newSelectedProducts);

    // Salvar no Firebase
    if (currentUser?.id) {
      try {
        await productSelectionService.updateSelectedProducts(currentUser.id, newSelectedProducts);
      } catch (error) {
        console.error('Erro ao salvar seleção:', error);
      }
    }
  };

  const deselectAllProducts = async () => {
    const newSelectedProducts = new Set<string>();
    setSelectedProducts(newSelectedProducts);

    // Salvar no Firebase
    if (currentUser?.id) {
      try {
        await productSelectionService.updateSelectedProducts(currentUser.id, newSelectedProducts);
      } catch (error) {
        console.error('Erro ao salvar seleção:', error);
      }
    }
  };

  const getSelectedProductsData = (): CotacaoItem[] => {
    return filteredData.filter(item => 
      selectedProducts.has(`${item.PHOTO_NO}-${item.referencia}`)
    );
  };

  // Função para marcar produtos selecionados como exportados
  const handleExportSelectedProducts = async () => {
    const selectedData = getSelectedProductsData();
    
    if (selectedData.length === 0) {
      showWarning('Nenhuma Seleção', 'Nenhum produto selecionado para marcar como exportado.');
      return;
    }

    setIsExporting(true);
    
    try {
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

      showSuccess('Produtos Marcados', `${selectedData.length} produtos marcados como exportados com sucesso!`);
    } catch (error) {
      console.error('Erro ao marcar produtos:', error);
      showError('Erro na Marcação', 'Erro ao marcar produtos como exportados. Verifique o console para mais detalhes.');
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
      await exportBaseProdutosToExcel(sortedBaseProdutos, {
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
      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-3">
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

        {/* Card de Ajustes Recolhível */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          {/* Header do Card Ajustes */}
          <div 
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setIsAjustesExpanded(!isAjustesExpanded)}
          >
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Ajustes
              </h2>
              <span className="text-sm text-gray-500">Controles e configurações</span>
            </div>
            <div className="flex items-center gap-2">
              {isAjustesExpanded ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>

          {/* Conteúdo Recolhível - Controles de Ajustes */}
          {isAjustesExpanded && (
            <div className="border-t border-gray-200 p-4 space-y-4">
              {/* Card Gerenciar Cotações */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-3">
                  <Package className="w-4 h-4" />
                  Gerenciar Cotações
                </h3>
                
                {/* Botões de Ação - Desktop */}
                <div className="hidden sm:block">
                  {/* Primeira linha: Botões de Ação */}
                  <div className="flex gap-3 mb-3">
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
                    
                    {/* Sino de Notificações */}
                    <NotificationBell
                      notifications={notifications}
                      unreadCount={unreadCount}
                      onMarkAsRead={markAsRead}
                      onMarkAllAsRead={markAllAsRead}
                      onFilterByRef={filterByRef}
                    />
                  </div>
                </div>

                {/* Botões de Ação - Mobile */}
                <div className="flex sm:hidden items-center justify-between">
                  <div className="flex items-center space-x-2">
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

                    <button
                      onClick={handleExportBaseProdutos}
                      className="btn-primary bg-[#02618a] flex items-center gap-1 px-2 py-1.5 text-xs"
                      disabled={isExportingBaseProdutos || allData.length === 0 || exportedProducts.size === 0}
                    >
                      <FileSpreadsheet className="w-3 h-3" />
                      <span className="hidden xs:inline">{isExportingBaseProdutos ? 'Gerando...' : `Base (${exportedProducts.size})`}</span>
                    </button>
                    
                    {/* Sino de Notificações - Mobile */}
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

              {/* Card de Busca */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Buscar
                </h3>
                <SearchAndFilters 
                  data={allData} 
                  onFilterChange={handleFilterChange} 
                />
              </div>

              {/* Card de Seleção de Produtos */}
              <div className="bg-gray-50 rounded-lg p-4">
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
                      onClick={deselectAllProducts}
                      className="px-3 py-1.5 text-xs bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                      disabled={selectedProducts.size === 0}
                    >
                      Desmarcar Todos
                    </button>
                    <button
                      onClick={async () => {
                        showWarning('Confirmar Limpeza', 'Tem certeza que deseja limpar todos os estados de seleção e exportação?', { autoClose: false });
                        setSelectedProducts(new Set());
                        setExportedProducts(new Set());
                        if (currentUser?.id) {
                          try {
                            await productSelectionService.clearSelectionState(currentUser.id);
                            showSuccess('Estados Limpos', 'Estados limpos com sucesso!');
                          } catch (error) {
                            console.error('Erro ao limpar estados:', error);
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
            </div>
          )}
        </div>

        {/* Card de Cotações - Sempre Visível */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-light text-gray-900 flex items-center gap-2">
                <Package className="w-6 h-6 text-primary-600" />
                Tabela de Produtos
              </h2>
              
              {/* Filtro para produtos com comentários */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showOnlyWithComments"
                  checked={showOnlyWithComments}
                  onChange={(e) => setShowOnlyWithComments(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label 
                  htmlFor="showOnlyWithComments" 
                  className="text-sm text-gray-700 cursor-pointer select-none"
                >
                  Apenas produtos com comentários
                </label>
              </div>
            </div>
            
            {filteredData.length !== allData.length && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TrendingUp className="w-5 h-5" />
                <span>
                  Mostrando {filteredData.length} de {allData.length} itens
                </span>
              </div>
            )}
          </div>
          
          {/* Tabela de Cotações */}
          <div className="cotacoes-table">
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
        <div className="w-full">
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
