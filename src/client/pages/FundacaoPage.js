import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Input, Textarea, Select, Button, Badge } from '../components/UI';
import { Building, LifeBuoy, BookOpen, CheckCircle2, MessageSquare } from 'lucide-react';
export function FundacaoPage() {
    const { user } = useAuth();
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('duvida');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [myRequests, setMyRequests] = useState([]);
    const [isLoadingRequests, setIsLoadingRequests] = useState(false);
    useEffect(() => {
        if (user) {
            loadMyRequests();
        }
    }, [user]);
    const loadMyRequests = async () => {
        setIsLoadingRequests(true);
        try {
            const data = await apiRequest('/api/modules/fundacao/support/my');
            setMyRequests(data.requests);
        }
        catch {
            setMyRequests([]);
        }
        finally {
            setIsLoadingRequests(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            alert('Faça login para registrar uma solicitação de suporte.');
            return;
        }
        setIsSubmitting(true);
        setErrorMessage(null);
        try {
            await apiRequest('/api/modules/fundacao/support', {
                method: 'POST',
                body: JSON.stringify({ subject, category, message }),
            });
            setSuccess(true);
            setSubject('');
            setMessage('');
            await loadMyRequests();
            setTimeout(() => setSuccess(false), 3000);
        }
        catch (err) {
            setErrorMessage(err.message || 'Erro ao registrar chamado de suporte.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsxs("div", { className: "space-y-6 text-left", children: [_jsxs("div", { className: "pb-4 border-b border-zinc-800", children: [_jsxs("h1", { className: "text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2", children: [_jsx(Building, { className: "w-6 h-6 text-zinc-300" }), "Funda\u00E7\u00E3o \u2022 Sustenta\u00E7\u00E3o & Suporte"] }), _jsx("p", { className: "text-xs text-zinc-400 mt-1", children: "Infraestrutura da plataforma, documenta\u00E7\u00E3o t\u00E9cnica, condi\u00E7\u00F5es de uso, padr\u00F5es de acessibilidade e canal de atendimento." })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3", children: [_jsxs("h2", { className: "text-sm font-semibold text-white flex items-center gap-2", children: [_jsx(BookOpen, { className: "w-4 h-4 text-zinc-400" }), "Princ\u00EDpios de Arquitetura e Acessibilidade"] }), _jsx("p", { className: "text-xs text-zinc-300 leading-relaxed", children: "O Zero Control foi constru\u00EDdo seguindo diretrizes rigorosas de soberania de dados, autentica\u00E7\u00E3o com Argon2id, integridade relacional em PostgreSQL e navega\u00E7\u00E3o universal via teclado." }), _jsxs("div", { className: "space-y-2 pt-2 border-t border-zinc-800 text-xs text-zinc-400", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle2, { className: "w-3.5 h-3.5 text-emerald-400 shrink-0" }), _jsx("span", { children: "Nenhum dado desnecess\u00E1rio (sem exig\u00EAncia de e-mail, telefone ou CPF)." })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle2, { className: "w-3.5 h-3.5 text-emerald-400 shrink-0" }), _jsx("span", { children: "Formatos de imagem validados e reprocessados com Sharp (WebP sem metadados)." })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle2, { className: "w-3.5 h-3.5 text-emerald-400 shrink-0" }), _jsx("span", { children: "Interface testada para larguras de 360px, 768px e 1440px." })] })] })] }), user && (_jsxs("div", { className: "p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3", children: [_jsxs("h2", { className: "text-sm font-semibold text-white flex items-center gap-2", children: [_jsx(MessageSquare, { className: "w-4 h-4 text-zinc-400" }), "Meus Chamados de Suporte (", myRequests.length, ")"] }), myRequests.length === 0 ? (_jsx("p", { className: "text-xs text-zinc-500", children: "Voc\u00EA n\u00E3o possui chamados de suporte abertos." })) : (_jsx("div", { className: "space-y-2.5", children: myRequests.map((req) => (_jsxs("div", { className: "p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("span", { className: "font-semibold text-white", children: req.subject }), _jsx(Badge, { variant: req.status === 'aberto' ? 'warning' : 'success', children: req.status })] }), _jsx("p", { className: "text-zinc-400 line-clamp-2", children: req.message }), _jsxs("span", { className: "text-[10px] text-zinc-500 font-mono mt-1 block", children: ["Registrado em ", new Date(req.created_at).toLocaleDateString('pt-BR')] })] }, req.id))) }))] }))] }), _jsxs("div", { className: "p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4", children: [_jsxs("h2", { className: "text-sm font-semibold text-white flex items-center gap-2", children: [_jsx(LifeBuoy, { className: "w-4 h-4 text-zinc-400" }), "Abrir Chamado com a Funda\u00E7\u00E3o"] }), success && (_jsx("div", { className: "p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300", children: "Sua solicita\u00E7\u00E3o de suporte foi registrada e enviada \u00E0 equipe t\u00E9cnica." })), errorMessage && (_jsx("div", { className: "p-3 rounded-lg bg-red-950/80 border border-red-800 text-xs text-red-300", children: errorMessage })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-3", children: [_jsx(Input, { label: "Assunto (5 a 120 caracteres)", placeholder: "Ex: D\u00FAvida sobre sele\u00E7\u00E3o de candidato ou problema no upload", value: subject, onChange: (e) => setSubject(e.target.value), required: true, minLength: 5, maxLength: 120 }), _jsx(Select, { label: "Categoria", value: category, onChange: (e) => setCategory(e.target.value), options: [
                                            { value: 'duvida', label: 'Dúvida Operacional' },
                                            { value: 'bug', label: 'Relato de Falha ou Inconsistência' },
                                            { value: 'sugestao', label: 'Sugestão de Melhoria' },
                                            { value: 'acesso', label: 'Problema com Sessão / Acesso' },
                                            { value: 'outro', label: 'Outro assunto' },
                                        ] }), _jsx(Textarea, { label: "Mensagem detalhada (m\u00EDnimo 20 caracteres)", placeholder: "Explique o que aconteceu, passos realizados ou sua sugest\u00E3o...", value: message, onChange: (e) => setMessage(e.target.value), rows: 4, required: true, minLength: 20, maxLength: 3000 }), _jsx(Button, { type: "submit", variant: "primary", size: "md", isLoading: isSubmitting, className: "w-full", children: "Registrar chamado de suporte" })] })] })] })] }));
}
