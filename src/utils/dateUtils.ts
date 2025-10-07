// Utilitários para formatação de datas no padrão brasileiro

/**
 * Converte uma data do formato YYYY-MM-DD para DD/MM/YYYY
 */
export const formatDateToBrazilian = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    // Para evitar problemas de fuso horário, criar a data diretamente
    const [year, month, day] = dateString.split('-').map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return dateString;
    
    const formattedDay = day.toString().padStart(2, '0');
    const formattedMonth = month.toString().padStart(2, '0');
    
    return `${formattedDay}/${formattedMonth}/${year}`;
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return dateString;
  }
};

/**
 * Converte uma data do formato DD/MM/YYYY para YYYY-MM-DD
 */
export const formatDateFromBrazilian = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const [day, month, year] = dateString.split('/');
    if (!day || !month || !year) return dateString;
    
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  } catch (error) {
    console.error('Erro ao converter data:', error);
    return dateString;
  }
};

/**
 * Formata data e hora no padrão brasileiro
 */
export const formatDateTimeToBrazilian = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error('Erro ao formatar data e hora:', error);
    return dateString;
  }
};

/**
 * Formata data enquanto digita, adicionando barras automaticamente
 */
export const formatDateInput = (value: string): string => {
  // Se o valor estiver vazio, retorna vazio
  if (!value) return '';
  
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Se não há números, retorna vazio
  if (!numbers) return '';
  
  // Limita a 8 dígitos (DDMMYYYY)
  const limitedNumbers = numbers.slice(0, 8);
  
  // Adiciona as barras automaticamente baseado no tamanho
  if (limitedNumbers.length <= 2) {
    return limitedNumbers;
  } else if (limitedNumbers.length <= 4) {
    return `${limitedNumbers.slice(0, 2)}/${limitedNumbers.slice(2)}`;
  } else {
    return `${limitedNumbers.slice(0, 2)}/${limitedNumbers.slice(2, 4)}/${limitedNumbers.slice(4)}`;
  }
};

/**
 * Valida se a data está no formato correto DD/MM/YYYY
 */
export const isValidDate = (dateString: string): boolean => {
  if (!dateString || dateString.length !== 10) return false;
  
  const [day, month, year] = dateString.split('/').map(Number);
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
  if (day < 1 || day > 31) return false;
  if (month < 1 || month > 12) return false;
  if (year < 1900 || year > 2100) return false;
  
  const date = new Date(year, month - 1, day);
  return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
};
