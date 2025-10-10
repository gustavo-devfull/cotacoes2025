import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface ProdutosJaExportadosData {
  totalExportados: number;
  ultimaAtualizacao: Date;
}

export class ProdutosJaExportadosService {
  private static readonly COLLECTION_NAME = 'produtosJaExportados';
  private static readonly DOCUMENT_ID = 'total';

  /**
   * Obter o total de produtos já exportados
   */
  static async getTotalExportados(): Promise<number> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, this.DOCUMENT_ID);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as ProdutosJaExportadosData;
        console.log('📊 Total de produtos já exportados carregado:', data.totalExportados);
        return data.totalExportados;
      } else {
        console.log('📊 Nenhum produto exportado encontrado, inicializando com 0');
        await this.initializeCounter();
        return 0;
      }
    } catch (error) {
      console.error('❌ Erro ao carregar total de produtos exportados:', error);
      return 0;
    }
  }

  /**
   * Adicionar produtos ao contador total
   */
  static async adicionarProdutosExportados(quantidade: number): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, this.DOCUMENT_ID);
      
      // Verificar se o documento existe
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        // Atualizar contador existente
        await updateDoc(docRef, {
          totalExportados: increment(quantidade),
          ultimaAtualizacao: new Date()
        });
        console.log(`📊 Adicionados ${quantidade} produtos ao contador total`);
      } else {
        // Criar documento se não existir
        await this.initializeCounter();
        await updateDoc(docRef, {
          totalExportados: increment(quantidade),
          ultimaAtualizacao: new Date()
        });
        console.log(`📊 Inicializado contador e adicionados ${quantidade} produtos`);
      }
    } catch (error) {
      console.error('❌ Erro ao adicionar produtos ao contador total:', error);
      throw error;
    }
  }

  /**
   * Inicializar contador se não existir
   */
  private static async initializeCounter(): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, this.DOCUMENT_ID);
      await setDoc(docRef, {
        totalExportados: 0,
        ultimaAtualizacao: new Date()
      });
      console.log('📊 Contador de produtos exportados inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar contador:', error);
      throw error;
    }
  }

  /**
   * Resetar contador total (para casos especiais)
   */
  static async resetarContador(): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, this.DOCUMENT_ID);
      await setDoc(docRef, {
        totalExportados: 0,
        ultimaAtualizacao: new Date()
      });
      console.log('📊 Contador de produtos exportados resetado');
    } catch (error) {
      console.error('❌ Erro ao resetar contador:', error);
      throw error;
    }
  }
}
