import React from 'react';
import { Post } from '../../shared/types';
import { UserAvatar } from './UserAvatar';
import { Badge } from './UI';
import { MapPin, Calendar, Clock, DollarSign, Bookmark, MessageSquare } from 'lucide-react';

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
        return <Badge variant="success">Aberta</Badge>;
      case 'em_andamento':
        return <Badge variant="info">Em andamento</Badge>;
      case 'encerrada':
        return <Badge variant="neutral">Encerrada</Badge>;
      case 'suspensa':
        return <Badge variant="danger">Suspensa</Badge>;
      default:
        return <Badge variant="neutral">{post.status}</Badge>;
    }
  };

  const getIntentionBadge = () => {
    if (post.intention === 'Preciso de um serviço') {
      return <Badge variant="silver">Preciso de um serviço</Badge>;
    }
    if (post.intention === 'Ofereço um serviço') {
      return <Badge variant="neutral">Ofereço um serviço</Badge>;
    }
    return <Badge variant="neutral">Oportunidade de trabalho</Badge>;
  };

  return (
    <article
      onClick={onClick}
      className="bg-zinc-900/90 border border-zinc-800/90 hover:border-zinc-700 rounded-xl overflow-hidden flex flex-col transition-all duration-150 cursor-pointer group shadow-sm hover:shadow-md text-left"
    >
      {/* Capa */}
      {coverImage ? (
        <div className="h-44 w-full overflow-hidden bg-zinc-950 relative">
          <img
            src={coverImage.thumbnail_url || coverImage.image_url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
            {getStatusBadge()}
          </div>
        </div>
      ) : (
        <div className="h-20 w-full bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-zinc-800/60 p-3 flex items-start justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-zinc-600"></span>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              {post.origin_module.toUpperCase()}
            </span>
          </div>
          <div>{getStatusBadge()}</div>
        </div>
      )}

      {/* Conteúdo */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            {getIntentionBadge()}
            <Badge variant="neutral">{post.opportunity_type_name}</Badge>
            <Badge variant="silver">{post.service_category_name}</Badge>
          </div>

          <h3 className="font-semibold text-sm text-zinc-100 group-hover:text-white line-clamp-2 leading-snug">
            {post.title}
          </h3>

          <p className="text-xs text-zinc-400 mt-2 line-clamp-3 leading-relaxed">
            {post.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-zinc-800/80 space-y-2.5">
          {/* Metadados: Remuneração e Localização */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-100 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-zinc-400" />
              {formatCompensation(post)}
            </span>

            <span className="text-zinc-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-zinc-500" />
              {post.modality === 'Remoto'
                ? 'Remoto'
                : `${post.city || ''}${post.state ? `, ${post.state}` : ''}`}
            </span>
          </div>

          {/* Rodapé: Autor, Data e Salvar */}
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <div className="flex items-center gap-2">
              <UserAvatar
                username={post.author_username}
                avatarUrl={post.author_avatar_url}
                size="xs"
              />
              <span className="font-medium text-zinc-300 truncate max-w-[100px]">
                {post.author_username}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-zinc-500" />
                {formatRelativeDate(post.created_at)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {post.applications_count != null && post.applications_count > 0 && (
                <span className="flex items-center gap-1 text-zinc-400 font-mono text-[10px]">
                  <MessageSquare className="w-3 h-3" />
                  {post.applications_count}
                </span>
              )}

              {onToggleSave && (
                <button
                  type="button"
                  onClick={onToggleSave}
                  aria-label={post.is_saved ? 'Remover dos salvos' : 'Salvar oportunidade'}
                  className={`p-1 rounded hover:bg-zinc-800 transition-colors ${
                    post.is_saved ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Bookmark
                    className={`w-3.5 h-3.5 ${post.is_saved ? 'fill-current' : ''}`}
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
