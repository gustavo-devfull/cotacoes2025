import { 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface CommentDocument {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  message: string;
  images: string[];
  timestamp: Date;
}

const COMMENTS_COLLECTION = 'comments';

export const commentsService = {
  /**
   * Buscar comentários por ID do produto
   */
  async getCommentsByProductId(productId: string): Promise<CommentDocument[]> {
    try {
      console.log('🔍 Buscando comentários para productId:', productId);
      
      const q = query(
        collection(db, COMMENTS_COLLECTION),
        where('productId', '==', productId)
      );
      
      const querySnapshot = await getDocs(q);
      const comments: CommentDocument[] = [];
      
      console.log('📊 Total de comentários encontrados:', querySnapshot.size);
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('📝 Comentário encontrado:', {
          id: doc.id,
          productId: data.productId,
          message: data.message?.substring(0, 50) + '...'
        });
        
        comments.push({
          id: doc.id,
          productId: data.productId,
          userId: data.userId,
          userName: data.userName,
          message: data.message,
          images: data.images || [],
          timestamp: data.timestamp?.toDate() || new Date()
        });
      });
      
      console.log('✅ Comentários retornados:', comments.length);
      return comments;
    } catch (error) {
      console.error('❌ Erro ao buscar comentários por produto:', error);
      throw error;
    }
  },

  /**
   * Excluir todos os comentários associados a um produto
   */
  async deleteCommentsByProductId(productId: string): Promise<number> {
    try {
      // Buscar todos os comentários do produto
      const comments = await this.getCommentsByProductId(productId);
      
      if (comments.length === 0) {
        console.log('Nenhum comentário encontrado para o produto:', productId);
        return 0;
      }

      // Excluir cada comentário
      let deletedCount = 0;
      for (const comment of comments) {
        try {
          await deleteDoc(doc(db, COMMENTS_COLLECTION, comment.id));
          deletedCount++;
          console.log('Comentário excluído:', comment.id);
        } catch (error) {
          console.error('Erro ao excluir comentário:', comment.id, error);
        }
      }

      console.log(`Excluídos ${deletedCount} comentários para o produto:`, productId);
      return deletedCount;
    } catch (error) {
      console.error('Erro ao excluir comentários do produto:', error);
      throw error;
    }
  },

  /**
   * Excluir comentários de múltiplos produtos
   */
  async deleteCommentsByProductIds(productIds: string[]): Promise<{ [productId: string]: number }> {
    const results: { [productId: string]: number } = {};
    
    try {
      for (const productId of productIds) {
        try {
          const deletedCount = await this.deleteCommentsByProductId(productId);
          results[productId] = deletedCount;
        } catch (error) {
          console.error(`Erro ao excluir comentários do produto ${productId}:`, error);
          results[productId] = 0;
        }
      }
      
      return results;
    } catch (error) {
      console.error('Erro ao excluir comentários de múltiplos produtos:', error);
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
