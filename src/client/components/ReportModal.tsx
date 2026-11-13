import React, { useState } from 'react';
import { Modal, Button, Textarea, Select } from './UI';
import { apiRequest } from '../lib/api';
import { ShieldAlert } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string | null;
  postTitle: string | null;
}

export function ReportModal({
  isOpen,
  onClose,
  postId,
  postTitle,
}: ReportModalProps) {
  const [category, setCategory] = useState('termos');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!postId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao enviar denúncia.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Denunciar Publicação ao Conselho"
      description={`Encaminhar "${postTitle || 'esta publicação'}" para análise do Conselho`}
      maxWidth="md"
    >
      {success ? (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-center text-xs text-emerald-200 py-6">
          <ShieldAlert className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          Denúncia recebida pelo Conselho com sucesso. Nossos moderadores analisarão o caso.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-red-950/70 border border-red-800 text-xs text-red-300">
              {errorMessage}
            </div>
          )}

          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-400">
            O Conselho é o órgão responsável pela integridade, moderação e resolução de divergências do Zero Control. Relate com precisão o motivo da inconformidade.
          </div>

          <Select
            label="Categoria da irregularidade"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: 'termos', label: 'Violação dos Termos da Guilda' },
              { value: 'fraude', label: 'Suspeita de Fraude ou Golpe' },
              { value: 'spam', label: 'Spam ou Publicação Duplicada' },
              { value: 'ofensivo', label: 'Conteúdo Ofensivo ou Inadequado' },
              { value: 'outro', label: 'Outro motivo' },
            ]}
          />

          <Textarea
            label="Relato circunstanciado (mínimo 10 caracteres)"
            placeholder="Explique detalhadamente o que motivou esta denúncia..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
            minLength={10}
            maxLength={2000}
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" variant="danger" isLoading={isLoading}>
              Enviar denúncia
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
