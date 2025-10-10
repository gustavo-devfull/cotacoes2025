import { 
  db, 
  COTACOES_COLLECTION, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  collection, 
  query, 
  orderBy, 
  onSnapshot 
} from '../config/firebase';
import { CotacaoItem } from '../types';

// Interface para documento no Firebase (inclui ID)
export interface CotacaoDocument extends CotacaoItem {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Função para adicionar uma nova cotação
export const addCotacao = async (cotacao: CotacaoItem): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COTACOES_COLLECTION), {
      ...cotacao,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Cotação adicionada com ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao adicionar cotação:', error);
    throw error;
  }
};

// Função para buscar todas as cotações
export const getCotacoes = async (): Promise<CotacaoDocument[]> => {
  try {
    const q = query(collection(db, COTACOES_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const cotacoes: CotacaoDocument[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      cotacoes.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as CotacaoDocument);
    });
    
    console.log('Cotações carregadas:', cotacoes.length);
    return cotacoes;
  } catch (error) {
    console.error('Erro ao buscar cotações:', error);
    
    // Verificar se é erro de permissão
    if (error instanceof Error && error.message.includes('permissions')) {
      console.warn('⚠️ Erro de permissões do Firebase. Configure as regras do Firestore.');
      console.warn('📋 Instruções: Verifique o arquivo CONFIGURAR-FIREBASE-RULES.md');
    }
    
    throw error;
  }
};

// Função para atualizar uma cotação
export const updateCotacao = async (id: string, cotacao: Partial<CotacaoItem>): Promise<void> => {
  try {
    const cotacaoRef = doc(db, COTACOES_COLLECTION, id);
    await updateDoc(cotacaoRef, {
      ...cotacao,
      updatedAt: new Date()
    });
    console.log('Cotação atualizada:', id);
  } catch (error) {
    console.error('Erro ao atualizar cotação:', error);
    throw error;
  }
};

// Função para deletar uma cotação
export const deleteCotacao = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COTACOES_COLLECTION, id));
    console.log('Cotação deletada:', id);
  } catch (error) {
    console.error('Erro ao deletar cotação:', error);
    throw error;
  }
};

// Função para adicionar múltiplas cotações (importação) com validação de duplicatas
export const addMultipleCotacoes = async (cotacoes: CotacaoItem[]): Promise<string[]> => {
  try {
    console.log('🔄 Iniciando importação de', cotacoes.length, 'cotações...');
    
    // Buscar cotações existentes para verificar duplicatas
    const existingCotacoes = await getCotacoes();
    const existingReferences = new Set(existingCotacoes.map(cotacao => cotacao.referencia));
    
    console.log('📋 Referências existentes encontradas:', existingReferences.size);
    
    // Filtrar apenas cotações que não são duplicatas
    const newCotacoes = cotacoes.filter(cotacao => {
      const isDuplicate = existingReferences.has(cotacao.referencia);
      if (isDuplicate) {
        console.log('⚠️ Duplicata encontrada:', cotacao.referencia);
      }
      return !isDuplicate;
    });
    
    console.log('✅ Cotações novas para importar:', newCotacoes.length);
    console.log('⚠️ Cotações duplicadas ignoradas:', cotacoes.length - newCotacoes.length);
    
    if (newCotacoes.length === 0) {
      console.log('ℹ️ Nenhuma cotação nova para importar');
      return [];
    }
    
    // Adicionar apenas as cotações novas
    const promises = newCotacoes.map(cotacao => addCotacao(cotacao));
    const ids = await Promise.all(promises);
    
    console.log('✅ Importação concluída:', ids.length, 'cotações adicionadas');
    return ids;
  } catch (error) {
    console.error('❌ Erro ao adicionar múltiplas cotações:', error);
    throw error;
  }
};

// Função para verificar duplicatas antes da importação
export const checkDuplicates = async (cotacoes: CotacaoItem[]): Promise<{
  newItems: CotacaoItem[];
  duplicates: CotacaoItem[];
  duplicateReferences: string[];
}> => {
  try {
    console.log('🔍 Verificando duplicatas para', cotacoes.length, 'cotações...');
    
    // Buscar cotações existentes
    const existingCotacoes = await getCotacoes();
    const existingReferences = new Set(existingCotacoes.map(cotacao => cotacao.referencia));
    
    // Separar novos itens e duplicatas
    const newItems: CotacaoItem[] = [];
    const duplicates: CotacaoItem[] = [];
    const duplicateReferences: string[] = [];
    
    cotacoes.forEach(cotacao => {
      if (existingReferences.has(cotacao.referencia)) {
        duplicates.push(cotacao);
        if (!duplicateReferences.includes(cotacao.referencia)) {
          duplicateReferences.push(cotacao.referencia);
        }
      } else {
        newItems.push(cotacao);
      }
    });
    
    console.log('📊 Resultado da verificação:', {
      novos: newItems.length,
      duplicatas: duplicates.length,
      referenciasDuplicadas: duplicateReferences.length
    });
    
    return {
      newItems,
      duplicates,
      duplicateReferences
    };
  } catch (error) {
    console.error('❌ Erro ao verificar duplicatas:', error);
    throw error;
  }
};

// Função para escutar mudanças em tempo real
export const subscribeToCotacoes = (callback: (cotacoes: CotacaoDocument[]) => void) => {
  const q = query(collection(db, COTACOES_COLLECTION), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (querySnapshot) => {
    const cotacoes: CotacaoDocument[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      cotacoes.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as CotacaoDocument);
    });
    
    callback(cotacoes);
  }, (error) => {
    console.error('Erro na escuta em tempo real:', error);
    
    // Verificar se é erro de permissão
    if (error instanceof Error && error.message.includes('permissions')) {
      console.warn('⚠️ Erro de permissões do Firebase. Configure as regras do Firestore.');
      console.warn('📋 Instruções: Verifique o arquivo CONFIGURAR-FIREBASE-RULES.md');
    }
  });
};

// Função para converter CotacaoDocument para CotacaoItem (remover campos do Firebase)
export const convertToCotacaoItem = (doc: CotacaoDocument): CotacaoItem => {
  const { id, createdAt, updatedAt, ...cotacaoItem } = doc;
  return cotacaoItem;
};

// Função para buscar cotação por ID
export const getCotacaoById = async (id: string): Promise<CotacaoDocument | null> => {
  try {
    const cotacoes = await getCotacoes();
    return cotacoes.find(cotacao => cotacao.id === id) || null;
  } catch (error) {
    console.error('Erro ao buscar cotação por ID:', error);
    throw error;
  }
};

// Função para buscar cotações por SHOP_NO
export const getCotacoesByShop = async (shopNo: string): Promise<CotacaoDocument[]> => {
  try {
    const cotacoes = await getCotacoes();
    return cotacoes.filter(cotacao => cotacao.SHOP_NO === shopNo);
  } catch (error) {
    console.error('Erro ao buscar cotações por loja:', error);
    throw error;
  }
};

// Função para buscar cotações por NUM_COTACAO
export const getCotacoesByNumCotacao = async (numCotacao: string): Promise<CotacaoDocument[]> => {
  try {
    const cotacoes = await getCotacoes();
    return cotacoes.filter(cotacao => cotacao.NUM_COTACAO === numCotacao);
  } catch (error) {
    console.error('Erro ao buscar cotações por número:', error);
    throw error;
  }
};
