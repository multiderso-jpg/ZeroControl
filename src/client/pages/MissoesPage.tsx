import React, { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';
import { Badge, Button } from '../components/UI';
import { Target, Gift, Clock, CheckCircle2, ChevronRight } from 'lucide-react';

interface Quest {
  id: string;
  title: string;
  objective: string;
  delivery_criteria: string;
  reward_description: string;
  deadline: string | null;
  status: string;
  related_post_title: string | null;
}

export function MissoesPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiRequest<{ quests: Quest[] }>('/api/modules/missoes/quests')
      .then((data) => setQuests(data.quests))
      .catch(() => setQuests([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6 text-left">
      <div className="pb-4 border-b border-zinc-800">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Target className="w-6 h-6 text-zinc-300" />
          Missões • Quests com Recompensa
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Objetivos estratégicos com critérios explícitos de entrega, recompensas definidas e aceite responsável.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-28 rounded-xl bg-zinc-900 animate-pulse" />
          <div className="h-28 rounded-xl bg-zinc-900 animate-pulse" />
        </div>
      ) : quests.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-zinc-900/30 border border-zinc-800 text-xs text-zinc-500">
          Nenhuma missão ativa disponível no momento. Novas quests são publicadas periodicamente pela coordenação.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quests.map((q) => (
            <div
              key={q.id}
              className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="silver">Quest Oficial</Badge>
                  <Badge variant={q.status === 'aberta' ? 'success' : 'neutral'}>
                    {q.status}
                  </Badge>
                </div>

                <h3 className="font-semibold text-sm text-white mb-2">{q.title}</h3>
                <p className="text-xs text-zinc-300 leading-relaxed mb-3">{q.objective}</p>

                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] space-y-1.5 text-zinc-400 mb-3">
                  <div>
                    <span className="font-semibold text-zinc-300">Critério de Aceite:</span>{' '}
                    {q.delivery_criteria}
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <Gift className="w-3.5 h-3.5" />
                    Recompensa: {q.reward_description}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {q.deadline ? `Prazo: ${new Date(q.deadline).toLocaleDateString('pt-BR')}` : 'Sem prazo fixo'}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => alert('Candidatura para esta missão vinculada ao mural da Guilda.')}
                >
                  Ver detalhes
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
