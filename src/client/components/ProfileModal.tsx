import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button, Input, Textarea, Select } from './UI';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from './UserAvatar';
import { apiRequest } from '../lib/api';
import { Camera, Trash2, KeyRound, User as UserIcon, ZoomIn, ZoomOut, Check, X } from 'lucide-react';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // Redesenhar canvas sempre que a imagem ou a escala mudar
  useEffect(() => {
    if (!loadedImage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const nw = loadedImage.naturalWidth;
    const nh = loadedImage.naturalHeight;
    const baseScale = Math.max(canvas.width / nw, canvas.height / nh);
    const finalScale = baseScale * scale;
    const drawW = nw * finalScale;
    const drawH = nh * finalScale;
    const drawX = (canvas.width - drawW) / 2;
    const drawY = (canvas.height - drawH) / 2;

    ctx.drawImage(loadedImage, drawX, drawY, drawW, drawH);
  }, [loadedImage, scale]);

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
    if (file.size > 15 * 1024 * 1024) {
      setAvatarError('A fotografia original deve ter no máximo 15 MB.');
      return;
    }

    setAvatarError(null);
    setAvatarFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setLoadedImage(img);
        setScale(1);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    // Limpar o valor do input para permitir selecionar o mesmo arquivo novamente
    e.target.value = '';
  };

  const handleUploadAvatar = async () => {
    if (!canvasRef.current) return;
    setIsUploadingAvatar(true);
    setAvatarError(null);

    canvasRef.current.toBlob(async (blob) => {
      if (!blob) {
        setIsUploadingAvatar(false);
        setAvatarError('Erro ao processar imagem.');
        return;
      }
      try {
        const fileToUpload = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
        await uploadAvatar(fileToUpload);
        setLoadedImage(null);
        setAvatarFile(null);
        setProfileSuccess('Fotografia de avatar atualizada com sucesso!');
      } catch (err: any) {
        setAvatarError(err.message || 'Erro ao enviar foto.');
      } finally {
        setIsUploadingAvatar(false);
      }
    }, 'image/jpeg', 0.9);
  };

  const handleCancelCrop = () => {
    setLoadedImage(null);
    setAvatarFile(null);
    setAvatarError(null);
  };

  const handleRemoveAvatar = async () => {
    if (!confirm('Deseja remover sua fotografia de perfil e retornar ao avatar com iniciais?'))
      return;
    try {
      await removeAvatar();
      setLoadedImage(null);
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

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarSelect}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center p-6 bg-zinc-950 border border-zinc-800 rounded-xl">
              {loadedImage ? (
                <div className="flex flex-col items-center w-full">
                  <div className="relative mb-3 flex items-center justify-center">
                    <canvas
                      ref={canvasRef}
                      width={512}
                      height={512}
                      className="w-44 h-44 rounded-full border-2 border-zinc-100 shadow-2xl bg-black"
                    />
                  </div>

                  <div className="w-full max-w-xs space-y-1.5 mb-5 bg-zinc-900/90 p-3 rounded-lg border border-zinc-800">
                    <div className="flex justify-between text-xs text-zinc-200 font-medium">
                      <span>Ajustar Escala / Zoom</span>
                      <span className="font-mono text-zinc-400">{Math.round(scale * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ZoomOut className="w-4 h-4 text-zinc-400" />
                      <input
                        type="range"
                        min="0.5"
                        max="3.0"
                        step="0.05"
                        value={scale}
                        onChange={(e) => setScale(parseFloat(e.target.value))}
                        className="w-full accent-white cursor-pointer h-1.5 bg-zinc-700 rounded-lg"
                      />
                      <ZoomIn className="w-4 h-4 text-zinc-400" />
                    </div>
                    <p className="text-[10px] text-zinc-400 text-center pt-1">
                      Arraste para ampliar ou reduzir e enquadrar perfeitamente seu avatar.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      isLoading={isUploadingAvatar}
                      icon={<Check className="w-4 h-4" />}
                      onClick={handleUploadAvatar}
                    >
                      Salvar foto recortada
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      icon={<X className="w-4 h-4" />}
                      onClick={handleCancelCrop}
                      disabled={isUploadingAvatar}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative mb-3">
                    <UserAvatar
                      username={user.username}
                      avatarUrl={user.avatar_url}
                      size="xl"
                    />
                  </div>

                  <div className="text-center text-xs text-zinc-400 max-w-xs mb-4">
                    Envie uma fotografia em JPEG, PNG ou WebP. Você poderá ajustar o tamanho e enquadramento antes de salvar.
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      icon={<Camera className="w-4 h-4" />}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Escolher foto
                    </Button>

                    {user.avatar_url && (
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
                </>
              )}
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
