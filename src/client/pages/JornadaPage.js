import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/UI';
import { Compass } from 'lucide-react';
export function JornadaPage() {
    const { user } = useAuth();
    const [engagements, setEngagements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        if (user) {
            apiRequest('/api/modules/jornada/engagements')
                .then((data) => setEngagements(data.engagements))
                .catch(() => setEngagements([]))
                .finally(() => setIsLoading(false));
        }
        else {
            setIsLoading(false);
        }
    }, [user]);
    const phases = ['preparacao', 'execucao', 'entrega', 'revisao', 'aceite'];
    return (_jsxs("div", { className: "space-y-6 text-left", children: [_jsxs("div", { className: "pb-4 border-b border-zinc-800", children: [_jsxs("h1", { className: "text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2", children: [_jsx(Compass, { className: "w-6 h-6 text-zinc-300" }), "Jornada \u2022 Execu\u00E7\u00E3o & Aceite"] }), _jsx("p", { className: "text-xs text-zinc-400 mt-1", children: "Acompanhamento dos compromissos formais em andamento: prepara\u00E7\u00E3o de escopo, execu\u00E7\u00E3o t\u00E9cnica, entregas e valida\u00E7\u00E3o final." })] }), isLoading ? (_jsx("div", { className: "h-32 rounded-xl bg-zinc-900 animate-pulse" })) : engagements.length === 0 ? (_jsx("div", { className: "p-12 text-center rounded-xl bg-zinc-900/30 border border-zinc-800 text-xs text-zinc-500", children: "Voc\u00EA n\u00E3o possui compromissos ativos na Jornada no momento. Compromissos s\u00E3o iniciados ap\u00F3s a sele\u00E7\u00E3o de uma candidatura na Guilda." })) : (_jsx("div", { className: "space-y-4", children: engagements.map((eng) => (_jsxs("div", { className: "p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold text-white", children: eng.title }), _jsxs("p", { className: "text-xs text-zinc-400 mt-0.5", children: ["Cliente: @", eng.client_username, " \u2022 Prestador: @", eng.provider_username] })] }), _jsxs(Badge, { variant: "info", children: ["Fase: ", eng.phase] })] }), _jsx("div", { className: "grid grid-cols-5 gap-1.5 pt-2", children: phases.map((p, idx) => {
                                const currentIdx = phases.indexOf(eng.phase);
                                const isDone = idx <= currentIdx;
                                return (_jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("div", { className: `h-1.5 rounded-full ${isDone ? 'bg-zinc-200' : 'bg-zinc-800'}` }), _jsx("span", { className: "text-[10px] font-mono text-zinc-400 capitalize truncate", children: p })] }, p));
                            }) }), _jsxs("div", { className: "p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-400", children: [_jsx("span", { className: "font-semibold text-zinc-300 block mb-1", children: "Termos acordados:" }), eng.terms] })] }, eng.id))) }))] }));
}
