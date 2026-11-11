import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Modal, Input, Textarea, Select, Button } from './UI';
import { apiRequest } from '../api/client';
import { INTENTIONS, MODALITIES, OPPORTUNITY_TYPES, SERVICE_CATEGORIES, } from '../../shared/constants';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';
export function PostModal({ isOpen, onClose, onPostCreated, originModule = 'guilda', }) {
    const [intention, setIntention] = useState('Preciso de um serviço');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [opportunityType, setOpportunityType] = useState('freelancer');
    const [serviceCategory, setServiceCategory] = useState('tecnologia-e-programacao');
    const [modality, setModality] = useState('Remoto');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [compensationType, setCompensationType] = useState('valor_fixo');
    const [amountStr, setAmountStr] = useState('');
    const [amountMinStr, setAmountMinStr] = useState('');
    const [amountMaxStr, setAmountMaxStr] = useState('');
    const [amountUnit, setAmountUnit] = useState('');
    const [deadline, setDeadline] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [coverIndex, setCoverIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const handleFileChange = (e) => {
        if (!e.target.files)
            return;
        const files = Array.from(e.target.files);
        if (selectedFiles.length + files.length > 5) {
            setErrorMessage('O limite máximo é de 5 fotos por anúncio.');
            return;
        }
        const newFiles = [...selectedFiles, ...files];
        setSelectedFiles(newFiles);
        const newUrls = files.map((f) => URL.createObjectURL(f));
        setPreviewUrls((prev) => [...prev, ...newUrls]);
        setErrorMessage(null);
    };
    const removeFile = (index) => {
        const newFiles = [...selectedFiles];
        newFiles.splice(index, 1);
        setSelectedFiles(newFiles);
        const newUrls = [...previewUrls];
        URL.revokeObjectURL(newUrls[index]);
        newUrls.splice(index, 1);
        setPreviewUrls(newUrls);
        if (coverIndex === index)
            setCoverIndex(0);
        else if (coverIndex > index)
            setCoverIndex(coverIndex - 1);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage(null);
        try {
            // 1. Converte valores em centavos
            let amountCents = null;
            let amountMinCents = null;
            let amountMaxCents = null;
            if (compensationType === 'valor_fixo' && amountStr) {
                amountCents = Math.round(parseFloat(amountStr.replace(',', '.')) * 100);
            }
            else if (compensationType === 'faixa') {
                if (amountMinStr)
                    amountMinCents = Math.round(parseFloat(amountMinStr.replace(',', '.')) * 100);
                if (amountMaxStr)
                    amountMaxCents = Math.round(parseFloat(amountMaxStr.replace(',', '.')) * 100);
            }
            // 2. Cria post (texto)
            const postData = {
                intention,
                title,
                description,
                opportunity_type_slug: opportunityType,
                service_category_slug: serviceCategory,
                modality,
                city: modality !== 'Remoto' ? city : null,
                state: modality !== 'Remoto' ? state.toUpperCase() : null,
                compensation_type: compensationType,
                amount_cents: amountCents,
                amount_min_cents: amountMinCents,
                amount_max_cents: amountMaxCents,
                amount_unit: amountUnit || null,
                deadline: deadline ? new Date(deadline).toISOString() : null,
                origin_module: originModule,
            };
            const res = await apiRequest('/api/posts', {
                method: 'POST',
                body: JSON.stringify(postData),
            });
            let finalPost = res.post;
            // 3. Se houver fotos anexadas, envia para a rota de imagens
            if (selectedFiles.length > 0) {
                const formData = new FormData();
                selectedFiles.forEach((file) => formData.append('images', file));
                const imgRes = await apiRequest(`/api/posts/${finalPost.id}/images`, {
                    method: 'POST',
                    body: formData,
                });
                finalPost = imgRes.post;
            }
            onPostCreated(finalPost);
            onClose();
            // Limpa formulário
            setTitle('');
            setDescription('');
            setSelectedFiles([]);
            setPreviewUrls([]);
        }
        catch (err) {
            setErrorMessage(err.message || 'Erro ao publicar oportunidade. Seus dados foram preservados.');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx(Modal, { isOpen: isOpen, onClose: onClose, title: "Publicar Oportunidade ou Servi\u00E7o", description: "Divulgue suas demandas, servi\u00E7os aut\u00F4nomos ou oportunidades para os membros da Guilda.", maxWidth: "2xl", children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 text-left", children: [errorMessage && (_jsx("div", { className: "p-3 rounded-lg bg-red-950/70 border border-red-800 text-xs text-red-300", children: errorMessage })), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-medium text-zinc-300 mb-1.5 block", children: "Qual \u00E9 o objetivo desta publica\u00E7\u00E3o?" }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-2", children: INTENTIONS.map((item) => (_jsx("button", { type: "button", onClick: () => setIntention(item), className: `px-3 py-2 rounded-lg text-xs font-medium border text-center transition-colors cursor-pointer ${intention === item
                                    ? 'bg-zinc-100 text-zinc-950 border-white font-semibold'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'}`, children: item }, item))) })] }), _jsx(Input, { label: "T\u00EDtulo do trabalho ou servi\u00E7o (5 a 120 caracteres)", placeholder: "Ex: Reforma de circuito el\u00E9trico trif\u00E1sico ou Cria\u00E7\u00E3o de API REST", value: title, onChange: (e) => setTitle(e.target.value), required: true, maxLength: 120 }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsx(Select, { label: "Tipo de Oportunidade (24 op\u00E7\u00F5es)", value: opportunityType, onChange: (e) => setOpportunityType(e.target.value), options: OPPORTUNITY_TYPES.map((t) => ({
                                value: t.slug,
                                label: `${t.name} — ${t.description}`,
                            })) }), _jsx(Select, { label: "\u00C1rea Profissional (24 op\u00E7\u00F5es)", value: serviceCategory, onChange: (e) => setServiceCategory(e.target.value), options: SERVICE_CATEGORIES.map((c) => ({
                                value: c.slug,
                                label: c.name,
                            })) })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [_jsx(Select, { label: "Modalidade", value: modality, onChange: (e) => setModality(e.target.value), options: MODALITIES.map((m) => ({ value: m, label: m })) }), modality !== 'Remoto' ? (_jsxs(_Fragment, { children: [_jsx(Input, { label: "Cidade *", placeholder: "Ex: S\u00E3o Paulo", value: city, onChange: (e) => setCity(e.target.value), required: true }), _jsx(Input, { label: "UF *", placeholder: "Ex: SP", value: state, onChange: (e) => setState(e.target.value.toUpperCase()), maxLength: 2, required: true })] })) : (_jsx("div", { className: "sm:col-span-2 flex items-center px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg text-xs text-zinc-400", children: "Oportunidade remota dispensa endere\u00E7o f\u00EDsico." }))] }), _jsx(Textarea, { label: "Descri\u00E7\u00E3o detalhada e requisitos (m\u00EDnimo 30 caracteres)", placeholder: "Descreva minuciosamente o escopo, entreg\u00E1veis esperados, prazos, habilidades e quaisquer observa\u00E7\u00F5es necess\u00E1rias...", value: description, onChange: (e) => setDescription(e.target.value), rows: 4, required: true, maxLength: 5000 }), _jsxs("div", { className: "p-3 bg-zinc-900/70 border border-zinc-800 rounded-xl space-y-3", children: [_jsx("label", { className: "text-xs font-semibold text-zinc-200 block", children: "Condi\u00E7\u00E3o de Remunera\u00E7\u00E3o" }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2", children: [
                                { id: 'valor_fixo', label: 'Valor fixo' },
                                { id: 'faixa', label: 'Faixa de valor' },
                                { id: 'a_combinar', label: 'A combinar' },
                                { id: 'voluntario', label: 'Voluntário' },
                            ].map((c) => (_jsx("button", { type: "button", onClick: () => setCompensationType(c.id), className: `px-2.5 py-1.5 rounded-lg text-xs font-medium border text-center transition-colors cursor-pointer ${compensationType === c.id
                                    ? 'bg-zinc-200 text-zinc-950 font-semibold border-white'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'}`, children: c.label }, c.id))) }), compensationType === 'valor_fixo' && (_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2", children: [_jsx(Input, { label: "Valor em R$ (Ex: 1500,00)", placeholder: "0,00", value: amountStr, onChange: (e) => setAmountStr(e.target.value) }), _jsx(Input, { label: "Unidade (Opcional: p/ hora, di\u00E1ria, projeto)", placeholder: "Ex: projeto total ou por hora", value: amountUnit, onChange: (e) => setAmountUnit(e.target.value) })] })), compensationType === 'faixa' && (_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2", children: [_jsx(Input, { label: "Valor m\u00EDnimo R$", placeholder: "Ex: 1000,00", value: amountMinStr, onChange: (e) => setAmountMinStr(e.target.value) }), _jsx(Input, { label: "Valor m\u00E1ximo R$", placeholder: "Ex: 2500,00", value: amountMaxStr, onChange: (e) => setAmountMaxStr(e.target.value) }), _jsx(Input, { label: "Unidade (Opcional)", placeholder: "Ex: m\u00EAs", value: amountUnit, onChange: (e) => setAmountUnit(e.target.value) })] }))] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: _jsx(Input, { label: "Prazo de Conclus\u00E3o (Opcional)", type: "datetime-local", value: deadline, onChange: (e) => setDeadline(e.target.value) }) }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("label", { className: "text-xs font-medium text-zinc-300 flex items-center gap-1.5", children: [_jsx(ImageIcon, { className: "w-4 h-4 text-zinc-400" }), "Fotos do servi\u00E7o ou refer\u00EAncia (Opcional, at\u00E9 5 fotos)"] }), _jsxs("span", { className: "text-[11px] text-zinc-500", children: [selectedFiles.length, "/5 fotos"] })] }), previewUrls.length > 0 && (_jsx("div", { className: "grid grid-cols-3 sm:grid-cols-5 gap-2 pt-1", children: previewUrls.map((url, idx) => (_jsxs("div", { className: "relative group rounded-lg overflow-hidden border border-zinc-700 bg-zinc-950 h-20", children: [_jsx("img", { src: url, alt: `Prévia ${idx + 1}`, className: "w-full h-full object-cover" }), _jsx("button", { type: "button", onClick: () => removeFile(idx), className: "absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-zinc-300 hover:text-white", children: _jsx(X, { className: "w-3.5 h-3.5" }) }), coverIndex === idx ? (_jsx("span", { className: "absolute bottom-1 left-1 px-1 py-0.5 text-[9px] bg-emerald-900/90 text-emerald-200 rounded font-semibold", children: "Capa" })) : (_jsx("button", { type: "button", onClick: () => setCoverIndex(idx), className: "absolute bottom-1 left-1 px-1 py-0.5 text-[9px] bg-black/80 text-zinc-400 hover:text-white rounded", children: "Tornar capa" }))] }, idx))) })), selectedFiles.length < 5 && (_jsxs("label", { className: "flex flex-col items-center justify-center border border-dashed border-zinc-800 hover:border-zinc-700 rounded-xl p-4 bg-zinc-900/40 cursor-pointer transition-colors", children: [_jsx(UploadCloud, { className: "w-6 h-6 text-zinc-400 mb-1" }), _jsx("span", { className: "text-xs text-zinc-300", children: "Clique para selecionar fotos (JPEG, PNG ou WebP at\u00E9 8MB)" }), _jsx("input", { type: "file", multiple: true, accept: "image/jpeg,image/png,image/webp", onChange: handleFileChange, className: "hidden" })] }))] }), _jsxs("div", { className: "pt-3 border-t border-zinc-800 flex items-center justify-end gap-2", children: [_jsx(Button, { type: "button", variant: "ghost", onClick: onClose, disabled: isLoading, children: "Cancelar" }), _jsx(Button, { type: "submit", variant: "primary", isLoading: isLoading, children: "Publicar oportunidade" })] })] }) }));
}
