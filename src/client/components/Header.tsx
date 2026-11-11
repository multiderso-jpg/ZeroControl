import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from './UserAvatar';
import { Button } from './UI';
import {
  Menu,
  PlusCircle,
  User as UserIcon,
  Camera,
  FileText,
  Send,
  LogOut,
  ChevronDown,
  ShieldAlert,
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  onOpenPublishModal: () => void;
  onOpenProfileModal: () => void;
  onOpenAvatarModal: () => void;
}

export function Header({
  onToggleMobileMenu,
  onOpenPublishModal,
  onOpenProfileModal,
  onOpenAvatarModal,
}: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
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

  return (
    <header className="h-14 bg-zinc-950 border-b border-zinc-800 px-4 flex items-center justify-between sticky top-0 z-40 select-none">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          aria-label="Abrir menu de navegação"
          className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link
          to="/guilda"
          className="flex items-center gap-2 group text-white tracking-wider"
          aria-label="Zero Control - Início"
        >
          <div className="w-7 h-7 rounded bg-zinc-100 flex items-center justify-center text-zinc-950 font-mono font-black text-sm group-hover:bg-white transition-colors">
            0
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-widest text-zinc-100">
              ZERO CONTROL
            </span>
            <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase -mt-1">
              Phantom Troupe
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Button
              variant="primary"
              size="sm"
              icon={<PlusCircle className="w-4 h-4" />}
              onClick={onOpenPublishModal}
              className="hidden sm:inline-flex"
            >
              Publicar trabalho
            </Button>

            <button
              onClick={onOpenPublishModal}
              aria-label="Publicar trabalho"
              className="sm:hidden p-2 rounded-lg bg-zinc-100 text-zinc-950 hover:bg-white"
            >
              <PlusCircle className="w-4 h-4" />
            </button>

            {/* Menu do Avatar do Usuário */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors cursor-pointer"
                aria-expanded={dropdownOpen}
                aria-label="Menu do usuário"
              >
                <UserAvatar
                  username={user.username}
                  avatarUrl={user.avatar_url}
                  size="sm"
                />
                <span className="hidden md:inline-block text-xs font-medium text-zinc-200 max-w-[120px] truncate">
                  {user.username}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 hidden md:inline-block" />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl py-1 z-50 text-xs animate-in fade-in duration-100"
                  role="menu"
                >
                  <div className="px-3 py-2 border-b border-zinc-800">
                    <p className="font-semibold text-zinc-100">{user.username}</p>
                    <p className="text-[11px] text-zinc-400 uppercase tracking-wider font-mono">
                      Papel: {user.role}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenProfileModal();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer text-left"
                    role="menuitem"
                  >
                    <UserIcon className="w-4 h-4 text-zinc-400" />
                    Meu perfil
                  </button>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenAvatarModal();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer text-left"
                    role="menuitem"
                  >
                    <Camera className="w-4 h-4 text-zinc-400" />
                    Alterar foto
                  </button>

                  <Link
                    to="/guilda?me=posts"
                    onClick={() => setDropdownOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer text-left"
                    role="menuitem"
                  >
                    <FileText className="w-4 h-4 text-zinc-400" />
                    Minhas publicações
                  </Link>

                  <Link
                    to="/guilda?me=candidaturas"
                    onClick={() => setDropdownOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer text-left"
                    role="menuitem"
                  >
                    <Send className="w-4 h-4 text-zinc-400" />
                    Minhas candidaturas
                  </Link>

                  {(user.role === 'moderador' || user.role === 'administrador') && (
                    <Link
                      to="/conselho"
                      onClick={() => setDropdownOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-amber-400 hover:bg-zinc-800 cursor-pointer text-left border-t border-zinc-800"
                      role="menuitem"
                    >
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      Fila de Moderação (Conselho)
                    </Link>
                  )}

                  <div className="border-t border-zinc-800 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-zinc-800 cursor-pointer text-left"
                    role="menuitem"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair da conta
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </Link>
            <Link to="/cadastro">
              <Button variant="primary" size="sm">
                Criar conta
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
