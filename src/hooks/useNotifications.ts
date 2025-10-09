import { useState, useEffect } from 'react';
import { Notification } from '../types';
import { addDoc, collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escutar notificações em tempo real
    const q = query(
      collection(db, 'notifications'), 
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsData: Notification[] = [];
      let unread = 0;
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const notification: Notification = {
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
        };
        
        notificationsData.push(notification);
        if (!notification.isRead) {
          unread++;
        }
      });
      
      setNotifications(notificationsData);
      setUnreadCount(unread);
      setLoading(false);
    }, (error) => {
      console.error('Erro na escuta de notificações:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createNotification = async (
    productId: string,
    productInfo: { shopNo: string; ref: string; description: string },
    commentInfo: { userId: string; userName: string; message: string; timestamp: Date }
  ) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        type: 'comment',
        productId,
        productInfo,
        commentInfo,
        isRead: false,
        createdAt: new Date()
      });
      
      console.log('Notificação criada com sucesso');
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      throw error;
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        isRead: true
      });
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      const promises = unreadNotifications.map(notification => 
        updateDoc(doc(db, 'notifications', notification.id), {
          isRead: true
        })
      );
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    createNotification,
    markAsRead,
    markAllAsRead
  };
};
