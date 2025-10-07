import React, { useState } from 'react';
import { CotacaoItem, FilterOptions } from '../types';
import { Search, Filter, X } from 'lucide-react';

interface SearchAndFiltersProps {
  data: CotacaoItem[];
  onFilterChange: (filteredData: CotacaoItem[]) => void;
}

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({ data, onFilterChange }) => {
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    shopFilter: '',
    photoNoFilter: ''
  });

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    // Aplicar filtros
    let filteredData = data;

    // Filtro de busca geral
    if (updatedFilters.searchTerm) {
      const searchTerm = updatedFilters.searchTerm.toLowerCase();
      filteredData = filteredData.filter(item =>
        item.NUM_COTACAO.toLowerCase().includes(searchTerm) ||
        item.referencia.toLowerCase().includes(searchTerm) ||
        item.PHOTO_NO.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.name.toLowerCase().includes(searchTerm) ||
        item.SHOP_NO.toLowerCase().includes(searchTerm) ||
        item.obs.toLowerCase().includes(searchTerm)
      );
    }

    // Filtro por loja
    if (updatedFilters.shopFilter) {
      filteredData = filteredData.filter(item =>
        item.SHOP_NO.toLowerCase().includes(updatedFilters.shopFilter.toLowerCase())
      );
    }

    // Filtro por PHOTO NO
    if (updatedFilters.photoNoFilter) {
      filteredData = filteredData.filter(item =>
        item.PHOTO_NO.toLowerCase().includes(updatedFilters.photoNoFilter.toLowerCase())
      );
    }

    onFilterChange(filteredData);
  };

  const clearFilters = () => {
    const clearedFilters = {
      searchTerm: '',
      shopFilter: '',
      photoNoFilter: ''
    };
    setFilters(clearedFilters);
    onFilterChange(data);
  };

  const hasActiveFilters = filters.searchTerm || filters.shopFilter || filters.photoNoFilter;

  // Obter lojas únicas para o dropdown
  const uniqueShops = Array.from(new Set(data.map(item => item.SHOP_NO)));

  return (
    <div className="card p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Busca Principal */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="text"
              placeholder="Buscar por NUM COTAÇÃO, REF, PHOTO NO, descrição, nome, loja ou OBS..."
              className="input-field pl-10"
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange({ searchTerm: e.target.value })}
            />
          </div>
        </div>

        {/* Filtro por Loja */}
        <div className="lg:w-48">
          <select
            className="input-field"
            value={filters.shopFilter}
            onChange={(e) => handleFilterChange({ shopFilter: e.target.value })}
          >
            <option value="">Todas as Lojas</option>
            {uniqueShops.map(shop => (
              <option key={shop} value={shop}>{shop}</option>
            ))}
          </select>
        </div>

        {/* Filtro por PHOTO NO */}
        <div className="lg:w-48">
          <input
            type="text"
            placeholder="Filtrar por PHOTO NO"
            className="input-field"
            value={filters.photoNoFilter}
            onChange={(e) => handleFilterChange({ photoNoFilter: e.target.value })}
          />
        </div>

        {/* Botão Limpar Filtros */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="btn-secondary flex items-center gap-2 whitespace-nowrap"
          >
            <X className="w-5 h-5" />
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Indicador de filtros ativos */}
      {hasActiveFilters && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <Filter className="w-5 h-5" />
          <span>Filtros ativos:</span>
          {filters.searchTerm && (
            <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs">
              Busca: "{filters.searchTerm}"
            </span>
          )}
          {filters.shopFilter && (
            <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs">
              Loja: {filters.shopFilter}
            </span>
          )}
          {filters.photoNoFilter && (
            <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs">
              PHOTO NO: {filters.photoNoFilter}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAndFilters;
