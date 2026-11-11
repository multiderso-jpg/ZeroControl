import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const refreshProfile = async () => {
        try {
            const data = await apiRequest('/api/profile');
            setProfile(data.profile);
        }
        catch {
            setProfile(null);
        }
    };
    const checkAuth = async () => {
        try {
            const data = await apiRequest('/api/auth/me');
            if (data.user) {
                setUser(data.user);
                await refreshProfile();
            }
            else {
                setUser(null);
                setProfile(null);
            }
        }
        catch {
            setUser(null);
            setProfile(null);
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        checkAuth();
    }, []);
    const login = async (username, password) => {
        const data = await apiRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
        setUser(data.user);
        await refreshProfile();
    };
    const register = async (username, password) => {
        const data = await apiRequest('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
        setUser(data.user);
        await refreshProfile();
    };
    const logout = async () => {
        try {
            await apiRequest('/api/auth/logout', { method: 'POST' });
        }
        finally {
            setUser(null);
            setProfile(null);
        }
    };
    const uploadAvatar = async (file) => {
        const formData = new FormData();
        formData.append('avatar', file);
        const res = await apiRequest('/api/profile/avatar', {
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
    const updateProfileData = async (bio, visibility) => {
        const res = await apiRequest('/api/profile', {
            method: 'PATCH',
            body: JSON.stringify({ bio, visibility }),
        });
        setProfile(res.profile);
    };
    return (_jsx(AuthContext.Provider, { value: {
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
        }, children: children }));
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser utilizado dentro de um AuthProvider.');
    }
    return context;
}
