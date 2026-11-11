import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input, Button } from '../components/UI';
import { Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
export function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/guilda';
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage(null);
        try {
            await login(username, password);
            navigate(from, { replace: true });
        }
        catch (err) {
            setErrorMessage(err.message || 'Usuário ou senha incorretos.');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4 selection:bg-zinc-800", children: _jsxs("div", { className: "w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-left", children: [_jsxs("div", { className: "flex items-center gap-2.5 mb-6", children: [_jsx("div", { className: "w-8 h-8 rounded bg-zinc-100 flex items-center justify-center text-zinc-950 font-mono font-black text-base", children: "0" }), _jsxs("div", { children: [_jsx("h1", { className: "text-lg font-bold tracking-tight text-white", children: "Zero Control" }), _jsx("p", { className: "text-xs text-zinc-400", children: "Acesso \u00E0 Guilda e Vertentes Operacionais" })] })] }), errorMessage && (_jsx("div", { className: "mb-4 p-3 rounded-lg bg-red-950/70 border border-red-800 text-xs text-red-300", children: errorMessage })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsx(Input, { label: "Usu\u00E1rio", placeholder: "Digite seu nome de usu\u00E1rio", value: username, onChange: (e) => setUsername(e.target.value), autoComplete: "username", required: true }), _jsx(Input, { label: "Senha", type: showPassword ? 'text' : 'password', placeholder: "Digite sua senha de acesso", value: password, onChange: (e) => setPassword(e.target.value), autoComplete: "current-password", required: true, rightElement: _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "p-1 text-zinc-400 hover:text-zinc-200 cursor-pointer", "aria-label": showPassword ? 'Ocultar senha' : 'Exibir senha', children: showPassword ? _jsx(EyeOff, { className: "w-4 h-4" }) : _jsx(Eye, { className: "w-4 h-4" }) }) }), _jsx(Button, { type: "submit", variant: "primary", size: "lg", isLoading: isLoading, className: "w-full mt-2", children: "Entrar na Guilda" })] }), _jsxs("div", { className: "mt-6 pt-6 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400", children: [_jsx("span", { children: "Ainda n\u00E3o possui conta?" }), _jsxs(Link, { to: "/cadastro", className: "font-medium text-white hover:underline flex items-center gap-1", children: ["Cadastrar-se ", _jsx(ArrowRight, { className: "w-3.5 h-3.5" })] })] }), _jsxs("div", { className: "mt-4 p-3 bg-zinc-950/60 border border-zinc-800/60 rounded-xl text-[11px] text-zinc-500 leading-relaxed", children: [_jsx(ShieldCheck, { className: "w-3.5 h-3.5 inline mr-1 text-zinc-400" }), "O Zero Control n\u00E3o armazena e-mails ou n\u00FAmeros de telefone para sua m\u00E1xima privacidade. Mantenha sua senha em seguran\u00E7a."] })] }) }));
}
