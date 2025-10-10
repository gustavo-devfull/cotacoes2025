import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProdutosJaExportadosService } from '../services/produtosJaExportadosService';

interface ProdutosJaExportadosContextType {
  totalExportados: number;
  isLoading: boolean;
  adicionarProdutos: (quantidade: number) => Promise<void>;
  resetarContador: () => Promise<void>;
  recarregarTotal: () => Promise<void>;
}

const ProdutosJaExportadosContext = createContext<ProdutosJaExportadosContextType | undefined>(undefined);

export const useProdutosJaExportados = () => {
  const context = useContext(ProdutosJaExportadosContext);
  if (context === undefined) {
    throw new Error('useProdutosJaExportados must be used within a ProdutosJaExportadosProvider');
  }
  return context;
};

interface ProdutosJaExportadosProviderProps {
  children: ReactNode;
}

export const ProdutosJaExportadosProvider: React.FC<ProdutosJaExportadosProviderProps> = ({ children }) => {
  const [totalExportados, setTotalExportados] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Carregar total inicial
  useEffect(() => {
    carregarTotal();
  }, []);

  const carregarTotal = async () => {
    try {
      setIsLoading(true);
      const total = await ProdutosJaExportadosService.getTotalExportados();
      setTotalExportados(total);
      console.log('📊 Total de produtos já exportados carregado no contexto:', total);
    } catch (error) {
      console.error('❌ Erro ao carregar total de produtos exportados:', error);
      setTotalExportados(0);
    } finally {
      setIsLoading(false);
    }
  };

  const adicionarProdutos = async (quantidade: number) => {
    try {
      await ProdutosJaExportadosService.adicionarProdutosExportados(quantidade);
      setTotalExportados(prev => prev + quantidade);
      console.log(`📊 Adicionados ${quantidade} produtos ao contador total. Novo total: ${totalExportados + quantidade}`);
    } catch (error) {
      console.error('❌ Erro ao adicionar produtos ao contador:', error);
      throw error;
    }
  };

  const resetarContador = async () => {
    try {
      await ProdutosJaExportadosService.resetarContador();
      setTotalExportados(0);
      console.log('📊 Contador de produtos exportados resetado');
    } catch (error) {
      console.error('❌ Erro ao resetar contador:', error);
      throw error;
    }
  };

  const recarregarTotal = async () => {
    await carregarTotal();
  };

  return (
    <ProdutosJaExportadosContext.Provider value={{
      totalExportados,
      isLoading,
      adicionarProdutos,
      resetarContador,
      recarregarTotal
    }}>
      {children}
    </ProdutosJaExportadosContext.Provider>
  );
};
