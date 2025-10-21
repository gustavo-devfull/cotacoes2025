import React, { useState, useEffect } from 'react';
import { Bell, X, MessageCircle, Package, Clock, Check, CheckCheck, Filter } from 'lucide-react';
import { Notification } from '../types';
import { formatDateTimeToBrazilian } from '../utils/dateUtils';
import { useUsers } from '../contexts/UsersContext';
import { useUser } from '../contexts/UserContext';

interface NotificationBellProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onFilterByRef?: (ref: string) => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onFilterByRef
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showOnlyMyComments, setShowOnlyMyComments] = useState(false);
  
  // Get users context with error handling
  const usersContext = useUsers();
  const { getUsersByIds } = usersContext;
  const { currentUser } = useUser();
  const [mentionedUsersCache, setMentionedUsersCache] = useState<{[key: string]: string[]}>({});

  // Carregar nomes dos usuários marcados
  useEffect(() => {
    const loadMentionedUsers = async () => {
      const cache: {[key: string]: string[]} = {};
      
      for (const notification of notifications) {
        const { mentionedUsers } = notification.commentInfo;
        if (mentionedUsers && mentionedUsers.length > 0) {
          const cacheKey = mentionedUsers.sort().join(',');
          
          if (!cache[cacheKey]) {
            try {
              const users = await getUsersByIds(mentionedUsers);
              cache[cacheKey] = users.map(user => user.name);
            } catch (error) {
              console.error('Erro ao carregar usuários marcados:', error);
              cache[cacheKey] = mentionedUsers; // Fallback para IDs
            }
          }
        }
      }
      
      setMentionedUsersCache(cache);
    };

    if (notifications.length > 0) {
      loadMentionedUsers();
    }
  }, [notifications, getUsersByIds]);

  const formatNotificationMessage = (notification: Notification) => {
    const { userName, message, mentionedUsers } = notification.commentInfo;
    const { shopNo, ref } = notification.productInfo;
    
    let baseMessage = `${userName} comentou em ${shopNo} - ${ref}: "${message.length > 50 ? message.substring(0, 50) + '...' : message}"`;
    
    // Adicionar informação sobre usuários marcados se existirem
    if (mentionedUsers && mentionedUsers.length > 0) {
      const cacheKey = mentionedUsers.sort().join(',');
      const userNames = mentionedUsersCache[cacheKey] || mentionedUsers;
      
      if (userNames.length > 0) {
        baseMessage += ` (marcou: ${userNames.join(', ')})`;
      }
    }
    
    return baseMessage;
  };

  const formatProductInfo = (notification: Notification) => {
    const { shopNo, ref, description } = notification.productInfo;
    return `${shopNo} - ${ref} - ${description.length > 30 ? description.substring(0, 30) + '...' : description}`;
  };

  // Contar quantos comentários o usuário logado está marcado
  const getMyCommentsCount = () => {
    if (!currentUser) return 0;
    return notifications.filter(notification => {
      const { mentionedUsers } = notification.commentInfo;
      return mentionedUsers && mentionedUsers.includes(currentUser.id);
    }).length;
  };

  // Filtrar notificações para mostrar apenas as que o usuário logado está marcado
  const getFilteredNotifications = () => {
    if (!showOnlyMyComments || !currentUser) {
      return notifications;
    }
    
    return notifications.filter(notification => {
      const { mentionedUsers } = notification.commentInfo;
      return mentionedUsers && mentionedUsers.includes(currentUser.id);
    });
  };

  const myCommentsCount = getMyCommentsCount();
  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-full transition-colors duration-200"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Notification Panel */}
          <div className="absolute right-0 mt-2 w-[28rem] max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[500px] overflow-hidden overflow-x-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Notificações</h3>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded"
                    title="Marcar todas como lidas"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Controls */}
            {currentUser && myCommentsCount > 0 && (
              <div className="px-4 py-3 border-b border-gray-200 bg-blue-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Você está marcado em {myCommentsCount} comentário{myCommentsCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowOnlyMyComments(!showOnlyMyComments)}
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-md transition-colors ${
                      showOnlyMyComments
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
                    }`}
                    title={showOnlyMyComments ? 'Mostrar todas as notificações' : 'Mostrar apenas meus comentários'}
                  >
                    <Filter className="w-3 h-3" />
                    {showOnlyMyComments ? 'Todas' : 'Apenas Meus'}
                  </button>
                </div>
              </div>
            )}

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>
                    {showOnlyMyComments 
                      ? 'Você não está marcado em nenhum comentário' 
                      : 'Nenhuma notificação'
                    }
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 ${
                      !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          !notification.isRead ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <MessageCircle className="w-4 h-4" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium break-words ${
                              !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {formatNotificationMessage(notification)}
                            </p>
                            
                            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                              <Package className="w-3 h-3" />
                              {onFilterByRef ? (
                                <button
                                  onClick={() => {
                                    onFilterByRef(notification.productInfo.ref);
                                    setIsOpen(false); // Fechar o modal após clicar
                                  }}
                                  className="text-left break-words text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
                                  title={`Filtrar tabela por REF: ${notification.productInfo.ref}`}
                                >
                                  {formatProductInfo(notification)}
                                </button>
                              ) : (
                                <span className="break-words">
                                  {formatProductInfo(notification)}
                                </span>
                              )}
                            </div>
                            
                            <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                              <Clock className="w-3 h-3" />
                              <span>
                                {formatDateTimeToBrazilian(notification.commentInfo.timestamp.toISOString())}
                              </span>
                            </div>
                          </div>
                          
                          {!notification.isRead && (
                            <button
                              onClick={() => onMarkAsRead(notification.id)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                              title="Marcar como lida"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {filteredNotifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
                <p className="text-xs text-gray-500">
                  {showOnlyMyComments ? (
                    <>
                      {filteredNotifications.length} de {notifications.length} notificação{notifications.length !== 1 ? 'ões' : ''} 
                      {myCommentsCount > 0 && ` (${myCommentsCount} onde você está marcado)`}
                    </>
                  ) : (
                    <>
                      {filteredNotifications.length} notificação{filteredNotifications.length !== 1 ? 'ões' : ''} total
                      {myCommentsCount > 0 && ` (${myCommentsCount} onde você está marcado)`}
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
