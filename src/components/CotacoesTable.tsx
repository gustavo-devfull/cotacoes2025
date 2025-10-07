import React from 'react';
import { CotacaoItem, Comment, User } from '../types';
import { Eye, Loader2, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import CommentsComponent from './CommentsComponent';
import { ftpImageService } from '../services/ftpImageService';
import { formatDateToBrazilian } from '../utils/dateUtils';

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
        const url = await ftpImageService.getImageUrl(productRef);
        if (url) {
          setImageUrl(url);
        } else {
          setImageError(true);
        }
      } catch (error) {
        console.error(`Erro ao carregar imagem para REF ${productRef}:`, error);
        setImageError(true);
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
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          setImageError(true);
          setImageLoaded(true);
        }}
        onClick={handleImageClick}
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
  type?: 'text' | 'number';
  className?: string;
}

const EditableCell: React.FC<EditableCellProps> = ({ 
  value, 
  field, 
  item, 
  onUpdate, 
  type = 'text',
  className = ''
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(String(value));
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

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
    return (
      <input
        ref={inputRef}
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={`w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
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
  onAddComment: (productId: string, message: string, imageUrls: string[]) => void;
  lightbox: {
    openLightbox: (images: string[], index?: number, title?: string) => void;
  };
}

const CotacoesTable: React.FC<CotacoesTableProps> = ({ 
  data, 
  onUpdateItem, 
  onDeleteItem, 
  isLoading = false,
  comments,
  currentUser,
  onAddComment,
  lightbox
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
      // Calcular a posição aproximada da coluna PHOTO
      // SHOP NO (190px) + NUM COTAÇÃO (190px) + REF (190px) + DESCRIPTION (190px) + OBS (400px) + MOQ (100px) = 1260px
      const photoColumnPosition = 1260;
      scrollContainerRef.current.scrollTo({
        left: photoColumnPosition,
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
            title="Rolar para a coluna PHOTO"
          >
            <Camera className="w-4 h-4" />
            PHOTO
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
          <thead className="table-header sticky top-0 z-20 bg-white shadow-sm">
            <tr>
              <th className="table-cell text-left w-[190px] border-r border-gray-200">SHOP NO</th>
              <th className="table-cell text-left w-[190px] border-r border-gray-200">NUM COTAÇÃO</th>
              <th className="table-cell text-left w-[190px] border-r border-gray-200">REF</th>
              <th className="table-cell text-left w-[190px] border-r border-gray-200">DESCRIPTION</th>
              <th className="table-cell text-left w-[400px] border-r border-gray-200">OBS</th>
              <th className="table-cell text-center w-[100px] border-r border-gray-200">MOQ</th>
              <th className="table-cell text-center w-[100px] border-r border-gray-200">PHOTO</th>
              <th className="table-cell text-center w-[100px] border-r border-gray-200">CTNS</th>
              <th className="table-cell text-center w-[100px] border-r border-gray-200">UNIT/CTN</th>
              <th className="table-cell text-center w-[100px] border-r border-gray-200">QTY</th>
              <th className="table-cell text-right w-[150px] border-r border-gray-200">U.PRICE RMB</th>
              <th className="table-cell text-center w-[100px] border-r border-gray-200">UNIT</th>
              <th className="table-cell text-right w-[150px] border-r border-gray-200">AMOUNT</th>
              <th className="table-cell text-center w-[100px] border-r border-gray-200">L (cm)</th>
              <th className="table-cell text-center w-[100px] border-r border-gray-200">W (cm)</th>
              <th className="table-cell text-center w-[100px] border-r border-gray-200">H (cm)</th>
              <th className="table-cell text-right w-[100px] border-r border-gray-200">CBM</th>
              <th className="table-cell text-right w-[150px] border-r border-gray-200">CBM TOTAL</th>
              <th className="table-cell text-right w-[100px] border-r border-gray-200">G.W</th>
              <th className="table-cell text-right w-[100px] border-r border-gray-200">T.G.W</th>
              <th className="table-cell text-right w-[100px] border-r border-gray-200">N.W</th>
              <th className="table-cell text-right w-[100px] border-r border-gray-200">T.N.W</th>
              <th className="table-cell text-center w-[190px] border-r border-gray-200">PESO UNIT (kg)</th>
              <th className="table-cell text-left w-[400px] border-r border-gray-200">OBSERVATIONS EXTRA</th>
              <th className="table-cell text-left w-[150px] border-r border-gray-200">NOME CONTATO</th>
              <th className="table-cell text-left w-[150px] border-r border-gray-200">TELEFONE CONTATO</th>
              <th className="table-cell text-center w-[190px]">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={`${item.PHOTO_NO}-${index}`} className="hover:bg-gray-50 transition-colors duration-150">
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
                <td className="table-cell font-medium text-purple-600 border-r border-gray-200 w-[190px]">
                  {onUpdateItem ? (
                    <EditableCell 
                      value={formatDateToBrazilian(item.NUM_COTACAO)} 
                      field="NUM_COTACAO" 
                      item={item} 
                      onUpdate={onUpdateItem}
                      type="text"
                    />
                  ) : (
                    formatDateToBrazilian(item.NUM_COTACAO)
                  )}
                </td>
                <td className="table-cell font-medium text-blue-600 border-r border-gray-200 w-[190px]">
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
                      type="text"
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
                    formatNumber(item.MOQ)
                  )}
                </td>
                
                {/* PHOTO */}
                <td className="table-cell text-center border-r border-gray-200 w-[100px]">
                  <ProductImage 
                    productRef={item.referencia} 
                    description={item.description}
                    onImageClick={(imageUrl, title) => {
                      lightbox.openLightbox([imageUrl], 0, title);
                    }}
                  />
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
                    formatNumber(item.ctns)
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
                    formatNumber(item.unitCtn)
                  )}
                </td>
                <td className="table-cell text-center font-medium text-blue-600 border-r border-gray-200 w-[100px]">
                  {formatNumber(item.qty)}
                </td>
                <td className="table-cell text-right font-medium border-r border-gray-200 w-[150px]">
                  {onUpdateItem ? (
                    <EditableCell 
                      value={item.unitPriceRmb} 
                      field="unitPriceRmb" 
                      item={item} 
                      onUpdate={onUpdateItem}
                      type="number"
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
                
                <td className="table-cell text-center border-r border-gray-200 w-[190px]">
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
                <td className="table-cell border-r border-gray-200 w-[400px]">
                  <CommentsComponent
                    productId={`${item.PHOTO_NO}-${item.referencia}`}
                    comments={comments}
                    currentUser={currentUser || { id: '', name: 'Usuário' }}
                    onAddComment={onAddComment}
                    onImageClick={(images, index, title) => {
                      lightbox.openLightbox(images, index, title);
                    }}
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
                <td className="table-cell text-center w-[190px]">
                  {onDeleteItem && (
                    <button
                      onClick={() => onDeleteItem(item)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors duration-150 flex items-center gap-1"
                      title="Excluir produto"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Excluir
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CotacoesTable;