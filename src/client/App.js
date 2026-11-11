import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { GuildaPage } from './pages/GuildaPage';
import { ForjaPage } from './pages/ForjaPage';
import { AliancaPage } from './pages/AliancaPage';
import { MissoesPage } from './pages/MissoesPage';
import { CompanhiaPage } from './pages/CompanhiaPage';
import { JornadaPage } from './pages/JornadaPage';
import { MutiraoPage } from './pages/MutiraoPage';
import { EmbaixadaPage } from './pages/EmbaixadaPage';
import { ComandoPage } from './pages/ComandoPage';
import { ConselhoPage } from './pages/ConselhoPage';
import { TesourariaPage } from './pages/TesourariaPage';
import { FundacaoPage } from './pages/FundacaoPage';
function ProtectedRoute({ children }) {
    const { user, isLoading } = useAuth();
    const location = useLocation();
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 text-xs font-mono", children: "Inicializando Zero Control..." }));
    }
    if (!user) {
        return _jsx(Navigate, { to: "/login", state: { from: location }, replace: true });
    }
    return _jsx(_Fragment, { children: children });
}
export function App() {
    const { user, isLoading } = useAuth();
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 text-xs font-mono", children: "Carregando Zero Control..." }));
    }
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: user ? _jsx(Navigate, { to: "/guilda", replace: true }) : _jsx(LoginPage, {}) }), _jsx(Route, { path: "/cadastro", element: user ? _jsx(Navigate, { to: "/guilda", replace: true }) : _jsx(RegisterPage, {}) }), _jsx(Route, { path: "/", element: _jsx(Navigate, { to: user ? '/guilda' : '/login', replace: true }) }), _jsx(Route, { path: "/guilda", element: _jsx(Layout, { children: _jsx(GuildaPage, {}) }) }), _jsx(Route, { path: "/guilda/publicacoes/:id", element: _jsx(Layout, { children: _jsx(GuildaPage, {}) }) }), _jsx(Route, { path: "/forja", element: _jsx(Layout, { children: _jsx(ForjaPage, {}) }) }), _jsx(Route, { path: "/alianca", element: _jsx(Layout, { children: _jsx(AliancaPage, {}) }) }), _jsx(Route, { path: "/missoes", element: _jsx(Layout, { children: _jsx(MissoesPage, {}) }) }), _jsx(Route, { path: "/companhia", element: _jsx(ProtectedRoute, { children: _jsx(Layout, { children: _jsx(CompanhiaPage, {}) }) }) }), _jsx(Route, { path: "/jornada", element: _jsx(ProtectedRoute, { children: _jsx(Layout, { children: _jsx(JornadaPage, {}) }) }) }), _jsx(Route, { path: "/mutirao", element: _jsx(Layout, { children: _jsx(MutiraoPage, {}) }) }), _jsx(Route, { path: "/embaixada", element: _jsx(ProtectedRoute, { children: _jsx(Layout, { children: _jsx(EmbaixadaPage, {}) }) }) }), _jsx(Route, { path: "/comando", element: _jsx(ProtectedRoute, { children: _jsx(Layout, { children: _jsx(ComandoPage, {}) }) }) }), _jsx(Route, { path: "/conselho", element: _jsx(ProtectedRoute, { children: _jsx(Layout, { children: _jsx(ConselhoPage, {}) }) }) }), _jsx(Route, { path: "/tesouraria", element: _jsx(ProtectedRoute, { children: _jsx(Layout, { children: _jsx(TesourariaPage, {}) }) }) }), _jsx(Route, { path: "/fundacao", element: _jsx(Layout, { children: _jsx(FundacaoPage, {}) }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/guilda", replace: true }) })] }));
}
