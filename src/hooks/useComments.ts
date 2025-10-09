import { useState, useEffect } from 'react';
import { Comment } from '../types';
import { addDoc, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

export const useComments = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  useEffect(() => {
    // Tentar conectar ao Firebase primeiro
    const q = query(collection(db, 'comments'), orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData: Comment[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        commentsData.push({
          id: doc.id,
          productId: data.productId,
          userId: data.userId,
          userName: data.userName,
          message: data.message,
          images: data.images || [],
          timestamp: data.timestamp?.toDate() || new Date(),
          mentionedUsers: data.mentionedUsers || [] // ADICIONADO: Carregar mentionedUsers
        });
      });
      setComments(commentsData);
      setLoading(false);
      setIsOfflineMode(false);
    }, (error) => {
      console.error('Erro na escuta em tempo real de comentários:', error);
      setFirebaseError(`Erro Firebase: ${error.message}`);
      setLoading(false);
      setIsOfflineMode(false); // Manter modo online mesmo com erro
      
      // Não usar fallback offline - manter comentários vazios
      setComments([]);
    });

    return () => unsubscribe();
  }, []);

  const addComment = async (
    productId: string, 
    message: string, 
    imageUrls: string[], 
    user: { id: string; name: string },
    productInfo?: { shopNo: string; ref: string; description: string },
    mentionedUsers?: string[]
  ) => {
    try {
      console.log('💾 SALVANDO COMENTÁRIO NO FIREBASE:', {
        productId,
        message,
        imageUrls: imageUrls.length,
        user: user.name,
        mentionedUsers,
        mentionedUsersLength: mentionedUsers?.length || 0
      });
      
      // Sempre usar Firebase - modo online apenas
      await addDoc(collection(db, 'comments'), {
        productId,
        userId: user.id,
        userName: user.name,
        message,
        images: imageUrls,
        timestamp: new Date(),
        mentionedUsers: mentionedUsers || []
      });
      
      console.log('Comentário salvo no Firebase com sucesso');
      
      // Criar notificação se informações do produto foram fornecidas
      if (productInfo) {
        // Determinar a mensagem da notificação
        let notificationMessage = message;
        
        // Se não há mensagem de texto mas há imagens, usar "Foto"
        if (!message.trim() && imageUrls.length > 0) {
          notificationMessage = 'Foto';
        }
        // Se há mensagem e imagens, manter a mensagem original
        else if (message.trim() && imageUrls.length > 0) {
          notificationMessage = message;
        }
        // Se só há mensagem, manter a mensagem original
        else if (message.trim()) {
          notificationMessage = message;
        }
        
        await addDoc(collection(db, 'notifications'), {
          type: 'comment',
          productId,
          productInfo,
          commentInfo: {
            userId: user.id,
            userName: user.name,
            message: notificationMessage,
            timestamp: new Date(),
            mentionedUsers: mentionedUsers || []
          },
          isRead: false,
          createdAt: new Date()
        });
        
        console.log('Notificação criada com sucesso');
      }
    } catch (error: any) {
      console.error('Erro ao adicionar comentário no Firebase:', error);
      setFirebaseError(`Erro ao salvar comentário: ${error.message}`);
      throw error; // Re-throw para que o componente possa tratar
    }
  };

  return {
    comments,
    loading,
    addComment,
    isOfflineMode,
    firebaseError
  };
};