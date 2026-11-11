import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Badge, Button } from '../components/UI';
import { Users, UserPlus } from 'lucide-react';
export function CompanhiaPage() {
    const { user } = useAuth();
    const [teams, setTeams] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        if (user) {
            apiRequest('/api/modules/companhia/teams')
                .then((data) => setTeams(data.teams))
                .catch(() => setTeams([]))
                .finally(() => setIsLoading(false));
        }
        else {
            setIsLoading(false);
        }
    }, [user]);
    return (_jsxs("div", { className: "space-y-6 text-left", children: [_jsxs("div", { className: "pb-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2", children: [_jsx(Users, { className: "w-6 h-6 text-zinc-300" }), "Companhia \u2022 Forma\u00E7\u00E3o de Equipes"] }), _jsx("p", { className: "text-xs text-zinc-400 mt-1", children: "Agrupamento de profissionais por fun\u00E7\u00F5es complementares, disponibilidade e sele\u00E7\u00E3o conjunta para grandes empreitadas." })] }), _jsx(Button, { variant: "outline", size: "sm", icon: _jsx(UserPlus, { className: "w-4 h-4" }), onClick: () => alert('Na V1, criação avançada de esquadrões é gerenciada sob demanda.'), children: "Nova equipe" })] }), isLoading ? (_jsx("div", { className: "h-32 rounded-xl bg-zinc-900 animate-pulse" })) : teams.length === 0 ? (_jsx("div", { className: "p-12 text-center rounded-xl bg-zinc-900/30 border border-zinc-800 text-xs text-zinc-500", children: "Voc\u00EA n\u00E3o faz parte de nenhuma equipe ativa no momento. Equipes s\u00E3o formadas a partir de convites aceitos entre participantes." })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: teams.map((t) => (_jsxs("div", { className: "p-4 rounded-xl bg-zinc-900 border border-zinc-800", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "font-semibold text-white text-sm", children: t.name }), _jsx(Badge, { variant: "neutral", children: t.status })] }), _jsx("p", { className: "text-xs text-zinc-400 mb-3", children: t.description }), _jsxs("div", { className: "text-[11px] text-zinc-500 flex items-center justify-between", children: [_jsxs("span", { children: ["L\u00EDder: @", t.leader_username] }), _jsxs("span", { children: [t.members_count, " integrantes"] })] })] }, t.id))) }))] }));
}
