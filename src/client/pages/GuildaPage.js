import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { OPPORTUNITY_TYPES, SERVICE_CATEGORIES, INTENTIONS, MODALITIES, } from '../../shared/constants';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { PostCard } from '../components/PostCard';
import { PostDetailModal } from '../components/PostDetailModal';
import { PostModal } from '../components/PostModal';
import { Input, Select, Button, Badge } from '../components/UI';
import { Search, SlidersHorizontal, RotateCcw, PlusCircle, Sparkles, Send, ChevronLeft, ChevronRight, FilterX, } from 'lucide-react';
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
    const [selectedSort, setSelectedSort] = useState(searchParams.get('ordem') || 'recent');
    // Estados de dados
    const [posts, setPosts] = useState([]);
    const [totalPosts, setTotalPosts] = useState(0);
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('pagina') || '1', 10));
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    // Painel lateral de candidaturas e missões rápidas
    const [myApplications, setMyApplications] = useState([]);
    // Modais
    const [activePost, setActivePost] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isPublishOpen, setIsPublishOpen] = useState(false);
    const fetchPosts = async () => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (searchTerm)
                queryParams.set('search', searchTerm);
            if (selectedIntention !== 'todas')
                queryParams.set('intention', selectedIntention);
            if (selectedType)
                queryParams.set('opportunity_type_slug', selectedType);
            if (selectedCategory)
                queryParams.set('service_category_slug', selectedCategory);
            if (selectedModality)
                queryParams.set('modality', selectedModality);
            if (selectedCity)
                queryParams.set('city', selectedCity);
            queryParams.set('sort', selectedSort);
            queryParams.set('page', currentPage.toString());
            queryParams.set('limit', '12');
            const data = await apiRequest(`/api/posts?${queryParams.toString()}`);
            setPosts(data.posts);
            setTotalPosts(data.total);
            setTotalPages(data.totalPages || 1);
        }
        catch {
            setPosts([]);
        }
        finally {
            setIsLoading(false);
        }
    };
    const fetchMySidebarData = async () => {
        if (!user)
            return;
        try {
            const data = await apiRequest('/api/applications/my');
            setMyApplications(data.applications.slice(0, 5));
        }
        catch { }
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
    const handleToggleSave = async (post, e) => {
        e.stopPropagation();
        if (!user) {
            alert('Faça login para salvar oportunidades.');
            return;
        }
        try {
            const res = await apiRequest(`/api/posts/${post.id}/save`, {
                method: 'POST',
            });
            setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, is_saved: res.saved } : p)));
        }
        catch { }
    };
    return (_jsxs("div", { className: "space-y-6 text-left", children: [_jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2", children: ["Mural da Guilda", _jsxs(Badge, { variant: "silver", children: [totalPosts, " oportunidades"] })] }), _jsx("p", { className: "text-xs text-zinc-400 mt-1", children: "Espa\u00E7o central para oferta e busca de servi\u00E7os, contrata\u00E7\u00F5es e parcerias da comunidade." })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", className: "md:hidden", icon: _jsx(SlidersHorizontal, { className: "w-4 h-4" }), onClick: () => setShowMobileFilters(!showMobileFilters), children: "Filtros" }), _jsx(Button, { variant: "primary", size: "sm", icon: _jsx(PlusCircle, { className: "w-4 h-4" }), onClick: () => setIsPublishOpen(true), children: "Publicar trabalho" })] })] }), _jsxs("div", { className: "flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none", children: [_jsx("button", { onClick: () => {
                            setSelectedIntention('todas');
                            setCurrentPage(1);
                        }, className: `px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${selectedIntention === 'todas'
                            ? 'bg-zinc-100 text-zinc-950 font-semibold'
                            : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'}`, children: "Todas as inten\u00E7\u00F5es" }), INTENTIONS.map((item) => (_jsx("button", { onClick: () => {
                            setSelectedIntention(item);
                            setCurrentPage(1);
                        }, className: `px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${selectedIntention === item
                            ? 'bg-zinc-100 text-zinc-950 font-semibold'
                            : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'}`, children: item }, item)))] }), _jsxs("div", { className: `p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3 ${showMobileFilters ? 'block' : 'hidden md:block'}`, children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3", children: [_jsx(Input, { placeholder: "Buscar por palavras-chave...", value: searchTerm, onChange: (e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }, rightElement: _jsx(Search, { className: "w-4 h-4" }) }), _jsx(Select, { options: [
                                    { value: '', label: 'Todos os tipos (24 opções)' },
                                    ...OPPORTUNITY_TYPES.map((t) => ({ value: t.slug, label: t.name })),
                                ], value: selectedType, onChange: (e) => {
                                    setSelectedType(e.target.value);
                                    setCurrentPage(1);
                                } }), _jsx(Select, { options: [
                                    { value: '', label: 'Todas as áreas (24 opções)' },
                                    ...SERVICE_CATEGORIES.map((c) => ({ value: c.slug, label: c.name })),
                                ], value: selectedCategory, onChange: (e) => {
                                    setSelectedCategory(e.target.value);
                                    setCurrentPage(1);
                                } }), _jsx(Select, { options: [
                                    { value: '', label: 'Todas as modalidades' },
                                    ...MODALITIES.map((m) => ({ value: m, label: m })),
                                ], value: selectedModality, onChange: (e) => {
                                    setSelectedModality(e.target.value);
                                    setCurrentPage(1);
                                } })] }), _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800/60 text-xs", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-zinc-400", children: "Ordenar por:" }), _jsx("button", { onClick: () => setSelectedSort('recent'), className: `px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${selectedSort === 'recent'
                                            ? 'bg-zinc-800 text-white font-semibold'
                                            : 'text-zinc-500 hover:text-zinc-300'}`, children: "Mais recentes" }), _jsx("button", { onClick: () => setSelectedSort('deadline'), className: `px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${selectedSort === 'deadline'
                                            ? 'bg-zinc-800 text-white font-semibold'
                                            : 'text-zinc-500 hover:text-zinc-300'}`, children: "Proximidade do prazo" })] }), _jsx(Button, { variant: "ghost", size: "sm", icon: _jsx(RotateCcw, { className: "w-3.5 h-3.5" }), onClick: handleClearFilters, children: "Limpar filtros" })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-4 gap-6 items-start", children: [_jsxs("div", { className: "lg:col-span-3 space-y-6", children: [isLoading ? (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4", children: [1, 2, 3, 4, 5, 6].map((i) => (_jsx("div", { className: "h-72 rounded-xl bg-zinc-900/50 border border-zinc-800 animate-pulse" }, i))) })) : posts.length === 0 ? (_jsxs("div", { className: "p-12 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20", children: [_jsx(FilterX, { className: "w-10 h-10 text-zinc-600 mx-auto mb-3" }), _jsx("h3", { className: "text-sm font-semibold text-zinc-300", children: "Nenhuma oportunidade encontrada" }), _jsx("p", { className: "text-xs text-zinc-500 mt-1 max-w-sm mx-auto", children: "Tente ajustar os filtros, buscar por outros termos ou publique uma nova oportunidade para a Guilda." }), _jsx(Button, { variant: "outline", size: "sm", className: "mt-4", onClick: handleClearFilters, children: "Limpar todos os filtros" })] })) : (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4", children: posts.map((post) => (_jsx(PostCard, { post: post, onClick: () => {
                                        setActivePost(post);
                                        setIsDetailOpen(true);
                                    }, onToggleSave: (e) => handleToggleSave(post, e) }, post.id))) })), totalPages > 1 && (_jsxs("div", { className: "flex items-center justify-between pt-4 border-t border-zinc-800 text-xs text-zinc-400", children: [_jsxs("span", { children: ["P\u00E1gina ", currentPage, " de ", totalPages, " (", totalPosts, " resultados)"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", disabled: currentPage <= 1, onClick: () => setCurrentPage((p) => Math.max(1, p - 1)), icon: _jsx(ChevronLeft, { className: "w-4 h-4" }), children: "Anterior" }), _jsx(Button, { variant: "outline", size: "sm", disabled: currentPage >= totalPages, onClick: () => setCurrentPage((p) => Math.min(totalPages, p + 1)), icon: _jsx(ChevronRight, { className: "w-4 h-4" }), children: "Pr\u00F3xima" })] })] }))] }), _jsxs("div", { className: "space-y-4 hidden lg:block", children: [user && (_jsxs("div", { className: "p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5", children: [_jsx(Send, { className: "w-3.5 h-3.5 text-zinc-400" }), "Minhas Candidaturas"] }), _jsx("span", { className: "text-[11px] font-mono text-zinc-500", children: myApplications.length })] }), myApplications.length === 0 ? (_jsx("p", { className: "text-xs text-zinc-500", children: "Voc\u00EA ainda n\u00E3o enviou interesse para oportunidades abertas." })) : (_jsx("div", { className: "space-y-2", children: myApplications.map((app) => (_jsxs("div", { className: "p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 text-xs", children: [_jsx("p", { className: "font-medium text-zinc-200 line-clamp-1", children: app.post_title }), _jsxs("div", { className: "flex items-center justify-between mt-1 text-[11px] text-zinc-500", children: [_jsxs("span", { children: ["@", app.author_username] }), _jsx(Badge, { variant: app.status === 'selecionada'
                                                                ? 'success'
                                                                : app.status === 'recusada'
                                                                    ? 'danger'
                                                                    : 'warning', children: app.status })] })] }, app.id))) }))] })), _jsxs("div", { className: "p-4 rounded-xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 space-y-2.5", children: [_jsxs("div", { className: "flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-zinc-400", children: [_jsx(Sparkles, { className: "w-3.5 h-3.5 text-zinc-300" }), "Forja \u2022 Phantom Troupe"] }), _jsx("p", { className: "text-xs text-zinc-300 leading-relaxed", children: "Necessita de engenharia dedicada ou servi\u00E7os institucionais especializados?" }), _jsx(Button, { variant: "outline", size: "sm", className: "w-full text-xs", onClick: () => {
                                            window.location.href = '/forja';
                                        }, children: "Consultar Cat\u00E1logo da Forja" })] })] })] }), _jsx(PostDetailModal, { isOpen: isDetailOpen, onClose: () => setIsDetailOpen(false), post: activePost, onPostUpdated: (updated) => {
                    setActivePost(updated);
                    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
                }, onOpenReport: (id, title) => {
                    setIsDetailOpen(false);
                    // O layout lida com o modal de denúncia
                    const ev = new CustomEvent('open-report', { detail: { id, title } });
                    window.dispatchEvent(ev);
                } }), _jsx(PostModal, { isOpen: isPublishOpen, onClose: () => setIsPublishOpen(false), onPostCreated: (newPost) => {
                    setPosts((prev) => [newPost, ...prev]);
                    setTotalPosts((t) => t + 1);
                } })] }));
}
