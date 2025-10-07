// Configurações do sistema - personalize conforme necessário

export const appConfig = {
  // Configurações de imagem
  images: {
    // URL base para as imagens dos produtos
    baseUrl: 'https://picsum.photos',
    // Tamanho padrão das imagens na tabela
    thumbnailSize: '100x100',
    // Tamanho das imagens em tooltips/detalhes
    detailSize: '300x300',
    // Fallback para imagens não encontradas
    fallbackImage: '/images/no-image.jpg'
  },

  // Configurações de moeda
  currency: {
    code: 'USD',
    symbol: '$',
    locale: 'pt-BR'
  },

  // Configurações de formatação
  formatting: {
    // Número de casas decimais para preços
    priceDecimals: 2,
    // Número de casas decimais para CBM
    cbmDecimals: 4,
    // Número de casas decimais para dimensões
    dimensionDecimals: 1,
    // Número de casas decimais para peso
    weightDecimals: 0
  },

  // Configurações da tabela
  table: {
    // Itens por página (se implementar paginação)
    itemsPerPage: 50,
    // Largura máxima das colunas com tooltip
    tooltipMaxWidth: 200,
    // Altura das imagens na tabela
    imageHeight: 64,
    imageWidth: 64
  },

  // Configurações de busca
  search: {
    // Delay para busca em tempo real (ms)
    debounceDelay: 300,
    // Campos pesquisáveis
    searchableFields: ['PHOTO_NO', 'DESCRIPTION', 'NAME', 'SHOP_NO']
  },

  // Configurações de tema
  theme: {
    primaryColor: '#1e40af',
    secondaryColor: '#3b82f6',
    successColor: '#10b981',
    warningColor: '#f59e0b',
    errorColor: '#ef4444',
    // Duração das animações (ms)
    animationDuration: 200
  },

  // Configurações de responsividade
  responsive: {
    // Breakpoints para diferentes tamanhos de tela
    breakpoints: {
      mobile: '640px',
      tablet: '768px',
      desktop: '1024px',
      wide: '1280px'
    }
  }
};

// Função para obter configuração baseada no ambiente
export const getConfig = (environment: 'development' | 'production' = 'development') => {
  const baseConfig = { ...appConfig };
  
  if (environment === 'production') {
    // Configurações específicas para produção
    baseConfig.images.baseUrl = 'https://your-cdn.com/images/products';
    baseConfig.images.fallbackImage = '/images/no-image.jpg';
  }
  
  return baseConfig;
};

// Função para formatar valores monetários
export const formatCurrency = (value: number, config = appConfig) => {
  return new Intl.NumberFormat(config.currency.locale, {
    style: 'currency',
    currency: config.currency.code,
    minimumFractionDigits: config.formatting.priceDecimals,
    maximumFractionDigits: config.formatting.priceDecimals
  }).format(value);
};

// Função para formatar números
export const formatNumber = (value: number, decimals: number = 0) => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

// Função para gerar URL de imagem
export const getImageUrl = (photoNo: string, config = appConfig) => {
  if (config.images.baseUrl === 'https://picsum.photos') {
    // Modo demonstração
    return `${config.images.baseUrl}/${config.images.thumbnailSize}?random=${photoNo}`;
  }
  
  // Modo produção - adapte conforme seu sistema
  return `${config.images.baseUrl}/${photoNo}.jpg`;
};

