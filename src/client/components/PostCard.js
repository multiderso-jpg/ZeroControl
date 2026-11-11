import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { UserAvatar } from './UserAvatar';
import { Badge } from './UI';
import { MapPin, Clock, DollarSign, Bookmark, MessageSquare } from 'lucide-react';
export function formatCompensation(post) {
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
export function formatRelativeDate(dateStr) {
    try {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        if (diffMins < 2)
            return 'agora há pouco';
        if (diffMins < 60)
            return `há ${diffMins} min`;
        if (diffHours < 24)
            return `há ${diffHours} h`;
        if (diffDays === 1)
            return 'ontem';
        if (diffDays < 7)
            return `há ${diffDays} dias`;
        return date.toLocaleDateString('pt-BR');
    }
    catch {
        return '';
    }
}
export function PostCard({ post, onClick, onToggleSave }) {
    const coverImage = post.images.find((img) => img.is_cover) || post.images[0];
    const getStatusBadge = () => {
        switch (post.status) {
            case 'aberta':
                return _jsx(Badge, { variant: "success", children: "Aberta" });
            case 'em_andamento':
                return _jsx(Badge, { variant: "info", children: "Em andamento" });
            case 'encerrada':
                return _jsx(Badge, { variant: "neutral", children: "Encerrada" });
            case 'suspensa':
                return _jsx(Badge, { variant: "danger", children: "Suspensa" });
            default:
                return _jsx(Badge, { variant: "neutral", children: post.status });
        }
    };
    const getIntentionBadge = () => {
        if (post.intention === 'Preciso de um serviço') {
            return _jsx(Badge, { variant: "silver", children: "Preciso de um servi\u00E7o" });
        }
        if (post.intention === 'Ofereço um serviço') {
            return _jsx(Badge, { variant: "neutral", children: "Ofere\u00E7o um servi\u00E7o" });
        }
        return _jsx(Badge, { variant: "neutral", children: "Oportunidade de trabalho" });
    };
    return (_jsxs("article", { onClick: onClick, className: "bg-zinc-900/90 border border-zinc-800/90 hover:border-zinc-700 rounded-xl overflow-hidden flex flex-col transition-all duration-150 cursor-pointer group shadow-sm hover:shadow-md text-left", children: [coverImage ? (_jsxs("div", { className: "h-44 w-full overflow-hidden bg-zinc-950 relative", children: [_jsx("img", { src: coverImage.thumbnail_url || coverImage.image_url, alt: post.title, className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300", loading: "lazy" }), _jsx("div", { className: "absolute top-2.5 right-2.5 flex items-center gap-1.5", children: getStatusBadge() })] })) : (_jsxs("div", { className: "h-20 w-full bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-zinc-800/60 p-3 flex items-start justify-between", children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-zinc-600" }), _jsx("span", { className: "text-[10px] font-mono text-zinc-500 uppercase tracking-widest", children: post.origin_module.toUpperCase() })] }), _jsx("div", { children: getStatusBadge() })] })), _jsxs("div", { className: "p-4 flex-1 flex flex-col justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex flex-wrap items-center gap-1.5 mb-2", children: [getIntentionBadge(), _jsx(Badge, { variant: "neutral", children: post.opportunity_type_name }), _jsx(Badge, { variant: "silver", children: post.service_category_name })] }), _jsx("h3", { className: "font-semibold text-sm text-zinc-100 group-hover:text-white line-clamp-2 leading-snug", children: post.title }), _jsx("p", { className: "text-xs text-zinc-400 mt-2 line-clamp-3 leading-relaxed", children: post.description })] }), _jsxs("div", { className: "mt-4 pt-3 border-t border-zinc-800/80 space-y-2.5", children: [_jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsxs("span", { className: "font-semibold text-zinc-100 flex items-center gap-1", children: [_jsx(DollarSign, { className: "w-3.5 h-3.5 text-zinc-400" }), formatCompensation(post)] }), _jsxs("span", { className: "text-zinc-400 flex items-center gap-1", children: [_jsx(MapPin, { className: "w-3.5 h-3.5 text-zinc-500" }), post.modality === 'Remoto'
                                                ? 'Remoto'
                                                : `${post.city || ''}${post.state ? `, ${post.state}` : ''}`] })] }), _jsxs("div", { className: "flex items-center justify-between text-[11px] text-zinc-400", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(UserAvatar, { username: post.author_username, avatarUrl: post.author_avatar_url, size: "xs" }), _jsx("span", { className: "font-medium text-zinc-300 truncate max-w-[100px]", children: post.author_username }), _jsx("span", { children: "\u2022" }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Clock, { className: "w-3 h-3 text-zinc-500" }), formatRelativeDate(post.created_at)] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [post.applications_count != null && post.applications_count > 0 && (_jsxs("span", { className: "flex items-center gap-1 text-zinc-400 font-mono text-[10px]", children: [_jsx(MessageSquare, { className: "w-3 h-3" }), post.applications_count] })), onToggleSave && (_jsx("button", { type: "button", onClick: onToggleSave, "aria-label": post.is_saved ? 'Remover dos salvos' : 'Salvar oportunidade', className: `p-1 rounded hover:bg-zinc-800 transition-colors ${post.is_saved ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`, children: _jsx(Bookmark, { className: `w-3.5 h-3.5 ${post.is_saved ? 'fill-current' : ''}` }) }))] })] })] })] })] }));
}
