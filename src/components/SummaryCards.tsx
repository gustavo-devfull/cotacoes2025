import React from 'react';
import { SummaryStats } from '../types';

interface SummaryCardsProps {
  stats: SummaryStats;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ stats }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatNumber = (value: number, decimals: number = 0) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total de Itens */}
      <div className="card p-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total de Itens</p>
            <p className="text-3xl font-bold text-primary-800">{stats.totalItems}</p>
          </div>
          <div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
      </div>

      {/* Valor Total */}
      <div className="card p-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Valor Total</p>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.totalValue)}</p>
          </div>
          <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        </div>
      </div>

      {/* CBM Total */}
      <div className="card p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">CBM Total</p>
            <p className="text-3xl font-bold text-blue-600">{formatNumber(stats.totalCBM, 3)} m³</p>
          </div>
          <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
