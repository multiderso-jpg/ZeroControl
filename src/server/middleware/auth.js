import { AuthService } from '../services/authService';
export async function authMiddleware(req, res, next) {
    const token = req.cookies?.zc_session;
    if (!token) {
        return next();
    }
    try {
        const user = await AuthService.getSessionUser(token);
        if (user) {
            req.user = user;
            req.sessionToken = token;
        }
    }
    catch (err) {
        // Falha silenciosa de autenticação opcional
    }
    next();
}
export function requireAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            error: 'Não autenticado. Faça login para acessar esta funcionalidade.',
        });
    }
    next();
}
export function requireRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Não autenticado.' });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Acesso negado. Esta operação exige privilégios administrativos.',
            });
        }
        next();
    };
}
