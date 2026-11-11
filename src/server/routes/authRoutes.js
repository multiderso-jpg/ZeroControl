import { Router } from 'express';
import { AuthService } from '../services/authService';
import { registerSchema, loginSchema, changePasswordSchema } from '../../shared/validation';
import { requireAuth } from '../middleware/auth';
import { createRateLimiter } from '../middleware/rateLimit';
import { config } from '../config';
const router = Router();
const loginLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // 20 tentativas por IP
    message: 'Muitas tentativas de acesso. Aguarde alguns minutos antes de tentar novamente.',
});
// Registrar conta
router.post('/register', loginLimiter, async (req, res, next) => {
    try {
        const validated = registerSchema.parse(req.body);
        const user = await AuthService.register(validated.username, validated.password);
        // Login automático pós cadastro
        const { sessionToken, expiresAt } = await AuthService.login(validated.username, validated.password);
        res.cookie('zc_session', sessionToken, {
            httpOnly: true,
            secure: config.isProd,
            sameSite: 'lax',
            expires: expiresAt,
            path: '/',
        });
        res.status(201).json({
            user,
            message: 'Conta criada com sucesso!',
        });
    }
    catch (err) {
        next(err);
    }
});
// Login
router.post('/login', loginLimiter, async (req, res, next) => {
    try {
        const validated = loginSchema.parse(req.body);
        const { user, sessionToken, expiresAt } = await AuthService.login(validated.username, validated.password);
        res.cookie('zc_session', sessionToken, {
            httpOnly: true,
            secure: config.isProd,
            sameSite: 'lax',
            expires: expiresAt,
            path: '/',
        });
        res.json({
            user,
            message: 'Login realizado com sucesso.',
        });
    }
    catch (err) {
        next(err);
    }
});
// Obter usuário da sessão atual
router.get('/me', (req, res) => {
    if (!req.user) {
        return res.status(401).json({ user: null });
    }
    res.json({ user: req.user });
});
// Logout
router.post('/logout', async (req, res, next) => {
    try {
        if (req.sessionToken) {
            await AuthService.logout(req.sessionToken);
        }
        res.clearCookie('zc_session', { path: '/' });
        res.json({ message: 'Sessão encerrada com sucesso.' });
    }
    catch (err) {
        next(err);
    }
});
// Troca de senha
router.post('/change-password', requireAuth, async (req, res, next) => {
    try {
        const validated = changePasswordSchema.parse(req.body);
        await AuthService.changePassword(req.user.id, validated.currentPassword, validated.newPassword);
        // Efetua novo login para a sessão atual após revogar as anteriores
        const { sessionToken, expiresAt } = await AuthService.login(req.user.username, validated.newPassword);
        res.cookie('zc_session', sessionToken, {
            httpOnly: true,
            secure: config.isProd,
            sameSite: 'lax',
            expires: expiresAt,
            path: '/',
        });
        res.json({ message: 'Senha atualizada com sucesso. As demais sessões foram revogadas.' });
    }
    catch (err) {
        next(err);
    }
});
export default router;
