import React, { useState } from 'react';
import { authService } from '../services/authService';

const UserRoleUpdater: React.FC = () => {
  const [email, setEmail] = useState('gutopc@me.com');
  const [newRole, setNewRole] = useState<'admin' | 'user'>('admin');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const updateRole = async () => {
    setLoading(true);
    setResult('');
    
    try {
      // Primeiro, vamos buscar todos os usuários para encontrar o correto
      const users = await authService.getAllUsers();
      const targetUser = users.find(user => user.email === email);
      
      if (!targetUser) {
        setResult(`❌ Usuário com email ${email} não encontrado`);
        setLoading(false);
        return;
      }
      
      console.log('Usuário encontrado:', targetUser);
      
      // Atualizar o role
      await authService.updateUserRole(targetUser.id, newRole);
      
      setResult(`✅ Usuário ${email} promovido a ${newRole} com sucesso!`);
      
    } catch (error) {
      console.error('Erro ao atualizar role:', error);
      setResult(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 bg-green-50 border border-green-200">
      <h3 className="text-lg font-semibold text-green-800 mb-4">🔧 Atualizar Role do Usuário</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email do Usuário:
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Digite o email do usuário"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Novo Role:
          </label>
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as 'admin' | 'user')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="admin">Admin</option>
            <option value="user">Usuário</option>
          </select>
        </div>
        
        <button
          onClick={updateRole}
          disabled={loading}
          className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Atualizando...' : 'Atualizar Role'}
        </button>
        
        {result && (
          <div className={`p-3 rounded-lg text-sm ${
            result.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {result}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserRoleUpdater;

