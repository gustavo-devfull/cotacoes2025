// Serviço para buscar imagens do FTP baseadas na REF do produto
import React from 'react';
class FTPImageService {
  private baseUrl: string;
  private imageCache: Map<string, string> = new Map();

  constructor() {
    // URL base do servidor FTP (ajuste conforme sua configuração)
    this.baseUrl = 'https://ideolog.ia.br/images/products/';
  }

  /**
   * Busca a URL da imagem baseada na REF do produto
   * @param ref - Referência do produto (ex: CHDJ25001)
   * @returns Promise com a URL da imagem (.jpg) ou null se não encontrada
   */
  async getImageUrl(ref: string): Promise<string | null> {
    if (!ref || typeof ref !== 'string') {
      return null;
    }

    // Limpar a REF (remover espaços, caracteres especiais)
    const cleanRef = ref.trim().toUpperCase();
    
    // Verificar cache primeiro
    if (this.imageCache.has(cleanRef)) {
      return this.imageCache.get(cleanRef) || null;
    }

    try {
      // Tentar apenas extensão .jpg
      const imageUrl = `${this.baseUrl}${cleanRef}.jpg`;
      
      // Verificar se a imagem existe fazendo uma requisição HEAD
      const exists = await this.checkImageExists(imageUrl);
      if (exists) {
        // Adicionar ao cache
        this.imageCache.set(cleanRef, imageUrl);
        console.log(`✅ Imagem encontrada para REF ${cleanRef}: ${imageUrl}`);
        return imageUrl;
      }

      console.log(`❌ Nenhuma imagem encontrada para REF: ${cleanRef}`);
      return null;
    } catch (error) {
      console.error(`Erro ao buscar imagem para REF ${cleanRef}:`, error);
      return null;
    }
  }

  /**
   * Verifica se uma imagem existe no servidor usando uma abordagem que evita CORS
   * @param imageUrl - URL da imagem para verificar
   * @returns Promise<boolean>
   */
  private async checkImageExists(imageUrl: string): Promise<boolean> {
    return new Promise((resolve) => {
      // Criar um elemento Image para testar se a imagem carrega
      const img = new Image();
      
      // Configurar timeout para evitar espera infinita
      const timeout = setTimeout(() => {
        console.warn(`Timeout ao verificar imagem: ${imageUrl}`);
        resolve(true); // Assumir que existe para tentar carregar
      }, 5000); // 5 segundos de timeout
      
      // Quando a imagem carregar com sucesso
      img.onload = () => {
        clearTimeout(timeout);
        console.log(`✅ Imagem verificada com sucesso: ${imageUrl}`);
        resolve(true);
      };
      
      // Quando houver erro no carregamento
      img.onerror = () => {
        clearTimeout(timeout);
        console.log(`❌ Imagem não encontrada: ${imageUrl}`);
        resolve(false);
      };
      
      // Tentar carregar a imagem
      img.src = imageUrl;
    });
  }

  /**
   * Busca múltiplas imagens de uma vez
   * @param refs - Array de referências
   * @returns Promise com Map de REF -> URL da imagem
   */
  async getMultipleImageUrls(refs: string[]): Promise<Map<string, string>> {
    const results = new Map<string, string>();
    
    // Processar em lotes para não sobrecarregar o servidor
    const batchSize = 5;
    for (let i = 0; i < refs.length; i += batchSize) {
      const batch = refs.slice(i, i + batchSize);
      
      const promises = batch.map(async (ref) => {
        const url = await this.getImageUrl(ref);
        if (url) {
          results.set(ref, url);
        }
      });
      
      await Promise.all(promises);
      
      // Pequena pausa entre lotes
      if (i + batchSize < refs.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }

  /**
   * Limpa o cache de imagens
   */
  clearCache(): void {
    this.imageCache.clear();
  }

  /**
   * Obtém estatísticas do cache
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.imageCache.size,
      keys: Array.from(this.imageCache.keys())
    };
  }

  /**
   * Define uma URL base diferente
   * @param baseUrl - Nova URL base
   */
  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
    this.clearCache(); // Limpar cache ao mudar URL base
  }
}

// Instância singleton do serviço
export const ftpImageService = new FTPImageService();

// Hook para usar o serviço no React
export const useFTPImages = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const getImageUrl = async (ref: string): Promise<string | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const url = await ftpImageService.getImageUrl(ref);
      return url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getMultipleImageUrls = async (refs: string[]): Promise<Map<string, string>> => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await ftpImageService.getMultipleImageUrls(refs);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return new Map();
    } finally {
      setLoading(false);
    }
  };

  return {
    getImageUrl,
    getMultipleImageUrls,
    loading,
    error,
    clearCache: ftpImageService.clearCache.bind(ftpImageService),
    getCacheStats: ftpImageService.getCacheStats.bind(ftpImageService)
  };
};
