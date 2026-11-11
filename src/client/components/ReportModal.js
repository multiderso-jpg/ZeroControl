import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Modal, Button, Textarea, Select } from './UI';
import { apiRequest } from '../api/client';
import { ShieldAlert } from 'lucide-react';
export function ReportModal({ isOpen, onClose, postId, postTitle, }) {
    const [category, setCategory] = useState('termos');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [success, setSuccess] = useState(false);
    if (!postId)
        return null;
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage(null);
        try {
            await apiRequest('/api/council/reports', {
                method: 'POST',
                body: JSON.stringify({
                    post_id: postId,
                    category,
                    description,
                }),
            });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setDescription('');
                onClose();
            }, 1500);
        }
        catch (err) {
            setErrorMessage(err.message || 'Erro ao enviar denúncia.');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx(Modal, { isOpen: isOpen, onClose: onClose, title: "Denunciar Publica\u00E7\u00E3o ao Conselho", description: `Encaminhar "${postTitle || 'esta publicação'}" para análise do Conselho`, maxWidth: "md", children: success ? (_jsxs("div", { className: "p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-center text-xs text-emerald-200 py-6", children: [_jsx(ShieldAlert, { className: "w-8 h-8 text-emerald-400 mx-auto mb-2" }), "Den\u00FAncia recebida pelo Conselho com sucesso. Nossos moderadores analisar\u00E3o o caso."] })) : (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 text-left", children: [errorMessage && (_jsx("div", { className: "p-2.5 rounded-lg bg-red-950/70 border border-red-800 text-xs text-red-300", children: errorMessage })), _jsx("div", { className: "p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-400", children: "O Conselho \u00E9 o \u00F3rg\u00E3o respons\u00E1vel pela integridade, modera\u00E7\u00E3o e resolu\u00E7\u00E3o de diverg\u00EAncias do Zero Control. Relate com precis\u00E3o o motivo da inconformidade." }), _jsx(Select, { label: "Categoria da irregularidade", value: category, onChange: (e) => setCategory(e.target.value), options: [
                        { value: 'termos', label: 'Violação dos Termos da Guilda' },
                        { value: 'fraude', label: 'Suspeita de Fraude ou Golpe' },
                        { value: 'spam', label: 'Spam ou Publicação Duplicada' },
                        { value: 'ofensivo', label: 'Conteúdo Ofensivo ou Inadequado' },
                        { value: 'outro', label: 'Outro motivo' },
                    ] }), _jsx(Textarea, { label: "Relato circunstanciado (m\u00EDnimo 10 caracteres)", placeholder: "Explique detalhadamente o que motivou esta den\u00FAncia...", value: description, onChange: (e) => setDescription(e.target.value), rows: 4, required: true, minLength: 10, maxLength: 2000 }), _jsxs("div", { className: "pt-2 flex justify-end gap-2", children: [_jsx(Button, { type: "button", variant: "ghost", onClick: onClose, disabled: isLoading, children: "Cancelar" }), _jsx(Button, { type: "submit", variant: "danger", isLoading: isLoading, children: "Enviar den\u00FAncia" })] })] })) }));
}
