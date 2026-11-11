import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input, Button } from '../components/UI';
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
export function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const { register } = useAuth();
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage(null);
        try {
            await register(username, password);
            navigate('/guilda', { replace: true });
        }
        catch (err) {
            if (err.details && err.details.length > 0) {
                setErrorMessage(err.details[0].message);
            }
            else {
                setErrorMessage(err.message || 'Erro ao realizar cadastro.');
            }
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4 selection:bg-zinc-800", children: _jsxs("div", { className: "w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-left", children: [_jsxs("div", { className: "flex items-center gap-2.5 mb-6", children: [_jsx("div", { className: "w-8 h-8 rounded bg-zinc-100 flex items-center justify-center text-zinc-950 font-mono font-black text-base", children: "0" }), _jsxs("div", { children: [_jsx("h1", { className: "text-lg font-bold tracking-tight text-white", children: "Criar Conta Zero Control" }), _jsx("p", { className: "text-xs text-zinc-400", children: "Cadastro r\u00E1pido com apenas Usu\u00E1rio e Senha" })] })] }), errorMessage && (_jsx("div", { className: "mb-4 p-3 rounded-lg bg-red-950/70 border border-red-800 text-xs text-red-300", children: errorMessage })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsx(Input, { label: "Nome de Usu\u00E1rio (3 a 30 caracteres)", placeholder: "Ex: operador_phantom", value: username, onChange: (e) => setUsername(e.target.value), helperText: "Apenas letras, n\u00FAmeros, ponto, h\u00EDfen e sublinhado.", autoComplete: "username", required: true, minLength: 3, maxLength: 30 }), _jsx(Input, { label: "Senha (m\u00EDnimo 15 caracteres)", type: showPassword ? 'text' : 'password', placeholder: "Crie uma senha longa e segura", value: password, onChange: (e) => setPassword(e.target.value), helperText: "Permitido colar e usar gerenciadores de senha. Sem exig\u00EAncias artificiais.", autoComplete: "new-password", required: true, minLength: 15, maxLength: 128, rightElement: _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "p-1 text-zinc-400 hover:text-zinc-200 cursor-pointer", "aria-label": showPassword ? 'Ocultar senha' : 'Exibir senha', children: showPassword ? _jsx(EyeOff, { className: "w-4 h-4" }) : _jsx(Eye, { className: "w-4 h-4" }) }) }), _jsx(Button, { type: "submit", variant: "primary", size: "lg", isLoading: isLoading, className: "w-full mt-2", children: "Cadastrar e Entrar na Guilda" })] }), _jsxs("div", { className: "mt-6 pt-6 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400", children: [_jsx("span", { children: "J\u00E1 possui uma conta?" }), _jsxs(Link, { to: "/login", className: "font-medium text-white hover:underline flex items-center gap-1", children: ["Acessar conta ", _jsx(ArrowRight, { className: "w-3.5 h-3.5" })] })] }), _jsxs("div", { className: "mt-4 p-3 bg-zinc-950/60 border border-zinc-800/60 rounded-xl text-[11px] text-zinc-400 leading-relaxed space-y-1", children: [_jsxs("div", { className: "flex items-center gap-1.5 font-semibold text-zinc-300", children: [_jsx(CheckCircle2, { className: "w-3.5 h-3.5 text-emerald-400" }), "Privacidade por Design (V1)"] }), _jsx("p", { className: "text-zinc-500", children: "N\u00E3o exigimos nome completo, e-mail, telefone ou CPF. N\u00E3o h\u00E1 recupera\u00E7\u00E3o de senha por terceiros. Guarde sua senha com aten\u00E7\u00E3o." })] })] }) }));
}
