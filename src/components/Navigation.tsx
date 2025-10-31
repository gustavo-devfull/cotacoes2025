import React, { useState } from 'react';
import { Home, Users, User, Menu, X, Building2 } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import LoginComponent from './LoginComponent';
import RaviLogo from '../assets/RAVI-LOGO-BRANCO.svg';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
  const { isAdmin } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, requireAuth: true },
    { id: 'lojas', label: 'Lojas/Fábricas', icon: Building2, requireAuth: true },
    { id: 'profile', label: 'Meu Perfil', icon: User, requireAuth: true },
    ...(isAdmin ? [{ id: 'users', label: 'Gestão de Usuários', icon: Users, requireAuth: true, requireAdmin: true }] : []),
  ];

  const handlePageChange = (pageId: string) => {
    onPageChange(pageId);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button 
              onClick={() => handlePageChange('dashboard')}
              className="flex-shrink-0 flex items-center gap-3 hover:opacity-80 transition-opacity duration-200"
              title="Voltar ao Dashboard"
            >
              <img 
                src={RaviLogo} 
                alt="RAVI Logo" 
                className="h-14 w-auto"
              />
              <h1 className="text-xl font-bold tracking-tight text-[#0175a6] uppercase">Sistema de Cotações</h1>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handlePageChange(item.id)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden md:block">
            <LoginComponent />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handlePageChange(item.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 flex items-center gap-2 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
            
            {/* Mobile User Menu */}
            <div className="pt-4 border-t border-gray-200">
              <LoginComponent />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
