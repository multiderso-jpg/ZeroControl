import { jsx as _jsx } from "react/jsx-runtime";
export function UserAvatar({ username = 'U', avatarUrl, size = 'md', className = '', }) {
    const sizeClasses = {
        xs: 'w-6 h-6 text-[10px]',
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm font-semibold',
        lg: 'w-16 h-16 text-lg font-bold',
        xl: 'w-24 h-24 text-2xl font-bold',
    };
    const getInitials = (name) => {
        if (!name)
            return 'ZC';
        const parts = name.trim().split(/[\s._-]+/);
        if (parts.length === 1) {
            return parts[0].substring(0, 2).toUpperCase();
        }
        return (parts[0][0] + parts[1][0]).toUpperCase();
    };
    if (avatarUrl) {
        return (_jsx("img", { src: avatarUrl, alt: `Avatar de ${username}`, className: `rounded-full object-cover border border-zinc-700 bg-zinc-800 ${sizeClasses[size]} ${className}`, onError: (e) => {
                // Em caso de falha de carregamento, oculta a tag de imagem quebrada para mostrar o fallback
                e.target.style.display = 'none';
            } }));
    }
    return (_jsx("div", { "aria-label": `Avatar de ${username}`, className: `rounded-full flex items-center justify-center bg-zinc-800 border border-zinc-700 text-zinc-200 select-none ${sizeClasses[size]} ${className}`, children: getInitials(username) }));
}
