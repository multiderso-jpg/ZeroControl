import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ModuleSelector } from './ModuleSelector';
import { PostModal } from './PostModal';
import { ProfileModal } from './ProfileModal';
import { ReportModal } from './ReportModal';
export function Layout({ children, onPostCreated }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [publishModalOpen, setPublishModalOpen] = useState(false);
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [avatarTabOpen, setAvatarTabOpen] = useState(false);
    // Modal de denúncia global
    const [reportPostId, setReportPostId] = useState(null);
    const [reportPostTitle, setReportPostTitle] = useState(null);
    const handleOpenReport = (postId, title) => {
        setReportPostId(postId);
        setReportPostTitle(title);
    };
    const handlePostCreated = (post) => {
        if (onPostCreated) {
            onPostCreated(post);
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-zinc-800", children: [_jsx(Header, { onToggleMobileMenu: () => setMobileMenuOpen(!mobileMenuOpen), onOpenPublishModal: () => setPublishModalOpen(true), onOpenProfileModal: () => {
                    setAvatarTabOpen(false);
                    setProfileModalOpen(true);
                }, onOpenAvatarModal: () => {
                    setAvatarTabOpen(true);
                    setProfileModalOpen(true);
                } }), _jsx(ModuleSelector, {}), _jsxs("div", { className: "flex-1 flex max-w-7xl w-full mx-auto", children: [_jsx(Sidebar, { mobileOpen: mobileMenuOpen, onCloseMobile: () => setMobileMenuOpen(false) }), _jsx("main", { className: "flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-x-hidden", children: children })] }), _jsx(PostModal, { isOpen: publishModalOpen, onClose: () => setPublishModalOpen(false), onPostCreated: handlePostCreated }), _jsx(ProfileModal, { isOpen: profileModalOpen, onClose: () => setProfileModalOpen(false), defaultTab: avatarTabOpen ? 'avatar' : 'profile' }), _jsx(ReportModal, { isOpen: Boolean(reportPostId), onClose: () => {
                    setReportPostId(null);
                    setReportPostTitle(null);
                }, postId: reportPostId, postTitle: reportPostTitle })] }));
}
