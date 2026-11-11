import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Post, Application } from '../../shared/types';
import {
  OPPORTUNITY_TYPES,
  SERVICE_CATEGORIES,
  INTENTIONS,
  MODALITIES,
} from '../../shared/constants';
import { apiRequest } from '../api/client';
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
  Sparkles,
  Send,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  FilterX,
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

  // Estados de dados
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('pagina') || '1', 10));
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Painel lateral de candidaturas e missões rápidas
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
      queryParams.set('limit', '12');

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
    } catch {}
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
      {/* Cabeçalho da Guilda */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Mural da Guilda
            <Badge variant="silver">{totalPosts} oportunidades</Badge>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Espaço central para oferta e busca de serviços, contratações e parcerias da comunidade.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="md:hidden"
            icon={<SlidersHorizontal className="w-4 h-4" />}
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            Filtros
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<PlusCircle className="w-4 h-4" />}
            onClick={() => setIsPublishOpen(true)}
          >
            Publicar trabalho
          </Button>
        </div>
      </div>

      {/* Abas Rápidas de Intenção */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => {
            setSelectedIntention('todas');
            setCurrentPage(1);
          }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
            selectedIntention === 'todas'
              ? 'bg-zinc-100 text-zinc-950 font-semibold'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          Todas as intenções
        </button>

        {INTENTIONS.map((item) => (
          <button
            key={item}
            onClick={() => {
              setSelectedIntention(item);
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedIntention === item
                ? 'bg-zinc-100 text-zinc-950 font-semibold'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Barra de Busca e Filtros Contextuais */}
      <div
        className={`p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3 ${
          showMobileFilters ? 'block' : 'hidden md:block'
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            placeholder="Buscar por palavras-chave..."
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

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">Ordenar por:</span>
            <button
              onClick={() => setSelectedSort('recent')}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                selectedSort === 'recent'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Mais recentes
            </button>
            <button
              onClick={() => setSelectedSort('deadline')}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
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

      {/* Conteúdo Principal: Mural Central + Painel Complementar Lateral */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Mural de Cards (3 colunas no desktop) */}
        <div className="lg:col-span-3 space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-72 rounded-xl bg-zinc-900/50 border border-zinc-800 animate-pulse"
                />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
              <FilterX className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-zinc-300">
                Nenhuma oportunidade encontrada
              </h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                Tente ajustar os filtros, buscar por outros termos ou publique uma nova oportunidade para a Guilda.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={handleClearFilters}
              >
                Limpar todos os filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
                Página {currentPage} de {totalPages} ({totalPosts} resultados)
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

        {/* Painel Complementar Lateral (Desktop) */}
        <div className="space-y-4 hidden lg:block">
          {/* Minhas Candidaturas Rápidas */}
          {user && (
            <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-zinc-400" />
                  Minhas Candidaturas
                </span>
                <span className="text-[11px] font-mono text-zinc-500">
                  {myApplications.length}
                </span>
              </div>

              {myApplications.length === 0 ? (
                <p className="text-xs text-zinc-500">
                  Você ainda não enviou interesse para oportunidades abertas.
                </p>
              ) : (
                <div className="space-y-2">
                  {myApplications.map((app) => (
                    <div
                      key={app.id}
                      className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 text-xs"
                    >
                      <p className="font-medium text-zinc-200 line-clamp-1">
                        {app.post_title}
                      </p>
                      <div className="flex items-center justify-between mt-1 text-[11px] text-zinc-500">
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

          {/* Destaque Institucional Phantom Troupe */}
          <div className="p-4 rounded-xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-zinc-400">
              <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
              Forja • Phantom Troupe
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Necessita de engenharia dedicada ou serviços institucionais especializados?
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                window.location.href = '/forja';
              }}
            >
              Consultar Catálogo da Forja
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
        onOpenReport={(id, title) => {
          setIsDetailOpen(false);
          // O layout lida com o modal de denúncia
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
