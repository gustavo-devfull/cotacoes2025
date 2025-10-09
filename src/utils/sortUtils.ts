import { CotacaoItem, SortOptions } from '../types';

export const sortData = (data: CotacaoItem[], sortOptions: SortOptions): CotacaoItem[] => {
  if (!sortOptions.field || !sortOptions.direction) {
    return data;
  }

  const sortedData = [...data].sort((a, b) => {
    const field = sortOptions.field!;
    const direction = sortOptions.direction!;

    let aValue = a[field];
    let bValue = b[field];

    // Tratar valores nulos/undefined
    if (aValue === null || aValue === undefined) aValue = '';
    if (bValue === null || bValue === undefined) bValue = '';

    // Converter para string para comparação
    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();

    // Para números, converter de volta para comparação numérica
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      if (direction === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    }

    // Para strings e outros tipos
    if (direction === 'asc') {
      return aStr.localeCompare(bStr);
    } else {
      return bStr.localeCompare(aStr);
    }
  });

  return sortedData;
};

export const getNextSortDirection = (
  currentField: keyof CotacaoItem | null,
  currentDirection: 'asc' | 'desc' | null,
  newField: keyof CotacaoItem
): 'asc' | 'desc' => {
  // Se é um campo diferente, começar com 'asc'
  if (currentField !== newField) {
    return 'asc';
  }

  // Se é o mesmo campo, alternar entre 'asc' e 'desc'
  if (currentDirection === 'asc') {
    return 'desc';
  } else {
    return 'asc';
  }
};
