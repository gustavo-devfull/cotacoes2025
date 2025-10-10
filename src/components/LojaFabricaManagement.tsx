import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Building2, Phone, Calendar, Tag } from 'lucide-react';
import { LojaFabrica } from '../types';

const LojaFabricaManagement: React.FC = () => {
  const [lojas, setLojas] = useState<LojaFabrica[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoja, setEditingLoja] = useState<LojaFabrica | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    nomeContato: '',
    telefone: '',
    segmento: '',
    dataCotacao: ''
  });

  // Dados mock para demonstração
  useEffect(() => {
    const mockLojas: LojaFabrica[] = [
      {
        id: '1',
        nome: 'Fábrica Tech Solutions',
        nomeContato: 'João Silva',
        telefone: '(11) 99999-9999',
        segmento: 'Eletrônicos',
        dataCotacao: '2025-01-15',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-15')
      },
      {
        id: '2',
        nome: 'Loja Premium Audio',
        nomeContato: 'Maria Santos',
        telefone: '(11) 88888-8888',
        segmento: 'Áudio',
        dataCotacao: '2025-01-16',
        createdAt: new Date('2025-01-02'),
        updatedAt: new Date('2025-01-16')
      },
      {
        id: '3',
        nome: 'Fábrica Mobile Accessories',
        nomeContato: 'Carlos Oliveira',
        telefone: '(11) 77777-7777',
        segmento: 'Acessórios',
        dataCotacao: '2025-01-17',
        createdAt: new Date('2025-01-03'),
        updatedAt: new Date('2025-01-17')
      }
    ];
    setLojas(mockLojas);
  }, []);

  const filteredLojas = lojas.filter(loja =>
    loja.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loja.nomeContato.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loja.segmento.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (loja?: LojaFabrica) => {
    if (loja) {
      setEditingLoja(loja);
      setFormData({
        nome: loja.nome,
        nomeContato: loja.nomeContato,
        telefone: loja.telefone,
        segmento: loja.segmento,
        dataCotacao: loja.dataCotacao
      });
    } else {
      setEditingLoja(null);
      setFormData({
        nome: '',
        nomeContato: '',
        telefone: '',
        segmento: '',
        dataCotacao: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLoja(null);
    setFormData({
      nome: '',
      nomeContato: '',
      telefone: '',
      segmento: '',
      dataCotacao: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingLoja) {
      // Editar loja existente
      const updatedLoja: LojaFabrica = {
        ...editingLoja,
        ...formData,
        updatedAt: new Date()
      };
      setLojas(lojas.map(loja => loja.id === editingLoja.id ? updatedLoja : loja));
    } else {
      // Criar nova loja
      const newLoja: LojaFabrica = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setLojas([...lojas, newLoja]);
    }
    
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta loja/fábrica?')) {
      setLojas(lojas.filter(loja => loja.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lojas e Fábricas</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gerencie as informações das lojas e fábricas parceiras
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="mt-4 sm:mt-0 btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Loja/Fábrica
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Buscar por nome, contato ou segmento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLojas.map((loja) => (
          <div key={loja.id} className="card hover:shadow-lg transition-shadow duration-200">
            {/* Card Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{loja.nome}</h3>
                  <p className="text-sm text-gray-500">{loja.segmento}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal(loja)}
                  className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(loja.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Card Content */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{loja.nomeContato}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{loja.telefone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Tag className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{loja.segmento}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  {new Date(loja.dataCotacao).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>

            {/* Card Footer */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Criado em {new Date(loja.createdAt).toLocaleDateString('pt-BR')}</span>
                <span>Atualizado em {new Date(loja.updatedAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredLojas.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Nenhuma loja encontrada' : 'Nenhuma loja cadastrada'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Tente ajustar os termos de busca' 
              : 'Comece adicionando uma nova loja ou fábrica'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => handleOpenModal()}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Nova Loja/Fábrica
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingLoja ? 'Editar Loja/Fábrica' : 'Nova Loja/Fábrica'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Loja/Fábrica *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Contato *
                  </label>
                  <input
                    type="text"
                    value={formData.nomeContato}
                    onChange={(e) => setFormData({ ...formData, nomeContato: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Segmento *
                  </label>
                  <input
                    type="text"
                    value={formData.segmento}
                    onChange={(e) => setFormData({ ...formData, segmento: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data da Cotação *
                  </label>
                  <input
                    type="date"
                    value={formData.dataCotacao}
                    onChange={(e) => setFormData({ ...formData, dataCotacao: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    {editingLoja ? 'Salvar Alterações' : 'Criar Loja/Fábrica'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LojaFabricaManagement;
