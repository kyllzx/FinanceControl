
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { APP_NAME } from '../constants';
import { ShieldIcon } from '../components/icons'; 

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('user@example.com'); 
  const [name, setName] = useState('Usuário Teste'); 
  const { login, isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (isAuthenticated) {
      if (user?.profileCompleted) {
        navigate('/dashboard', { replace: true });
      } else if (user && !user.profileCompleted) { 
        navigate('/profile-setup', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
        alert("Por favor, insira um e-mail.");
        return;
    }
    login(email, name);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <ShieldIcon className="mx-auto h-16 w-auto text-indigo-400" />
        <h2 className="mt-6 text-center text-4xl font-extrabold text-white">
          Bem-vindo ao {APP_NAME}
        </h2>
        <p className="mt-2 text-center text-md text-indigo-200">
          Controle suas finanças com facilidade.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow-xl rounded-lg sm:px-10"> {/* Added dark:bg-slate-800 for consistency if system theme is dark */}
          <form className="space-y-6" onSubmit={handleLogin}>
            <Input
              label="Email (Simulado)"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading && !isAuthenticated}
            />
            <Input
              label="Nome (Opcional, Simulado)"
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading && !isAuthenticated}
            />
            <div>
              <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading && !isAuthenticated}>
                Entrar / Registrar (Simulado)
              </Button>
            </div>
          </form>
           <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Este é um login simulado. Use qualquer e-mail.
          </p>
        </div>
      </div>
    </div>
  );
};
