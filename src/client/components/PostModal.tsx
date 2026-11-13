import React, { useState } from 'react';
import { Modal, Input, Textarea, Select, Button, Badge } from './UI';
import { apiRequest } from '../lib/api';
import { Post } from '../../shared/types';
import {
  INTENTIONS,
  MODALITIES,
  OPPORTUNITY_TYPES,
  SERVICE_CATEGORIES,
} from '../../shared/constants';
import { UploadCloud, X, Check, Image as ImageIcon, Link as LinkIcon, ExternalLink, Globe } from 'lucide-react';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (newPost: Post) => void;
  originModule?: string;
}

export function PostModal({
  isOpen,
  onClose,
  onPostCreated,
  originModule = 'guilda',
}: PostModalProps) {
  const [intention, setIntention] = useState<string>('Ofereço um serviço');
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

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);

  // Link e Prévia de Link
  const [link, setLink] = useState('');

  const isImageLink = (url: string) => {
    return /\.(jpeg|jpg|png|webp|gif|svg)($|\?)/i.test(url.trim());
  };

  const getDomain = (url: string) => {
    try {
      const u = new URL(url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`);
      return u.hostname.replace('www.', '');
    } catch {
      return url.trim();
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
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

  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);

    const newUrls = [...previewUrls];
    URL.revokeObjectURL(newUrls[index]);
    newUrls.splice(index, 1);
    setPreviewUrls(newUrls);

    if (coverIndex === index) setCoverIndex(0);
    else if (coverIndex > index) setCoverIndex(coverIndex - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Converte valores em centavos
      let amountCents: number | null = null;
      let amountMinCents: number | null = null;
      let amountMaxCents: number | null = null;

      if (compensationType === 'valor_fixo' && amountStr) {
        amountCents = Math.round(parseFloat(amountStr.replace(',', '.')) * 100);
      } else if (compensationType === 'faixa') {
        if (amountMinStr) amountMinCents = Math.round(parseFloat(amountMinStr.replace(',', '.')) * 100);
        if (amountMaxStr) amountMaxCents = Math.round(parseFloat(amountMaxStr.replace(',', '.')) * 100);
      }

      const formattedLink = link.trim()
        ? link.trim().startsWith('http://') || link.trim().startsWith('https://')
          ? link.trim()
          : `https://${link.trim()}`
        : null;

      const finalDescription = formattedLink
        ? `${description.trim()}\n\n🔗 Link / Referência: ${formattedLink}`
        : description.trim();

      // 2. Cria post (texto)
      const postData = {
        intention,
        title: title.trim(),
        description: finalDescription,
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

      const res = await apiRequest<{ post: Post }>('/api/posts', {
        method: 'POST',
        body: JSON.stringify(postData),
      });

      let finalPost = res.post;

      // 3. Se houver fotos anexadas, envia para a rota de imagens
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((file) => formData.append('images', file));

        const imgRes = await apiRequest<{ post: Post }>(`/api/posts/${finalPost.id}/images`, {
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
      setLink('');
      setSelectedFiles([]);
      setPreviewUrls([]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao publicar oportunidade. Seus dados foram preservados.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Publicar Job / Trabalho"
      description="Divulgue suas demandas, serviços autônomos ou contratações no mural de Job´s."
      maxWidth="2xl"
      centerTitle={true}
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-left">
        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-950/70 border border-red-800 text-xs text-red-300 text-center">
            {errorMessage}
          </div>
        )}

        {/* --- ÁREA DE PRÉVIA SUPERIOR: Imagem selecionada ou Link adicionado --- */}
        <div className="p-4 bg-zinc-950/90 border border-zinc-800 rounded-2xl space-y-3 shadow-inner">
          <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 block text-center font-bold">
            Mídia e Prévia de Destaque
          </label>

          {/* Prévia da Imagem / Fotos Selecionadas */}
          {previewUrls.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <ImageIcon className="w-4 h-4 text-zinc-300" />
                  Fotos anexadas ({selectedFiles.length}/5)
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">Foto de capa</span>
              </div>

              {/* Capa Ampliada no Topo */}
              <div className="h-52 sm:h-64 w-full rounded-xl overflow-hidden bg-black flex items-center justify-center border border-zinc-700/80 relative shadow-lg">
                <img
                  src={previewUrls[coverIndex] || previewUrls[0]}
                  alt="Capa do Job"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-black/85 text-white font-mono text-[10px] font-bold border border-zinc-700">
                  Capa do Job
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(coverIndex)}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/85 text-zinc-300 hover:text-red-400 transition-colors cursor-pointer"
                  title="Remover foto de capa"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Faixa de Miniaturas */}
              {previewUrls.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1">
                  {previewUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className={`relative rounded-lg overflow-hidden border shrink-0 w-16 h-14 bg-black transition-all cursor-pointer ${
                        coverIndex === idx
                          ? 'border-white scale-105 shadow-md'
                          : 'border-zinc-800 opacity-60 hover:opacity-100'
                      }`}
                      onClick={() => setCoverIndex(idx)}
                    >
                      <img src={url} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(idx);
                        }}
                        className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/80 text-zinc-300 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {coverIndex === idx && (
                        <span className="absolute bottom-0.5 left-0.5 px-1 text-[8px] bg-emerald-900/90 text-emerald-200 rounded font-bold">
                          Capa
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Prévia do Link Adicionado */}
          {link.trim().length > 0 && (
            <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-zinc-300" />
                  Prévia do Link
                </span>
                <button
                  type="button"
                  onClick={() => setLink('')}
                  className="text-zinc-500 hover:text-red-400 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Limpar link
                </button>
              </div>

              {isImageLink(link.trim()) ? (
                <div className="h-44 sm:h-52 w-full rounded-lg overflow-hidden bg-black flex items-center justify-center border border-zinc-800">
                  <img
                    src={link.trim().startsWith('http') ? link.trim() : `https://${link.trim()}`}
                    alt="Prévia do link de imagem"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-300">
                      <LinkIcon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col overflow-hidden text-left">
                      <span className="text-xs font-semibold text-white truncate">
                        {getDomain(link.trim())}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-mono truncate">
                        {link.trim()}
                      </span>
                    </div>
                  </div>
                  <a
                    href={link.trim().startsWith('http') ? link.trim() : `https://${link.trim()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-zinc-200 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 shrink-0 ml-2 border border-zinc-700 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Abrir link
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Controles para Adicionar Link e Fotos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <Input
              label="Adicionar Link ou Portfólio (Opcional)"
              placeholder="https://exemplo.com ou https://imagem.com/foto.jpg"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              centerLabel={true}
              rightElement={<LinkIcon className="w-4 h-4 text-zinc-400" />}
            />

            <div className="flex flex-col gap-1 w-full text-left">
              <label className="text-xs font-medium text-zinc-300 text-center block w-full">
                Anexar Fotos ({selectedFiles.length}/5)
              </label>
              {selectedFiles.length < 5 ? (
                <label className="flex items-center justify-center gap-2 border border-dashed border-zinc-700 hover:border-zinc-500 rounded-lg px-3 py-2 bg-zinc-900 hover:bg-zinc-800/80 cursor-pointer transition-colors text-xs text-zinc-300">
                  <UploadCloud className="w-4 h-4 text-zinc-400" />
                  <span>Escolher imagens locais</span>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-500 text-center">
                  Limite de 5 fotos atingido.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Objetivo / Intenção */}
        <div>
          <label className="text-xs font-semibold text-zinc-200 mb-1.5 block text-center">
            Qual é o objetivo desta publicação?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {INTENTIONS.map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => setIntention(item)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border text-center transition-colors cursor-pointer ${
                  intention === item
                    ? 'bg-zinc-100 text-zinc-950 border-white font-semibold shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Título */}
        <Input
          label="Título do trabalho ou serviço (5 a 120 caracteres)"
          placeholder="Ex: Reforma de circuito elétrico trifásico ou Criação de API REST"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={120}
          centerLabel={true}
        />

        {/* Classificação: Tipo de Oportunidade e Área Profissional */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Tipo de Oportunidade (24 opções)"
            value={opportunityType}
            onChange={(e) => setOpportunityType(e.target.value)}
            centerLabel={true}
            options={OPPORTUNITY_TYPES.map((t) => ({
              value: t.slug,
              label: `${t.name} — ${t.description}`,
            }))}
          />

          <Select
            label="Área Profissional (24 opções)"
            value={serviceCategory}
            onChange={(e) => setServiceCategory(e.target.value)}
            centerLabel={true}
            options={SERVICE_CATEGORIES.map((c) => ({
              value: c.slug,
              label: c.name,
            }))}
          />
        </div>

        {/* Modalidade e Localização */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Modalidade"
            value={modality}
            onChange={(e) => setModality(e.target.value)}
            centerLabel={true}
            options={MODALITIES.map((m) => ({ value: m, label: m }))}
          />

          {modality !== 'Remoto' ? (
            <>
              <Input
                label="Cidade *"
                placeholder="Ex: São Paulo"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                centerLabel={true}
              />
              <Input
                label="UF *"
                placeholder="Ex: SP"
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase())}
                maxLength={2}
                required
                centerLabel={true}
              />
            </>
          ) : (
            <div className="sm:col-span-2 flex items-center justify-center px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg text-xs text-zinc-400 text-center">
              Oportunidade remota dispensa endereço físico.
            </div>
          )}
        </div>

        {/* Descrição */}
        <Textarea
          label="Descrição detalhada e requisitos (mínimo 30 caracteres)"
          placeholder="Descreva minuciosamente o escopo, entregáveis esperados, prazos, habilidades e quaisquer observações necessárias..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
          maxLength={5000}
          centerLabel={true}
        />

        {/* Remuneração */}
        <div className="p-3 bg-zinc-900/70 border border-zinc-800 rounded-xl space-y-3">
          <label className="text-xs font-semibold text-zinc-200 block text-center">
            Condição de Remuneração
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'valor_fixo', label: 'Valor fixo' },
              { id: 'faixa', label: 'Faixa de valor' },
              { id: 'a_combinar', label: 'A combinar' },
              { id: 'voluntario', label: 'Voluntário' },
            ].map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => setCompensationType(c.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border text-center transition-colors cursor-pointer ${
                  compensationType === c.id
                    ? 'bg-zinc-200 text-zinc-950 font-semibold border-white'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {compensationType === 'valor_fixo' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Input
                label="Valor em R$ (Ex: 1500,00)"
                placeholder="0,00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                centerLabel={true}
              />
              <Input
                label="Unidade (Opcional: p/ hora, diária, projeto)"
                placeholder="Ex: projeto total ou por hora"
                value={amountUnit}
                onChange={(e) => setAmountUnit(e.target.value)}
                centerLabel={true}
              />
            </div>
          )}

          {compensationType === 'faixa' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <Input
                label="Valor mínimo R$"
                placeholder="Ex: 1000,00"
                value={amountMinStr}
                onChange={(e) => setAmountMinStr(e.target.value)}
                centerLabel={true}
              />
              <Input
                label="Valor máximo R$"
                placeholder="Ex: 2500,00"
                value={amountMaxStr}
                onChange={(e) => setAmountMaxStr(e.target.value)}
                centerLabel={true}
              />
              <Input
                label="Unidade (Opcional)"
                placeholder="Ex: mês"
                value={amountUnit}
                onChange={(e) => setAmountUnit(e.target.value)}
                centerLabel={true}
              />
            </div>
          )}
        </div>

        {/* Prazo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Prazo de Conclusão (Opcional)"
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            centerLabel={true}
          />
        </div>

        <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Publicar Job
          </Button>
        </div>
      </form>
    </Modal>
  );
}
