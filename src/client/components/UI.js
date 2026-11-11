import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { X, Loader2 } from 'lucide-react';
export function Button({ children, variant = 'primary', size = 'md', isLoading = false, icon, className = '', disabled, ...props }) {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400';
    const sizeStyles = {
        sm: 'text-xs px-2.5 py-1.5 gap-1.5',
        md: 'text-sm px-4 py-2 gap-2',
        lg: 'text-base px-5 py-2.5 gap-2.5',
    };
    const variantStyles = {
        primary: 'bg-zinc-100 text-zinc-950 hover:bg-white active:bg-zinc-200 font-semibold shadow-sm',
        secondary: 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 active:bg-zinc-750 border border-zinc-700',
        outline: 'border border-zinc-700 text-zinc-200 hover:bg-zinc-800/60 active:bg-zinc-800',
        danger: 'bg-red-950 text-red-200 border border-red-800 hover:bg-red-900 active:bg-red-900/80',
        ghost: 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50',
    };
    return (_jsxs("button", { className: `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`, disabled: disabled || isLoading, ...props, children: [isLoading ? _jsx(Loader2, { className: "w-4 h-4 animate-spin text-current" }) : icon, children] }));
}
export function Input({ label, error, helperText, rightElement, className = '', id, ...props }) {
    const inputId = id || props.name || Math.random().toString(36).substring(7);
    return (_jsxs("div", { className: "flex flex-col gap-1 w-full text-left", children: [label && (_jsx("label", { htmlFor: inputId, className: "text-xs font-medium text-zinc-300", children: label })), _jsxs("div", { className: "relative flex items-center", children: [_jsx("input", { id: inputId, className: `w-full bg-zinc-900 border rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 transition-colors duration-150 focus:outline-none focus:border-zinc-400 ${error ? 'border-red-500' : 'border-zinc-800 hover:border-zinc-700'} ${rightElement ? 'pr-10' : ''} ${className}`, ...props }), rightElement && (_jsx("div", { className: "absolute right-3 flex items-center text-zinc-400", children: rightElement }))] }), error && _jsx("span", { className: "text-xs text-red-400 mt-0.5", children: error }), helperText && !error && (_jsx("span", { className: "text-xs text-zinc-500 mt-0.5", children: helperText }))] }));
}
export function Textarea({ label, error, helperText, className = '', id, ...props }) {
    const inputId = id || props.name || Math.random().toString(36).substring(7);
    return (_jsxs("div", { className: "flex flex-col gap-1 w-full text-left", children: [label && (_jsx("label", { htmlFor: inputId, className: "text-xs font-medium text-zinc-300", children: label })), _jsx("textarea", { id: inputId, className: `w-full bg-zinc-900 border rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 transition-colors duration-150 focus:outline-none focus:border-zinc-400 min-h-[100px] resize-y ${error ? 'border-red-500' : 'border-zinc-800 hover:border-zinc-700'} ${className}`, ...props }), error && _jsx("span", { className: "text-xs text-red-400 mt-0.5", children: error }), helperText && !error && (_jsx("span", { className: "text-xs text-zinc-500 mt-0.5", children: helperText }))] }));
}
export function Select({ label, error, options, className = '', id, ...props }) {
    const inputId = id || props.name || Math.random().toString(36).substring(7);
    return (_jsxs("div", { className: "flex flex-col gap-1 w-full text-left", children: [label && (_jsx("label", { htmlFor: inputId, className: "text-xs font-medium text-zinc-300", children: label })), _jsx("select", { id: inputId, className: `w-full bg-zinc-900 border rounded-lg px-3 py-2 text-sm text-zinc-100 transition-colors duration-150 focus:outline-none focus:border-zinc-400 cursor-pointer ${error ? 'border-red-500' : 'border-zinc-800 hover:border-zinc-700'} ${className}`, ...props, children: options.map((opt) => (_jsx("option", { value: opt.value, className: "bg-zinc-900 text-zinc-100", children: opt.label }, opt.value))) }), error && _jsx("span", { className: "text-xs text-red-400 mt-0.5", children: error })] }));
}
export function Badge({ children, variant = 'neutral', className = '' }) {
    const variants = {
        neutral: 'bg-zinc-800 text-zinc-300 border-zinc-700',
        silver: 'bg-zinc-300/10 text-zinc-200 border-zinc-400/30',
        success: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50',
        warning: 'bg-amber-950/60 text-amber-400 border-amber-800/50',
        danger: 'bg-red-950/60 text-red-400 border-red-800/50',
        info: 'bg-blue-950/60 text-blue-400 border-blue-800/50',
    };
    return (_jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${variants[variant]} ${className}`, children: children }));
}
export function Modal({ isOpen, onClose, title, description, children, maxWidth = 'lg', }) {
    const modalRef = useRef(null);
    const previousFocusRef = useRef(null);
    useEffect(() => {
        if (isOpen) {
            previousFocusRef.current = document.activeElement;
            const handleKeyDown = (e) => {
                if (e.key === 'Escape') {
                    onClose();
                }
            };
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
            // Foca o modal
            setTimeout(() => {
                modalRef.current?.focus();
            }, 50);
            return () => {
                document.removeEventListener('keydown', handleKeyDown);
                document.body.style.overflow = '';
                previousFocusRef.current?.focus();
            };
        }
    }, [isOpen, onClose]);
    if (!isOpen)
        return null;
    const maxWidthClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '4xl': 'max-w-4xl',
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-sm animate-in fade-in duration-150", role: "dialog", "aria-modal": "true", "aria-labelledby": "modal-title", onClick: (e) => {
            if (e.target === e.currentTarget)
                onClose();
        }, children: _jsxs("div", { ref: modalRef, tabIndex: -1, className: `w-full ${maxWidthClasses[maxWidth]} bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-6 text-zinc-100 relative focus:outline-none max-h-[90vh] flex flex-col`, children: [_jsxs("div", { className: "flex items-start justify-between pb-3 border-b border-zinc-800", children: [_jsxs("div", { children: [_jsx("h2", { id: "modal-title", className: "text-lg font-semibold tracking-tight text-white", children: title }), description && (_jsx("p", { className: "text-xs text-zinc-400 mt-1", children: description }))] }), _jsx("button", { onClick: onClose, "aria-label": "Fechar janela modal", className: "p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsx("div", { className: "mt-4 overflow-y-auto pr-1 flex-1", children: children })] }) }));
}
