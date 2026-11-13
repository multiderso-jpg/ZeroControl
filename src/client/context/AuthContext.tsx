import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SafeUser, UserProfile } from '../../shared/types';
import { apiRequest } from '../lib/api';

interface AuthContextType {
  user: SafeUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  removeAvatar: () => Promise<void>;
  updateProfileData: (bio?: string | null, visibility?: 'public' | 'members_only' | 'private') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      const data = await apiRequest<{ profile: UserProfile }>('/api/profile');
      setProfile(data.profile);
    } catch {
      setProfile(null);
    }
  };

  const checkAuth = async () => {
    try {
      const data = await apiRequest<{ user: SafeUser | null }>('/api/auth/me');
      if (data.user) {
        setUser(data.user);
        await refreshProfile();
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch {
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const data = await apiRequest<{ user: SafeUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setUser(data.user);
    await refreshProfile();
  };

  const register = async (username: string, password: string) => {
    const data = await apiRequest<{ user: SafeUser }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setUser(data.user);
    await refreshProfile();
  };

  const logout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      setProfile(null);
    }
  };

  const uploadAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const res = await apiRequest<{ avatar_url: string }>('/api/profile/avatar', {
      method: 'POST',
      body: formData,
    });

    if (user) {
      setUser({ ...user, avatar_url: res.avatar_url });
    }
    await refreshProfile();
  };

  const removeAvatar = async () => {
    await apiRequest('/api/profile/avatar', { method: 'DELETE' });
    if (user) {
      setUser({ ...user, avatar_url: null });
    }
    await refreshProfile();
  };

  const updateProfileData = async (
    bio?: string | null,
    visibility?: 'public' | 'members_only' | 'private'
  ) => {
    const res = await apiRequest<{ profile: UserProfile }>('/api/profile', {
      method: 'PATCH',
      body: JSON.stringify({ bio, visibility }),
    });
    setProfile(res.profile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
        uploadAvatar,
        removeAvatar,
        updateProfileData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider.');
  }
  return context;
}
