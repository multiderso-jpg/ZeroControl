import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/UI';
import { Coins, ShieldAlert } from 'lucide-react';
export function TesourariaPage() {
    const { user } = useAuth();
    const [financialData, setFinancialData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        if (user) {
            apiRequest('/api/modules/tesouraria/records')
                .then((res) => setFinancialData(res))
                .catch(() => setFinancialData(null))
                .finally(() => setIsLoading(false));
        }
        else {
            setIsLoading(false);
        }
    }, [user]);
    return (_jsxs("div", { className: "space-y-6 text-left", children: [_jsxs("div", { className: "pb-4 border-b border-zinc-800", children: [_jsxs("h1", { className: "text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2", children: [_jsx(Coins, { className: "w-6 h-6 text-zinc-300" }), "Tesouraria \u2022 Registros & Transpar\u00EAncia"] }), _jsx("p", { className: "text-xs text-zinc-400 mt-1", children: "Acompanhamento de refer\u00EAncias or\u00E7ament\u00E1rias, valores acordados e demonstrativo de transpar\u00EAncia financeira permitida." })] }), _jsxs("div", { className: "p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 space-y-1.5 leading-relaxed", children: [_jsxs("div", { className: "flex items-center gap-2 text-zinc-200 font-semibold", children: [_jsx(ShieldAlert, { className: "w-4 h-4 text-zinc-400" }), "Diretriz de Transpar\u00EAncia Financeira (V1)"] }), _jsx("p", { children: "O Zero Control distingue or\u00E7amentos, propostas, cobran\u00E7as e confirma\u00E7\u00F5es. Na primeira vers\u00E3o, os registros refletem valores formais acordados nas oportunidades. N\u00E3o simulamos carteiras fict\u00EDcias, cust\u00F3dia antecipada ou dep\u00F3sitos n\u00E3o verificados por institui\u00E7\u00F5es reguladas." })] }), !user ? (_jsx("div", { className: "p-8 text-center rounded-xl bg-zinc-900/40 border border-zinc-800 text-xs text-zinc-400", children: "Fa\u00E7a login para consultar seus registros cont\u00E1beis e demonstrativos vinculados." })) : isLoading ? (_jsx("div", { className: "h-32 rounded-xl bg-zinc-900 animate-pulse" })) : (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "p-5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "text-xs font-mono uppercase text-zinc-400", children: "Total Registrado" }), _jsx("p", { className: "text-2xl font-bold text-white mt-1", children: ((financialData?.total_cents || 0) / 100).toLocaleString('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL',
                                        }) })] }), _jsx(Badge, { variant: "silver", children: "BRL \u2022 Real Brasileiro" })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("h2", { className: "text-xs font-mono uppercase tracking-wider text-zinc-400", children: "Movimenta\u00E7\u00F5es e Lan\u00E7amentos Vinculados" }), (!financialData?.records || financialData.records.length === 0) ? (_jsx("div", { className: "p-8 text-center rounded-xl bg-zinc-900/30 border border-zinc-800 text-xs text-zinc-500", children: "Nenhum lan\u00E7amento registrado no momento." })) : (financialData.records.map((rec) => (_jsxs("div", { className: "p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs", children: [_jsxs("div", { children: [_jsx("span", { className: "font-semibold text-white block", children: rec.origin_description }), _jsxs("span", { className: "text-[11px] text-zinc-500 font-mono", children: ["Ref: ", rec.confirmation_reference || 'Registrado internamente', " \u2022 ", new Date(rec.created_at).toLocaleDateString('pt-BR')] })] }), _jsxs("div", { className: "text-right", children: [_jsx("span", { className: "font-bold text-zinc-100", children: (rec.amount_cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }), _jsx(Badge, { variant: "neutral", className: "mt-1 block", children: rec.status })] })] }, rec.id))))] })] }))] }));
}
