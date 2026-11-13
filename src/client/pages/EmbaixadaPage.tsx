import React, { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { Badge, Button } from '../components/UI';
import { Globe2, MessageSquare, ShieldCheck, Mail } from 'lucide-react';

export function EmbaixadaPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      apiRequest<{ directory: any[] }>('/api/modules/embaixada/directory')
        .then((data) => setMembers(data.directory))
        .catch(() => setMembers([]))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [user]);

  return (
    <div className="space-y-6 text-left">
      <div className="pb-4 border-b border-zinc-800">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Globe2 className="w-6 h-6 text-zinc-300" />
          Embaixada • Diretório & Relações
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Rede interna de contatos, apresentações autorizadas e encaminhamentos entre membros com visibilidade pública.
        </p>
      </div>

      {!user ? (
        <div className="p-8 text-center rounded-xl bg-zinc-900/40 border border-zinc-800 text-xs text-zinc-400">
          A visualização do diretório de membros da Embaixada é restrita a participantes autenticados da Guilda.
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-zinc-900 animate-pulse" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-zinc-900/30 border border-zinc-800 text-xs text-zinc-500">
          Nenhum membro com perfil público listado no momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {members.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between"
            >
              <div className="flex items-start gap-3">
                <UserAvatar username={m.username} avatarUrl={m.avatar_url} size="md" />
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-white text-sm truncate block">
                    @{m.username}
                  </span>
                  <Badge variant="neutral" className="mt-1">
                    {m.role}
                  </Badge>
                  <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                    {m.bio || 'Membro participante da Guilda Zero Control.'}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
                <span>Desde {new Date(m.created_at).toLocaleDateString('pt-BR')}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => alert(`Apresentação para @${m.username} registrada internamente.`)}
                >
                  Contatar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
