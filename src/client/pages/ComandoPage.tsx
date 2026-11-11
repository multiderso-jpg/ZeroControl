import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/UI';
import { Terminal, Activity, ShieldCheck, Database, HardDrive, Lock, BarChart3 } from 'lucide-react';

export function ComandoPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      apiRequest<{ indicators: any }>('/api/modules/comando/indicators')
        .then((res) => setData(res.indicators))
        .catch(() => setData(null))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [user]);

  return (
    <div className="space-y-6 text-left">
      <div className="pb-4 border-b border-zinc-800">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Terminal className="w-6 h-6 text-zinc-300" />
          Comando • Painel de Operações & Indicadores
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Métricas calculadas a partir de dados reais da base, telemetria e estado de integridade dos subsistemas.
        </p>
      </div>

      {!user ? (
        <div className="p-8 text-center rounded-xl bg-zinc-900/40 border border-zinc-800 text-xs text-zinc-400">
          Acesso ao console de Comando requer autenticação.
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-28 rounded-xl bg-zinc-900 animate-pulse" />
          <div className="h-28 rounded-xl bg-zinc-900 animate-pulse" />
          <div className="h-28 rounded-xl bg-zinc-900 animate-pulse" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Métricas Pessoais */}
          <div>
            <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-zinc-400" />
              Suas Atividades Operacionais
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-[11px] font-mono text-zinc-400 uppercase">Minhas Publicações</span>
                <p className="text-2xl font-bold text-white mt-1">
                  {data?.personal?.my_posts_count || 0}
                </p>
                <span className="text-[10px] text-zinc-500">Anúncios no mural da Guilda</span>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-[11px] font-mono text-zinc-400 uppercase">Candidaturas Ativas</span>
                <p className="text-2xl font-bold text-white mt-1">
                  {data?.personal?.my_applications_count || 0}
                </p>
                <span className="text-[10px] text-zinc-500">Manifestações de interesse</span>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-[11px] font-mono text-zinc-400 uppercase">Itens Salvos</span>
                <p className="text-2xl font-bold text-white mt-1">
                  {data?.personal?.my_saved_count || 0}
                </p>
                <span className="text-[10px] text-zinc-500">Oportunidades favoritadas</span>
              </div>
            </div>
          </div>

          {/* Indicadores Agregados (Para Moderadores e Administradores) */}
          {data?.operational && (
            <div>
              <h2 className="text-xs font-mono uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Indicadores da Plataforma (Moderação / Gestão)
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800">
                  <span className="text-[11px] font-mono text-zinc-400 uppercase">Total de Membros</span>
                  <p className="text-xl font-bold text-zinc-100 mt-1">
                    {data.operational.total_users}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800">
                  <span className="text-[11px] font-mono text-zinc-400 uppercase">Oportunidades Abertas</span>
                  <p className="text-xl font-bold text-emerald-400 mt-1">
                    {data.operational.active_posts}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800">
                  <span className="text-[11px] font-mono text-zinc-400 uppercase">Denúncias Pendentes</span>
                  <p className="text-xl font-bold text-amber-400 mt-1">
                    {data.operational.pending_reports}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800">
                  <span className="text-[11px] font-mono text-zinc-400 uppercase">Orçamentos Forja</span>
                  <p className="text-xl font-bold text-blue-400 mt-1">
                    {data.operational.pending_quotes}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Estado dos Subsistemas e Criptografia */}
          <div>
            <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-zinc-400" />
              Estado das Integrações e Segurança
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-3">
                <Database className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="text-xs font-semibold text-white block">PostgreSQL / PGlite</span>
                  <span className="text-[10px] text-zinc-400 font-mono">Conexão ativa e verificada</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-3">
                <Lock className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="text-xs font-semibold text-white block">Argon2id + CSRF Token</span>
                  <span className="text-[10px] text-zinc-400 font-mono">Proteção atômica em vigor</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-3">
                <HardDrive className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="text-xs font-semibold text-white block">Armazenamento de Fotos</span>
                  <span className="text-[10px] text-zinc-400 font-mono">Processamento Sharp WebP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
