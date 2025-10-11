import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ProdutosExportadosPorFabricaService } from '../services/produtosExportadosPorFabricaService';

interface ProdutosExportadosPorFabricaContextType {
  contadoresPorFabrica: Map<string, number>;
  isLoading: boolean;
  carregarContadoresPorFabricas: (fabricaIds: string[]) => Promise<void>;
  adicionarProdutosParaFabrica: (fabricaId: string, fabricaNome: string, quantidade: number) => Promise<void>;
  adicionarProdutosParaFabricas: (produtosPorFabrica: Map<string, { nome: string; quantidade: number }>) => Promise<void>;
  resetarContadorFabrica: (fabricaId: string) => Promise<void>;
  getTotalPorFabrica: (fabricaId: string) => number;
}

const ProdutosExportadosPorFabricaContext = createContext<ProdutosExportadosPorFabricaContextType | undefined>(undefined);

export const useProdutosExportadosPorFabrica = () => {
  const context = useContext(ProdutosExportadosPorFabricaContext);
  if (context === undefined) {
    throw new Error('useProdutosExportadosPorFabrica must be used within a ProdutosExportadosPorFabricaProvider');
  }
  return context;
};

interface ProdutosExportadosPorFabricaProviderProps {
  children: ReactNode;
}

export const ProdutosExportadosPorFabricaProvider: React.FC<ProdutosExportadosPorFabricaProviderProps> = ({ children }) => {
  const [contadoresPorFabrica, setContadoresPorFabrica] = useState<Map<string, number>>(new Map());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const carregarContadoresPorFabricas = async (fabricaIds: string[]) => {
    try {
      setIsLoading(true);
      const totais = await ProdutosExportadosPorFabricaService.getTotaisExportadosPorFabricas(fabricaIds);
      setContadoresPorFabrica(totais);
      console.log('📊 Contadores por fábrica carregados no contexto:', totais);
    } catch (error) {
      console.error('❌ Erro ao carregar contadores por fábrica:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const adicionarProdutosParaFabrica = async (fabricaId: string, fabricaNome: string, quantidade: number) => {
    try {
      await ProdutosExportadosPorFabricaService.adicionarProdutosExportadosParaFabrica(fabricaId, fabricaNome, quantidade);
      setContadoresPorFabrica(prev => {
        const newMap = new Map(prev);
        const currentTotal = newMap.get(fabricaId) || 0;
        newMap.set(fabricaId, currentTotal + quantidade);
        return newMap;
      });
      console.log(`📊 Adicionados ${quantidade} produtos ao contador da fábrica ${fabricaNome}. Novo total: ${(contadoresPorFabrica.get(fabricaId) || 0) + quantidade}`);
    } catch (error) {
      console.error('❌ Erro ao adicionar produtos ao contador da fábrica:', error);
      throw error;
    }
  };

  const adicionarProdutosParaFabricas = async (produtosPorFabrica: Map<string, { nome: string; quantidade: number }>) => {
    try {
      await ProdutosExportadosPorFabricaService.adicionarProdutosExportadosParaFabricas(produtosPorFabrica);
      setContadoresPorFabrica(prev => {
        const newMap = new Map(prev);
        produtosPorFabrica.forEach((data, fabricaId) => {
          const currentTotal = newMap.get(fabricaId) || 0;
          newMap.set(fabricaId, currentTotal + data.quantidade);
        });
        return newMap;
      });
      console.log('📊 Produtos adicionados aos contadores de todas as fábricas');
    } catch (error) {
      console.error('❌ Erro ao adicionar produtos aos contadores das fábricas:', error);
      throw error;
    }
  };

  const resetarContadorFabrica = async (fabricaId: string) => {
    try {
      await ProdutosExportadosPorFabricaService.resetarContadorFabrica(fabricaId);
      setContadoresPorFabrica(prev => {
        const newMap = new Map(prev);
        newMap.set(fabricaId, 0);
        return newMap;
      });
      console.log(`📊 Contador da fábrica ${fabricaId} resetado`);
    } catch (error) {
      console.error('❌ Erro ao resetar contador da fábrica:', error);
      throw error;
    }
  };

  const getTotalPorFabrica = (fabricaId: string): number => {
    return contadoresPorFabrica.get(fabricaId) || 0;
  };

  return (
    <ProdutosExportadosPorFabricaContext.Provider value={{
      contadoresPorFabrica,
      isLoading,
      carregarContadoresPorFabricas,
      adicionarProdutosParaFabrica,
      adicionarProdutosParaFabricas,
      resetarContadorFabrica,
      getTotalPorFabrica
    }}>
      {children}
    </ProdutosExportadosPorFabricaContext.Provider>
  );
};
