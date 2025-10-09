import { 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface NotificationDocument {
  id: string;
  type: 'comment';
  productId: string;
  productInfo: {
    shopNo: string;
    ref: string;
    description: string;
  };
  commentInfo: {
    userId: string;
    userName: string;
    message: string;
    timestamp: Date;
  };
  isRead: boolean;
  createdAt: Date;
}

const NOTIFICATIONS_COLLECTION = 'notifications';

export const notificationsService = {
  /**
   * Buscar notificações por ID do produto
   */
  async getNotificationsByProductId(productId: string): Promise<NotificationDocument[]> {
    try {
      console.log('🔔 Buscando notificações para productId:', productId);
      
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('productId', '==', productId)
      );
      
      const querySnapshot = await getDocs(q);
      const notifications: NotificationDocument[] = [];
      
      console.log('📊 Total de notificações encontradas:', querySnapshot.size);
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('🔔 Notificação encontrada:', {
          id: doc.id,
          productId: data.productId,
          message: data.commentInfo?.message?.substring(0, 30) + '...'
        });
        
        notifications.push({
          id: doc.id,
          type: data.type,
          productId: data.productId,
          productInfo: data.productInfo,
          commentInfo: {
            ...data.commentInfo,
            timestamp: data.commentInfo.timestamp?.toDate() || new Date()
          },
          isRead: data.isRead || false,
          createdAt: data.createdAt?.toDate() || new Date()
        });
      });
      
      console.log('✅ Notificações retornadas:', notifications.length);
      return notifications;
    } catch (error) {
      console.error('❌ Erro ao buscar notificações por produto:', error);
      throw error;
    }
  },

  /**
   * Excluir todas as notificações associadas a um produto
   */
  async deleteNotificationsByProductId(productId: string): Promise<number> {
    try {
      console.log('🗑️ Iniciando exclusão de notificações para productId:', productId);
      
      // Buscar todas as notificações do produto
      const notifications = await this.getNotificationsByProductId(productId);
      
      if (notifications.length === 0) {
        console.log('ℹ️ Nenhuma notificação encontrada para o produto:', productId);
        return 0;
      }

      console.log(`🗑️ Encontradas ${notifications.length} notificações para excluir`);

      // Excluir cada notificação
      let deletedCount = 0;
      for (const notification of notifications) {
        try {
          console.log('🗑️ Excluindo notificação:', notification.id);
          await deleteDoc(doc(db, NOTIFICATIONS_COLLECTION, notification.id));
          deletedCount++;
          console.log('✅ Notificação excluída com sucesso:', notification.id);
        } catch (error) {
          console.error('❌ Erro ao excluir notificação:', notification.id, error);
        }
      }

      console.log(`✅ Exclusão concluída: ${deletedCount}/${notifications.length} notificações excluídas para o produto:`, productId);
      return deletedCount;
    } catch (error) {
      console.error('❌ Erro ao excluir notificações do produto:', error);
      throw error;
    }
  },

  /**
   * Excluir notificações de múltiplos produtos
   */
  async deleteNotificationsByProductIds(productIds: string[]): Promise<{ [productId: string]: number }> {
    const results: { [productId: string]: number } = {};
    
    try {
      for (const productId of productIds) {
        try {
          const deletedCount = await this.deleteNotificationsByProductId(productId);
          results[productId] = deletedCount;
        } catch (error) {
          console.error(`Erro ao excluir notificações do produto ${productId}:`, error);
          results[productId] = 0;
        }
      }
      
      return results;
    } catch (error) {
      console.error('Erro ao excluir notificações de múltiplos produtos:', error);
      throw error;
    }
  },

  /**
   * Gerar ID do produto baseado no PHOTO_NO e REF
   */
  generateProductId(photoNo: string, ref: string): string {
    return `${photoNo}-${ref}`;
  },

  /**
   * Excluir todas as notificações do sistema
   */
  async deleteAllNotifications(): Promise<number> {
    try {
      console.log('🗑️ Iniciando exclusão de todas as notificações');
      
      // Buscar todas as notificações
      const q = query(collection(db, NOTIFICATIONS_COLLECTION));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.size === 0) {
        console.log('ℹ️ Nenhuma notificação encontrada para excluir');
        return 0;
      }

      console.log(`🗑️ Encontradas ${querySnapshot.size} notificações para excluir`);

      // Excluir cada notificação
      let deletedCount = 0;
      for (const docSnapshot of querySnapshot.docs) {
        try {
          console.log('🗑️ Excluindo notificação:', docSnapshot.id);
          await deleteDoc(doc(db, NOTIFICATIONS_COLLECTION, docSnapshot.id));
          deletedCount++;
          console.log('✅ Notificação excluída com sucesso:', docSnapshot.id);
        } catch (error) {
          console.error('❌ Erro ao excluir notificação:', docSnapshot.id, error);
        }
      }

      console.log(`✅ Exclusão concluída: ${deletedCount}/${querySnapshot.size} notificações excluídas`);
      return deletedCount;
    } catch (error) {
      console.error('❌ Erro ao excluir todas as notificações:', error);
      throw error;
    }
  }
};
