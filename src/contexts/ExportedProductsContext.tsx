import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ExportedProductsContextType {
  exportedProducts: Set<string>;
  setExportedProducts: (products: Set<string>) => void;
  addExportedProducts: (products: string[]) => void;
  removeExportedProducts: (products: string[]) => void;
  clearExportedProducts: () => void;
}

const ExportedProductsContext = createContext<ExportedProductsContextType | undefined>(undefined);

export const useExportedProducts = () => {
  const context = useContext(ExportedProductsContext);
  if (context === undefined) {
    throw new Error('useExportedProducts must be used within an ExportedProductsProvider');
  }
  return context;
};

interface ExportedProductsProviderProps {
  children: ReactNode;
}

export const ExportedProductsProvider: React.FC<ExportedProductsProviderProps> = ({ children }) => {
  const [exportedProducts, setExportedProducts] = useState<Set<string>>(new Set());

  const addExportedProducts = (products: string[]) => {
    setExportedProducts(prev => {
      const newSet = new Set([...prev, ...products]);
      console.log('📊 Produtos exportados atualizados:', newSet.size, 'total');
      return newSet;
    });
  };

  const removeExportedProducts = (products: string[]) => {
    setExportedProducts(prev => {
      const newSet = new Set(prev);
      products.forEach(product => newSet.delete(product));
      console.log('📊 Produtos exportados removidos:', newSet.size, 'total');
      return newSet;
    });
  };

  const clearExportedProducts = () => {
    setExportedProducts(new Set());
    console.log('📊 Produtos exportados limpos: 0 total');
  };

  // Função customizada para setExportedProducts com log
  const setExportedProductsWithLog = (products: Set<string>) => {
    console.log('📊 Produtos exportados carregados do Firebase:', products.size, 'total');
    setExportedProducts(products);
  };

  return (
    <ExportedProductsContext.Provider value={{
      exportedProducts,
      setExportedProducts: setExportedProductsWithLog,
      addExportedProducts,
      removeExportedProducts,
      clearExportedProducts
    }}>
      {children}
    </ExportedProductsContext.Provider>
  );
};
