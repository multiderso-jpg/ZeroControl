import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Modal, Button, Textarea, Input, Badge } from './UI';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';
import { UserAvatar } from './UserAvatar';
import { formatCompensation, formatRelativeDate } from './PostCard';
import { MapPin, Clock, DollarSign, ShieldAlert, Send, Users, } from 'lucide-react';
export function PostDetailModal({ post, isOpen, onClose, onPostUpdated, onOpenReport, }) {
    const { user } = useAuth();
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    // Estados da candidatura do usuário logado
    const [interestMessage, setInterestMessage] = useState('');
    const [proposedValueStr, setProposedValueStr] = useState('');
    const [isApplying, setIsApplying] = useState(false);
    const [applyError, setApplyError] = useState(null);
    // Estados de gerenciamento de candidatos para o autor
    const [showApplicants, setShowApplicants] = useState(false);
    const [applicants, setApplicants] = useState([]);
    const [isLoadingApplicants, setIsLoadingApplicants] = useState(false);
    const [isSelecting, setIsSelecting] = useState(null);
    const isAuthor = user && post && user.id === post.author_id;
    useEffect(() => {
        if (isOpen && post && isAuthor) {
            loadApplicants();
        }
    }, [isOpen, post?.id, isAuthor]);
    const loadApplicants = async () => {
        if (!post)
            return;
        setIsLoadingApplicants(true);
        try {
            const data = await apiRequest(`/api/applications/posts/${post.id}`);
            setApplicants(data.applications);
        }
        catch {
            // Ignora erro
        }
        finally {
            setIsLoadingApplicants(false);
        }
    };
    if (!post)
        return null;
    const handleApply = async (e) => {
        e.preventDefault();
        setIsApplying(true);
        setApplyError(null);
        try {
            let proposedCents = null;
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
            const updated = await apiRequest(`/api/posts/${post.id}`);
            onPostUpdated(updated.post);
            setInterestMessage('');
            setProposedValueStr('');
        }
        catch (err) {
            setApplyError(err.message || 'Erro ao enviar manifestação de interesse.');
        }
        finally {
            setIsApplying(false);
        }
    };
    const handleWithdraw = async () => {
        if (!confirm('Deseja realmente retirar sua candidatura para esta oportunidade?'))
            return;
        try {
            // Busca candidatura ativa
            const myApps = await apiRequest('/api/applications/my');
            const target = myApps.applications.find((a) => a.post_id === post.id);
            if (target) {
                await apiRequest(`/api/applications/${target.id}/withdraw`, { method: 'POST' });
                const updated = await apiRequest(`/api/posts/${post.id}`);
                onPostUpdated(updated.post);
            }
        }
        catch (err) {
            alert(err.message || 'Erro ao retirar candidatura.');
        }
    };
    const handleSelectCandidate = async (appId) => {
        if (!confirm('Confirmar a seleção deste candidato para a oportunidade? Esta ação colocará a publicação em andamento e recusará as demais candidaturas.'))
            return;
        setIsSelecting(appId);
        try {
            await apiRequest(`/api/applications/${appId}/select`, {
                method: 'POST',
                body: JSON.stringify({ postId: post.id }),
            });
            const updated = await apiRequest(`/api/posts/${post.id}`);
            onPostUpdated(updated.post);
            await loadApplicants();
        }
        catch (err) {
            alert(err.message || 'Erro ao selecionar candidato.');
        }
        finally {
            setIsSelecting(null);
        }
    };
    const handleClosePost = async () => {
        if (!confirm('Deseja realmente encerrar esta publicação? Ela deixará de receber novas candidaturas.'))
            return;
        try {
            await apiRequest(`/api/posts/${post.id}/close`, { method: 'POST' });
            const updated = await apiRequest(`/api/posts/${post.id}`);
            onPostUpdated(updated.post);
        }
        catch (err) {
            alert(err.message || 'Erro ao encerrar publicação.');
        }
    };
    return (_jsx(Modal, { isOpen: isOpen, onClose: onClose, title: post.title, description: `Publicado por @${post.author_username} na Guilda`, maxWidth: "4xl", children: _jsxs("div", { className: "space-y-6 text-left", children: [post.images.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "h-64 sm:h-96 w-full rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 flex items-center justify-center", children: _jsx("img", { src: post.images[activeImageIndex]?.image_url, alt: post.title, className: "w-full h-full object-contain" }) }), post.images.length > 1 && (_jsx("div", { className: "flex items-center gap-2 overflow-x-auto pb-1", children: post.images.map((img, idx) => (_jsx("button", { onClick: () => setActiveImageIndex(idx), className: `h-16 w-20 rounded-lg overflow-hidden border shrink-0 transition-all cursor-pointer ${activeImageIndex === idx ? 'border-white scale-105' : 'border-zinc-800 opacity-60'}`, children: _jsx("img", { src: img.thumbnail_url, alt: "", className: "w-full h-full object-cover" }) }, img.id))) }))] })), _jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx(Badge, { variant: "silver", children: post.intention }), _jsx(Badge, { variant: "neutral", children: post.opportunity_type_name }), _jsx(Badge, { variant: "neutral", children: post.service_category_name }), _jsxs(Badge, { variant: "neutral", children: [_jsx(MapPin, { className: "w-3 h-3 mr-1 inline" }), post.modality === 'Remoto'
                                    ? 'Remoto'
                                    : `${post.city || ''}${post.state ? `, ${post.state}` : ''}`] }), post.status === 'aberta' ? (_jsx(Badge, { variant: "success", children: "Aberta" })) : post.status === 'em_andamento' ? (_jsx(Badge, { variant: "info", children: "Em andamento" })) : (_jsx(Badge, { variant: "danger", children: "Encerrada" }))] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl", children: [_jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-[11px] font-mono uppercase text-zinc-400", children: "Remunera\u00E7\u00E3o Proposta" }), _jsxs("span", { className: "text-base font-bold text-white flex items-center gap-1 mt-0.5", children: [_jsx(DollarSign, { className: "w-4 h-4 text-zinc-400" }), formatCompensation(post)] })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-[11px] font-mono uppercase text-zinc-400", children: "Prazo" }), _jsxs("span", { className: "text-sm text-zinc-200 flex items-center gap-1 mt-1", children: [_jsx(Clock, { className: "w-4 h-4 text-zinc-400" }), post.deadline
                                            ? new Date(post.deadline).toLocaleDateString('pt-BR')
                                            : 'Não delimitado'] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2", children: "Descri\u00E7\u00E3o do Trabalho e Requisitos" }), _jsx("div", { className: "text-sm text-zinc-200 leading-relaxed whitespace-pre-line p-4 rounded-xl bg-zinc-900/40 border border-zinc-800", children: post.description })] }), _jsxs("div", { className: "flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(UserAvatar, { username: post.author_username, avatarUrl: post.author_avatar_url, size: "md" }), _jsxs("div", { className: "flex flex-col", children: [_jsxs("span", { className: "text-xs font-semibold text-white", children: ["@", post.author_username] }), _jsxs("span", { className: "text-[11px] text-zinc-400", children: ["Publicado ", formatRelativeDate(post.created_at)] })] })] }), !isAuthor && (_jsx(Button, { variant: "ghost", size: "sm", icon: _jsx(ShieldAlert, { className: "w-4 h-4 text-zinc-400" }), onClick: () => onOpenReport(post.id, post.title), children: "Denunciar ao Conselho" }))] }), isAuthor && (_jsxs("div", { className: "pt-4 border-t border-zinc-800 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Users, { className: "w-4 h-4 text-zinc-300" }), _jsxs("h4", { className: "text-sm font-semibold text-white", children: ["Candidaturas Recebidas (", applicants.length, ")"] })] }), post.status === 'aberta' && (_jsx(Button, { variant: "danger", size: "sm", onClick: handleClosePost, children: "Encerrar an\u00FAncio" }))] }), applicants.length === 0 ? (_jsx("p", { className: "text-xs text-zinc-500 py-3 text-center", children: "Ainda n\u00E3o h\u00E1 manifesta\u00E7\u00F5es de interesse registradas para este an\u00FAncio." })) : (_jsx("div", { className: "space-y-3", children: applicants.map((app) => (_jsxs("div", { className: "p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx(UserAvatar, { username: app.applicant_username, avatarUrl: app.applicant_avatar_url, size: "sm" }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "text-xs font-semibold text-white", children: ["@", app.applicant_username] }), _jsx(Badge, { variant: app.status === 'selecionada'
                                                                    ? 'success'
                                                                    : app.status === 'recusada'
                                                                        ? 'danger'
                                                                        : 'neutral', children: app.status })] }), _jsx("p", { className: "text-xs text-zinc-300 mt-1", children: app.message }), app.proposed_amount_cents && (_jsxs("p", { className: "text-[11px] text-zinc-400 mt-0.5", children: ["Proposta: ", (app.proposed_amount_cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })] }))] })] }), post.status === 'aberta' && app.status === 'enviada' && (_jsx(Button, { variant: "primary", size: "sm", isLoading: isSelecting === app.id, onClick: () => handleSelectCandidate(app.id), children: "Selecionar candidato" }))] }, app.id))) }))] })), !isAuthor && user && (_jsx("div", { className: "pt-4 border-t border-zinc-800 space-y-3", children: post.user_application_status ? (_jsxs("div", { className: "p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("span", { className: "text-xs font-semibold text-white block", children: "Situa\u00E7\u00E3o da sua candidatura:" }), _jsxs("div", { className: "mt-1", children: [post.user_application_status === 'enviada' && (_jsx(Badge, { variant: "warning", children: "Enviada \u2022 Aguardando an\u00E1lise do autor" })), post.user_application_status === 'selecionada' && (_jsx(Badge, { variant: "success", children: "Parab\u00E9ns! Voc\u00EA foi selecionado para esta oportunidade!" })), post.user_application_status === 'recusada' && (_jsx(Badge, { variant: "danger", children: "N\u00E3o selecionada nesta vaga" })), post.user_application_status === 'retirada' && (_jsx(Badge, { variant: "neutral", children: "Candidatura retirada por voc\u00EA" }))] })] }), post.user_application_status === 'enviada' && (_jsx(Button, { variant: "outline", size: "sm", onClick: handleWithdraw, children: "Retirar candidatura" }))] })) : post.status === 'aberta' ? (_jsxs("form", { onSubmit: handleApply, className: "space-y-3", children: [_jsxs("h4", { className: "text-sm font-semibold text-white flex items-center gap-2", children: [_jsx(Send, { className: "w-4 h-4 text-zinc-400" }), "Tenho interesse nesta oportunidade"] }), applyError && (_jsx("div", { className: "p-2.5 rounded-lg bg-red-950/70 border border-red-800 text-xs text-red-300", children: applyError })), _jsx(Textarea, { label: "Mensagem de apresenta\u00E7\u00E3o para o autor (m\u00EDnimo 5 caracteres)", placeholder: "Apresente sua experi\u00EAncia, disponibilidade e proposta para esta entrega...", value: interestMessage, onChange: (e) => setInterestMessage(e.target.value), rows: 3, required: true }), _jsxs("div", { className: "flex flex-col sm:flex-row items-end gap-3", children: [_jsx("div", { className: "w-full sm:w-1/2", children: _jsx(Input, { label: "Proposta de valor em R$ (Opcional)", placeholder: "Ex: 2400,00", value: proposedValueStr, onChange: (e) => setProposedValueStr(e.target.value) }) }), _jsx(Button, { type: "submit", variant: "primary", size: "md", isLoading: isApplying, className: "w-full sm:w-auto", children: "Enviar manifesta\u00E7\u00E3o de interesse" })] })] })) : (_jsx("div", { className: "p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-xs text-zinc-400 text-center", children: "Esta oportunidade j\u00E1 encerrou o per\u00EDodo de recebimento de candidaturas." })) }))] }) }));
}
