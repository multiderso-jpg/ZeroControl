import React from 'react';
import { Post } from '../../shared/types';
import { UserAvatar } from './UserAvatar';
import { Badge } from './UI';
import { MapPin, Calendar, Clock, DollarSign, Bookmark, MessageSquare, Briefcase } from 'lucide-react';

interface PostCardProps {
  post: Post;
  onClick: () => void;
  onToggleSave?: (e: React.MouseEvent) => void;
}

export function formatCompensation(post: Post): string {
  if (post.compensation_type === 'voluntario') {
    return 'Voluntário';
  }
  if (post.compensation_type === 'a_combinar') {
    return 'A combinar';
  }
  if (post.compensation_type === 'valor_fixo' && post.amount_cents != null) {
    const formatted = (post.amount_cents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    return post.amount_unit ? `${formatted} / ${post.amount_unit}` : formatted;
  }
  if (post.compensation_type === 'faixa') {
    const min = post.amount_min_cents != null
      ? (post.amount_min_cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      : 'R$ 0';
    const max = post.amount_max_cents != null
      ? (post.amount_max_cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      : 'sob consulta';
    const faixaStr = `${min} a ${max}`;
    return post.amount_unit ? `${faixaStr} / ${post.amount_unit}` : faixaStr;
  }
  return 'A combinar';
}

export function formatRelativeDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 2) return 'agora há pouco';
    if (diffMins < 60) return `há ${diffMins} min`;
    if (diffHours < 24) return `há ${diffHours} h`;
    if (diffDays === 1) return 'ontem';
    if (diffDays < 7) return `há ${diffDays} dias`;
    return date.toLocaleDateString('pt-BR');
  } catch {
    return '';
  }
}

export function PostCard({ post, onClick, onToggleSave }: PostCardProps) {
  const coverImage = post.images.find((img) => img.is_cover) || post.images[0];

  const getStatusBadge = () => {
    switch (post.status) {
      case 'aberta':
        return <Badge variant="success" className="px-2.5 py-1 text-xs">Aberta</Badge>;
      case 'em_andamento':
        return <Badge variant="info" className="px-2.5 py-1 text-xs">Em andamento</Badge>;
      case 'encerrada':
        return <Badge variant="neutral" className="px-2.5 py-1 text-xs">Encerrada</Badge>;
      case 'suspensa':
        return <Badge variant="danger" className="px-2.5 py-1 text-xs">Suspensa</Badge>;
      default:
        return <Badge variant="neutral" className="px-2.5 py-1 text-xs">{post.status}</Badge>;
    }
  };

  const getIntentionBadge = () => {
    if (post.intention === 'Ofereço um serviço') {
      return <Badge variant="neutral" className="px-2.5 py-1 text-xs">Ofereço um serviço</Badge>;
    }
    return <Badge variant="silver" className="px-2.5 py-1 text-xs">Oportunidade de serviços</Badge>;
  };

  return (
    <article
      onClick={onClick}
      className="bg-zinc-900/90 border border-zinc-800/90 hover:border-zinc-600 rounded-2xl overflow-hidden flex flex-col transition-all duration-200 cursor-pointer group shadow-md hover:shadow-xl text-left hover:-translate-y-1"
    >
      {/* Capa Ampliada (1.5x) */}
      {coverImage ? (
        <div className="h-64 w-full overflow-hidden bg-zinc-950 relative">
          <img
            src={coverImage.thumbnail_url || coverImage.image_url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {getStatusBadge()}
          </div>
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold tracking-wider uppercase bg-black/80 text-zinc-200 border border-zinc-700/80">
              JOB´S
            </span>
          </div>
        </div>
      ) : (
        <div className="h-28 w-full bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-zinc-800/60 p-4 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-400"></span>
            <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
              JOB´S
            </span>
          </div>
          <div>{getStatusBadge()}</div>
        </div>
      )}

      {/* Conteúdo com espaçamento 1.5x maior */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {getIntentionBadge()}
            <Badge variant="neutral" className="px-2.5 py-1 text-xs">{post.opportunity_type_name}</Badge>
            <Badge variant="silver" className="px-2.5 py-1 text-xs">{post.service_category_name}</Badge>
          </div>

          <h3 className="font-bold text-lg text-zinc-100 group-hover:text-white line-clamp-2 leading-snug tracking-tight">
            {post.title}
          </h3>

          <p className="text-sm text-zinc-300 mt-2.5 line-clamp-4 leading-relaxed font-normal">
            {post.description}
          </p>
        </div>

        <div className="pt-4 border-t border-zinc-800/80 space-y-3">
          {/* Metadados: Remuneração e Localização em destaque */}
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-base text-zinc-100 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-zinc-400" />
              {formatCompensation(post)}
            </span>

            <span className="text-zinc-300 text-xs flex items-center gap-1.5 font-medium">
              <MapPin className="w-4 h-4 text-zinc-400" />
              {post.modality === 'Remoto'
                ? 'Remoto'
                : `${post.city || ''}${post.state ? `, ${post.state}` : ''}`}
            </span>
          </div>

          {/* Rodapé: Autor, Data e Salvar */}
          <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
            <div className="flex items-center gap-2.5">
              <UserAvatar
                username={post.author_username}
                avatarUrl={post.author_avatar_url}
                size="sm"
              />
              <span className="font-semibold text-zinc-200 truncate max-w-[140px]">
                @{post.author_username}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-zinc-400">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                {formatRelativeDate(post.created_at)}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {post.comments_count != null && post.comments_count > 0 && (
                <span className="flex items-center gap-1 text-zinc-300 font-mono text-xs px-2 py-0.5 rounded bg-zinc-800/80" title={`${post.comments_count} comentário(s)`}>
                  <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                  {post.comments_count}
                </span>
              )}

              {post.applications_count != null && post.applications_count > 0 && (
                <span className="flex items-center gap-1 text-zinc-300 font-mono text-xs px-2 py-0.5 rounded bg-zinc-800/80" title={`${post.applications_count} candidatura(s)`}>
                  <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                  {post.applications_count}
                </span>
              )}

              {onToggleSave && (
                <button
                  type="button"
                  onClick={onToggleSave}
                  aria-label={post.is_saved ? 'Remover dos salvos' : 'Salvar oportunidade'}
                  className={`p-1.5 rounded-lg hover:bg-zinc-800 transition-colors ${
                    post.is_saved ? 'text-zinc-100 bg-zinc-800' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Bookmark
                    className={`w-4 h-4 ${post.is_saved ? 'fill-current' : ''}`}
                  />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
