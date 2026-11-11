import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Badge, Button, Textarea } from '../components/UI';
import { Scale, ShieldAlert, AlertTriangle } from 'lucide-react';
export function ConselhoPage() {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [decisionNotes, setDecisionNotes] = useState({});
    const [isProcessing, setIsProcessing] = useState(null);
    const isModerator = user?.role === 'moderador' || user?.role === 'administrador';
    useEffect(() => {
        if (isModerator) {
            loadReports();
        }
    }, [isModerator]);
    const loadReports = async () => {
        setIsLoading(true);
        try {
            const data = await apiRequest('/api/council/reports');
            setReports(data.reports);
        }
        catch {
            setReports([]);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleDecide = async (reportId, decision, suspendPost) => {
        setIsProcessing(reportId);
        try {
            await apiRequest(`/api/council/reports/${reportId}/decide`, {
                method: 'POST',
                body: JSON.stringify({
                    decision,
                    notes: decisionNotes[reportId] || 'Decisão registrada pelo Conselho.',
                    suspendPost,
                }),
            });
            await loadReports();
        }
        catch (err) {
            alert(err.message || 'Erro ao processar decisão.');
        }
        finally {
            setIsProcessing(null);
        }
    };
    return (_jsxs("div", { className: "space-y-6 text-left", children: [_jsxs("div", { className: "pb-4 border-b border-zinc-800", children: [_jsxs("h1", { className: "text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2", children: [_jsx(Scale, { className: "w-6 h-6 text-zinc-300" }), "Conselho \u2022 Modera\u00E7\u00E3o & Diretrizes"] }), _jsx("p", { className: "text-xs text-zinc-400 mt-1", children: "\u00D3rg\u00E3o respons\u00E1vel pela integridade comunit\u00E1ria, resolu\u00E7\u00E3o imparcial de diverg\u00EAncias e an\u00E1lise de den\u00FAncias sobre publica\u00E7\u00F5es e servi\u00E7os." })] }), _jsxs("div", { className: "p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2 text-xs text-zinc-300 leading-relaxed", children: [_jsxs("h2", { className: "font-semibold text-white flex items-center gap-1.5", children: [_jsx(ShieldAlert, { className: "w-4 h-4 text-zinc-400" }), "C\u00F3digo de Conduta da Guilda"] }), _jsxs("ul", { className: "list-disc list-inside space-y-1 text-zinc-400", children: [_jsx("li", { children: "Transpar\u00EAncia nas condi\u00E7\u00F5es de remunera\u00E7\u00E3o: n\u00E3o anunciar trabalho volunt\u00E1rio como vaga remunerada." }), _jsx("li", { children: "Respeito e profissionalismo nas propostas e mensagens de interesse." }), _jsx("li", { children: "Proibi\u00E7\u00E3o estrita de esquemas piramidais, golpes, conte\u00FAdo enganoso ou cobran\u00E7as indevidas." }), _jsx("li", { children: "Den\u00FAncias podem ser abertas diretamente no cart\u00E3o ou detalhes de qualquer publica\u00E7\u00E3o na Guilda." })] })] }), isModerator ? (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h2", { className: "text-sm font-semibold tracking-wider uppercase text-amber-400 flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "w-4 h-4" }), "Fila de Julgamento de Den\u00FAncias (", reports.length, ")"] }), _jsx(Button, { variant: "outline", size: "sm", onClick: loadReports, isLoading: isLoading, children: "Atualizar fila" })] }), reports.length === 0 ? (_jsx("div", { className: "p-8 text-center rounded-xl bg-zinc-900/30 border border-zinc-800 text-xs text-zinc-500", children: "Nenhuma den\u00FAncia pendente de an\u00E1lise na fila do Conselho." })) : (_jsx("div", { className: "space-y-3", children: reports.map((r) => (_jsxs("div", { className: "p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2", children: [_jsxs("div", { children: [_jsx("span", { className: "text-xs font-mono uppercase text-zinc-400", children: "Den\u00FAncia sobre:" }), _jsx("h3", { className: "text-sm font-bold text-white mt-0.5", children: r.post_title }), _jsxs("p", { className: "text-[11px] text-zinc-400", children: ["Relator: @", r.reporter_username, " \u2022 Categoria:", ' ', _jsx(Badge, { variant: "silver", children: r.category }), " \u2022 Registrada em", ' ', new Date(r.created_at).toLocaleDateString('pt-BR')] })] }), _jsx(Badge, { variant: r.status === 'pendente'
                                                ? 'warning'
                                                : r.status === 'procedente'
                                                    ? 'danger'
                                                    : 'success', children: r.status })] }), _jsxs("div", { className: "p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300", children: [_jsx("span", { className: "font-semibold text-zinc-400 block mb-1", children: "Relato da Den\u00FAncia:" }), r.description] }), r.status === 'pendente' ? (_jsxs("div", { className: "pt-2 border-t border-zinc-800/80 space-y-2", children: [_jsx(Textarea, { placeholder: "Observa\u00E7\u00F5es da decis\u00E3o da modera\u00E7\u00E3o...", value: decisionNotes[r.id] || '', onChange: (e) => setDecisionNotes({ ...decisionNotes, [r.id]: e.target.value }), rows: 2 }), _jsxs("div", { className: "flex flex-wrap items-center justify-end gap-2", children: [_jsx(Button, { variant: "secondary", size: "sm", isLoading: isProcessing === r.id, onClick: () => handleDecide(r.id, 'improcedente', false), children: "Julgar Improcedente" }), _jsx(Button, { variant: "danger", size: "sm", isLoading: isProcessing === r.id, onClick: () => handleDecide(r.id, 'procedente', true), children: "Procedente (Suspender Publica\u00E7\u00E3o)" })] })] })) : (_jsxs("div", { className: "text-[11px] text-zinc-500 pt-1", children: ["Julgada por @", r.decided_by_username || 'moderador', " \u2022 Parecer: ", r.decision_notes] }))] }, r.id))) }))] })) : (_jsx("div", { className: "p-6 text-center rounded-xl bg-zinc-900/30 border border-zinc-800 text-xs text-zinc-500", children: "A fila de aprecia\u00E7\u00E3o e julgamento de den\u00FAncias \u00E9 restrita a membros designados com o papel de Moderador ou Administrador do Conselho." }))] }));
}
