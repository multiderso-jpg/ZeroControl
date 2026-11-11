import React, { useState } from 'react';
import { Modal, Button, Input, Textarea, Select } from './UI';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from './UserAvatar';
import { apiRequest } from '../api/client';
import { Camera, Trash2, KeyRound, User as UserIcon } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'profile' | 'avatar' | 'security';
}

export function ProfileModal({
  isOpen,
  onClose,
  defaultTab = 'profile',
}: ProfileModalProps) {
  const { user, profile, uploadAvatar, removeAvatar, updateProfileData } = useAuth();
  const [tab, setTab] = useState<'profile' | 'avatar' | 'security'>(defaultTab);

  // Bio e Visibilidade
  const [bio, setBio] = useState(profile?.bio || '');
  const [visibility, setVisibility] = useState<'public' | 'members_only' | 'private'>(
    profile?.visibility || 'public'
  );
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  // Avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // Segurança (Senha)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  if (!user) return null;

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
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
    if (!avatarFile) return;
    setIsUploadingAvatar(true);
    setAvatarError(null);
    try {
      await uploadAvatar(avatarFile);
      setAvatarFile(null);
      setAvatarPreview(null);
      setProfileSuccess('Fotografia de avatar atualizada com sucesso!');
    } catch (err: any) {
      setAvatarError(err.message || 'Erro ao enviar foto.');
    } finally {
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
    } catch (err: any) {
      setAvatarError(err.message || 'Erro ao remover foto.');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccess(null);
    try {
      await updateProfileData(bio, visibility);
      setProfileSuccess('Perfil atualizado com sucesso!');
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar perfil.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      setPassError(err.message || 'Erro ao alterar senha.');
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gerenciamento de Conta e Perfil"
      description={`Operador @${user.username} • Papel: ${user.role}`}
      maxWidth="md"
    >
      <div className="space-y-4 text-left">
        {/* Abas */}
        <div className="flex border-b border-zinc-800 pb-1 gap-2">
          <button
            onClick={() => setTab('profile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              tab === 'profile'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Meu Perfil
          </button>
          <button
            onClick={() => setTab('avatar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              tab === 'avatar'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Fotografia
          </button>
          <button
            onClick={() => setTab('security')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              tab === 'security'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Segurança
          </button>
        </div>

        {profileSuccess && (
          <div className="p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-800 text-xs text-emerald-300">
            {profileSuccess}
          </div>
        )}

        {/* ABA: PERFIL */}
        {tab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-zinc-950 rounded-xl border border-zinc-800">
              <UserAvatar
                username={user.username}
                avatarUrl={user.avatar_url}
                size="lg"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">@{user.username}</span>
                <span className="text-xs text-zinc-400">Papel na plataforma: {user.role}</span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  Membro desde {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>

            <Textarea
              label="Bio / Apresentação (Até 500 caracteres)"
              placeholder="Fale um pouco sobre sua atuação, especialidades e serviços..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={500}
            />

            <Select
              label="Visibilidade do Perfil na Embaixada"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as any)}
              options={[
                { value: 'public', label: 'Público (visível a todos)' },
                { value: 'members_only', label: 'Apenas membros autenticados' },
                { value: 'private', label: 'Privado (oculto no diretório)' },
              ]}
            />

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" isLoading={isSavingProfile}>
                Salvar alterações
              </Button>
            </div>
          </form>
        )}

        {/* ABA: AVATAR / FOTO */}
        {tab === 'avatar' && (
          <div className="space-y-4">
            {avatarError && (
              <div className="p-2.5 rounded-lg bg-red-950/70 border border-red-800 text-xs text-red-300">
                {avatarError}
              </div>
            )}

            <div className="flex flex-col items-center justify-center p-6 bg-zinc-950 border border-zinc-800 rounded-xl">
              <div className="relative mb-3">
                <UserAvatar
                  username={user.username}
                  avatarUrl={avatarPreview || user.avatar_url}
                  size="xl"
                />
              </div>

              <div className="text-center text-xs text-zinc-400 max-w-xs mb-4">
                Envie uma imagem JPEG, PNG ou WebP de até 5 MB. Os metadados serão removidos e uma versão otimizada de 512x512 será gerada.
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <label className="cursor-pointer">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={<Camera className="w-4 h-4" />}
                    onClick={() => {}}
                  >
                    Escolher foto
                  </Button>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarSelect}
                    className="hidden"
                  />
                </label>

                {avatarFile && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    isLoading={isUploadingAvatar}
                    onClick={handleUploadAvatar}
                  >
                    Confirmar envio
                  </Button>
                )}

                {user.avatar_url && !avatarFile && (
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    icon={<Trash2 className="w-4 h-4" />}
                    onClick={handleRemoveAvatar}
                  >
                    Remover foto
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ABA: SEGURANÇA / SENHA */}
        {tab === 'security' && (
          <form onSubmit={handleChangePassword} className="space-y-3">
            {passError && (
              <div className="p-2.5 rounded-lg bg-red-950/70 border border-red-800 text-xs text-red-300">
                {passError}
              </div>
            )}
            {passSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-800 text-xs text-emerald-300">
                {passSuccess}
              </div>
            )}

            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-400">
              Como o Zero Control não exige e-mail ou telefone para máxima privacidade, a troca de senha exige a confirmação da senha atual. A alteração revoga imediatamente todas as outras sessões ativas.
            </div>

            <Input
              label="Senha atual"
              type="password"
              placeholder="Digite sua senha atual"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />

            <Input
              label="Nova senha (mínimo 15 caracteres)"
              type="password"
              placeholder="Crie uma nova senha de 15 a 128 caracteres"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={15}
              maxLength={128}
            />

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" isLoading={isChangingPass}>
                Atualizar senha
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
