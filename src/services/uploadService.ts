// Serviço de upload de imagens compatível com navegadores
// Usa FormData para enviar arquivos para um endpoint backend

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  isOffline?: boolean; // Indica se foi salvo em modo offline
}

export interface UploadConfig {
  endpoint: string; // URL do endpoint backend para upload
  maxFileSize: number; // Tamanho máximo em MB
  allowedTypes: string[]; // Tipos de arquivo permitidos
  offlineMode: boolean; // Se deve usar modo offline quando backend não estiver disponível
}

const defaultConfig: UploadConfig = {
  endpoint: 'http://localhost:3002/api/upload-ftp', // Endpoint FTP backend
  maxFileSize: 10, // 10MB (aumentado para FTP)
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  offlineMode: true // Ativar modo offline por padrão
};

class UploadService {
  private config: UploadConfig;

  constructor(config: Partial<UploadConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Faz upload de uma imagem usando FormData
   * @param file Arquivo a ser enviado
   * @param fileName Nome do arquivo (opcional)
   * @returns Promise com resultado do upload
   */
  public async uploadImage(file: File, fileName?: string): Promise<UploadResult> {
    try {
      // Validar arquivo
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Tentar upload para backend primeiro
      if (!this.config.offlineMode) {
        try {
          const result = await this.uploadToBackend(file, fileName);
          if (result.success) {
            return result;
          }
        } catch (error) {
          console.warn('Backend não disponível, usando modo offline:', error);
        }
      }

      // Modo offline: converter para base64 e armazenar localmente
      return await this.uploadOffline(file, fileName);

    } catch (error: any) {
      console.error('Erro no upload:', error);
      return { 
        success: false, 
        error: `Erro de conexão: ${error.message}` 
      };
    }
  }

  /**
   * Upload para backend
   */
  private async uploadToBackend(file: File, fileName?: string): Promise<UploadResult> {
    // Criar FormData
    const formData = new FormData();
    formData.append('image', file);
    if (fileName) {
      formData.append('filename', fileName);
    }

    console.log(`Enviando arquivo para FTP backend: ${fileName || file.name}`);

    // Fazer upload para FTP backend
    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // Não definir Content-Type - deixar o navegador definir automaticamente
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro no servidor FTP: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    if (result.success && result.url) {
      console.log(`Upload FTP bem-sucedido: ${result.url}`);
      return { 
        success: true, 
        url: result.url,
        isOffline: false // Indica que foi salvo no FTP
      };
    } else {
      throw new Error(result.error || 'Erro desconhecido no upload FTP');
    }
  }

  /**
   * Upload offline: converte para base64 e armazena localmente
   */
  private async uploadOffline(file: File, fileName?: string): Promise<UploadResult> {
    try {
      // Comprimir imagem
      const compressedFile = await this.compressImage(file, 800, 0.8);
      
      // Converter para base64
      const base64 = await this.fileToBase64(compressedFile);
      
      // Gerar URL única
      const uniqueId = Date.now() + '-' + Math.random().toString(36).substring(2, 9);
      const offlineUrl = `data:image/jpeg;base64,${base64}`;
      
      // Armazenar no localStorage para persistência
      const storageKey = `uploaded_image_${uniqueId}`;
      localStorage.setItem(storageKey, offlineUrl);
      
      console.log(`Imagem salva offline: ${fileName || file.name}`);
      
      return { 
        success: true, 
        url: offlineUrl,
        isOffline: true
      };
    } catch (error: any) {
      return { 
        success: false, 
        error: `Erro no upload offline: ${error.message}` 
      };
    }
  }

  /**
   * Converte arquivo para base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove o prefixo "data:image/jpeg;base64,"
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  }

  /**
   * Faz upload de múltiplas imagens
   * @param files Array de arquivos
   * @returns Promise com array de resultados
   */
  public async uploadMultipleImages(files: File[]): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => this.uploadImage(file));
    return Promise.all(uploadPromises);
  }

  /**
   * Valida um arquivo antes do upload
   * @param file Arquivo a ser validado
   * @returns Resultado da validação
   */
  public validateFile(file: File): { valid: boolean; error?: string } {
    // Verificar tipo de arquivo
    if (!this.config.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Tipo de arquivo não permitido. Use: ${this.config.allowedTypes.join(', ')}`
      };
    }

    // Verificar tamanho do arquivo
    const maxSizeBytes = this.config.maxFileSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `Arquivo muito grande. Máximo: ${this.config.maxFileSize}MB`
      };
    }

    return { valid: true };
  }

  /**
   * Gera um nome único para o arquivo
   * @param originalName Nome original do arquivo
   * @returns Nome único
   */
  public generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const extension = originalName.split('.').pop() || 'jpg';
    return `${timestamp}-${random}.${extension}`;
  }

  /**
   * Comprime uma imagem antes do upload
   * @param file Arquivo original
   * @param maxWidth Largura máxima
   * @param quality Qualidade (0-1)
   * @returns Promise com arquivo comprimido
   */
  public async compressImage(file: File, maxWidth: number = 800, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Redimensionar se necessário
          if (width > maxWidth) {
            height = height * (maxWidth / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Converter para blob
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Erro ao comprimir imagem'));
            }
          }, 'image/jpeg', quality);
        };
        
        img.onerror = (error) => reject(error);
      };
      
      reader.onerror = (error) => reject(error);
    });
  }
}

// Instância padrão do serviço
export const uploadService = new UploadService();

// Configuração para desenvolvimento local
export const configureUploadService = (config: Partial<UploadConfig>) => {
  return new UploadService(config);
};

// Exemplo de uso:
/*
// Upload simples
const result = await uploadService.uploadImage(file);
if (result.success) {
  console.log('URL da imagem:', result.url);
} else {
  console.error('Erro:', result.error);
}

// Upload com compressão
const compressedFile = await uploadService.compressImage(file, 800, 0.8);
const result = await uploadService.uploadImage(compressedFile);

// Upload múltiplo
const results = await uploadService.uploadMultipleImages(files);
*/
