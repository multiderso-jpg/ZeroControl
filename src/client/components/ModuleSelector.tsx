import React from 'react';
import { NavLink } from 'react-router-dom';
import { MODULES } from '../../shared/constants';
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

export function ModuleSelector() {
  return (
    <nav
      aria-label="As 12 Áreas do Zero Control"
      className="w-full bg-zinc-950/80 backdrop-blur border-b border-zinc-800/80 overflow-x-auto py-2 px-4 scrollbar-none sticky top-14 z-30"
    >
      <div className="flex items-center gap-1.5 min-w-max mx-auto max-w-7xl">
        <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mr-2 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Áreas
        </span>
        {MODULES.map((m) => (
          <NavLink
            key={m.slug}
            to={m.route}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 select-none ${
                isActive
                  ? 'bg-zinc-800 text-white font-semibold border border-zinc-600 shadow-inner'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
              }`
            }
          >
            {MODULE_ICONS[m.slug]}
            <span>{m.name}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
