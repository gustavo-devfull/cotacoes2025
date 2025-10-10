import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { UsersProvider } from '../contexts/UsersContext';
import { ExportedProductsProvider } from '../contexts/ExportedProductsContext';
import { ProdutosJaExportadosProvider } from '../contexts/ProdutosJaExportadosContext';
import Navigation from './Navigation';
import Dashboard from './Dashboard';
import UserProfile from './UserProfile';
import UserManagement from './UserManagement';
import LojaFabricaManagement from './LojaFabricaManagement';
import LoginForm from './LoginForm';
import FirestoreSetup from './FirestoreSetup';
import { AlertProvider } from './AlertModal';
import RaviLogo from '../assets/RAVI-LOGO-BRANCO.svg';
import FundoImage from '../assets/fundo.jpg';

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
      case 'lojas':
        return <LojaFabricaManagement />;
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
      <div 
        className="min-h-screen flex items-center justify-center relative"
        style={{
          backgroundImage: `url(${FundoImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay azul escuro transparente */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundColor: '#144372',
            opacity: 0.8
          }}
        ></div>
        
        {/* Conteúdo da tela de login */}
        <div className="relative z-10 max-w-md w-full space-y-8 px-4">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <img 
                src={RaviLogo} 
                alt="RAVI Logo" 
                className="h-48 w-auto"
              />
            </div>
            <h2 className="text-3xl font-light text-white mb-2">
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
      <UsersProvider>
        <ExportedProductsProvider>
          <ProdutosJaExportadosProvider>
            <div className="min-h-screen bg-gray-50">
              <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
              <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                  {renderPage()}
                </div>
              </main>
            </div>
          </ProdutosJaExportadosProvider>
        </ExportedProductsProvider>
      </UsersProvider>
    </AlertProvider>
  );
};

export default App;
