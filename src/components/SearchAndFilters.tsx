import React, { useState, useEffect } from 'react';
import { CotacaoItem, FilterOptions } from '../types';
import { Search, Filter, X } from 'lucide-react';
import { formatDateToBrazilian } from '../utils/dateUtils';

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
  
  const [searchInput, setSearchInput] = useState('');

  // Debounce para o campo de busca
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters({ ...filters, searchTerm: searchInput });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // Aplicar filtros quando outros campos mudarem
  useEffect(() => {
    applyFilters(filters);
  }, [filters.shopFilter, filters.segmentoFilter, filters.dateRangeStart, filters.dateRangeEnd]);

  const applyFilters = (updatedFilters: FilterOptions) => {
    setFilters(updatedFilters);

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

    // Filtro por loja - só aplica se houver seleção específica
    if (updatedFilters.shopFilter && updatedFilters.shopFilter.trim() !== '') {
      filteredData = filteredData.filter(item =>
        item.SHOP_NO.toLowerCase().includes(updatedFilters.shopFilter.toLowerCase())
      );
    }

    // Filtro por segmento - só aplica se houver seleção específica
    if (updatedFilters.segmentoFilter && updatedFilters.segmentoFilter.trim() !== '') {
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
    setSearchInput('');
    // Aplicar filtros limpos para mostrar todos os dados
    applyFilters(clearedFilters);
  };

  // Verificar se há filtros ativos
  const hasActiveFilters = Boolean(
    searchInput || 
    (filters.shopFilter && filters.shopFilter.trim() !== '') || 
    (filters.segmentoFilter && filters.segmentoFilter.trim() !== '') || 
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
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>

        {/* Filtro por Loja */}
        <div className="lg:w-48">
          <select
            className="input-field"
            value={filters.shopFilter}
            onChange={(e) => {
              const newFilters = { ...filters, shopFilter: e.target.value };
              setFilters(newFilters);
            }}
          >
            <option value="">🏪 Todas as Lojas</option>
            {uniqueShops.sort().map(shop => (
              <option key={shop} value={shop}>{shop}</option>
            ))}
          </select>
        </div>

        {/* Filtro por Segmento */}
        <div className="lg:w-48">
          <select
            className="input-field"
            value={filters.segmentoFilter}
            onChange={(e) => {
              const newFilters = { ...filters, segmentoFilter: e.target.value };
              setFilters(newFilters);
            }}
          >
            <option value="">📊 Todos os Segmentos</option>
            {uniqueSegmentos.sort().map(segmento => (
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
          {searchInput && (
            <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs">
              Busca: "{searchInput}"
            </span>
          )}
          {filters.shopFilter && filters.shopFilter.trim() !== '' && (
            <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs">
              Loja: {filters.shopFilter}
            </span>
          )}
          {filters.segmentoFilter && filters.segmentoFilter.trim() !== '' && (
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
