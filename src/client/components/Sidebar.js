import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from 'react-router-dom';
import { MODULES } from '../../shared/constants';
import { X } from 'lucide-react';
import { Shield, Hammer, Handshake, Target, Users, Compass, HeartHandshake, Globe2, Terminal, Scale, Coins, Building, } from 'lucide-react';
const MODULE_ICONS = {
    guilda: _jsx(Shield, { className: "w-4 h-4" }),
    forja: _jsx(Hammer, { className: "w-4 h-4" }),
    alianca: _jsx(Handshake, { className: "w-4 h-4" }),
    missoes: _jsx(Target, { className: "w-4 h-4" }),
    companhia: _jsx(Users, { className: "w-4 h-4" }),
    jornada: _jsx(Compass, { className: "w-4 h-4" }),
    mutirao: _jsx(HeartHandshake, { className: "w-4 h-4" }),
    embaixada: _jsx(Globe2, { className: "w-4 h-4" }),
    comando: _jsx(Terminal, { className: "w-4 h-4" }),
    conselho: _jsx(Scale, { className: "w-4 h-4" }),
    tesouraria: _jsx(Coins, { className: "w-4 h-4" }),
    fundacao: _jsx(Building, { className: "w-4 h-4" }),
};
export function Sidebar({ mobileOpen, onCloseMobile }) {
    const content = (_jsxs("div", { className: "flex flex-col h-full bg-zinc-950 p-4 border-r border-zinc-800/80", children: [_jsxs("div", { className: "flex items-center justify-between pb-3 mb-2 border-b border-zinc-800 lg:hidden", children: [_jsx("span", { className: "font-semibold text-sm text-zinc-100", children: "Navega\u00E7\u00E3o Zero Control" }), _jsx("button", { onClick: onCloseMobile, "aria-label": "Fechar menu", className: "p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-900 cursor-pointer", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsx("div", { className: "text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-2 px-2", children: "12 Vertentes Operacionais" }), _jsx("nav", { className: "flex-1 space-y-1 overflow-y-auto pr-1", children: MODULES.map((m) => (_jsxs(NavLink, { to: m.route, onClick: onCloseMobile, className: ({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${isActive
                        ? 'bg-zinc-800 text-white font-semibold border-l-2 border-l-white'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'}`, children: [_jsx("span", { className: "text-zinc-400", children: MODULE_ICONS[m.slug] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { children: m.name }), _jsx("span", { className: "text-[10px] text-zinc-500 font-normal truncate max-w-[170px]", children: m.subtitle })] })] }, m.slug))) }), _jsx("div", { className: "pt-4 border-t border-zinc-900 text-[10px] text-zinc-600 font-mono", children: "Zero Control v1.0 \u2022 Phantom Troupe" })] }));
    return (_jsxs(_Fragment, { children: [_jsx("aside", { className: "hidden lg:block w-64 h-[calc(100vh-3.5rem)] sticky top-14 shrink-0 overflow-y-auto", children: content }), mobileOpen && (_jsx("div", { className: "fixed inset-0 z-50 lg:hidden bg-black/80 backdrop-blur-sm", onClick: (e) => {
                    if (e.target === e.currentTarget)
                        onCloseMobile();
                }, children: _jsx("div", { className: "w-72 h-full bg-zinc-950 animate-in slide-in-from-left duration-200", children: content }) }))] }));
}
