import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/UI';
import { Coins, ShieldAlert, DollarSign, FileText, CheckCircle2 } from 'lucide-react';

export function TesourariaPage() {
  const { user } = useAuth();
  const [financialData, setFinancialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      apiRequest<any>('/api/modules/tesouraria/records')
        .then((res) => setFinancialData(res))
        .catch(() => setFinancialData(null))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [user]);

  return (
    <div className="space-y-6 text-left">
      <div className="pb-4 border-b border-zinc-800">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Coins className="w-6 h-6 text-zinc-300" />
          Tesouraria • Registros & Transparência
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Acompanhamento de referências orçamentárias, valores acordados e demonstrativo de transparência financeira permitida.
        </p>
      </div>

      {/* Nota de Integridade V1 */}
      <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 space-y-1.5 leading-relaxed">
        <div className="flex items-center gap-2 text-zinc-200 font-semibold">
          <ShieldAlert className="w-4 h-4 text-zinc-400" />
          Diretriz de Transparência Financeira (V1)
        </div>
        <p>
          O Zero Control distingue orçamentos, propostas, cobranças e confirmações. Na primeira versão, os registros refletem valores formais acordados nas oportunidades. Não simulamos carteiras fictícias, custódia antecipada ou depósitos não verificados por instituições reguladas.
        </p>
      </div>

      {!user ? (
        <div className="p-8 text-center rounded-xl bg-zinc-900/40 border border-zinc-800 text-xs text-zinc-400">
          Faça login para consultar seus registros contábeis e demonstrativos vinculados.
        </div>
      ) : isLoading ? (
        <div className="h-32 rounded-xl bg-zinc-900 animate-pulse" />
      ) : (
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono uppercase text-zinc-400">Total Registrado</span>
              <p className="text-2xl font-bold text-white mt-1">
                {((financialData?.total_cents || 0) / 100).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </p>
            </div>
            <Badge variant="silver">BRL • Real Brasileiro</Badge>
          </div>

          <div className="space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Movimentações e Lançamentos Vinculados
            </h2>

            {(!financialData?.records || financialData.records.length === 0) ? (
              <div className="p-8 text-center rounded-xl bg-zinc-900/30 border border-zinc-800 text-xs text-zinc-500">
                Nenhum lançamento registrado no momento.
              </div>
            ) : (
              financialData.records.map((rec: any) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-white block">{rec.origin_description}</span>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      Ref: {rec.confirmation_reference || 'Registrado internamente'} • {new Date(rec.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-zinc-100">
                      {(rec.amount_cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                    <Badge variant="neutral" className="mt-1 block">
                      {rec.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
