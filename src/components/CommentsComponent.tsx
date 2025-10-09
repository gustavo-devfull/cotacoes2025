import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Image, X } from 'lucide-react';
import { Comment as CommentType } from '../types';
import { uploadService } from '../services/uploadService';
import { useUsers } from '../hooks/useUsers';

interface CommentsComponentProps {
  productId: string;
  comments: CommentType[];
  currentUser: { id: string; name: string; avatar?: string };
  onAddComment: (productId: string, message: string, imageUrls: string[], mentionedUsers?: string[]) => void;
  onImageClick?: (images: string[], index: number, title?: string) => void;
  availableUsers?: { id: string; name: string; email: string }[]; // Lista de usuários disponíveis para marcar
  usersLoading?: boolean; // Indicador de carregamento dos usuários
}

const CommentsComponent: React.FC<CommentsComponentProps> = ({
  productId,
  comments,
  onAddComment,
  onImageClick,
  availableUsers = [],
  usersLoading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [mentionedUsersNames, setMentionedUsersNames] = useState<{[key: string]: string[]}>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getUsersByIds } = useUsers();

  // Filtrar comentários do produto atual
  const productComments = comments.filter(comment => comment.productId === productId);
  
  // DEBUG: Adicionar comentário de teste se não houver comentários com mentionedUsers
  const hasCommentsWithMentions = productComments.some(comment => comment.mentionedUsers && comment.mentionedUsers.length > 0);
  if (!hasCommentsWithMentions && productComments.length > 0) {
    console.log('🔍 DEBUG: Nenhum comentário com usuários marcados encontrado');
    console.log('📊 Comentários disponíveis:', productComments.map(c => ({
      id: c.id,
      message: c.message,
      mentionedUsers: c.mentionedUsers,
      hasMentionedUsers: !!(c.mentionedUsers && c.mentionedUsers.length > 0)
    })));
  }

  // Carregar nomes dos usuários marcados
  useEffect(() => {
    const loadMentionedUsersNames = async () => {
      console.log('🔍 Carregando nomes dos usuários marcados...');
      console.log('📊 Comentários recebidos:', comments.length);
      
      const cache: {[key: string]: string[]} = {};
      
      for (const comment of productComments) {
        console.log(`📝 Comentário ${comment.id}:`, {
          message: comment.message,
          mentionedUsers: comment.mentionedUsers,
          hasMentionedUsers: !!(comment.mentionedUsers && comment.mentionedUsers.length > 0)
        });
        
        if (comment.mentionedUsers && comment.mentionedUsers.length > 0) {
          const cacheKey = comment.mentionedUsers.sort().join(',');
          
          if (!cache[cacheKey]) {
            try {
              console.log(`🔍 Buscando nomes para IDs: ${comment.mentionedUsers.join(', ')}`);
              const users = await getUsersByIds(comment.mentionedUsers);
              cache[cacheKey] = users.map(user => user.name);
              console.log(`✅ Nomes encontrados: ${cache[cacheKey].join(', ')}`);
            } catch (error) {
              console.error('❌ Erro ao carregar nomes dos usuários marcados:', error);
              cache[cacheKey] = comment.mentionedUsers; // Fallback para IDs
            }
          }
        }
      }
      
      console.log('📊 Cache final de nomes:', cache);
      setMentionedUsersNames(cache);
    };

    if (productComments.length > 0) {
      loadMentionedUsersNames();
    }
  }, [productComments, getUsersByIds]);

  const handleSendMessage = async () => {
    if (newMessage.trim() || selectedFiles.length > 0) {
      setIsUploading(true);
      
      try {
        const imageUrls: string[] = [];
        
        // Upload das imagens usando o novo serviço
        if (selectedFiles.length > 0) {
          for (const file of selectedFiles) {
            // Comprimir imagem antes do upload
            const compressedImage = await uploadService.compressImage(file, 800, 0.8);
            
            // Upload da imagem
            const result = await uploadService.uploadImage(compressedImage, file.name);
            
            if (result.success && result.url) {
              imageUrls.push(result.url);
              
              // Mostrar mensagem se for modo offline
              if (result.isOffline) {
                console.log(`Imagem ${file.name} salva em modo offline (base64)`);
              }
            } else {
              console.error('Erro no upload da imagem:', result.error);
              alert(`Erro ao enviar imagem ${file.name}: ${result.error}`);
            }
          }
        }
        
        // Enviar comentário com URLs das imagens
        console.log('📤 Enviando comentário com usuários marcados:', {
          productId,
          message: newMessage.trim(),
          imageUrls,
          selectedUsers,
          hasSelectedUsers: selectedUsers.length > 0
        });
        
        onAddComment(productId, newMessage.trim(), imageUrls, selectedUsers.length > 0 ? selectedUsers : undefined);
        
        // Limpar formulário
        setNewMessage('');
        setSelectedFiles([]);
        setSelectedUsers([]);
      } catch (error) {
        console.error('Erro ao enviar comentário:', error);
        alert('Erro ao enviar comentário. Tente novamente.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const validFiles: File[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validar arquivo usando o serviço de upload
        const validation = uploadService.validateFile(file);
        if (!validation.valid) {
          alert(`Arquivo ${file.name}: ${validation.error}`);
          continue;
        }
        
        validFiles.push(file);
      }
      
      if (validFiles.length > 0) {
        setSelectedFiles(prev => [...prev, ...validFiles]);
      }
      
      // Limpar input
      event.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="relative">
      {/* Botão para abrir comentários */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors duration-200"
        title="Comentários do produto"
      >
        <MessageCircle className="w-4 h-4" />
        <span className="text-sm font-medium">
          {productComments.length} comentário{productComments.length !== 1 ? 's' : ''}
        </span>
      </button>

      {/* Modal de comentários */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Comentários do Produto
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Lista de comentários */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {productComments.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum comentário ainda. Seja o primeiro a comentar!</p>
                </div>
              ) : (
                productComments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    {/* Avatar do usuário */}
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        {comment.userName.charAt(0).toUpperCase()}
                      </div>
                    </div>

                    {/* Conteúdo do comentário */}
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-900 text-sm">
                            {comment.userName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(comment.timestamp)}
                          </span>
                        </div>
                        
                        {comment.message && (
                          <p className="text-gray-700 text-sm mb-2">
                            {comment.message}
                          </p>
                        )}

                        {/* Usuários marcados - SEMPRE mostrar se existirem */}
                        {comment.mentionedUsers && comment.mentionedUsers.length > 0 && (
                          <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                            <div className="flex items-center gap-2 text-sm text-blue-700">
                              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              <span className="font-medium">Marcou:</span>
                              <span className="font-semibold text-blue-800">
                                {(() => {
                                  console.log(`🏷️ RENDERIZANDO COMENTÁRIO ${comment.id}:`, {
                                    mentionedUsers: comment.mentionedUsers,
                                    mentionedUsersLength: comment.mentionedUsers?.length,
                                    message: comment.message,
                                    timestamp: comment.timestamp
                                  });
                                  
                                  // SEMPRE mostrar os IDs primeiro, depois tentar nomes
                                  const ids = comment.mentionedUsers.join(', ');
                                  console.log(`🔍 IDs dos usuários marcados: ${ids}`);
                                  
                                  const cacheKey = comment.mentionedUsers.sort().join(',');
                                  const userNames = mentionedUsersNames[cacheKey];
                                  
                                  if (userNames && userNames.length > 0) {
                                    console.log(`✅ Usando nomes do cache: ${userNames.join(', ')}`);
                                    return userNames.join(', ');
                                  }
                                  
                                  console.log(`⚠️ Usando IDs como fallback: ${ids}`);
                                  return ids;
                                })()}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Imagens do comentário */}
                        {comment.images.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {comment.images.map((image, index) => (
                              <img
                                key={index}
                                src={image}
                                alt={`Imagem ${index + 1}`}
                                className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-all duration-200"
                                onClick={() => {
                                  if (onImageClick) {
                                    onImageClick(comment.images, index, `Comentário de ${comment.userName}`);
                                  }
                                }}
                                title="Clique para ampliar"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Área de novo comentário */}
            <div className="border-t border-gray-200 p-4">
              {/* Indicador de upload */}
              <div className="space-y-3">
            {/* Arquivos selecionados */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Arquivos selecionados:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <Image className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700 truncate flex-1">
                        {file.name}
                      </span>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seleção de usuários para marcar */}
            {(availableUsers.length > 0 || usersLoading) && (
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marcar usuários:
                </label>
                {usersLoading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Carregando usuários...
                  </div>
                ) : availableUsers.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {availableUsers.map((user) => (
                      <label key={user.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user.id]);
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{user.name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    Nenhum usuário cadastrado no sistema
                  </div>
                )}
              </div>
            )}

                {/* Input de mensagem */}
                <div className="flex gap-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite seu comentário..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={2}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-300 text-gray-700 rounded-lg transition-colors duration-200"
                    title="Adicionar imagem"
                  >
                    <Image className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={(!newMessage.trim() && selectedFiles.length === 0) || isUploading}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors duration-200"
                    title="Enviar comentário"
                  >
                    {isUploading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Input de arquivo oculto */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentsComponent;
