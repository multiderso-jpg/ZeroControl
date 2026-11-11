import React, { useState } from 'react';
import { Modal, Input, Textarea, Select, Button, Badge } from './UI';
import { apiRequest } from '../api/client';
import { Post } from '../../shared/types';
import {
  INTENTIONS,
  MODALITIES,
  OPPORTUNITY_TYPES,
  SERVICE_CATEGORIES,
} from '../../shared/constants';
import { UploadCloud, X, Check, Image as ImageIcon } from 'lucide-react';

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
  const [intention, setIntention] = useState<string>('Preciso de um serviço');
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
      title="Publicar Oportunidade ou Serviço"
      description="Divulgue suas demandas, serviços autônomos ou oportunidades para os membros da Guilda."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-950/70 border border-red-800 text-xs text-red-300">
            {errorMessage}
          </div>
        )}

        {/* Intenção */}
        <div>
          <label className="text-xs font-medium text-zinc-300 mb-1.5 block">
            Qual é o objetivo desta publicação?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {INTENTIONS.map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => setIntention(item)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border text-center transition-colors cursor-pointer ${
                  intention === item
                    ? 'bg-zinc-100 text-zinc-950 border-white font-semibold'
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
        />

        {/* Classificação: Tipo de Oportunidade (os 24 tipos) e Área Profissional (as 24 áreas) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Tipo de Oportunidade (24 opções)"
            value={opportunityType}
            onChange={(e) => setOpportunityType(e.target.value)}
            options={OPPORTUNITY_TYPES.map((t) => ({
              value: t.slug,
              label: `${t.name} — ${t.description}`,
            }))}
          />

          <Select
            label="Área Profissional (24 opções)"
            value={serviceCategory}
            onChange={(e) => setServiceCategory(e.target.value)}
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
              />
              <Input
                label="UF *"
                placeholder="Ex: SP"
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase())}
                maxLength={2}
                required
              />
            </>
          ) : (
            <div className="sm:col-span-2 flex items-center px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg text-xs text-zinc-400">
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
        />

        {/* Remuneração */}
        <div className="p-3 bg-zinc-900/70 border border-zinc-800 rounded-xl space-y-3">
          <label className="text-xs font-semibold text-zinc-200 block">
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
              />
              <Input
                label="Unidade (Opcional: p/ hora, diária, projeto)"
                placeholder="Ex: projeto total ou por hora"
                value={amountUnit}
                onChange={(e) => setAmountUnit(e.target.value)}
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
              />
              <Input
                label="Valor máximo R$"
                placeholder="Ex: 2500,00"
                value={amountMaxStr}
                onChange={(e) => setAmountMaxStr(e.target.value)}
              />
              <Input
                label="Unidade (Opcional)"
                placeholder="Ex: mês"
                value={amountUnit}
                onChange={(e) => setAmountUnit(e.target.value)}
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
          />
        </div>

        {/* Upload de Fotos Opcionais (1 a 5) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-zinc-400" />
              Fotos do serviço ou referência (Opcional, até 5 fotos)
            </label>
            <span className="text-[11px] text-zinc-500">{selectedFiles.length}/5 fotos</span>
          </div>

          {previewUrls.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-1">
              {previewUrls.map((url, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-lg overflow-hidden border border-zinc-700 bg-zinc-950 h-20"
                >
                  <img src={url} alt={`Prévia ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-zinc-300 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  {coverIndex === idx ? (
                    <span className="absolute bottom-1 left-1 px-1 py-0.5 text-[9px] bg-emerald-900/90 text-emerald-200 rounded font-semibold">
                      Capa
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCoverIndex(idx)}
                      className="absolute bottom-1 left-1 px-1 py-0.5 text-[9px] bg-black/80 text-zinc-400 hover:text-white rounded"
                    >
                      Tornar capa
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {selectedFiles.length < 5 && (
            <label className="flex flex-col items-center justify-center border border-dashed border-zinc-800 hover:border-zinc-700 rounded-xl p-4 bg-zinc-900/40 cursor-pointer transition-colors">
              <UploadCloud className="w-6 h-6 text-zinc-400 mb-1" />
              <span className="text-xs text-zinc-300">
                Clique para selecionar fotos (JPEG, PNG ou WebP até 8MB)
              </span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Publicar oportunidade
          </Button>
        </div>
      </form>
    </Modal>
  );
}
