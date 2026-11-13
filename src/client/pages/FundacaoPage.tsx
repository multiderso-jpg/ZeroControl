import React, { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { SupportRequest } from '../../shared/types';
import { Input, Textarea, Select, Button, Badge } from '../components/UI';
import { Building, LifeBuoy, BookOpen, Send, CheckCircle2, MessageSquare } from 'lucide-react';

export function FundacaoPage() {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('duvida');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [myRequests, setMyRequests] = useState<SupportRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  useEffect(() => {
    if (user) {
      loadMyRequests();
    }
  }, [user]);

  const loadMyRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const data = await apiRequest<{ requests: SupportRequest[] }>('/api/modules/fundacao/support/my');
      setMyRequests(data.requests);
    } catch {
      setMyRequests([]);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Faça login para registrar uma solicitação de suporte.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await apiRequest('/api/modules/fundacao/support', {
        method: 'POST',
        body: JSON.stringify({ subject, category, message }),
      });

      setSuccess(true);
      setSubject('');
      setMessage('');
      await loadMyRequests();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao registrar chamado de suporte.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="pb-4 border-b border-zinc-800">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Building className="w-6 h-6 text-zinc-300" />
          Fundação • Sustentação & Suporte
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Infraestrutura da plataforma, documentação técnica, condições de uso, padrões de acessibilidade e canal de atendimento.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Documentação e Diretrizes de Sustentação */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-zinc-400" />
              Princípios de Arquitetura e Acessibilidade
            </h2>
            <p className="text-xs text-zinc-300 leading-relaxed">
              O Zero Control foi construído seguindo diretrizes rigorosas de soberania de dados, autenticação com Argon2id, integridade relacional em PostgreSQL e navegação universal via teclado.
            </p>
            <div className="space-y-2 pt-2 border-t border-zinc-800 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Nenhum dado desnecessário (sem exigência de e-mail, telefone ou CPF).</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Formatos de imagem validados e reprocessados com Sharp (WebP sem metadados).</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Interface testada para larguras de 360px, 768px e 1440px.</span>
              </div>
            </div>
          </div>

          {/* Histórico de Chamados do Usuário */}
          {user && (
            <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-zinc-400" />
                Meus Chamados de Suporte ({myRequests.length})
              </h2>

              {myRequests.length === 0 ? (
                <p className="text-xs text-zinc-500">
                  Você não possui chamados de suporte abertos.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {myRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white">{req.subject}</span>
                        <Badge variant={req.status === 'aberto' ? 'warning' : 'success'}>
                          {req.status}
                        </Badge>
                      </div>
                      <p className="text-zinc-400 line-clamp-2">{req.message}</p>
                      <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                        Registrado em {new Date(req.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Formulário Funcional de Abertura de Chamado */}
        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <LifeBuoy className="w-4 h-4 text-zinc-400" />
            Abrir Chamado com a Fundação
          </h2>

          {success && (
            <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300">
              Sua solicitação de suporte foi registrada e enviada à equipe técnica.
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-xs text-red-300">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              label="Assunto (5 a 120 caracteres)"
              placeholder="Ex: Dúvida sobre seleção de candidato ou problema no upload"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              minLength={5}
              maxLength={120}
            />

            <Select
              label="Categoria"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: 'duvida', label: 'Dúvida Operacional' },
                { value: 'bug', label: 'Relato de Falha ou Inconsistência' },
                { value: 'sugestao', label: 'Sugestão de Melhoria' },
                { value: 'acesso', label: 'Problema com Sessão / Acesso' },
                { value: 'outro', label: 'Outro assunto' },
              ]}
            />

            <Textarea
              label="Mensagem detalhada (mínimo 20 caracteres)"
              placeholder="Explique o que aconteceu, passos realizados ou sua sugestão..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
              minLength={20}
              maxLength={3000}
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              className="w-full"
            >
              Registrar chamado de suporte
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
