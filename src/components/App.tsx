import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import Navigation from './Navigation';
import Dashboard from './Dashboard';
import UserProfile from './UserProfile';
import UserManagement from './UserManagement';
import LoginForm from './LoginForm';
import FirestoreSetup from './FirestoreSetup';
import { AlertProvider } from './AlertModal';
import RaviLogo from '../assets/RAVI-LOGO-BRANCO.svg';

const App: React.FC = () => {
  const { currentUser, loading, hasPermissionError } = useUser();
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'profile':
        return <UserProfile />;
      case 'users':
        return <UserManagement />;
      default:
        return <Dashboard />;
    }
  };

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  // Se houver erro de permissão, mostrar configuração do Firestore
  if (hasPermissionError) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <FirestoreSetup />
        </div>
      </div>
    );
  }

  // Se não estiver logado, mostrar página de login
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-200 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 px-4">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <img 
                src={RaviLogo} 
                alt="RAVI Logo" 
                className="h-16 w-auto"
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Sistema de Cotações
            </h2>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Formulário de Login Direto */}
            <LoginForm />
          </div>
        </div>
      </div>
    );
  }

  return (
    <AlertProvider>
      <div className="min-h-screen bg-gray-50">
        <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {renderPage()}
          </div>
        </main>
      </div>
    </AlertProvider>
  );
};

export default App;
