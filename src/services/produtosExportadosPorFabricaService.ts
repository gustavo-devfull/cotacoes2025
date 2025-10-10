import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface ProdutosExportadosPorFabrica {
  fabricaId: string;
  fabricaNome: string;
  totalExportados: number;
  ultimaAtualizacao: Date;
}

export class ProdutosExportadosPorFabricaService {
  private static readonly COLLECTION_NAME = 'produtosExportadosPorFabrica';

  /**
   * Obter o total de produtos exportados para uma fábrica específica
   */
  static async getTotalExportadosPorFabrica(fabricaId: string): Promise<number> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, fabricaId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as ProdutosExportadosPorFabrica;
        console.log(`📊 Total de produtos exportados para fábrica ${fabricaId}:`, data.totalExportados);
        return data.totalExportados;
      } else {
        console.log(`📊 Nenhum produto exportado encontrado para fábrica ${fabricaId}, inicializando com 0`);
        return 0;
      }
    } catch (error) {
      console.error(`❌ Erro ao carregar total de produtos exportados para fábrica ${fabricaId}:`, error);
      return 0;
    }
  }

  /**
   * Obter totais de produtos exportados para múltiplas fábricas
   */
  static async getTotaisExportadosPorFabricas(fabricaIds: string[]): Promise<Map<string, number>> {
    const totais = new Map<string, number>();
    
    try {
      const promises = fabricaIds.map(async (fabricaId) => {
        const total = await this.getTotalExportadosPorFabrica(fabricaId);
        totais.set(fabricaId, total);
      });
      
      await Promise.all(promises);
      console.log('📊 Totais de produtos exportados por fábrica carregados:', totais);
      return totais;
    } catch (error) {
      console.error('❌ Erro ao carregar totais de produtos exportados por fábrica:', error);
      return totais;
    }
  }

  /**
   * Adicionar produtos exportados para uma fábrica específica
   */
  static async adicionarProdutosExportadosParaFabrica(
    fabricaId: string, 
    fabricaNome: string, 
    quantidade: number
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, fabricaId);
      
      // Verificar se o documento existe
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        // Atualizar contador existente
        await updateDoc(docRef, {
          totalExportados: increment(quantidade),
          ultimaAtualizacao: new Date()
        });
        console.log(`📊 Adicionados ${quantidade} produtos ao contador da fábrica ${fabricaNome}`);
      } else {
        // Criar documento se não existir
        await setDoc(docRef, {
          fabricaId,
          fabricaNome,
          totalExportados: quantidade,
          ultimaAtualizacao: new Date()
        });
        console.log(`📊 Criado contador para fábrica ${fabricaNome} com ${quantidade} produtos`);
      }
    } catch (error) {
      console.error(`❌ Erro ao adicionar produtos ao contador da fábrica ${fabricaNome}:`, error);
      throw error;
    }
  }

  /**
   * Adicionar produtos exportados para múltiplas fábricas
   */
  static async adicionarProdutosExportadosParaFabricas(
    produtosPorFabrica: Map<string, { nome: string; quantidade: number }>
  ): Promise<void> {
    try {
      const promises = Array.from(produtosPorFabrica.entries()).map(([fabricaId, data]) => 
        this.adicionarProdutosExportadosParaFabrica(fabricaId, data.nome, data.quantidade)
      );
      
      await Promise.all(promises);
      console.log('📊 Produtos exportados adicionados para todas as fábricas');
    } catch (error) {
      console.error('❌ Erro ao adicionar produtos exportados para fábricas:', error);
      throw error;
    }
  }

  /**
   * Resetar contador de uma fábrica específica
   */
  static async resetarContadorFabrica(fabricaId: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, fabricaId);
      await setDoc(docRef, {
        fabricaId,
        fabricaNome: '',
        totalExportados: 0,
        ultimaAtualizacao: new Date()
      });
      console.log(`📊 Contador da fábrica ${fabricaId} resetado`);
    } catch (error) {
      console.error(`❌ Erro ao resetar contador da fábrica ${fabricaId}:`, error);
      throw error;
    }
  }

  /**
   * Resetar todos os contadores de fábricas
   */
  static async resetarTodosContadores(): Promise<void> {
    try {
      // Esta função seria implementada se necessário
      console.log('📊 Resetar todos os contadores de fábricas');
    } catch (error) {
      console.error('❌ Erro ao resetar todos os contadores:', error);
      throw error;
    }
  }
}
