import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Modal, Button, Input, Textarea, Select } from './UI';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from './UserAvatar';
import { apiRequest } from '../api/client';
import { Camera, Trash2 } from 'lucide-react';
export function ProfileModal({ isOpen, onClose, defaultTab = 'profile', }) {
    const { user, profile, uploadAvatar, removeAvatar, updateProfileData } = useAuth();
    const [tab, setTab] = useState(defaultTab);
    // Bio e Visibilidade
    const [bio, setBio] = useState(profile?.bio || '');
    const [visibility, setVisibility] = useState(profile?.visibility || 'public');
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState(null);
    // Avatar
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [avatarError, setAvatarError] = useState(null);
    // Segurança (Senha)
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isChangingPass, setIsChangingPass] = useState(false);
    const [passError, setPassError] = useState(null);
    const [passSuccess, setPassSuccess] = useState(null);
    if (!user)
        return null;
    const handleAvatarSelect = (e) => {
        if (!e.target.files?.[0])
            return;
        const file = e.target.files[0];
        if (file.size > 5 * 1024 * 1024) {
            setAvatarError('A fotografia deve ter no máximo 5 MB.');
            return;
        }
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
        setAvatarError(null);
    };
    const handleUploadAvatar = async () => {
        if (!avatarFile)
            return;
        setIsUploadingAvatar(true);
        setAvatarError(null);
        try {
            await uploadAvatar(avatarFile);
            setAvatarFile(null);
            setAvatarPreview(null);
            setProfileSuccess('Fotografia de avatar atualizada com sucesso!');
        }
        catch (err) {
            setAvatarError(err.message || 'Erro ao enviar foto.');
        }
        finally {
            setIsUploadingAvatar(false);
        }
    };
    const handleRemoveAvatar = async () => {
        if (!confirm('Deseja remover sua fotografia de perfil e retornar ao avatar com iniciais?'))
            return;
        try {
            await removeAvatar();
            setAvatarPreview(null);
            setAvatarFile(null);
            setProfileSuccess('Foto removida com sucesso.');
        }
        catch (err) {
            setAvatarError(err.message || 'Erro ao remover foto.');
        }
    };
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setIsSavingProfile(true);
        setProfileSuccess(null);
        try {
            await updateProfileData(bio, visibility);
            setProfileSuccess('Perfil atualizado com sucesso!');
        }
        catch (err) {
            alert(err.message || 'Erro ao atualizar perfil.');
        }
        finally {
            setIsSavingProfile(false);
        }
    };
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setIsChangingPass(true);
        setPassError(null);
        setPassSuccess(null);
        try {
            await apiRequest('/api/auth/change-password', {
                method: 'POST',
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            setPassSuccess('Senha alterada com sucesso! As demais sessões foram encerradas.');
            setCurrentPassword('');
            setNewPassword('');
        }
        catch (err) {
            setPassError(err.message || 'Erro ao alterar senha.');
        }
        finally {
            setIsChangingPass(false);
        }
    };
    return (_jsx(Modal, { isOpen: isOpen, onClose: onClose, title: "Gerenciamento de Conta e Perfil", description: `Operador @${user.username} • Papel: ${user.role}`, maxWidth: "md", children: _jsxs("div", { className: "space-y-4 text-left", children: [_jsxs("div", { className: "flex border-b border-zinc-800 pb-1 gap-2", children: [_jsx("button", { onClick: () => setTab('profile'), className: `px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${tab === 'profile'
                                ? 'bg-zinc-800 text-white font-semibold'
                                : 'text-zinc-400 hover:text-white'}`, children: "Meu Perfil" }), _jsx("button", { onClick: () => setTab('avatar'), className: `px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${tab === 'avatar'
                                ? 'bg-zinc-800 text-white font-semibold'
                                : 'text-zinc-400 hover:text-white'}`, children: "Fotografia" }), _jsx("button", { onClick: () => setTab('security'), className: `px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${tab === 'security'
                                ? 'bg-zinc-800 text-white font-semibold'
                                : 'text-zinc-400 hover:text-white'}`, children: "Seguran\u00E7a" })] }), profileSuccess && (_jsx("div", { className: "p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-800 text-xs text-emerald-300", children: profileSuccess })), tab === 'profile' && (_jsxs("form", { onSubmit: handleSaveProfile, className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-3 p-3 bg-zinc-950 rounded-xl border border-zinc-800", children: [_jsx(UserAvatar, { username: user.username, avatarUrl: user.avatar_url, size: "lg" }), _jsxs("div", { className: "flex flex-col", children: [_jsxs("span", { className: "text-sm font-bold text-white", children: ["@", user.username] }), _jsxs("span", { className: "text-xs text-zinc-400", children: ["Papel na plataforma: ", user.role] }), _jsxs("span", { className: "text-[11px] text-zinc-500 font-mono", children: ["Membro desde ", new Date(user.created_at).toLocaleDateString('pt-BR')] })] })] }), _jsx(Textarea, { label: "Bio / Apresenta\u00E7\u00E3o (At\u00E9 500 caracteres)", placeholder: "Fale um pouco sobre sua atua\u00E7\u00E3o, especialidades e servi\u00E7os...", value: bio, onChange: (e) => setBio(e.target.value), rows: 3, maxLength: 500 }), _jsx(Select, { label: "Visibilidade do Perfil na Embaixada", value: visibility, onChange: (e) => setVisibility(e.target.value), options: [
                                { value: 'public', label: 'Público (visível a todos)' },
                                { value: 'members_only', label: 'Apenas membros autenticados' },
                                { value: 'private', label: 'Privado (oculto no diretório)' },
                            ] }), _jsx("div", { className: "pt-2 flex justify-end", children: _jsx(Button, { type: "submit", variant: "primary", isLoading: isSavingProfile, children: "Salvar altera\u00E7\u00F5es" }) })] })), tab === 'avatar' && (_jsxs("div", { className: "space-y-4", children: [avatarError && (_jsx("div", { className: "p-2.5 rounded-lg bg-red-950/70 border border-red-800 text-xs text-red-300", children: avatarError })), _jsxs("div", { className: "flex flex-col items-center justify-center p-6 bg-zinc-950 border border-zinc-800 rounded-xl", children: [_jsx("div", { className: "relative mb-3", children: _jsx(UserAvatar, { username: user.username, avatarUrl: avatarPreview || user.avatar_url, size: "xl" }) }), _jsx("div", { className: "text-center text-xs text-zinc-400 max-w-xs mb-4", children: "Envie uma imagem JPEG, PNG ou WebP de at\u00E9 5 MB. Os metadados ser\u00E3o removidos e uma vers\u00E3o otimizada de 512x512 ser\u00E1 gerada." }), _jsxs("div", { className: "flex flex-wrap items-center justify-center gap-2", children: [_jsxs("label", { className: "cursor-pointer", children: [_jsx(Button, { type: "button", variant: "secondary", size: "sm", icon: _jsx(Camera, { className: "w-4 h-4" }), onClick: () => { }, children: "Escolher foto" }), _jsx("input", { type: "file", accept: "image/jpeg,image/png,image/webp", onChange: handleAvatarSelect, className: "hidden" })] }), avatarFile && (_jsx(Button, { type: "button", variant: "primary", size: "sm", isLoading: isUploadingAvatar, onClick: handleUploadAvatar, children: "Confirmar envio" })), user.avatar_url && !avatarFile && (_jsx(Button, { type: "button", variant: "danger", size: "sm", icon: _jsx(Trash2, { className: "w-4 h-4" }), onClick: handleRemoveAvatar, children: "Remover foto" }))] })] })] })), tab === 'security' && (_jsxs("form", { onSubmit: handleChangePassword, className: "space-y-3", children: [passError && (_jsx("div", { className: "p-2.5 rounded-lg bg-red-950/70 border border-red-800 text-xs text-red-300", children: passError })), passSuccess && (_jsx("div", { className: "p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-800 text-xs text-emerald-300", children: passSuccess })), _jsx("div", { className: "p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-400", children: "Como o Zero Control n\u00E3o exige e-mail ou telefone para m\u00E1xima privacidade, a troca de senha exige a confirma\u00E7\u00E3o da senha atual. A altera\u00E7\u00E3o revoga imediatamente todas as outras sess\u00F5es ativas." }), _jsx(Input, { label: "Senha atual", type: "password", placeholder: "Digite sua senha atual", value: currentPassword, onChange: (e) => setCurrentPassword(e.target.value), required: true }), _jsx(Input, { label: "Nova senha (m\u00EDnimo 15 caracteres)", type: "password", placeholder: "Crie uma nova senha de 15 a 128 caracteres", value: newPassword, onChange: (e) => setNewPassword(e.target.value), required: true, minLength: 15, maxLength: 128 }), _jsx("div", { className: "pt-2 flex justify-end", children: _jsx(Button, { type: "submit", variant: "primary", isLoading: isChangingPass, children: "Atualizar senha" }) })] }))] }) }));
}
