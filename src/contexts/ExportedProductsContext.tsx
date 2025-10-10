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
    setExportedProducts(prev => new Set([...prev, ...products]));
  };

  const removeExportedProducts = (products: string[]) => {
    setExportedProducts(prev => {
      const newSet = new Set(prev);
      products.forEach(product => newSet.delete(product));
      return newSet;
    });
  };

  const clearExportedProducts = () => {
    setExportedProducts(new Set());
  };

  return (
    <ExportedProductsContext.Provider value={{
      exportedProducts,
      setExportedProducts,
      addExportedProducts,
      removeExportedProducts,
      clearExportedProducts
    }}>
      {children}
    </ExportedProductsContext.Provider>
  );
};
