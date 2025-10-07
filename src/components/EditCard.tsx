import React, { useState } from 'react';
import { CotacaoItem } from '../types';
import { Edit3, Trash2, CheckSquare, Square, X } from 'lucide-react';

interface EditCardProps {
  data: CotacaoItem[];
  onDeleteSelected: (selectedItems: CotacaoItem[], onProgress?: (progress: number) => void) => Promise<void>;
  onClose: () => void;
}

const EditCard: React.FC<EditCardProps> = ({ data, onDeleteSelected, onClose }) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingProgress, setDeletingProgress] = useState(0);

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
    setSelectAll(newSelected.size === data.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(data.map(item => `${item.PHOTO_NO}-${item.referencia}`));
      setSelectedItems(allIds);
      setSelectAll(true);
    }
  };

  const handleDeleteSelected = async () => {
    const itemsToDelete = data.filter(item => 
      selectedItems.has(`${item.PHOTO_NO}-${item.referencia}`)
    );
    
    setIsDeleting(true);
    setDeletingProgress(0);
    
    try {
      await onDeleteSelected(itemsToDelete, (progress) => {
        setDeletingProgress(progress);
      });
      setSelectedItems(new Set());
      setSelectAll(false);
    } catch (error) {
      console.error('Erro ao excluir itens:', error);
    } finally {
      setIsDeleting(false);
      setDeletingProgress(0);
    }
  };

  const selectedCount = selectedItems.size;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Edit3 className="w-6 h-6 text-primary-600" />
            Editar Produtos
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Controles */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                disabled={isDeleting}
              >
                {selectAll ? (
                  <CheckSquare className="w-5 h-5 text-primary-600" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400" />
                )}
                Selecionar Todos
              </button>
              <span className="text-sm text-gray-600">
                {selectedCount} de {data.length} produtos selecionados
              </span>
            </div>
            
            {selectedCount > 0 && (
              <button
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Excluindo...' : `Excluir Selecionados (${selectedCount})`}
              </button>
            )}
          </div>
          
          {/* Barra de Progresso */}
          {isDeleting && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Excluindo produtos...</span>
                <span>{deletingProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${deletingProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Lista de Produtos */}
        <div className="overflow-y-auto max-h-[400px]">
          <div className="p-6">
            <div className="space-y-3">
              {data.map((item) => {
                const itemId = `${item.PHOTO_NO}-${item.referencia}`;
                const isSelected = selectedItems.has(itemId);
                
                return (
                  <div
                    key={itemId}
                    className={`p-4 border rounded-lg transition-colors duration-200 ${
                      isSelected 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleSelectItem(itemId)}
                        className="flex-shrink-0"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-primary-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {item.referencia}
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.description}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">SHOP NO</p>
                          <p className="text-sm font-medium text-gray-900">
                            {item.SHOP_NO}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">NUM COTAÇÃO</p>
                          <p className="text-sm font-medium text-gray-900">
                            {item.NUM_COTACAO}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Valor</p>
                          <p className="text-sm font-medium text-gray-900">
                            ¥{item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCard;
