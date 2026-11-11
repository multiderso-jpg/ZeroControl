import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { Badge, Button } from '../components/UI';
import { Globe2 } from 'lucide-react';
export function EmbaixadaPage() {
    const { user } = useAuth();
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        if (user) {
            apiRequest('/api/modules/embaixada/directory')
                .then((data) => setMembers(data.directory))
                .catch(() => setMembers([]))
                .finally(() => setIsLoading(false));
        }
        else {
            setIsLoading(false);
        }
    }, [user]);
    return (_jsxs("div", { className: "space-y-6 text-left", children: [_jsxs("div", { className: "pb-4 border-b border-zinc-800", children: [_jsxs("h1", { className: "text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2", children: [_jsx(Globe2, { className: "w-6 h-6 text-zinc-300" }), "Embaixada \u2022 Diret\u00F3rio & Rela\u00E7\u00F5es"] }), _jsx("p", { className: "text-xs text-zinc-400 mt-1", children: "Rede interna de contatos, apresenta\u00E7\u00F5es autorizadas e encaminhamentos entre membros com visibilidade p\u00FAblica." })] }), !user ? (_jsx("div", { className: "p-8 text-center rounded-xl bg-zinc-900/40 border border-zinc-800 text-xs text-zinc-400", children: "A visualiza\u00E7\u00E3o do diret\u00F3rio de membros da Embaixada \u00E9 restrita a participantes autenticados da Guilda." })) : isLoading ? (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4", children: [1, 2, 3, 4, 5, 6].map((i) => (_jsx("div", { className: "h-32 rounded-xl bg-zinc-900 animate-pulse" }, i))) })) : members.length === 0 ? (_jsx("div", { className: "p-12 text-center rounded-xl bg-zinc-900/30 border border-zinc-800 text-xs text-zinc-500", children: "Nenhum membro com perfil p\u00FAblico listado no momento." })) : (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4", children: members.map((m) => (_jsxs("div", { className: "p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx(UserAvatar, { username: m.username, avatarUrl: m.avatar_url, size: "md" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("span", { className: "font-semibold text-white text-sm truncate block", children: ["@", m.username] }), _jsx(Badge, { variant: "neutral", className: "mt-1", children: m.role }), _jsx("p", { className: "text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed", children: m.bio || 'Membro participante da Guilda Zero Control.' })] })] }), _jsxs("div", { className: "mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500", children: [_jsxs("span", { children: ["Desde ", new Date(m.created_at).toLocaleDateString('pt-BR')] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => alert(`Apresentação para @${m.username} registrada internamente.`), children: "Contatar" })] })] }, m.id))) }))] }));
}
