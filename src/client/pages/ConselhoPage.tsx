import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Report } from '../../shared/types';
import { Badge, Button, Textarea } from '../components/UI';
import { Scale, ShieldAlert, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export function ConselhoPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [decisionNotes, setDecisionNotes] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const isModerator = user?.role === 'moderador' || user?.role === 'administrador';

  useEffect(() => {
    if (isModerator) {
      loadReports();
    }
  }, [isModerator]);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{ reports: Report[] }>('/api/council/reports');
      setReports(data.reports);
    } catch {
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecide = async (
    reportId: string,
    decision: 'procedente' | 'improcedente',
    suspendPost: boolean
  ) => {
    setIsProcessing(reportId);
    try {
      await apiRequest(`/api/council/reports/${reportId}/decide`, {
        method: 'POST',
        body: JSON.stringify({
          decision,
          notes: decisionNotes[reportId] || 'Decisão registrada pelo Conselho.',
          suspendPost,
        }),
      });
      await loadReports();
    } catch (err: any) {
      alert(err.message || 'Erro ao processar decisão.');
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="pb-4 border-b border-zinc-800">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Scale className="w-6 h-6 text-zinc-300" />
          Conselho • Moderação & Diretrizes
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Órgão responsável pela integridade comunitária, resolução imparcial de divergências e análise de denúncias sobre publicações e serviços.
        </p>
      </div>

      {/* Diretrizes da Comunidade */}
      <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2 text-xs text-zinc-300 leading-relaxed">
        <h2 className="font-semibold text-white flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-zinc-400" />
          Código de Conduta da Guilda
        </h2>
        <ul className="list-disc list-inside space-y-1 text-zinc-400">
          <li>Transparência nas condições de remuneração: não anunciar trabalho voluntário como vaga remunerada.</li>
          <li>Respeito e profissionalismo nas propostas e mensagens de interesse.</li>
          <li>Proibição estrita de esquemas piramidais, golpes, conteúdo enganoso ou cobranças indevidas.</li>
          <li>Denúncias podem ser abertas diretamente no cartão ou detalhes de qualquer publicação na Guilda.</li>
        </ul>
      </div>

      {/* Fila de Moderação (Apenas para Moderadores e Administradores) */}
      {isModerator ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-wider uppercase text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Fila de Julgamento de Denúncias ({reports.length})
            </h2>
            <Button variant="outline" size="sm" onClick={loadReports} isLoading={isLoading}>
              Atualizar fila
            </Button>
          </div>

          {reports.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-zinc-900/30 border border-zinc-800 text-xs text-zinc-500">
              Nenhuma denúncia pendente de análise na fila do Conselho.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((r) => (
                <div
                  key={r.id}
                  className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-mono uppercase text-zinc-400">
                        Denúncia sobre:
                      </span>
                      <h3 className="text-sm font-bold text-white mt-0.5">
                        {r.post_title}
                      </h3>
                      <p className="text-[11px] text-zinc-400">
                        Relator: @{r.reporter_username} • Categoria:{' '}
                        <Badge variant="silver">{r.category}</Badge> • Registrada em{' '}
                        {new Date(r.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    <Badge
                      variant={
                        r.status === 'pendente'
                          ? 'warning'
                          : r.status === 'procedente'
                          ? 'danger'
                          : 'success'
                      }
                    >
                      {r.status}
                    </Badge>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300">
                    <span className="font-semibold text-zinc-400 block mb-1">
                      Relato da Denúncia:
                    </span>
                    {r.description}
                  </div>

                  {r.status === 'pendente' ? (
                    <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                      <Textarea
                        placeholder="Observações da decisão da moderação..."
                        value={decisionNotes[r.id] || ''}
                        onChange={(e) =>
                          setDecisionNotes({ ...decisionNotes, [r.id]: e.target.value })
                        }
                        rows={2}
                      />

                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          isLoading={isProcessing === r.id}
                          onClick={() => handleDecide(r.id, 'improcedente', false)}
                        >
                          Julgar Improcedente
                        </Button>

                        <Button
                          variant="danger"
                          size="sm"
                          isLoading={isProcessing === r.id}
                          onClick={() => handleDecide(r.id, 'procedente', true)}
                        >
                          Procedente (Suspender Publicação)
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-zinc-500 pt-1">
                      Julgada por @{r.decided_by_username || 'moderador'} • Parecer: {r.decision_notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 text-center rounded-xl bg-zinc-900/30 border border-zinc-800 text-xs text-zinc-500">
          A fila de apreciação e julgamento de denúncias é restrita a membros designados com o papel de Moderador ou Administrador do Conselho.
        </div>
      )}
    </div>
  );
}
