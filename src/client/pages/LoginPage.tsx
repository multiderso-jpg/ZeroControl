import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input, Button } from '../components/UI';
import { Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/guilda';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Usuário ou senha incorretos.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4 selection:bg-zinc-800">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-left">
        {/* Cabeçalho do formulário */}
        <div className="flex items-center gap-2.5 mb-6">
          <img
            src="/icon.png"
            alt="Zero Control"
            className="w-8 h-8 rounded object-contain shadow-md"
          />
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              Zero Control
            </h1>
            <p className="text-xs text-zinc-400">
              Acesso à Guilda e Vertentes Operacionais
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/70 border border-red-800 text-xs text-red-300">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Usuário"
            placeholder="Digite seu nome de usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />

          <Input
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            placeholder="Digite sua senha de acesso"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full mt-2"
          >
            Entrar na Guilda
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
          <span>Ainda não possui conta?</span>
          <Link
            to="/cadastro"
            className="font-medium text-white hover:underline flex items-center gap-1"
          >
            Cadastrar-se <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="mt-4 p-3 bg-zinc-950/60 border border-zinc-800/60 rounded-xl text-[11px] text-zinc-500 leading-relaxed">
          <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-zinc-400" />
          O Zero Control não armazena e-mails ou números de telefone para sua máxima privacidade. Mantenha sua senha em segurança.
        </div>
      </div>
    </div>
  );
}
