import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { Badge } from '../components/UI';
import { Handshake, CheckCircle2, ShieldCheck, Clock, ExternalLink } from 'lucide-react';

interface Partnership {
  id: string;
  partner_name: string;
  benefit_title: string;
  description: string;
  eligibility: string;
  conditions: string;
  validity_date: string | null;
  status: string;
  is_verified: boolean;
}

export function AliancaPage() {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiRequest<{ partnerships: Partnership[] }>('/api/modules/alianca/partners')
      .then((data) => setPartnerships(data.partnerships))
      .catch(() => setPartnerships([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6 text-left">
      <div className="pb-4 border-b border-zinc-800">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Handshake className="w-6 h-6 text-zinc-300" />
          Aliança • Parcerias & Benefícios
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Convênios, patrocínios, infraestrutura e benefícios exclusivos verificados para participantes da Guilda.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-48 rounded-xl bg-zinc-900 animate-pulse" />
          <div className="h-48 rounded-xl bg-zinc-900 animate-pulse" />
        </div>
      ) : partnerships.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-zinc-900/30 border border-zinc-800 text-xs text-zinc-500">
          Nenhuma parceria ativa no momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {partnerships.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase text-zinc-400 font-bold">
                    {p.partner_name}
                  </span>
                  {p.is_verified ? (
                    <Badge variant="success" className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Verificado Oficial
                    </Badge>
                  ) : (
                    <Badge variant="neutral">Em análise</Badge>
                  )}
                </div>

                <h3 className="text-sm font-semibold text-white mb-2">{p.benefit_title}</h3>
                <p className="text-xs text-zinc-300 leading-relaxed mb-3">{p.description}</p>

                <div className="space-y-1.5 p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 text-[11px] text-zinc-400">
                  <div>
                    <span className="font-semibold text-zinc-300">Elegibilidade:</span> {p.eligibility}
                  </div>
                  <div>
                    <span className="font-semibold text-zinc-300">Condições:</span> {p.conditions}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Validade: {p.validity_date ? new Date(p.validity_date).toLocaleDateString('pt-BR') : 'Indeterminada'}
                </span>
                <span className="text-[11px] font-mono text-zinc-400">Ativo</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
