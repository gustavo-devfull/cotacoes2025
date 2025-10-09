import { 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc,
  orderBy 
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
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('productId', '==', productId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const notifications: NotificationDocument[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
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
      
      return notifications;
    } catch (error) {
      console.error('Erro ao buscar notificações por produto:', error);
      throw error;
    }
  },

  /**
   * Excluir todas as notificações associadas a um produto
   */
  async deleteNotificationsByProductId(productId: string): Promise<number> {
    try {
      // Buscar todas as notificações do produto
      const notifications = await this.getNotificationsByProductId(productId);
      
      if (notifications.length === 0) {
        console.log('Nenhuma notificação encontrada para o produto:', productId);
        return 0;
      }

      // Excluir cada notificação
      let deletedCount = 0;
      for (const notification of notifications) {
        try {
          await deleteDoc(doc(db, NOTIFICATIONS_COLLECTION, notification.id));
          deletedCount++;
          console.log('Notificação excluída:', notification.id);
        } catch (error) {
          console.error('Erro ao excluir notificação:', notification.id, error);
        }
      }

      console.log(`Excluídas ${deletedCount} notificações para o produto:`, productId);
      return deletedCount;
    } catch (error) {
      console.error('Erro ao excluir notificações do produto:', error);
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
  }
};
