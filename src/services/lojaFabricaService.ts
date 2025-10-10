import { CotacaoItem, LojaFabrica } from '../types';
import { updateCotacao } from './cotacaoService';

// Serviço para gerenciar dados de Lojas/Fábricas extraídos das cotações
export class LojaFabricaService {
  // Extrair lojas únicas dos dados de cotação
  static extractLojasFromCotacoes(cotacoes: CotacaoItem[]): LojaFabrica[] {
    const lojasMap = new Map<string, LojaFabrica>();
    
    cotacoes.forEach(cotacao => {
      const key = `${cotacao.SHOP_NO}-${cotacao.nomeContato}-${cotacao.telefoneContato}`;
      
      if (!lojasMap.has(key)) {
        // Garantir que a data seja tratada corretamente (evitar problemas de fuso horário)
        const dataCotacao = cotacao.dataCotacao ? new Date(cotacao.dataCotacao + 'T00:00:00') : new Date();
        
        lojasMap.set(key, {
          id: key,
          nome: cotacao.SHOP_NO,
          nomeContato: cotacao.nomeContato || '',
          telefone: cotacao.telefoneContato || '',
          segmento: cotacao.segmento || '',
          dataCotacao: cotacao.dataCotacao || '',
          createdAt: dataCotacao,
          updatedAt: dataCotacao
        });
      } else {
        // Atualizar datas se necessário
        const existingLoja = lojasMap.get(key)!;
        const cotacaoDate = cotacao.dataCotacao ? new Date(cotacao.dataCotacao + 'T00:00:00') : new Date();
        
        if (cotacaoDate < existingLoja.createdAt) {
          existingLoja.createdAt = cotacaoDate;
        }
        if (cotacaoDate > existingLoja.updatedAt) {
          existingLoja.updatedAt = cotacaoDate;
        }
      }
    });
    
    return Array.from(lojasMap.values());
  }
  
  // Obter estatísticas de uma loja específica
  static getLojaStats(lojaId: string, cotacoes: CotacaoItem[]) {
    const lojaCotacoes = cotacoes.filter(cotacao => 
      `${cotacao.SHOP_NO}-${cotacao.nomeContato}-${cotacao.telefoneContato}` === lojaId
    );
    
    return {
      totalCotacoes: lojaCotacoes.length,
      totalItens: lojaCotacoes.reduce((sum, cotacao) => sum + cotacao.qty, 0),
      valorTotal: lojaCotacoes.reduce((sum, cotacao) => sum + cotacao.amount, 0),
      cbmTotal: lojaCotacoes.reduce((sum, cotacao) => sum + cotacao.cbm_total, 0),
      ultimaCotacao: lojaCotacoes.length > 0 ? 
        new Date(Math.max(...lojaCotacoes.map(c => new Date(c.dataCotacao).getTime()))) : 
        null
    };
  }
  
  // Obter produtos de uma loja específica
  static getLojaProdutos(lojaId: string, cotacoes: CotacaoItem[]) {
    return cotacoes.filter(cotacao => 
      `${cotacao.SHOP_NO}-${cotacao.nomeContato}-${cotacao.telefoneContato}` === lojaId
    );
  }
  
  // Filtrar lojas por critérios
  static filterLojas(lojas: LojaFabrica[], filters: {
    searchTerm?: string;
    segmento?: string;
    dataInicio?: string;
    dataFim?: string;
  }) {
    return lojas.filter(loja => {
      // Filtro por termo de busca
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        if (!loja.nome.toLowerCase().includes(searchLower) &&
            !loja.nomeContato.toLowerCase().includes(searchLower) &&
            !loja.segmento.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      
      // Filtro por segmento
      if (filters.segmento && loja.segmento !== filters.segmento) {
        return false;
      }
      
      // Filtro por data
      if (filters.dataInicio || filters.dataFim) {
        const lojaDate = new Date(loja.dataCotacao);
        if (filters.dataInicio && lojaDate < new Date(filters.dataInicio)) {
          return false;
        }
        if (filters.dataFim && lojaDate > new Date(filters.dataFim)) {
          return false;
        }
      }
      
      return true;
    });
  }
  
  // Obter segmentos únicos
  static getSegmentosUnicos(cotacoes: CotacaoItem[]): string[] {
    const segmentos = new Set<string>();
    cotacoes.forEach(cotacao => {
      if (cotacao.segmento) {
        segmentos.add(cotacao.segmento);
      }
    });
    return Array.from(segmentos).sort();
  }
  
  // Validar dados de uma loja
  static validateLoja(loja: Partial<LojaFabrica>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!loja.nome || loja.nome.trim() === '') {
      errors.push('Nome da loja/fábrica é obrigatório');
    }
    
    if (!loja.nomeContato || loja.nomeContato.trim() === '') {
      errors.push('Nome do contato é obrigatório');
    }
    
    if (!loja.telefone || loja.telefone.trim() === '') {
      errors.push('Telefone é obrigatório');
    }
    
    if (!loja.segmento || loja.segmento.trim() === '') {
      errors.push('Segmento é obrigatório');
    }
    
    if (!loja.dataCotacao) {
      errors.push('Data da cotação é obrigatória');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // Atualizar produtos associados a uma loja quando ela for editada
  static async updateProdutosAssociados(
    lojaId: string, 
    cotacoes: CotacaoItem[], 
    novosDados: { nome?: string; segmento?: string }
  ): Promise<void> {
    try {
      // Encontrar todos os produtos associados à loja
      const produtosAssociados = cotacoes.filter(cotacao => 
        `${cotacao.SHOP_NO}-${cotacao.nomeContato}-${cotacao.telefoneContato}` === lojaId
      );
      
      console.log(`🔄 Atualizando ${produtosAssociados.length} produtos associados à loja ${lojaId}`);
      
      // Atualizar cada produto
      const promises = produtosAssociados.map(async (produto) => {
        const updates: Partial<CotacaoItem> = {};
        
        // Atualizar SHOP_NO se o nome da loja mudou
        if (novosDados.nome && produto.SHOP_NO !== novosDados.nome) {
          updates.SHOP_NO = novosDados.nome;
        }
        
        // Atualizar segmento se mudou
        if (novosDados.segmento && produto.segmento !== novosDados.segmento) {
          updates.segmento = novosDados.segmento;
        }
        
        // Só atualizar se houver mudanças
        if (Object.keys(updates).length > 0) {
          // Assumindo que o produto tem um ID (se estiver vindo do Firebase)
          if ('id' in produto && produto.id) {
            await updateCotacao(produto.id, updates);
            console.log(`✅ Produto ${produto.id} atualizado`);
          } else {
            console.warn(`⚠️ Produto sem ID não pode ser atualizado:`, produto);
          }
        }
      });
      
      await Promise.all(promises);
      console.log(`✅ Todos os produtos associados à loja ${lojaId} foram atualizados`);
      
    } catch (error) {
      console.error('❌ Erro ao atualizar produtos associados:', error);
      throw error;
    }
  }
}
