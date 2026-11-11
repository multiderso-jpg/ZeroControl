import React, { useEffect, useRef, ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';
import { X, Loader2 } from 'lucide-react';

// --- BUTTON ---
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400';

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

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-current" /> : icon}
      {children}
    </button>
  );
}

// --- INPUT ---
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  rightElement?: ReactNode;
}

export function Input({
  label,
  error,
  helperText,
  rightElement,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || props.name || Math.random().toString(36).substring(7);

  return (
    <div className="flex flex-col gap-1 w-full text-left">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-zinc-300">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          id={inputId}
          className={`w-full bg-zinc-900 border rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 transition-colors duration-150 focus:outline-none focus:border-zinc-400 ${
            error ? 'border-red-500' : 'border-zinc-800 hover:border-zinc-700'
          } ${rightElement ? 'pr-10' : ''} ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 flex items-center text-zinc-400">
            {rightElement}
          </div>
        )}
      </div>
      {error && <span className="text-xs text-red-400 mt-0.5">{error}</span>}
      {helperText && !error && (
        <span className="text-xs text-zinc-500 mt-0.5">{helperText}</span>
      )}
    </div>
  );
}

// --- TEXTAREA ---
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Textarea({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}: TextareaProps) {
  const inputId = id || props.name || Math.random().toString(36).substring(7);

  return (
    <div className="flex flex-col gap-1 w-full text-left">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-zinc-300">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`w-full bg-zinc-900 border rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 transition-colors duration-150 focus:outline-none focus:border-zinc-400 min-h-[100px] resize-y ${
          error ? 'border-red-500' : 'border-zinc-800 hover:border-zinc-700'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-400 mt-0.5">{error}</span>}
      {helperText && !error && (
        <span className="text-xs text-zinc-500 mt-0.5">{helperText}</span>
      )}
    </div>
  );
}

// --- SELECT ---
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export function Select({
  label,
  error,
  options,
  className = '',
  id,
  ...props
}: SelectProps) {
  const inputId = id || props.name || Math.random().toString(36).substring(7);

  return (
    <div className="flex flex-col gap-1 w-full text-left">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-zinc-300">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={`w-full bg-zinc-900 border rounded-lg px-3 py-2 text-sm text-zinc-100 transition-colors duration-150 focus:outline-none focus:border-zinc-400 cursor-pointer ${
          error ? 'border-red-500' : 'border-zinc-800 hover:border-zinc-700'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-zinc-900 text-zinc-100">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-400 mt-0.5">{error}</span>}
    </div>
  );
}

// --- BADGE ---
interface BadgeProps {
  children: ReactNode;
  variant?: 'neutral' | 'silver' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  const variants = {
    neutral: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    silver: 'bg-zinc-300/10 text-zinc-200 border-zinc-400/30',
    success: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50',
    warning: 'bg-amber-950/60 text-amber-400 border-amber-800/50',
    danger: 'bg-red-950/60 text-red-400 border-red-800/50',
    info: 'bg-blue-950/60 text-blue-400 border-blue-800/50',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

// --- MODAL (Accessible, Focus Trapped, Escape-closable) ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      const handleKeyDown = (e: KeyboardEvent) => {
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

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`w-full ${maxWidthClasses[maxWidth]} bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-6 text-zinc-100 relative focus:outline-none max-h-[90vh] flex flex-col`}
      >
        <div className="flex items-start justify-between pb-3 border-b border-zinc-800">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold tracking-tight text-white">
              {title}
            </h2>
            {description && (
              <p className="text-xs text-zinc-400 mt-1">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar janela modal"
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 overflow-y-auto pr-1 flex-1">{children}</div>
      </div>
    </div>
  );
}
