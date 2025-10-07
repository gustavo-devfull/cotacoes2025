import React, { useState } from 'react';
import { User, LogIn } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

const LoginComponent: React.FC = () => {
  const { currentUser, login, logout } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      login(name.trim(), email.trim());
      setName('');
      setEmail('');
      setIsOpen(false);
    }
  };

  if (currentUser) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {currentUser.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-700">
            {currentUser.name}
          </span>
        </div>
        <button
          onClick={logout}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          Sair
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
      >
        <LogIn className="w-4 h-4" />
        <span className="text-sm font-medium">Entrar</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Entrar no Sistema
              </h3>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite seu nome"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite seu email"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  Entrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginComponent;
