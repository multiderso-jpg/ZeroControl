import React, { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Badge, Button } from '../components/UI';
import { HeartHandshake, MapPin, Calendar, Clock, Check, Users } from 'lucide-react';

export function MutiraoPage() {
  const { user } = useAuth();
  const [actions, setActions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  useEffect(() => {
    loadActions();
  }, [user]);

  const loadActions = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{ actions: any[] }>('/api/modules/mutirao/actions');
      setActions(data.actions);
    } catch {
      setActions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async (id: string) => {
    if (!user) {
      alert('Faça login para aderir a um mutirão voluntário.');
      return;
    }

    setJoiningId(id);
    try {
      await apiRequest(`/api/modules/mutirao/actions/${id}/join`, { method: 'POST' });
      await loadActions();
    } catch (err: any) {
      alert(err.message || 'Erro ao confirmar participação.');
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="pb-4 border-b border-zinc-800">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <HeartHandshake className="w-6 h-6 text-zinc-300" />
          Mutirão • Voluntariado & Ações Coletivas
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Iniciativas coletivas de impacto comunitário, voluntariado livre e apoio mútuo, com reembolso de despesas operacionais claramente delimitado.
        </p>
      </div>

      {isLoading ? (
        <div className="h-32 rounded-xl bg-zinc-900 animate-pulse" />
      ) : actions.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-zinc-900/30 border border-zinc-800 text-xs text-zinc-500">
          Nenhum mutirão coletivo cadastrado no momento. Ações voluntárias são de adesão espontânea e aberta.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((act) => (
            <div
              key={act.id}
              className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-zinc-300 uppercase">
                    {act.entity_name}
                  </span>
                  <Badge variant="silver">Voluntariado</Badge>
                </div>

                <h3 className="font-semibold text-sm text-white mb-2">{act.purpose}</h3>

                <div className="space-y-1.5 p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Local: {act.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>
                      Data: {new Date(act.scheduled_time).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  {act.expenses_reimbursement && (
                    <div className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-900">
                      Reembolso previsto: {act.expenses_reimbursement}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {act.participants_count} voluntários confirmados
                </span>

                {act.is_joined ? (
                  <Badge variant="success" className="flex items-center gap-1">
                    <Check className="w-3 h-3" /> Inscrito
                  </Badge>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={joiningId === act.id}
                    onClick={() => handleJoin(act.id)}
                  >
                    Aderir livremente
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
