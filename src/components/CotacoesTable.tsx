import React from 'react';
import { CotacaoItem, Comment, User, SortOptions } from '../types';
import { Eye, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import CommentsComponent from './CommentsComponent';
import ProductToggle from './ProductToggle';
import { ftpImageService } from '../services/ftpImageService';
import SortableHeader from './SortableHeader';

// Componente para exibir imagem do produto
const ProductImage: React.FC<{ 
  productRef: string; 
  description: string; 
  onImageClick?: (imageUrl: string, title: string) => void;
}> = ({ productRef, description, onImageClick }) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Buscar imagem do FTP baseada na REF
  React.useEffect(() => {
    const loadImage = async () => {
      if (!productRef) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setImageError(false);
      setImageLoaded(false);

      try {
        // Construir URL diretamente para melhor performance
        const cleanRef = productRef.trim().toUpperCase();
        const directUrl = `https://ideolog.ia.br/images/products/${cleanRef}.jpg`;
        
        // Verificar cache primeiro
        const cachedUrl = ftpImageService.getCacheStats().keys.includes(cleanRef) 
          ? directUrl 
          : null;
        
        if (cachedUrl) {
          setImageUrl(cachedUrl);
          setIsLoading(false);
          return;
        }

        // Tentar obter URL do serviço
        const url = await ftpImageService.getImageUrl(productRef);
        if (url) {
          setImageUrl(url);
        } else {
          // Se o serviço não encontrou, tentar URL direta
          setImageUrl(directUrl);
        }
      } catch (error) {
        console.error(`Erro ao carregar imagem para REF ${productRef}:`, error);
        // Em caso de erro, tentar URL direta
        const cleanRef = productRef.trim().toUpperCase();
        setImageUrl(`https://ideolog.ia.br/images/products/${cleanRef}.jpg`);
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [productRef]);

  const handleImageClick = () => {
    if (onImageClick && imageLoaded && !imageError && imageUrl) {
      onImageClick(imageUrl, description);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  if (isLoading) {
    return (
      <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (imageError || !imageUrl) {
    return (
      <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
        <Eye className="w-6 h-6 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative w-20 h-20">
      <img
        src={imageUrl}
        alt={description}
        className="w-20 h-20 object-cover rounded-lg border border-gray-200 transition-all duration-200 cursor-pointer hover:opacity-80 hover:scale-105 opacity-100"
        onLoad={handleImageLoad}
        onError={handleImageError}
        onClick={handleImageClick}
        loading="lazy"
        title={`REF: ${productRef} - Clique para ampliar`}
      />
    </div>
  );
};

// Componente Tooltip
const Tooltip: React.FC<{ content: string; children: React.ReactNode }> = ({ content, children }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  if (!content) {
    return <>{children}</>;
  }

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute bottom-full left-0 mb-2 bg-gray-800 text-white text-sm rounded py-2 px-3 z-10 w-96 max-w-96 break-words">
          {content}
        </div>
      )}
    </div>
  );
};

// Componente de célula editável
interface EditableCellProps {
  value: string | number;
  field: keyof CotacaoItem;
  item: CotacaoItem;
  onUpdate: (item: CotacaoItem, field: keyof CotacaoItem, value: string | number) => void;
  type?: 'text' | 'number' | 'textarea';
  className?: string;
  bgColor?: string; // Nova prop para cor de fundo
}

const EditableCell: React.FC<EditableCellProps> = ({ 
  value, 
  field, 
  item, 
  onUpdate, 
  type = 'text',
  className = '',
  bgColor = ''
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(String(value));
  const inputRef = React.useRef<HTMLInputElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (isEditing) {
      if (type === 'textarea' && textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      } else if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }
  }, [isEditing, type]);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditValue(String(value));
  };

  const handleSave = () => {
    const newValue = type === 'number' ? parseFloat(editValue) || 0 : editValue;
    onUpdate(item, field, newValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(String(value));
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  if (isEditing) {
    if (type === 'textarea') {
      return (
        <textarea
          ref={textareaRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          rows={3}
          className={`w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${bgColor} ${className}`}
        />
      );
    }
    
    return (
      <input
        ref={inputRef}
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={`w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${bgColor} ${className}`}
      />
    );
  }

  return (
    <div 
      onDoubleClick={handleDoubleClick}
      className={`cursor-pointer hover:bg-blue-50 transition-colors duration-150 ${className}`}
      title="Duplo clique para editar"
    >
      {type === 'number' ? formatNumber(Number(value), 2) : String(value)}
    </div>
  );
};

// Função para formatar números
const formatNumber = (value: number, decimals: number = 0): string => {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

interface CotacoesTableProps {
  data: CotacaoItem[];
  onUpdateItem?: (item: CotacaoItem, field: keyof CotacaoItem, value: string | number) => void;
  onDeleteItem?: (item: CotacaoItem) => void;
  isLoading?: boolean;
  comments: Comment[];
  currentUser: User | null;
  onAddComment: (productId: string, message: string, imageUrls: string[], mentionedUsers?: string[]) => void;
  lightbox: {
    openLightbox: (images: string[], index?: number, title?: string) => void;
  };
  sortOptions: SortOptions;
  onSort: (field: keyof CotacaoItem) => void;
  // Props para seleção e exportação
  selectedProducts: Set<string>;
  exportedProducts: Set<string>;
  onToggleProductSelection: (productId: string) => void;
  // Lista de usuários disponíveis para marcar
  availableUsers?: { id: string; name: string; email: string }[];
  usersLoading?: boolean; // Indicador de carregamento dos usuários
}

const CotacoesTable: React.FC<CotacoesTableProps> = ({ 
  data, 
  onUpdateItem, 
  onDeleteItem, 
  isLoading = false,
  comments,
  currentUser,
  onAddComment,
  lightbox, 
  sortOptions, 
  onSort,
  selectedProducts,
  exportedProducts,
  onToggleProductSelection,
  availableUsers = [],
  usersLoading = false
}) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollToStart = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: 0,
        behavior: 'smooth'
      });
    }
  };

  const scrollToEnd = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: scrollContainerRef.current.scrollWidth,
        behavior: 'smooth'
      });
    }
  };

  const scrollToPhoto = () => {
    if (scrollContainerRef.current) {
      // Calcular a posição da coluna MOQ considerando as colunas fixas
      // Colunas fixas: SEL (60px) + PHOTO (100px) + REF (150px) = 310px
      // Colunas antes do MOQ: SHOP NO (190px) + SEGMENTO (150px) + DESCRIPTION (190px) + OBS (400px) = 930px
      // Posição MOQ = 930px (colunas não fixas antes do MOQ)
      const moqColumnPosition = 930;
      scrollContainerRef.current.scrollTo({
        left: moqColumnPosition,
        behavior: 'smooth'
      });
    }
  };
  if (isLoading) {
    return (
      <div className="card p-8 text-center">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Carregando dados...</h3>
        <p className="text-gray-600">Conectando ao Firebase e carregando cotações</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="text-gray-500 text-lg">Nenhuma cotação encontrada</div>
        <div className="text-gray-400 text-sm mt-2">Ajuste os filtros ou importe uma planilha</div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden w-[1400px] mx-auto">
      {/* Botões de scroll horizontal */}
      <div className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={scrollToStart}
            className="btn-scroll flex items-center gap-2 text-sm"
            title="Rolar para a primeira coluna"
          >
            <ChevronLeft className="w-4 h-4" />
            Início
          </button>
          <button
            onClick={scrollToPhoto}
            className="btn-scroll flex items-center gap-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100"
            title="Rolar para as colunas Valores"
          >
            
            Preço
          </button>
          <button
            onClick={scrollToEnd}
            className="btn-scroll flex items-center gap-2 text-sm"
            title="Rolar para a última coluna"
          >
            Fim
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="text-sm text-gray-600">
          {data.length} produto{data.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div ref={scrollContainerRef} className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full table-fixed">
          <thead className="table-header sticky top-0 z-40 bg-grey-300 shadow-sm">
            <tr>
              <th className="table-cell text-center w-[60px] border-r border-gray-200 bg-gray-500 sticky left-0 z-50">
                <div className="flex items-center justify-center">
                  <span className="text-xs text-gray-600">SEL</span>
                </div>
              </th>
              <SortableHeader field="SHOP_NO" sortOptions={sortOptions} onSort={onSort} className="text-left w-[190px]">
                Loja/Fábrica
              </SortableHeader>
              <th className="table-cell text-center w-[100px] border-r border-gray-200 sticky left-[60px] z-50 bg-grey-300">Foto</th>
              <SortableHeader field="referencia" sortOptions={sortOptions} onSort={onSort} className="text-left w-[150px] sticky left-[160px] z-50 bg-grey-300 border-r border-gray-200">
                REF
              </SortableHeader>
              <SortableHeader field="segmento" sortOptions={sortOptions} onSort={onSort} className="text-left w-[150px]">
                SEGMENTO
              </SortableHeader>
              <SortableHeader field="description" sortOptions={sortOptions} onSort={onSort} className="text-left w-[190px]">
                Descrição
              </SortableHeader>
              <SortableHeader field="obs" sortOptions={sortOptions} onSort={onSort} className="text-left w-[400px]">
                OBS
              </SortableHeader>
              <SortableHeader field="MOQ" sortOptions={sortOptions} onSort={onSort} className="text-center w-[100px]">
                MOQ
              </SortableHeader>
              <SortableHeader field="ctns" sortOptions={sortOptions} onSort={onSort} className="text-center w-[100px]">
                CTNS
              </SortableHeader>
              <SortableHeader field="unitCtn" sortOptions={sortOptions} onSort={onSort} className="text-center w-[100px]">
                UNIT/CTN
              </SortableHeader>
              <SortableHeader field="qty" sortOptions={sortOptions} onSort={onSort} className="text-center w-[100px]">
                QTY
              </SortableHeader>
              <SortableHeader field="unitPriceRmb" sortOptions={sortOptions} onSort={onSort} className="text-right w-[150px]">
                Preço ¥
              </SortableHeader>
              <SortableHeader field="unit" sortOptions={sortOptions} onSort={onSort} className="text-center w-[100px]">
                UNIT
              </SortableHeader>
              <SortableHeader field="amount" sortOptions={sortOptions} onSort={onSort} className="text-right w-[150px]">
              ¥ Total
              </SortableHeader>
              <SortableHeader field="l" sortOptions={sortOptions} onSort={onSort} className="text-center w-[100px]">
                L(cm)
              </SortableHeader>
              <SortableHeader field="w" sortOptions={sortOptions} onSort={onSort} className="text-center w-[100px]">
                W(cm)
              </SortableHeader>
              <SortableHeader field="h" sortOptions={sortOptions} onSort={onSort} className="text-center w-[100px]">
                H(cm)
              </SortableHeader>
              <SortableHeader field="cbm" sortOptions={sortOptions} onSort={onSort} className="text-right w-[100px]">
                CBM
              </SortableHeader>
              <SortableHeader field="cbm_total" sortOptions={sortOptions} onSort={onSort} className="text-right w-[150px]">
                CBM TOTAL
              </SortableHeader>
              <SortableHeader field="gw" sortOptions={sortOptions} onSort={onSort} className="text-right w-[100px]">
                G.W
              </SortableHeader>
              <SortableHeader field="tgw" sortOptions={sortOptions} onSort={onSort} className="text-right w-[100px]">
                T.G.W
              </SortableHeader>
              <SortableHeader field="nw" sortOptions={sortOptions} onSort={onSort} className="text-right w-[100px]">
                N.W
              </SortableHeader>
              <SortableHeader field="tnw" sortOptions={sortOptions} onSort={onSort} className="text-right w-[100px]">
                T.N.W
              </SortableHeader>
              <SortableHeader field="pesoUnitario" sortOptions={sortOptions} onSort={onSort} className="text-center w-[180px]">
                PESO UNIT (kg)
              </SortableHeader>
              <SortableHeader field="OBSERVATIONS_EXTRA" sortOptions={sortOptions} onSort={onSort} className="text-left w-[210px]">
                Comentários
              </SortableHeader>
              <SortableHeader field="nomeContato" sortOptions={sortOptions} onSort={onSort} className="text-left w-[150px]">
                CONTATO
              </SortableHeader>
              <SortableHeader field="telefoneContato" sortOptions={sortOptions} onSort={onSort} className="text-left w-[150px]">
                TELEFONE 
              </SortableHeader>
              <th className="table-cell text-center w-[80px]">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const productId = `${item.PHOTO_NO}-${item.referencia}`;
              const isSelected = selectedProducts.has(productId);
              const isExported = exportedProducts.has(productId);
              const isDuplicate = item.isDuplicate;
              
              return (
                <tr 
                  key={`${item.PHOTO_NO}-${item.referencia}-${index}`} 
                  data-product-id={productId}
                  className={`hover:bg-gray-50 transition-colors duration-150 ${
                    isDuplicate ? 'bg-red-50 border-l-4 border-l-red-400' :
                    isExported ? 'bg-green-50 border-l-4 border-l-green-400' : 
                    isSelected ? 'bg-blue-50 border-l-4 border-l-blue-400' : ''
                  }`}
                >
                  <td className="table-cell text-center border-r border-gray-200 w-[60px] sticky left-0 z-20 bg-white">
                    <div className="flex items-center justify-center">
                      <ProductToggle
                        isSelected={isSelected}
                        isExported={isExported}
                        onToggle={() => onToggleProductSelection(productId)}
                      />
                    </div>
                  </td>
                  <td className="table-cell font-medium text-primary-800 border-r border-gray-200 w-[190px]">
                  {onUpdateItem ? (
                    <EditableCell 
                      value={item.SHOP_NO} 
                      field="SHOP_NO" 
                      item={item} 
                      onUpdate={onUpdateItem}
                      type="text"
                    />
                  ) : (
                    item.SHOP_NO
                  )}
                </td>
                {/* PHOTO */}
                <td className="table-cell text-center border-r border-gray-200 w-[100px] sticky left-[60px] z-20 bg-white">
                  <ProductImage 
                    productRef={item.referencia} 
                    description={item.description}
                    onImageClick={(imageUrl, title) => {
                      lightbox.openLightbox([imageUrl], 0, title);
                    }}
                  />
                </td>
                <td className="table-cell font-medium text-blue-600 border-r border-gray-200 w-[150px] sticky left-[160px] z-20 bg-white">
                  {onUpdateItem ? (
                    <EditableCell 
                      value={item.referencia} 
                      field="referencia" 
                      item={item} 
                      onUpdate={onUpdateItem}
                      type="text"
                    />
                  ) : (
                    item.referencia
                  )}
                </td>
                <td className="table-cell border-r border-gray-200 w-[150px]">
                  {onUpdateItem ? (
                    <EditableCell 
                      value={item.segmento} 
                      field="segmento" 
                      item={item} 
                      onUpdate={onUpdateItem}
                      type="text"
                    />
                  ) : (
                    item.segmento
                  )}
                </td>
                <td className="table-cell border-r border-gray-200 w-[190px]">
                  {onUpdateItem ? (
                    <EditableCell 
                      value={item.description} 
                      field="description" 
                      item={item} 
                      onUpdate={onUpdateItem}
                      type="text"
                    />
                  ) : (
                    item.description
                  )}
                </td>
                
                {/* OBS com tooltip */}
                <td className="table-cell border-r border-gray-200 w-[400px]">
                  {onUpdateItem ? (
                    <EditableCell 
                      value={item.obs} 
                      field="obs" 
                      item={item} 
                      onUpdate={onUpdateItem}
                      type="textarea"
                    />
                  ) : (
                    <Tooltip content={item.obs}>
                      <div className="flex items-center gap-1">
                        <span className="truncate max-w-20">{item.obs}</span>
                        {item.obs && <Eye className="w-4 h-4 text-gray-400" />}
                      </div>
                    </Tooltip>
                  )}
                </td>
                
                <td className="table-cell text-center border-r border-gray-200 w-[100px]">
                  {onUpdateItem ? (
                    <EditableCell 
                      value={item.MOQ} 
                      field="MOQ" 
                      item={item} 
                      onUpdate={onUpdateItem}
                      type="number"
                    />
                  ) : (
                    formatNumber(Math.round(item.MOQ), 0)
                  )}
                </td>
                
                <td className="table-cell text-center border-r border-gray-200 w-[100px]">
                  {onUpdateItem ? (
                    <EditableCell 
                      value={item.ctns} 
                      field="ctns" 
                      item={item} 
                      onUpdate={onUpdateItem}
                      type="number"
                    />
                  ) : (
                    formatNumber(Math.round(item.ctns), 0)
                  )}
                </td>
                <td className="table-cell text-center border-r border-gray-200 w-[100px]">
                  {onUpdateItem ? (
                    <EditableCell 
                      value={item.unitCtn} 
                      field="unitCtn" 
                      item={item} 
                      onUpdate={onUpdateItem}
                      type="number"
                    />
                  ) : (
                    formatNumber(Math.round(item.unitCtn), 0)
                  )}
                </td>
                <td className="table-cell text-center font-medium text-blue-600 border-r border-gray-200 w-[100px]">
                  {formatNumber(item.qty)}
                </td>
                <td className="table-cell text-right font-medium border-r border-gray-200 w-[150px] bg-green-100">
                  {onUpdateItem ? (
                    <EditableCell 
                      value={item.unitPriceRmb} 
                      field="unitPriceRmb" 
                      item={item} 
                      onUpdate={onUpdateItem}
                      type="number"
                      bgColor="bg-green-100"
                    />
                  ) : (
                    `¥ ${formatNumber(item.unitPriceRmb, 2)}`
                  )}
                </td>
                <td className="table-cell text-center border-r border-gray-200 w-[100px]">
                  {onUpdateItem ? (
                    <EditableCell 
                      value={item.unit} 
                      field="unit" 
                      item={item} 
                      onUpdate={onUpdateItem}
                      type="text"
                    />
                  ) : (
                    item.unit
                  )}
                </td>
                <td className="table-cell text-right font-semibold text-green-600 border-r border-gray-200 w-[150px]">
                  ¥ {formatNumber(item.amount, 2)}
                </td>
                
                {/* Dimensões */}
                <td className="table-cell text-center border-r border-gray-200 w-[100px]">
                  {onUpdateItem ? (
                    <EditableCell 
                      value={item.l} 
                      field="l" 
                      item={item} 
                      onUpdate={onUpdateItem}
                      type="number"
                    />
                  ) : (
                    formatNumber(item.l, 1)
                  )}
                </td>
                <td className="table-cell text-center border-r border-gray-200 w-[100px]">
                  {onUpdateItem ? (
                    <EditableCell 
                      value={item.w} 
                      field="w" 
                      item={item} 
                      onUpdate={onUpdateItem}
                      type="number"
                    />
                  ) : (
                    formatNumber(item.w, 1)
                  )}
                </td>
                <td className="table-cell text-center border-r border-gray-200 w-[100px]">
                  {onUpdateItem ? (
                    <EditableCell 
                      value={item.h} 
                      field="h" 
                      item={item} 
                      onUpdate={onUpdateItem}
                      type="number"
                    />
                  ) : (
                    formatNumber(item.h, 1)
                  )}
                </td>
                
                <td className="table-cell text-right font-medium text-blue-600 border-r border-gray-200 w-[100px]">
                  {formatNumber(item.cbm, 4)}
                </td>
                <td className="table-cell text-right font-semibold text-blue-700 border-r border-gray-200 w-[150px]">
                  {formatNumber(item.cbm_total, 4)}
                </td>
                
                {/* Campos de peso */}
                <td className="table-cell text-right border-r border-gray-200 w-[100px]">
                  {onUpdateItem ? (
                    <EditableCell 
                      value={item.gw} 
                      field="gw" 
                      item={item} 
                      onUpdate={onUpdateItem}
                      type="number"
                    />
                  ) : (
                    formatNumber(item.gw, 2)
                  )}
                </td>
                <td className="table-cell text-right font-medium text-purple-600 border-r border-gray-200 w-[100px]">
                  {formatNumber(item.tgw, 2)}
                </td>
                <td className="table-cell text-right font-medium text-orange-600 border-r border-gray-200 w-[100px]">
                  {formatNumber(item.nw, 2)}
                </td>
                <td className="table-cell text-right font-semibold text-orange-700 border-r border-gray-200 w-[100px]">
                  {formatNumber(item.tnw, 2)}
                </td>
                
                <td className="table-cell text-center border-r border-gray-200 w-[150px]">
                  {onUpdateItem ? (
                    <EditableCell 
                      value={item.pesoUnitario} 
                      field="pesoUnitario" 
                      item={item} 
                      onUpdate={onUpdateItem}
                      type="number"
                    />
                  ) : (
                    formatNumber(item.pesoUnitario, 2)
                  )}
                </td>
                
                {/* Sistema de Comentários */}
                <td className="table-cell border-r border-gray-200 w-[210px]">
                  <CommentsComponent
                    productId={`${item.PHOTO_NO}-${item.referencia}`}
                    comments={comments}
                    currentUser={currentUser || { id: '', name: 'Usuário' }}
                    onAddComment={onAddComment}
                    onImageClick={(images, index, title) => {
                      lightbox.openLightbox(images, index, title);
                    }}
                    availableUsers={availableUsers}
                    usersLoading={usersLoading}
                  />
                </td>
                
                {/* Nome do Contato */}
                <td className="table-cell border-r border-gray-200 w-[150px]">
                  {onUpdateItem ? (
                    <EditableCell 
                      value={item.nomeContato} 
                      field="nomeContato" 
                      item={item} 
                      onUpdate={onUpdateItem}
                      type="text"
                    />
                  ) : (
                    item.nomeContato
                  )}
                </td>
                
                {/* Telefone do Contato */}
                <td className="table-cell border-r border-gray-200 w-[150px]">
                  {onUpdateItem ? (
                    <EditableCell 
                      value={item.telefoneContato} 
                      field="telefoneContato" 
                      item={item} 
                      onUpdate={onUpdateItem}
                      type="text"
                    />
                  ) : (
                    item.telefoneContato
                  )}
                </td>
                
                {/* Ações */}
                <td className="table-cell text-center w-[80px]">
                  {onDeleteItem && (
                    <button
                      onClick={() => onDeleteItem(item)}
                      className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-md transition-colors duration-150 flex items-center justify-center"
                      title="Excluir produto"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CotacoesTable;