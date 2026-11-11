import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Badge, Button } from '../components/UI';
import { Users, UserPlus, Shield, Clock } from 'lucide-react';

export function CompanhiaPage() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      apiRequest<{ teams: any[] }>('/api/modules/companhia/teams')
        .then((data) => setTeams(data.teams))
        .catch(() => setTeams([]))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [user]);

  return (
    <div className="space-y-6 text-left">
      <div className="pb-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-zinc-300" />
            Companhia • Formação de Equipes
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Agrupamento de profissionais por funções complementares, disponibilidade e seleção conjunta para grandes empreitadas.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={<UserPlus className="w-4 h-4" />}
          onClick={() => alert('Na V1, criação avançada de esquadrões é gerenciada sob demanda.')}
        >
          Nova equipe
        </Button>
      </div>

      {isLoading ? (
        <div className="h-32 rounded-xl bg-zinc-900 animate-pulse" />
      ) : teams.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-zinc-900/30 border border-zinc-800 text-xs text-zinc-500">
          Você não faz parte de nenhuma equipe ativa no momento. Equipes são formadas a partir de convites aceitos entre participantes.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((t) => (
            <div key={t.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-white text-sm">{t.name}</span>
                <Badge variant="neutral">{t.status}</Badge>
              </div>
              <p className="text-xs text-zinc-400 mb-3">{t.description}</p>
              <div className="text-[11px] text-zinc-500 flex items-center justify-between">
                <span>Líder: @{t.leader_username}</span>
                <span>{t.members_count} integrantes</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
