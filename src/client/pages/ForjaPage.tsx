import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Textarea, Modal, Badge } from '../components/UI';
import { Hammer, Sparkles, Send, Clock, Briefcase, FileCheck2 } from 'lucide-react';

interface ServiceOffering {
  id: string;
  title: string;
  description: string;
  estimated_delivery: string;
  portfolio_sample: string | null;
}

interface QuoteRequest {
  id: string;
  service_title: string;
  description: string;
  estimated_budget: string | null;
  status: string;
  created_at: string;
}

export function ForjaPage() {
  const { user } = useAuth();
  const [offerings, setOfferings] = useState<ServiceOffering[]>([]);
  const [myQuotes, setMyQuotes] = useState<QuoteRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal de solicitação de orçamento
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServiceTitle, setSelectedServiceTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{ offerings: ServiceOffering[] }>('/api/modules/forja/offerings');
      setOfferings(data.offerings);

      if (user) {
        const quotesData = await apiRequest<{ quotes: QuoteRequest[] }>('/api/modules/forja/quotes/my');
        setMyQuotes(quotesData.quotes);
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (title?: string) => {
    setSelectedServiceTitle(title || '');
    setDescription('');
    setEstimatedBudget('');
    setSuccessMessage(null);
    setIsModalOpen(true);
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      alert(err.message || 'Erro ao enviar solicitação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Hammer className="w-6 h-6 text-zinc-300" />
            Forja • Phantom Troupe
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Serviços institucionais de alto padrão técnico, portfólio oficial e solicitações diretas de orçamento.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Send className="w-4 h-4" />}
          onClick={() => handleOpenModal()}
        >
          Solicitar orçamento
        </Button>
      </div>

      {/* Catálogo de Serviços */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold tracking-wider uppercase text-zinc-300 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-zinc-400" />
          Serviços Institucionais Disponíveis
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {offerings.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between hover:border-zinc-700 transition-colors"
            >
              <div>
                <Badge variant="silver" className="mb-2">Phantom Troupe</Badge>
                <h3 className="font-semibold text-sm text-white mb-2">{item.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">{item.description}</p>
                {item.portfolio_sample && (
                  <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 text-[11px] text-zinc-400 mb-4">
                    <span className="font-semibold text-zinc-300 block mb-0.5">Portfólio / Casos:</span>
                    {item.portfolio_sample}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  {item.estimated_delivery}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenModal(item.title)}
                >
                  Pedir orçamento
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Minhas Solicitações de Orçamento */}
      {user && (
        <div className="pt-6 border-t border-zinc-800 space-y-3">
          <h2 className="text-sm font-semibold tracking-wider uppercase text-zinc-300 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-zinc-400" />
            Minhas Solicitações de Orçamento ({myQuotes.length})
          </h2>

          {myQuotes.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-zinc-900/30 border border-zinc-800 text-xs text-zinc-500">
              Você ainda não enviou solicitações de orçamento para a Phantom Troupe.
            </div>
          ) : (
            <div className="space-y-3">
              {myQuotes.map((q) => (
                <div
                  key={q.id}
                  className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-semibold text-white text-sm block">{q.service_title}</span>
                    <p className="text-zinc-400 mt-1 line-clamp-2">{q.description}</p>
                    {q.estimated_budget && (
                      <span className="text-[11px] text-zinc-500 mt-1 block">
                        Previsão informada: {q.estimated_budget}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={q.status === 'pendente' ? 'warning' : 'info'}>
                      {q.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de Orçamento */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Solicitar Orçamento Institucional"
        description="Encaminhe os detalhes da sua demanda para análise da equipe técnica da Phantom Troupe."
        maxWidth="md"
      >
        {successMessage ? (
          <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300 text-center py-6">
            {successMessage}
          </div>
        ) : (
          <form onSubmit={handleSubmitQuote} className="space-y-3">
            <Input
              label="Serviço ou Demanda"
              placeholder="Ex: Engenharia de Software ou Arquitetura Web"
              value={selectedServiceTitle}
              onChange={(e) => setSelectedServiceTitle(e.target.value)}
              required
            />

            <Textarea
              label="Descrição do escopo e requisitos (mínimo 20 caracteres)"
              placeholder="Descreva o objetivo do projeto, tecnologia requerida, prazos e expectativas..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
              minLength={20}
              maxLength={3000}
            />

            <Input
              label="Expectativa ou Faixa de Orçamento (Opcional)"
              placeholder="Ex: R$ 10.000 a R$ 25.000"
              value={estimatedBudget}
              onChange={(e) => setEstimatedBudget(e.target.value)}
            />

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Enviar solicitação
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
