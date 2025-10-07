import React, { useState } from 'react';
import { CotacaoItem, FilterOptions } from '../types';
import { Search, Filter, X } from 'lucide-react';
import { formatDateFromBrazilian, formatDateToBrazilian } from '../utils/dateUtils';

interface SearchAndFiltersProps {
  data: CotacaoItem[];
  onFilterChange: (filteredData: CotacaoItem[]) => void;
}

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({ data, onFilterChange }) => {
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    shopFilter: '',
    segmentoFilter: '',
    dateRangeStart: '',
    dateRangeEnd: ''
  });

  const applyFilters = (updatedFilters: FilterOptions) => {

    // Aplicar filtros
    let filteredData = data;

    // Filtro de busca geral
    if (updatedFilters.searchTerm) {
      const searchTerm = updatedFilters.searchTerm.toLowerCase();
      filteredData = filteredData.filter(item =>
        item.NUM_COTACAO.toLowerCase().includes(searchTerm) ||
        item.referencia.toLowerCase().includes(searchTerm) ||
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

    // Filtro por segmento
    if (updatedFilters.segmentoFilter) {
      filteredData = filteredData.filter(item =>
        item.segmento.toLowerCase().includes(updatedFilters.segmentoFilter.toLowerCase())
      );
    }

    // Filtro por período de datas
    if (updatedFilters.dateRangeStart && updatedFilters.dateRangeEnd) {
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.dataCotacao);
        const startDate = new Date(updatedFilters.dateRangeStart);
        const endDate = new Date(updatedFilters.dateRangeEnd);
        return itemDate >= startDate && itemDate <= endDate;
      });
    } else if (updatedFilters.dateRangeStart) {
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.dataCotacao);
        const startDate = new Date(updatedFilters.dateRangeStart);
        return itemDate >= startDate;
      });
    } else if (updatedFilters.dateRangeEnd) {
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.dataCotacao);
        const endDate = new Date(updatedFilters.dateRangeEnd);
        return itemDate <= endDate;
      });
    }

    onFilterChange(filteredData);
  };

  const clearFilters = () => {
    const clearedFilters = {
      searchTerm: '',
      shopFilter: '',
      segmentoFilter: '',
      dateRangeStart: '',
      dateRangeEnd: ''
    };
    setFilters(clearedFilters);
    applyFilters(clearedFilters);
  };

  // Verificar se há filtros ativos
  const hasActiveFilters = Boolean(
    filters.searchTerm || 
    filters.shopFilter || 
    filters.segmentoFilter || 
    filters.dateRangeStart || 
    filters.dateRangeEnd
  );

  // Obter lojas únicas para o dropdown
  const uniqueShops = Array.from(new Set(data.map(item => item.SHOP_NO)));
  
  // Obter segmentos únicos para o dropdown
  const uniqueSegmentos = Array.from(new Set(data.map(item => item.segmento)));

  return (
    <div className="card p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Busca Principal */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="text"
              placeholder="Buscar por NUM COTAÇÃO, REF, descrição, nome, loja ou OBS..."
              className="input-field pl-10"
              value={filters.searchTerm}
              onChange={(e) => applyFilters({ ...filters, searchTerm: e.target.value })}
            />
          </div>
        </div>

        {/* Filtro por Loja */}
        <div className="lg:w-48">
          <select
            className="input-field"
            value={filters.shopFilter}
            onChange={(e) => applyFilters({ ...filters, shopFilter: e.target.value })}
          >
            <option value="">Todas as Lojas</option>
            {uniqueShops.map(shop => (
              <option key={shop} value={shop}>{shop}</option>
            ))}
          </select>
        </div>

        {/* Filtro por Segmento */}
        <div className="lg:w-48">
          <select
            className="input-field"
            value={filters.segmentoFilter}
            onChange={(e) => applyFilters({ ...filters, segmentoFilter: e.target.value })}
          >
            <option value="">Todos os Segmentos</option>
            {uniqueSegmentos.map(segmento => (
              <option key={segmento} value={segmento}>{segmento}</option>
            ))}
          </select>
        </div>

        {/* Filtro por Período */}
        <div className="lg:w-48">
          <input
            type="date"
            placeholder="Data Inicial"
            className="input-field"
            value={filters.dateRangeStart}
            onChange={(e) => {
              const newFilters = { ...filters, dateRangeStart: e.target.value };
              setFilters(newFilters);
              applyFilters(newFilters);
            }}
          />
        </div>

        <div className="lg:w-48">
          <input
            type="date"
            placeholder="Data Final"
            className="input-field"
            value={filters.dateRangeEnd}
            onChange={(e) => {
              const newFilters = { ...filters, dateRangeEnd: e.target.value };
              setFilters(newFilters);
              applyFilters(newFilters);
            }}
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
          {filters.segmentoFilter && (
            <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs">
              Segmento: {filters.segmentoFilter}
            </span>
          )}
          {filters.dateRangeStart && (
            <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs">
              De: {formatDateToBrazilian(filters.dateRangeStart)}
            </span>
          )}
          {filters.dateRangeEnd && (
            <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs">
              Até: {formatDateToBrazilian(filters.dateRangeEnd)}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAndFilters;
