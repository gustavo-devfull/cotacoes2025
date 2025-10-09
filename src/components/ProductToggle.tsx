import React from 'react';
import { Check } from 'lucide-react';

interface ProductToggleProps {
  isSelected: boolean;
  isExported: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const ProductToggle: React.FC<ProductToggleProps> = ({
  isSelected,
  isExported,
  onToggle,
  disabled = false
}) => {
  const getToggleClasses = () => {
    if (isExported) {
      return 'bg-green-200 border-green-400 cursor-not-allowed';
    }
    
    if (isSelected) {
      return 'bg-blue-500 border-blue-600 hover:bg-blue-600';
    }
    
    return 'bg-gray-200 border-gray-300 hover:bg-gray-300';
  };

  const getIconClasses = () => {
    if (isExported) {
      return 'text-green-600';
    }
    
    if (isSelected) {
      return 'text-white';
    }
    
    return 'text-gray-400';
  };

  return (
    <button
      onClick={onToggle}
      disabled={disabled || isExported}
      className={`
        w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200
        ${getToggleClasses()}
        ${disabled || isExported ? 'opacity-50' : 'hover:scale-105'}
      `}
      title={
        isExported 
          ? 'Produto já exportado' 
          : isSelected 
            ? 'Desmarcar produto' 
            : 'Selecionar produto'
      }
    >
      {(isSelected || isExported) && (
        <Check 
          className={`w-3 h-3 ${getIconClasses()}`} 
        />
      )}
    </button>
  );
};

export default ProductToggle;
