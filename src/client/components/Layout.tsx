import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ModuleSelector } from './ModuleSelector';
import { PostModal } from './PostModal';
import { ProfileModal } from './ProfileModal';
import { ReportModal } from './ReportModal';
import { Post } from '../../shared/types';

interface LayoutProps {
  children: React.ReactNode;
  onPostCreated?: (post: Post) => void;
}

export function Layout({ children, onPostCreated }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [avatarTabOpen, setAvatarTabOpen] = useState(false);

  // Modal de denúncia global
  const [reportPostId, setReportPostId] = useState<string | null>(null);
  const [reportPostTitle, setReportPostTitle] = useState<string | null>(null);

  const handleOpenReport = (postId: string, title: string) => {
    setReportPostId(postId);
    setReportPostTitle(title);
  };

  const handlePostCreated = (post: Post) => {
    if (onPostCreated) {
      onPostCreated(post);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-zinc-800">
      {/* Cabeçalho */}
      <Header
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        onOpenPublishModal={() => setPublishModalOpen(true)}
        onOpenProfileModal={() => {
          setAvatarTabOpen(false);
          setProfileModalOpen(true);
        }}
        onOpenAvatarModal={() => {
          setAvatarTabOpen(true);
          setProfileModalOpen(true);
        }}
      />

      {/* Faixa compacta das 12 Áreas */}
      <ModuleSelector />

      {/* Conteúdo com Sidebar Lateral */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Modais Globais */}
      <PostModal
        isOpen={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        onPostCreated={handlePostCreated}
      />

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        defaultTab={avatarTabOpen ? 'avatar' : 'profile'}
      />

      <ReportModal
        isOpen={Boolean(reportPostId)}
        onClose={() => {
          setReportPostId(null);
          setReportPostTitle(null);
        }}
        postId={reportPostId}
        postTitle={reportPostTitle}
      />
    </div>
  );
}
