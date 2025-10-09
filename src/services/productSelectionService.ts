import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface ProductSelectionState {
  id: string;
  userId: string;
  selectedProducts: string[];
  exportedProducts: string[];
  lastUpdated: Date;
}

const COLLECTION_NAME = 'productSelections';

export const productSelectionService = {
  // Salvar estado de seleção e exportação
  async saveSelectionState(
    userId: string, 
    selectedProducts: Set<string>, 
    exportedProducts: Set<string>
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, userId);
      const state: Omit<ProductSelectionState, 'id'> = {
        userId,
        selectedProducts: Array.from(selectedProducts),
        exportedProducts: Array.from(exportedProducts),
        lastUpdated: new Date()
      };

      await setDoc(docRef, {
        ...state,
        lastUpdated: serverTimestamp()
      }, { merge: true });

      console.log('Estado de seleção salvo com sucesso');
    } catch (error) {
      console.error('Erro ao salvar estado de seleção:', error);
      throw error;
    }
  },

  // Carregar estado de seleção e exportação
  async loadSelectionState(userId: string): Promise<{
    selectedProducts: Set<string>;
    exportedProducts: Set<string>;
  }> {
    try {
      const docRef = doc(db, COLLECTION_NAME, userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          selectedProducts: new Set(data.selectedProducts || []),
          exportedProducts: new Set(data.exportedProducts || [])
        };
      }

      // Retorna sets vazios se não encontrar dados
      return {
        selectedProducts: new Set<string>(),
        exportedProducts: new Set<string>()
      };
    } catch (error) {
      console.error('Erro ao carregar estado de seleção:', error);
      // Retorna sets vazios em caso de erro
      return {
        selectedProducts: new Set<string>(),
        exportedProducts: new Set<string>()
      };
    }
  },

  // Atualizar apenas produtos selecionados
  async updateSelectedProducts(userId: string, selectedProducts: Set<string>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, userId);
      await updateDoc(docRef, {
        selectedProducts: Array.from(selectedProducts),
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar produtos selecionados:', error);
      throw error;
    }
  },

  // Atualizar apenas produtos exportados
  async updateExportedProducts(userId: string, exportedProducts: Set<string>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, userId);
      await updateDoc(docRef, {
        exportedProducts: Array.from(exportedProducts),
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar produtos exportados:', error);
      throw error;
    }
  },

  // Escutar mudanças em tempo real
  subscribeToSelectionState(
    userId: string,
    callback: (state: { selectedProducts: Set<string>; exportedProducts: Set<string> }) => void
  ): () => void {
    const docRef = doc(db, COLLECTION_NAME, userId);
    
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        callback({
          selectedProducts: new Set(data.selectedProducts || []),
          exportedProducts: new Set(data.exportedProducts || [])
        });
      } else {
        // Documento não existe, retorna sets vazios
        callback({
          selectedProducts: new Set<string>(),
          exportedProducts: new Set<string>()
        });
      }
    }, (error) => {
      console.error('Erro ao escutar mudanças no estado de seleção:', error);
      // Em caso de erro, retorna sets vazios
      callback({
        selectedProducts: new Set<string>(),
        exportedProducts: new Set<string>()
      });
    });
  },

  // Limpar todos os estados (útil para reset)
  async clearSelectionState(userId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, userId);
      await setDoc(docRef, {
        userId,
        selectedProducts: [],
        exportedProducts: [],
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao limpar estado de seleção:', error);
      throw error;
    }
  }
};
