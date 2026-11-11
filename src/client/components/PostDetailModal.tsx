import React, { useState, useEffect } from 'react';
import { Modal, Button, Textarea, Input, Badge } from './UI';
import { Post, Application } from '../../shared/types';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';
import { UserAvatar } from './UserAvatar';
import { formatCompensation, formatRelativeDate } from './PostCard';
import {
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Bookmark,
  ShieldAlert,
  Send,
  CheckCircle2,
  XCircle,
  Users,
  Check,
} from 'lucide-react';

interface PostDetailModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onPostUpdated: (updatedPost: Post) => void;
  onOpenReport: (postId: string, postTitle: string) => void;
}

export function PostDetailModal({
  post,
  isOpen,
  onClose,
  onPostUpdated,
  onOpenReport,
}: PostDetailModalProps) {
  const { user } = useAuth();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Estados da candidatura do usuário logado
  const [interestMessage, setInterestMessage] = useState('');
  const [proposedValueStr, setProposedValueStr] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  // Estados de gerenciamento de candidatos para o autor
  const [showApplicants, setShowApplicants] = useState(false);
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(false);
  const [isSelecting, setIsSelecting] = useState<string | null>(null);

  const isAuthor = user && post && user.id === post.author_id;

  useEffect(() => {
    if (isOpen && post && isAuthor) {
      loadApplicants();
    }
  }, [isOpen, post?.id, isAuthor]);

  const loadApplicants = async () => {
    if (!post) return;
    setIsLoadingApplicants(true);
    try {
      const data = await apiRequest<{ applications: Application[] }>(
        `/api/applications/posts/${post.id}`
      );
      setApplicants(data.applications);
    } catch {
      // Ignora erro
    } finally {
      setIsLoadingApplicants(false);
    }
  };

  if (!post) return null;

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsApplying(true);
    setApplyError(null);

    try {
      let proposedCents: number | null = null;
      if (proposedValueStr) {
        proposedCents = Math.round(parseFloat(proposedValueStr.replace(',', '.')) * 100);
      }

      await apiRequest(`/api/applications/posts/${post.id}/apply`, {
        method: 'POST',
        body: JSON.stringify({
          message: interestMessage,
          proposed_amount_cents: proposedCents,
        }),
      });

      // Atualiza estado do post
      const updated = await apiRequest<{ post: Post }>(`/api/posts/${post.id}`);
      onPostUpdated(updated.post);
      setInterestMessage('');
      setProposedValueStr('');
    } catch (err: any) {
      setApplyError(err.message || 'Erro ao enviar manifestação de interesse.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleWithdraw = async () => {
    if (!confirm('Deseja realmente retirar sua candidatura para esta oportunidade?')) return;
    try {
      // Busca candidatura ativa
      const myApps = await apiRequest<{ applications: Application[] }>('/api/applications/my');
      const target = myApps.applications.find((a) => a.post_id === post.id);
      if (target) {
        await apiRequest(`/api/applications/${target.id}/withdraw`, { method: 'POST' });
        const updated = await apiRequest<{ post: Post }>(`/api/posts/${post.id}`);
        onPostUpdated(updated.post);
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao retirar candidatura.');
    }
  };

  const handleSelectCandidate = async (appId: string) => {
    if (
      !confirm(
        'Confirmar a seleção deste candidato para a oportunidade? Esta ação colocará a publicação em andamento e recusará as demais candidaturas.'
      )
    )
      return;

    setIsSelecting(appId);
    try {
      await apiRequest(`/api/applications/${appId}/select`, {
        method: 'POST',
        body: JSON.stringify({ postId: post.id }),
      });

      const updated = await apiRequest<{ post: Post }>(`/api/posts/${post.id}`);
      onPostUpdated(updated.post);
      await loadApplicants();
    } catch (err: any) {
      alert(err.message || 'Erro ao selecionar candidato.');
    } finally {
      setIsSelecting(null);
    }
  };

  const handleClosePost = async () => {
    if (!confirm('Deseja realmente encerrar esta publicação? Ela deixará de receber novas candidaturas.'))
      return;

    try {
      await apiRequest(`/api/posts/${post.id}/close`, { method: 'POST' });
      const updated = await apiRequest<{ post: Post }>(`/api/posts/${post.id}`);
      onPostUpdated(updated.post);
    } catch (err: any) {
      alert(err.message || 'Erro ao encerrar publicação.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={post.title}
      description={`Publicado por @${post.author_username} na Guilda`}
      maxWidth="4xl"
    >
      <div className="space-y-6 text-left">
        {/* Galeria de Fotos */}
        {post.images.length > 0 && (
          <div className="space-y-2">
            <div className="h-64 sm:h-96 w-full rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 flex items-center justify-center">
              <img
                src={post.images[activeImageIndex]?.image_url}
                alt={post.title}
                className="w-full h-full object-contain"
              />
            </div>
            {post.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {post.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`h-16 w-20 rounded-lg overflow-hidden border shrink-0 transition-all cursor-pointer ${
                      activeImageIndex === idx ? 'border-white scale-105' : 'border-zinc-800 opacity-60'
                    }`}
                  >
                    <img src={img.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Metadados e Classificação */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="silver">{post.intention}</Badge>
          <Badge variant="neutral">{post.opportunity_type_name}</Badge>
          <Badge variant="neutral">{post.service_category_name}</Badge>
          <Badge variant="neutral">
            <MapPin className="w-3 h-3 mr-1 inline" />
            {post.modality === 'Remoto'
              ? 'Remoto'
              : `${post.city || ''}${post.state ? `, ${post.state}` : ''}`}
          </Badge>
          {post.status === 'aberta' ? (
            <Badge variant="success">Aberta</Badge>
          ) : post.status === 'em_andamento' ? (
            <Badge variant="info">Em andamento</Badge>
          ) : (
            <Badge variant="danger">Encerrada</Badge>
          )}
        </div>

        {/* Remuneração e Prazo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl">
          <div className="flex flex-col">
            <span className="text-[11px] font-mono uppercase text-zinc-400">Remuneração Proposta</span>
            <span className="text-base font-bold text-white flex items-center gap-1 mt-0.5">
              <DollarSign className="w-4 h-4 text-zinc-400" />
              {formatCompensation(post)}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] font-mono uppercase text-zinc-400">Prazo</span>
            <span className="text-sm text-zinc-200 flex items-center gap-1 mt-1">
              <Clock className="w-4 h-4 text-zinc-400" />
              {post.deadline
                ? new Date(post.deadline).toLocaleDateString('pt-BR')
                : 'Não delimitado'}
            </span>
          </div>
        </div>

        {/* Descrição Completa */}
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
            Descrição do Trabalho e Requisitos
          </h4>
          <div className="text-sm text-zinc-200 leading-relaxed whitespace-pre-line p-4 rounded-xl bg-zinc-900/40 border border-zinc-800">
            {post.description}
          </div>
        </div>

        {/* Informações do Autor */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
          <div className="flex items-center gap-3">
            <UserAvatar username={post.author_username} avatarUrl={post.author_avatar_url} size="md" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">@{post.author_username}</span>
              <span className="text-[11px] text-zinc-400">
                Publicado {formatRelativeDate(post.created_at)}
              </span>
            </div>
          </div>

          {!isAuthor && (
            <Button
              variant="ghost"
              size="sm"
              icon={<ShieldAlert className="w-4 h-4 text-zinc-400" />}
              onClick={() => onOpenReport(post.id, post.title)}
            >
              Denunciar ao Conselho
            </Button>
          )}
        </div>

        {/* Seção do Autor: Gerenciamento e Seleção de Candidatos */}
        {isAuthor && (
          <div className="pt-4 border-t border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-zinc-300" />
                <h4 className="text-sm font-semibold text-white">
                  Candidaturas Recebidas ({applicants.length})
                </h4>
              </div>

              {post.status === 'aberta' && (
                <Button variant="danger" size="sm" onClick={handleClosePost}>
                  Encerrar anúncio
                </Button>
              )}
            </div>

            {applicants.length === 0 ? (
              <p className="text-xs text-zinc-500 py-3 text-center">
                Ainda não há manifestações de interesse registradas para este anúncio.
              </p>
            ) : (
              <div className="space-y-3">
                {applicants.map((app) => (
                  <div
                    key={app.id}
                    className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <UserAvatar username={app.applicant_username} avatarUrl={app.applicant_avatar_url} size="sm" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">
                            @{app.applicant_username}
                          </span>
                          <Badge
                            variant={
                              app.status === 'selecionada'
                                ? 'success'
                                : app.status === 'recusada'
                                ? 'danger'
                                : 'neutral'
                            }
                          >
                            {app.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-zinc-300 mt-1">{app.message}</p>
                        {app.proposed_amount_cents && (
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            Proposta: {(app.proposed_amount_cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                        )}
                      </div>
                    </div>

                    {post.status === 'aberta' && app.status === 'enviada' && (
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={isSelecting === app.id}
                        onClick={() => handleSelectCandidate(app.id)}
                      >
                        Selecionar candidato
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Seção do Visitante / Candidato: Manifestação de Interesse */}
        {!isAuthor && user && (
          <div className="pt-4 border-t border-zinc-800 space-y-3">
            {post.user_application_status ? (
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-white block">
                    Situação da sua candidatura:
                  </span>
                  <div className="mt-1">
                    {post.user_application_status === 'enviada' && (
                      <Badge variant="warning">Enviada • Aguardando análise do autor</Badge>
                    )}
                    {post.user_application_status === 'selecionada' && (
                      <Badge variant="success">Parabéns! Você foi selecionado para esta oportunidade!</Badge>
                    )}
                    {post.user_application_status === 'recusada' && (
                      <Badge variant="danger">Não selecionada nesta vaga</Badge>
                    )}
                    {post.user_application_status === 'retirada' && (
                      <Badge variant="neutral">Candidatura retirada por você</Badge>
                    )}
                  </div>
                </div>

                {post.user_application_status === 'enviada' && (
                  <Button variant="outline" size="sm" onClick={handleWithdraw}>
                    Retirar candidatura
                  </Button>
                )}
              </div>
            ) : post.status === 'aberta' ? (
              <form onSubmit={handleApply} className="space-y-3">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-zinc-400" />
                  Tenho interesse nesta oportunidade
                </h4>

                {applyError && (
                  <div className="p-2.5 rounded-lg bg-red-950/70 border border-red-800 text-xs text-red-300">
                    {applyError}
                  </div>
                )}

                <Textarea
                  label="Mensagem de apresentação para o autor (mínimo 5 caracteres)"
                  placeholder="Apresente sua experiência, disponibilidade e proposta para esta entrega..."
                  value={interestMessage}
                  onChange={(e) => setInterestMessage(e.target.value)}
                  rows={3}
                  required
                />

                <div className="flex flex-col sm:flex-row items-end gap-3">
                  <div className="w-full sm:w-1/2">
                    <Input
                      label="Proposta de valor em R$ (Opcional)"
                      placeholder="Ex: 2400,00"
                      value={proposedValueStr}
                      onChange={(e) => setProposedValueStr(e.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isApplying}
                    className="w-full sm:w-auto"
                  >
                    Enviar manifestação de interesse
                  </Button>
                </div>
              </form>
            ) : (
              <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-xs text-zinc-400 text-center">
                Esta oportunidade já encerrou o período de recebimento de candidaturas.
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
