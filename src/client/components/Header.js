import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from './UserAvatar';
import { Button } from './UI';
import { Menu, PlusCircle, User as UserIcon, Camera, FileText, Send, LogOut, ChevronDown, ShieldAlert, } from 'lucide-react';
export function Header({ onToggleMobileMenu, onOpenPublishModal, onOpenProfileModal, onOpenAvatarModal, }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const handleLogout = async () => {
        setDropdownOpen(false);
        await logout();
        navigate('/login');
    };
    return (_jsxs("header", { className: "h-14 bg-zinc-950 border-b border-zinc-800 px-4 flex items-center justify-between sticky top-0 z-40 select-none", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: onToggleMobileMenu, "aria-label": "Abrir menu de navega\u00E7\u00E3o", className: "lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 cursor-pointer", children: _jsx(Menu, { className: "w-5 h-5" }) }), _jsxs(Link, { to: "/guilda", className: "flex items-center gap-2 group text-white tracking-wider", "aria-label": "Zero Control - In\u00EDcio", children: [_jsx("div", { className: "w-7 h-7 rounded bg-zinc-100 flex items-center justify-center text-zinc-950 font-mono font-black text-sm group-hover:bg-white transition-colors", children: "0" }), _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "font-bold text-sm tracking-widest text-zinc-100", children: "ZERO CONTROL" }), _jsx("span", { className: "text-[9px] font-mono tracking-widest text-zinc-500 uppercase -mt-1", children: "Phantom Troupe" })] })] })] }), _jsx("div", { className: "flex items-center gap-3", children: user ? (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "primary", size: "sm", icon: _jsx(PlusCircle, { className: "w-4 h-4" }), onClick: onOpenPublishModal, className: "hidden sm:inline-flex", children: "Publicar trabalho" }), _jsx("button", { onClick: onOpenPublishModal, "aria-label": "Publicar trabalho", className: "sm:hidden p-2 rounded-lg bg-zinc-100 text-zinc-950 hover:bg-white", children: _jsx(PlusCircle, { className: "w-4 h-4" }) }), _jsxs("div", { className: "relative", ref: dropdownRef, children: [_jsxs("button", { onClick: () => setDropdownOpen(!dropdownOpen), className: "flex items-center gap-2 p-1 rounded-full hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors cursor-pointer", "aria-expanded": dropdownOpen, "aria-label": "Menu do usu\u00E1rio", children: [_jsx(UserAvatar, { username: user.username, avatarUrl: user.avatar_url, size: "sm" }), _jsx("span", { className: "hidden md:inline-block text-xs font-medium text-zinc-200 max-w-[120px] truncate", children: user.username }), _jsx(ChevronDown, { className: "w-3.5 h-3.5 text-zinc-400 hidden md:inline-block" })] }), dropdownOpen && (_jsxs("div", { className: "absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl py-1 z-50 text-xs animate-in fade-in duration-100", role: "menu", children: [_jsxs("div", { className: "px-3 py-2 border-b border-zinc-800", children: [_jsx("p", { className: "font-semibold text-zinc-100", children: user.username }), _jsxs("p", { className: "text-[11px] text-zinc-400 uppercase tracking-wider font-mono", children: ["Papel: ", user.role] })] }), _jsxs("button", { onClick: () => {
                                                setDropdownOpen(false);
                                                onOpenProfileModal();
                                            }, className: "w-full flex items-center gap-2.5 px-3 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer text-left", role: "menuitem", children: [_jsx(UserIcon, { className: "w-4 h-4 text-zinc-400" }), "Meu perfil"] }), _jsxs("button", { onClick: () => {
                                                setDropdownOpen(false);
                                                onOpenAvatarModal();
                                            }, className: "w-full flex items-center gap-2.5 px-3 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer text-left", role: "menuitem", children: [_jsx(Camera, { className: "w-4 h-4 text-zinc-400" }), "Alterar foto"] }), _jsxs(Link, { to: "/guilda?me=posts", onClick: () => setDropdownOpen(false), className: "w-full flex items-center gap-2.5 px-3 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer text-left", role: "menuitem", children: [_jsx(FileText, { className: "w-4 h-4 text-zinc-400" }), "Minhas publica\u00E7\u00F5es"] }), _jsxs(Link, { to: "/guilda?me=candidaturas", onClick: () => setDropdownOpen(false), className: "w-full flex items-center gap-2.5 px-3 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer text-left", role: "menuitem", children: [_jsx(Send, { className: "w-4 h-4 text-zinc-400" }), "Minhas candidaturas"] }), (user.role === 'moderador' || user.role === 'administrador') && (_jsxs(Link, { to: "/conselho", onClick: () => setDropdownOpen(false), className: "w-full flex items-center gap-2.5 px-3 py-2 text-amber-400 hover:bg-zinc-800 cursor-pointer text-left border-t border-zinc-800", role: "menuitem", children: [_jsx(ShieldAlert, { className: "w-4 h-4 text-amber-400" }), "Fila de Modera\u00E7\u00E3o (Conselho)"] })), _jsx("div", { className: "border-t border-zinc-800 my-1" }), _jsxs("button", { onClick: handleLogout, className: "w-full flex items-center gap-2.5 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-zinc-800 cursor-pointer text-left", role: "menuitem", children: [_jsx(LogOut, { className: "w-4 h-4" }), "Sair da conta"] })] }))] })] })) : (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Link, { to: "/login", children: _jsx(Button, { variant: "ghost", size: "sm", children: "Entrar" }) }), _jsx(Link, { to: "/cadastro", children: _jsx(Button, { variant: "primary", size: "sm", children: "Criar conta" }) })] })) })] }));
}
