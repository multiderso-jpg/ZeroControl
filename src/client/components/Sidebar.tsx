import React from 'react';
import { NavLink } from 'react-router-dom';
import { MODULES } from '../../shared/constants';
import { X } from 'lucide-react';
import {
  Shield,
  Hammer,
  Handshake,
  Target,
  Users,
  Compass,
  HeartHandshake,
  Globe2,
  Terminal,
  Scale,
  Coins,
  Building,
} from 'lucide-react';

const MODULE_ICONS: Record<string, React.ReactNode> = {
  guilda: <Shield className="w-4 h-4" />,
  forja: <Hammer className="w-4 h-4" />,
  alianca: <Handshake className="w-4 h-4" />,
  missoes: <Target className="w-4 h-4" />,
  companhia: <Users className="w-4 h-4" />,
  jornada: <Compass className="w-4 h-4" />,
  mutirao: <HeartHandshake className="w-4 h-4" />,
  embaixada: <Globe2 className="w-4 h-4" />,
  comando: <Terminal className="w-4 h-4" />,
  conselho: <Scale className="w-4 h-4" />,
  tesouraria: <Coins className="w-4 h-4" />,
  fundacao: <Building className="w-4 h-4" />,
};

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const content = (
    <div className="flex flex-col h-full bg-zinc-950 p-4 border-r border-zinc-800/80">
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-zinc-800 lg:hidden">
        <span className="font-semibold text-sm text-zinc-100">Navegação Zero Control</span>
        <button
          onClick={onCloseMobile}
          aria-label="Fechar menu"
          className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-900 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-2 px-2">
        12 Vertentes Operacionais
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {MODULES.map((m) => (
          <NavLink
            key={m.slug}
            to={m.route}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-zinc-800 text-white font-semibold border-l-2 border-l-white'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`
            }
          >
            <span className="text-zinc-400">{MODULE_ICONS[m.slug]}</span>
            <div className="flex flex-col">
              <span>{m.name}</span>
              <span className="text-[10px] text-zinc-500 font-normal truncate max-w-[170px]">
                {m.subtitle}
              </span>
            </div>
          </NavLink>
        ))}
      </nav>

      <div className="pt-4 border-t border-zinc-900 text-[10px] text-zinc-600 font-mono">
        Zero Control v1.0 • Phantom Troupe
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar Desktop */}
      <aside className="hidden lg:block w-64 h-[calc(100vh-3.5rem)] sticky top-14 shrink-0 overflow-y-auto">
        {content}
      </aside>

      {/* Drawer Mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-black/80 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) onCloseMobile();
          }}
        >
          <div className="w-72 h-full bg-zinc-950 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
