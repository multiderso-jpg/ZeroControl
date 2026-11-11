import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Textarea, Modal, Badge } from '../components/UI';
import { Hammer, Send, Clock, Briefcase, FileCheck2 } from 'lucide-react';
export function ForjaPage() {
    const { user } = useAuth();
    const [offerings, setOfferings] = useState([]);
    const [myQuotes, setMyQuotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    // Modal de solicitação de orçamento
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedServiceTitle, setSelectedServiceTitle] = useState('');
    const [description, setDescription] = useState('');
    const [estimatedBudget, setEstimatedBudget] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    useEffect(() => {
        loadData();
    }, [user]);
    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await apiRequest('/api/modules/forja/offerings');
            setOfferings(data.offerings);
            if (user) {
                const quotesData = await apiRequest('/api/modules/forja/quotes/my');
                setMyQuotes(quotesData.quotes);
            }
        }
        catch {
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleOpenModal = (title) => {
        setSelectedServiceTitle(title || '');
        setDescription('');
        setEstimatedBudget('');
        setSuccessMessage(null);
        setIsModalOpen(true);
    };
    const handleSubmitQuote = async (e) => {
        e.preventDefault();
        if (!user) {
            alert('Faça login para solicitar um orçamento à Phantom Troupe.');
            return;
        }
        setIsSubmitting(true);
        try {
            await apiRequest('/api/modules/forja/quotes', {
                method: 'POST',
                body: JSON.stringify({
                    service_title: selectedServiceTitle,
                    description,
                    estimated_budget: estimatedBudget || null,
                }),
            });
            setSuccessMessage('Solicitação de orçamento registrada com sucesso!');
            await loadData();
            setTimeout(() => {
                setIsModalOpen(false);
                setSuccessMessage(null);
            }, 1500);
        }
        catch (err) {
            alert(err.message || 'Erro ao enviar solicitação.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsxs("div", { className: "space-y-6 text-left", children: [_jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2", children: [_jsx(Hammer, { className: "w-6 h-6 text-zinc-300" }), "Forja \u2022 Phantom Troupe"] }), _jsx("p", { className: "text-xs text-zinc-400 mt-1", children: "Servi\u00E7os institucionais de alto padr\u00E3o t\u00E9cnico, portf\u00F3lio oficial e solicita\u00E7\u00F5es diretas de or\u00E7amento." })] }), _jsx(Button, { variant: "primary", size: "sm", icon: _jsx(Send, { className: "w-4 h-4" }), onClick: () => handleOpenModal(), children: "Solicitar or\u00E7amento" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("h2", { className: "text-sm font-semibold tracking-wider uppercase text-zinc-300 flex items-center gap-2", children: [_jsx(Briefcase, { className: "w-4 h-4 text-zinc-400" }), "Servi\u00E7os Institucionais Dispon\u00EDveis"] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: offerings.map((item) => (_jsxs("div", { className: "p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between hover:border-zinc-700 transition-colors", children: [_jsxs("div", { children: [_jsx(Badge, { variant: "silver", className: "mb-2", children: "Phantom Troupe" }), _jsx("h3", { className: "font-semibold text-sm text-white mb-2", children: item.title }), _jsx("p", { className: "text-xs text-zinc-400 leading-relaxed mb-4", children: item.description }), item.portfolio_sample && (_jsxs("div", { className: "p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 text-[11px] text-zinc-400 mb-4", children: [_jsx("span", { className: "font-semibold text-zinc-300 block mb-0.5", children: "Portf\u00F3lio / Casos:" }), item.portfolio_sample] }))] }), _jsxs("div", { className: "pt-3 border-t border-zinc-800/80 flex items-center justify-between", children: [_jsxs("span", { className: "text-[11px] text-zinc-400 flex items-center gap-1", children: [_jsx(Clock, { className: "w-3.5 h-3.5 text-zinc-500" }), item.estimated_delivery] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => handleOpenModal(item.title), children: "Pedir or\u00E7amento" })] })] }, item.id))) })] }), user && (_jsxs("div", { className: "pt-6 border-t border-zinc-800 space-y-3", children: [_jsxs("h2", { className: "text-sm font-semibold tracking-wider uppercase text-zinc-300 flex items-center gap-2", children: [_jsx(FileCheck2, { className: "w-4 h-4 text-zinc-400" }), "Minhas Solicita\u00E7\u00F5es de Or\u00E7amento (", myQuotes.length, ")"] }), myQuotes.length === 0 ? (_jsx("div", { className: "p-6 text-center rounded-xl bg-zinc-900/30 border border-zinc-800 text-xs text-zinc-500", children: "Voc\u00EA ainda n\u00E3o enviou solicita\u00E7\u00F5es de or\u00E7amento para a Phantom Troupe." })) : (_jsx("div", { className: "space-y-3", children: myQuotes.map((q) => (_jsxs("div", { className: "p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs", children: [_jsxs("div", { children: [_jsx("span", { className: "font-semibold text-white text-sm block", children: q.service_title }), _jsx("p", { className: "text-zinc-400 mt-1 line-clamp-2", children: q.description }), q.estimated_budget && (_jsxs("span", { className: "text-[11px] text-zinc-500 mt-1 block", children: ["Previs\u00E3o informada: ", q.estimated_budget] }))] }), _jsx("div", { className: "flex items-center gap-2", children: _jsx(Badge, { variant: q.status === 'pendente' ? 'warning' : 'info', children: q.status }) })] }, q.id))) }))] })), _jsx(Modal, { isOpen: isModalOpen, onClose: () => setIsModalOpen(false), title: "Solicitar Or\u00E7amento Institucional", description: "Encaminhe os detalhes da sua demanda para an\u00E1lise da equipe t\u00E9cnica da Phantom Troupe.", maxWidth: "md", children: successMessage ? (_jsx("div", { className: "p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300 text-center py-6", children: successMessage })) : (_jsxs("form", { onSubmit: handleSubmitQuote, className: "space-y-3", children: [_jsx(Input, { label: "Servi\u00E7o ou Demanda", placeholder: "Ex: Engenharia de Software ou Arquitetura Web", value: selectedServiceTitle, onChange: (e) => setSelectedServiceTitle(e.target.value), required: true }), _jsx(Textarea, { label: "Descri\u00E7\u00E3o do escopo e requisitos (m\u00EDnimo 20 caracteres)", placeholder: "Descreva o objetivo do projeto, tecnologia requerida, prazos e expectativas...", value: description, onChange: (e) => setDescription(e.target.value), rows: 4, required: true, minLength: 20, maxLength: 3000 }), _jsx(Input, { label: "Expectativa ou Faixa de Or\u00E7amento (Opcional)", placeholder: "Ex: R$ 10.000 a R$ 25.000", value: estimatedBudget, onChange: (e) => setEstimatedBudget(e.target.value) }), _jsxs("div", { className: "pt-2 flex justify-end gap-2", children: [_jsx(Button, { type: "button", variant: "ghost", onClick: () => setIsModalOpen(false), children: "Cancelar" }), _jsx(Button, { type: "submit", variant: "primary", isLoading: isSubmitting, children: "Enviar solicita\u00E7\u00E3o" })] })] })) })] }));
}
