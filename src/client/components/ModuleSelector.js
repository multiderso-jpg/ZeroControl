import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from 'react-router-dom';
import { MODULES } from '../../shared/constants';
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
export function ModuleSelector() {
    return (_jsx("nav", { "aria-label": "As 12 \u00C1reas do Zero Control", className: "w-full bg-zinc-950/80 backdrop-blur border-b border-zinc-800/80 overflow-x-auto py-2 px-4 scrollbar-none sticky top-14 z-30", children: _jsxs("div", { className: "flex items-center gap-1.5 min-w-max mx-auto max-w-7xl", children: [_jsxs("span", { className: "text-[11px] font-mono uppercase tracking-wider text-zinc-500 mr-2 flex items-center gap-1", children: [_jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" }), "\u00C1reas"] }), MODULES.map((m) => (_jsxs(NavLink, { to: m.route, className: ({ isActive }) => `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 select-none ${isActive
                        ? 'bg-zinc-800 text-white font-semibold border border-zinc-600 shadow-inner'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'}`, children: [MODULE_ICONS[m.slug], _jsx("span", { children: m.name })] }, m.slug)))] }) }));
}
