import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/UI';
import { Compass, CheckCircle2, Clock, GitCommit, FileText } from 'lucide-react';

export function JornadaPage() {
  const { user } = useAuth();
  const [engagements, setEngagements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      apiRequest<{ engagements: any[] }>('/api/modules/jornada/engagements')
        .then((data) => setEngagements(data.engagements))
        .catch(() => setEngagements([]))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const phases = ['preparacao', 'execucao', 'entrega', 'revisao', 'aceite'];

  return (
    <div className="space-y-6 text-left">
      <div className="pb-4 border-b border-zinc-800">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Compass className="w-6 h-6 text-zinc-300" />
          Jornada • Execução & Aceite
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Acompanhamento dos compromissos formais em andamento: preparação de escopo, execução técnica, entregas e validação final.
        </p>
      </div>

      {isLoading ? (
        <div className="h-32 rounded-xl bg-zinc-900 animate-pulse" />
      ) : engagements.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-zinc-900/30 border border-zinc-800 text-xs text-zinc-500">
          Você não possui compromissos ativos na Jornada no momento. Compromissos são iniciados após a seleção de uma candidatura na Guilda.
        </div>
      ) : (
        <div className="space-y-4">
          {engagements.map((eng) => (
            <div key={eng.id} className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-white">{eng.title}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Cliente: @{eng.client_username} • Prestador: @{eng.provider_username}
                  </p>
                </div>
                <Badge variant="info">Fase: {eng.phase}</Badge>
              </div>

              {/* Barra de Progresso das Fases */}
              <div className="grid grid-cols-5 gap-1.5 pt-2">
                {phases.map((p, idx) => {
                  const currentIdx = phases.indexOf(eng.phase);
                  const isDone = idx <= currentIdx;
                  return (
                    <div key={p} className="flex flex-col gap-1">
                      <div
                        className={`h-1.5 rounded-full ${
                          isDone ? 'bg-zinc-200' : 'bg-zinc-800'
                        }`}
                      />
                      <span className="text-[10px] font-mono text-zinc-400 capitalize truncate">
                        {p}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-400">
                <span className="font-semibold text-zinc-300 block mb-1">Termos acordados:</span>
                {eng.terms}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
