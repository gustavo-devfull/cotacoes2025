import React, { useState } from 'react';
import { LogIn, UserPlus, Eye, EyeOff, Loader2, X } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import RaviLogo from '../assets/RAVI-LOGO-BRANCO.svg';

const LoginComponent: React.FC = () => {
  const { currentUser, signIn, signUp, signOut, loading } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Limpar erro ao digitar
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        // Validações para cadastro
        if (!formData.name.trim()) {
          throw new Error('Nome é obrigatório');
        }
        if (!formData.email.trim()) {
          throw new Error('Email é obrigatório');
        }
        if (formData.password.length < 6) {
          throw new Error('Senha deve ter pelo menos 6 caracteres');
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Senhas não coincidem');
        }

        await signUp(formData.email, formData.password, formData.name);
      } else {
        // Validações para login
        if (!formData.email.trim()) {
          throw new Error('Email é obrigatório');
        }
        if (!formData.password.trim()) {
          throw new Error('Senha é obrigatória');
        }

        await signIn(formData.email, formData.password);
      }

      // Limpar formulário e fechar modal
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      setIsOpen(false);
    } catch (error: any) {
      console.error('Erro na autenticação:', error);
      setError(error.message || 'Erro na autenticação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  if (currentUser) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            {currentUser.avatar ? (
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <span className="text-white text-sm font-medium">
                {currentUser.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700">
              {currentUser.name}
            </span>
            <span className="text-xs text-gray-500">
              {currentUser.role === 'admin' ? 'Administrador' : 'Usuário'}
            </span>
          </div>
        </div>
        <button
          onClick={signOut}
          disabled={loading}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sair'}
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        <LogIn className="w-4 h-4" />
        <span className="text-sm font-medium">Entrar</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header com Logo */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-center relative">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col items-center">
                <img 
                  src={RaviLogo} 
                  alt="RAVI Logo" 
                  className="h-12 w-auto mb-3"
                />
                <h3 className="text-xl font-bold text-white">
                  {isSignUp ? 'Criar Conta' : 'Bem-vindo de volta'}
                </h3>
                <p className="text-blue-100 text-sm mt-1">
                  {isSignUp ? 'Cadastre-se para começar' : 'Faça login para continuar'}
                </p>
              </div>
            </div>

            {/* Formulário */}
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Digite seu nome completo"
                      required={isSignUp}
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Digite seu email"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Digite sua senha"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {isSignUp && (
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar Senha
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Confirme sua senha"
                      required={isSignUp}
                    />
                  </div>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        {isSignUp ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                        {isSignUp ? 'Criar Conta' : 'Entrar'}
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={toggleMode}
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200 font-medium"
                >
                  {isSignUp 
                    ? 'Já tem uma conta? Faça login' 
                    : 'Não tem uma conta? Criar conta'
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginComponent;





