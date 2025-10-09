import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { CotacaoItem, SortOptions } from '../types';

interface SortableHeaderProps {
  field: keyof CotacaoItem;
  children: React.ReactNode;
  sortOptions: SortOptions;
  onSort: (field: keyof CotacaoItem) => void;
  className?: string;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({
  field,
  children,
  sortOptions,
  onSort,
  className = ''
}) => {
  const isActive = sortOptions.field === field;
  const direction = isActive ? sortOptions.direction : null;

  const getSortIcon = () => {
    if (!isActive) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    
    if (direction === 'asc') {
      return <ArrowUp className="w-4 h-4 text-gray-600" />;
    }
    
    if (direction === 'desc') {
      return <ArrowDown className="w-4 h-4 text-gray-600" />;
    }
    
    return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
  };

  const handleClick = () => {
    onSort(field);
  };

  return (
    <th 
      className={`table-cell border-r border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${className}`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between group">
        <span className={`${isActive ? 'text-blue-600 font-semibold' : 'text-gray-900'}`}>
          {children}
        </span>
        <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {getSortIcon()}
        </div>
      </div>
    </th>
  );
};

export default SortableHeader;
