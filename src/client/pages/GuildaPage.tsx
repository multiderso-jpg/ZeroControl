import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Post, Application } from '../../shared/types';
import {
  OPPORTUNITY_TYPES,
  SERVICE_CATEGORIES,
  INTENTIONS,
  MODALITIES,
} from '../../shared/constants';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { PostCard } from '../components/PostCard';
import { PostDetailModal } from '../components/PostDetailModal';
import { PostModal } from '../components/PostModal';
import { Input, Select, Button, Badge } from '../components/UI';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  PlusCircle,
  Clock,
  Briefcase,
  Send,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  FilterX,
  Layers,
} from 'lucide-react';

export function GuildaPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Estados dos filtros
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedIntention, setSelectedIntention] = useState(searchParams.get('intencao') || 'todas');
  const [selectedType, setSelectedType] = useState(searchParams.get('tipo') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoria') || '');
  const [selectedModality, setSelectedModality] = useState(searchParams.get('modalidade') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('cidade') || '');
  const [selectedSort, setSelectedSort] = useState<'recent' | 'deadline'>(
    (searchParams.get('ordem') as any) || 'recent'
  );

  // Estados de dados exclusivamente reais
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('pagina') || '1', 10));
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Painel lateral de candidaturas reais
  const [myApplications, setMyApplications] = useState<Application[]>([]);

  // Modais
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.set('search', searchTerm);
      if (selectedIntention !== 'todas') queryParams.set('intention', selectedIntention);
      if (selectedType) queryParams.set('opportunity_type_slug', selectedType);
      if (selectedCategory) queryParams.set('service_category_slug', selectedCategory);
      if (selectedModality) queryParams.set('modality', selectedModality);
      if (selectedCity) queryParams.set('city', selectedCity);
      queryParams.set('sort', selectedSort);
      queryParams.set('page', currentPage.toString());
      queryParams.set('limit', '10');

      const data = await apiRequest<{
        posts: Post[];
        total: number;
        page: number;
        totalPages: number;
      }>(`/api/posts?${queryParams.toString()}`);

      setPosts(data.posts);
      setTotalPosts(data.total);
      setTotalPages(data.totalPages || 1);
    } catch {
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMySidebarData = async () => {
    if (!user) return;
    try {
      const data = await apiRequest<{ applications: Application[] }>('/api/applications/my');
      setMyApplications(data.applications.slice(0, 5));
    } catch {
      setMyApplications([]);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [
    searchTerm,
    selectedIntention,
    selectedType,
    selectedCategory,
    selectedModality,
    selectedCity,
    selectedSort,
    currentPage,
  ]);

  useEffect(() => {
    fetchMySidebarData();
  }, [user]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedIntention('todas');
    setSelectedType('');
    setSelectedCategory('');
    setSelectedModality('');
    setSelectedCity('');
    setSelectedSort('recent');
    setCurrentPage(1);
    setSearchParams({});
  };

  const handleToggleSave = async (post: Post, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      alert('Faça login para salvar oportunidades.');
      return;
    }

    try {
      const res = await apiRequest<{ saved: boolean }>(`/api/posts/${post.id}/save`, {
        method: 'POST',
      });
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, is_saved: res.saved } : p))
      );
    } catch {}
  };

  return (
    <div className="space-y-6 text-left">
      {/* Cabeçalho de Job´s */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Briefcase className="w-7 h-7 text-zinc-300" />
            Mural de Job´s
            <Badge variant="silver" className="text-xs px-2.5 py-1">{totalPosts} ativos</Badge>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Espaço central para publicação, contratação e acompanhamento de Job´s e serviços da comunidade.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            className="md:hidden"
            icon={<SlidersHorizontal className="w-4 h-4" />}
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            Filtros
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={<PlusCircle className="w-5 h-5" />}
            onClick={() => setIsPublishOpen(true)}
          >
            Publicar Job
          </Button>
        </div>
      </div>

      {/* Conteúdo Principal: Mural de Cards (Exibido no topo, logo abaixo do cabeçalho) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Janelas onde ficam as tasks / Job´s (1.5x maiores em largura e altura) */}
        <div className="lg:col-span-3 space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-96 rounded-2xl bg-zinc-900/50 border border-zinc-800 animate-pulse"
                />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="p-16 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
              <FilterX className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-base font-bold text-zinc-200">
                Nenhum Job encontrado
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 max-w-md mx-auto">
                Não há registros com estes filtros no momento. Seja o primeiro a publicar um Job ou ajuste seus critérios de busca.
              </p>
              <div className="flex items-center justify-center gap-3 mt-6">
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleClearFilters}
                >
                  Limpar filtros
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  icon={<PlusCircle className="w-4 h-4" />}
                  onClick={() => setIsPublishOpen(true)}
                >
                  Publicar Job
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onClick={() => {
                    setActivePost(post);
                    setIsDetailOpen(true);
                  }}
                  onToggleSave={(e) => handleToggleSave(post, e)}
                />
              ))}
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-zinc-800 text-xs text-zinc-400">
              <span>
                Página {currentPage} de {totalPages} ({totalPosts} Job´s ativos)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  icon={<ChevronLeft className="w-4 h-4" />}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  icon={<ChevronRight className="w-4 h-4" />}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Painel Complementar Lateral (Desktop) - Apenas dados reais */}
        <div className="space-y-4 hidden lg:block">
          {/* Minhas Candidaturas Reais */}
          {user && (
            <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-zinc-400" />
                  Minhas Candidaturas
                </span>
                <span className="text-xs font-mono font-bold text-zinc-400">
                  {myApplications.length}
                </span>
              </div>

              {myApplications.length === 0 ? (
                <p className="text-xs text-zinc-500 py-1">
                  Você ainda não possui candidaturas registradas em Job´s abertos.
                </p>
              ) : (
                <div className="space-y-2 pt-1">
                  {myApplications.map((app) => (
                    <div
                      key={app.id}
                      className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs"
                    >
                      <p className="font-semibold text-zinc-200 line-clamp-1">
                        {app.post_title}
                      </p>
                      <div className="flex items-center justify-between mt-1.5 text-[11px] text-zinc-500">
                        <span>@{app.author_username}</span>
                        <Badge
                          variant={
                            app.status === 'selecionada'
                              ? 'success'
                              : app.status === 'recusada'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {app.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Resumo Operacional Real */}
          <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-2.5 text-xs text-zinc-400">
            <div className="flex items-center gap-2 text-zinc-200 font-semibold">
              <Layers className="w-4 h-4 text-zinc-400" />
              Base de Dados Real
            </div>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              O mural exibe exclusivamente registros reais persistidos em PostgreSQL. Cada publicação possui autor verificado por sessão protegida.
            </p>
          </div>
        </div>
      </div>

      {/* Seção Inferior: Abas de Intenção e Filtros de Busca */}
      <div className="pt-6 border-t border-zinc-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
            Filtros e Critérios de Busca de Job´s
          </span>
        </div>

        {/* Abas Rápidas de Intenção */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => {
              setSelectedIntention('todas');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedIntention === 'todas'
                ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Todos os Job´s
          </button>

          {INTENTIONS.map((item) => (
            <button
              key={item}
              onClick={() => {
                setSelectedIntention(item);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedIntention === item
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Barra de Busca e Filtros Contextuais */}
        <div
          className={`p-5 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-4 ${
            showMobileFilters ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Buscar por título ou descrição..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              rightElement={<Search className="w-4 h-4" />}
            />

            <Select
              options={[
                { value: '', label: 'Todos os tipos (24 opções)' },
                ...OPPORTUNITY_TYPES.map((t) => ({ value: t.slug, label: t.name })),
              ]}
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
            />

            <Select
              options={[
                { value: '', label: 'Todas as áreas (24 opções)' },
                ...SERVICE_CATEGORIES.map((c) => ({ value: c.slug, label: c.name })),
              ]}
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
            />

            <Select
              options={[
                { value: '', label: 'Todas as modalidades' },
                ...MODALITIES.map((m) => ({ value: m, label: m })),
              ]}
              value={selectedModality}
              onChange={(e) => {
                setSelectedModality(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800/60 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 font-medium">Ordenar por:</span>
              <button
                onClick={() => setSelectedSort('recent')}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  selectedSort === 'recent'
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Mais recentes
              </button>
              <button
                onClick={() => setSelectedSort('deadline')}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  selectedSort === 'deadline'
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Proximidade do prazo
              </button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={handleClearFilters}
            >
              Limpar filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes da Publicação */}
      <PostDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        post={activePost}
        onPostUpdated={(updated) => {
          setActivePost(updated);
          setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        }}
        onPostDeleted={(deletedId) => {
          setIsDetailOpen(false);
          setActivePost(null);
          setPosts((prev) => prev.filter((p) => p.id !== deletedId));
          setTotalPosts((t) => Math.max(0, t - 1));
        }}
        onOpenReport={(id, title) => {
          setIsDetailOpen(false);
          const ev = new CustomEvent('open-report', { detail: { id, title } });
          window.dispatchEvent(ev);
        }}
      />

      {/* Modal de Publicação */}
      <PostModal
        isOpen={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
        onPostCreated={(newPost) => {
          setPosts((prev) => [newPost, ...prev]);
          setTotalPosts((t) => t + 1);
        }}
      />
    </div>
  );
}
