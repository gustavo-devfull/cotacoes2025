// Função para comprimir imagens antes de salvar no Firebase
export const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calcular novas dimensões mantendo proporção
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      // Configurar canvas
      canvas.width = width;
      canvas.height = height;

      // Desenhar imagem redimensionada
      ctx?.drawImage(img, 0, 0, width, height);

      // Converter para base64 com compressão
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      
      // Verificar tamanho (limite do Firestore: ~1MB)
      const sizeInBytes = (compressedDataUrl.length * 3) / 4;
      const maxSize = 1024 * 1024; // 1MB

      if (sizeInBytes > maxSize) {
        // Se ainda muito grande, reduzir qualidade
        const newQuality = Math.max(0.1, quality * 0.7);
        const newCompressedDataUrl = canvas.toDataURL('image/jpeg', newQuality);
        resolve(newCompressedDataUrl);
      } else {
        resolve(compressedDataUrl);
      }
    };

    img.onerror = () => {
      reject(new Error('Erro ao carregar imagem'));
    };

    // Carregar imagem
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };
    reader.readAsDataURL(file);
  });
};

// Função para validar tamanho do arquivo
export const validateFileSize = (file: File, maxSizeMB: number = 5): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

// Função para validar tipo de arquivo
export const validateFileType = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return allowedTypes.includes(file.type);
};








