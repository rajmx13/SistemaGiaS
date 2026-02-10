import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowRight } from 'lucide-react';
import { Input, Button } from '../components/ui';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Fake login simulation
    setTimeout(() => {
      localStorage.setItem('subcontrol_session', 'true');
      navigate('/dashboard');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-surface border border-border rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary/10 p-3 rounded-full mb-4">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white">Bem-vindo de volta</h1>
          <p className="text-slate-400 text-sm mt-2">Entre no SubControl</p>
        </div>

        <form onSubmit={handleLogin}>
          <Input 
            label="Email" 
            type="email" 
            placeholder="admin@exemplo.com"
            value={email}
            onChange={(e: any) => setEmail(e.target.value)}
            required
          />
          <Input 
            label="Senha" 
            type="password" 
            placeholder="••••••••"
            value={password}
            onChange={(e: any) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full mt-2" isLoading={loading}>
            Entrar <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </form>
        
        <p className="mt-6 text-center text-xs text-slate-500">
          Isto é uma demonstração. Use qualquer email/senha.
        </p>
      </div>
    </div>
  );
}