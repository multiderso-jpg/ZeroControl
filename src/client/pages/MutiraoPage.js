import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Badge, Button } from '../components/UI';
import { HeartHandshake, MapPin, Clock, Check, Users } from 'lucide-react';
export function MutiraoPage() {
    const { user } = useAuth();
    const [actions, setActions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [joiningId, setJoiningId] = useState(null);
    useEffect(() => {
        loadActions();
    }, [user]);
    const loadActions = async () => {
        setIsLoading(true);
        try {
            const data = await apiRequest('/api/modules/mutirao/actions');
            setActions(data.actions);
        }
        catch {
            setActions([]);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleJoin = async (id) => {
        if (!user) {
            alert('Faça login para aderir a um mutirão voluntário.');
            return;
        }
        setJoiningId(id);
        try {
            await apiRequest(`/api/modules/mutirao/actions/${id}/join`, { method: 'POST' });
            await loadActions();
        }
        catch (err) {
            alert(err.message || 'Erro ao confirmar participação.');
        }
        finally {
            setJoiningId(null);
        }
    };
    return (_jsxs("div", { className: "space-y-6 text-left", children: [_jsxs("div", { className: "pb-4 border-b border-zinc-800", children: [_jsxs("h1", { className: "text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2", children: [_jsx(HeartHandshake, { className: "w-6 h-6 text-zinc-300" }), "Mutir\u00E3o \u2022 Voluntariado & A\u00E7\u00F5es Coletivas"] }), _jsx("p", { className: "text-xs text-zinc-400 mt-1", children: "Iniciativas coletivas de impacto comunit\u00E1rio, voluntariado livre e apoio m\u00FAtuo, com reembolso de despesas operacionais claramente delimitado." })] }), isLoading ? (_jsx("div", { className: "h-32 rounded-xl bg-zinc-900 animate-pulse" })) : actions.length === 0 ? (_jsx("div", { className: "p-12 text-center rounded-xl bg-zinc-900/30 border border-zinc-800 text-xs text-zinc-500", children: "Nenhum mutir\u00E3o coletivo cadastrado no momento. A\u00E7\u00F5es volunt\u00E1rias s\u00E3o de ades\u00E3o espont\u00E2nea e aberta." })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: actions.map((act) => (_jsxs("div", { className: "p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-xs font-mono font-bold text-zinc-300 uppercase", children: act.entity_name }), _jsx(Badge, { variant: "silver", children: "Voluntariado" })] }), _jsx("h3", { className: "font-semibold text-sm text-white mb-2", children: act.purpose }), _jsxs("div", { className: "space-y-1.5 p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 mb-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(MapPin, { className: "w-3.5 h-3.5 text-zinc-500" }), _jsxs("span", { children: ["Local: ", act.location] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "w-3.5 h-3.5 text-zinc-500" }), _jsxs("span", { children: ["Data: ", new Date(act.scheduled_time).toLocaleString('pt-BR')] })] }), act.expenses_reimbursement && (_jsxs("div", { className: "text-[11px] text-zinc-400 pt-1 border-t border-zinc-900", children: ["Reembolso previsto: ", act.expenses_reimbursement] }))] })] }), _jsxs("div", { className: "pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Users, { className: "w-3.5 h-3.5" }), act.participants_count, " volunt\u00E1rios confirmados"] }), act.is_joined ? (_jsxs(Badge, { variant: "success", className: "flex items-center gap-1", children: [_jsx(Check, { className: "w-3 h-3" }), " Inscrito"] })) : (_jsx(Button, { variant: "primary", size: "sm", isLoading: joiningId === act.id, onClick: () => handleJoin(act.id), children: "Aderir livremente" }))] })] }, act.id))) }))] }));
}
