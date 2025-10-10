import React, { useState, useEffect } from 'react';
import { CotacaoItem, FilterOptions } from '../types';
import { Search, Filter, X, Calendar } from 'lucide-react';
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
  const [showPeriodModal, setShowPeriodModal] = useState(false);

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
        (item.obs && item.obs.toLowerCase().includes(searchTerm)) // ADICIONADO: Campo OBS
      );
    }

    // Filtro por loja
    if (updatedFilters.shopFilter && updatedFilters.shopFilter.trim() !== '') {
      filteredData = filteredData.filter(item => item.SHOP_NO === updatedFilters.shopFilter);
    }

    // Filtro por segmento
    if (updatedFilters.segmentoFilter && updatedFilters.segmentoFilter.trim() !== '') {
      filteredData = filteredData.filter(item => item.segmento === updatedFilters.segmentoFilter);
    }

    // Filtro por período
    if (updatedFilters.dateRangeStart) {
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.dataCotacao);
        const startDate = new Date(updatedFilters.dateRangeStart);
        return itemDate >= startDate;
      });
    }

    if (updatedFilters.dateRangeEnd) {
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.dataCotacao);
        const endDate = new Date(updatedFilters.dateRangeEnd);
        return itemDate <= endDate;
      });
    }

    onFilterChange(filteredData);
  };

  const clearFilters = () => {
    const clearedFilters: FilterOptions = {
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
    <>
      <div className="card p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Busca Principal */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por qualquer informação"
                className="input-field pl-10"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </div>

          {/* Filtro por Loja */}
          <div className="lg:w-68">
            <select
              className="input-field"
              value={filters.shopFilter}
              onChange={(e) => {
                const newFilters = { ...filters, shopFilter: e.target.value };
                setFilters(newFilters);
              }}
            >
              <option value="">Todas as Lojas/Fábricas</option>
              {uniqueShops.map(shop => (
                <option key={shop} value={shop}>{shop}</option>
              ))}
            </select>
          </div>

          {/* Filtro por Segmento */}
          <div className="lg:w-68">
            <select
              className="input-field"
              value={filters.segmentoFilter}
              onChange={(e) => {
                const newFilters = { ...filters, segmentoFilter: e.target.value };
                setFilters(newFilters);
              }}
            >
              <option value="">Todos os Segmentos</option>
              {uniqueSegmentos.map(segmento => (
                <option key={segmento} value={segmento}>{segmento}</option>
              ))}
            </select>
          </div>

          {/* Botão Período */}
          <div className="lg:w-48">
            <button
              onClick={() => setShowPeriodModal(true)}
              className={`w-full px-3 py-2 border rounded-md text-sm transition-colors duration-200 flex items-center gap-2 ${
                filters.dateRangeStart || filters.dateRangeEnd
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              <Calendar className="w-4 h-4" />
              {filters.dateRangeStart || filters.dateRangeEnd
                ? `${filters.dateRangeStart ? formatDateToBrazilian(filters.dateRangeStart) : 'Início'} - ${filters.dateRangeEnd ? formatDateToBrazilian(filters.dateRangeEnd) : 'Fim'}`
                : 'Período'
              }
            </button>
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

      {/* Modal de Período */}
      {showPeriodModal && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40" 
            onClick={() => setShowPeriodModal(false)}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Selecionar Período
                </h3>
                <button
                  onClick={() => setShowPeriodModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Inicial
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.dateRangeStart}
                    onChange={(e) => {
                      const newFilters = { ...filters, dateRangeStart: e.target.value };
                      setFilters(newFilters);
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Final
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.dateRangeEnd}
                    onChange={(e) => {
                      const newFilters = { ...filters, dateRangeEnd: e.target.value };
                      setFilters(newFilters);
                    }}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    const newFilters = { ...filters, dateRangeStart: '', dateRangeEnd: '' };
                    setFilters(newFilters);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
                >
                  Limpar
                </button>
                <button
                  onClick={() => setShowPeriodModal(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default SearchAndFilters;