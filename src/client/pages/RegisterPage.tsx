import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input, Button } from '../components/UI';
import { Eye, EyeOff, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await register(username, password);
      navigate('/guilda', { replace: true });
    } catch (err: any) {
      if (err.details && err.details.length > 0) {
        setErrorMessage(err.details[0].message);
      } else {
        setErrorMessage(err.message || 'Erro ao realizar cadastro.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4 selection:bg-zinc-800">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-left">
        {/* Cabeçalho do formulário */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-8 h-8 rounded bg-zinc-100 flex items-center justify-center text-zinc-950 font-mono font-black text-base">
            0
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              Criar Conta Zero Control
            </h1>
            <p className="text-xs text-zinc-400">
              Cadastro rápido com apenas Usuário e Senha
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
            label="Nome de Usuário (3 a 30 caracteres)"
            placeholder="Ex: operador_phantom"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            helperText="Apenas letras, números, ponto, hífen e sublinhado."
            autoComplete="username"
            required
            minLength={3}
            maxLength={30}
          />

          <Input
            label="Senha (mínimo 15 caracteres)"
            type={showPassword ? 'text' : 'password'}
            placeholder="Crie uma senha longa e segura"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="Permitido colar e usar gerenciadores de senha. Sem exigências artificiais."
            autoComplete="new-password"
            required
            minLength={15}
            maxLength={128}
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
            Cadastrar e Entrar na Guilda
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
          <span>Já possui uma conta?</span>
          <Link
            to="/login"
            className="font-medium text-white hover:underline flex items-center gap-1"
          >
            Acessar conta <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="mt-4 p-3 bg-zinc-950/60 border border-zinc-800/60 rounded-xl text-[11px] text-zinc-400 leading-relaxed space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-zinc-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Privacidade por Design (V1)
          </div>
          <p className="text-zinc-500">
            Não exigimos nome completo, e-mail, telefone ou CPF. Não há recuperação de senha por terceiros. Guarde sua senha com atenção.
          </p>
        </div>
      </div>
    </div>
  );
}
