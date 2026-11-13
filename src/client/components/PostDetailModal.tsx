import React, { useState, useEffect } from 'react';
import { Modal, Button, Textarea, Input, Badge } from './UI';
import { Post, Application, PostComment } from '../../shared/types';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
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
  MessageSquare,
  Trash2,
} from 'lucide-react';

interface PostDetailModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onPostUpdated: (updatedPost: Post) => void;
  onPostDeleted?: (postId: string) => void;
  onOpenReport: (postId: string, postTitle: string) => void;
}

export function PostDetailModal({
  post,
  isOpen,
  onClose,
  onPostUpdated,
  onPostDeleted,
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

  // Estados de comentários
  const [comments, setComments] = useState<PostComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState<string | null>(null);

  // Estado de exclusão do post
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  const isAuthor = Boolean(user && post && user.id === post.author_id);
  const isPhantomTroupe = Boolean(
    user && (user.username.toLowerCase() === 'phantomtroupe' || user.role === 'administrador')
  );
  const canDeletePost = Boolean(user && (isAuthor || isPhantomTroupe));

  useEffect(() => {
    if (isOpen && post) {
      loadComments();
      if (isAuthor) {
        loadApplicants();
      }
    }
  }, [isOpen, post?.id, isAuthor]);

  const loadComments = async () => {
    if (!post) return;
    setIsLoadingComments(true);
    try {
      const data = await apiRequest<{ comments: PostComment[] }>(`/api/posts/${post.id}/comments`);
      setComments(data.comments || []);
    } catch {
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || !post) return;
    setIsPostingComment(true);
    try {
      const data = await apiRequest<{ comment: PostComment }>(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: commentContent.trim() }),
      });
      setComments((prev) => [...prev, data.comment]);
      setCommentContent('');
      onPostUpdated({
        ...post,
        comments_count: (post.comments_count || 0) + 1,
      });
    } catch (err: any) {
      alert(err.message || 'Erro ao publicar comentário.');
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Deseja excluir este comentário?')) return;
    setIsDeletingComment(commentId);
    try {
      await apiRequest(`/api/posts/${post!.id}/comments/${commentId}`, { method: 'DELETE' });
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      onPostUpdated({
        ...post!,
        comments_count: Math.max(0, (post!.comments_count || 1) - 1),
      });
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir comentário.');
    } finally {
      setIsDeletingComment(null);
    }
  };

  const handleDeletePost = async () => {
    if (!post) return;
    if (!confirm('Tem certeza de que deseja excluir permanentemente este Job?')) return;
    setIsDeletingPost(true);
    try {
      await apiRequest(`/api/posts/${post.id}`, { method: 'DELETE' });
      onPostDeleted?.(post.id);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir Job.');
    } finally {
      setIsDeletingPost(false);
    }
  };

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
      description={`Trabalho publicado por @${post.author_username} • Job´s`}
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

        {/* Informações do Autor e Ações */}
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

          <div className="flex items-center gap-2">
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

            {canDeletePost && (
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 className="w-4 h-4" />}
                isLoading={isDeletingPost}
                onClick={handleDeletePost}
              >
                Excluir Job
              </Button>
            )}
          </div>
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

        {/* Seção de Comentários nos Job´s */}
        <div className="pt-4 border-t border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-zinc-400" />
              Comentários ({comments.length})
            </h4>
          </div>

          {/* Lista de Comentários */}
          {isLoadingComments ? (
            <div className="text-xs text-zinc-500 py-3 text-center">Carregando comentários...</div>
          ) : comments.length === 0 ? (
            <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80 text-xs text-zinc-400 text-center">
              Nenhum comentário publicado ainda neste Job. Seja o primeiro a comentar!
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => {
                const canDeleteThisComment = Boolean(
                  user && (user.id === comment.author_id || isPhantomTroupe)
                );
                return (
                  <div
                    key={comment.id}
                    className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <UserAvatar
                        username={comment.author_username}
                        avatarUrl={comment.author_avatar_url}
                        size="sm"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">
                            @{comment.author_username}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {formatRelativeDate(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    </div>

                    {canDeleteThisComment && (
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={isDeletingComment === comment.id}
                        aria-label="Excluir comentário"
                        className="text-zinc-500 hover:text-red-400 p-1 rounded-md hover:bg-zinc-900 transition-colors shrink-0 cursor-pointer"
                        title="Excluir comentário (Autor ou ADM PhantomTroupe)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Formulário para novo comentário */}
          {user ? (
            <form onSubmit={handlePostComment} className="space-y-2 pt-2">
              <Textarea
                placeholder="Escreva uma dúvida, observação ou comentário sobre este Job..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                rows={2}
                maxLength={1000}
                required
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isPostingComment}
                  disabled={!commentContent.trim()}
                  icon={<Send className="w-3.5 h-3.5" />}
                >
                  Comentar
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-xs text-zinc-500 text-center py-2">
              Entre em sua conta para participar dos comentários deste Job.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
