import crypto from 'crypto';
export function csrfMiddleware(req, res, next) {
    // Gera token CSRF se não existir
    let csrfToken = req.cookies?.zc_csrf;
    if (!csrfToken) {
        csrfToken = crypto.randomBytes(24).toString('hex');
        res.cookie('zc_csrf', csrfToken, {
            httpOnly: false, // O cliente JavaScript precisa ler este cookie para enviar no header X-CSRF-Token
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
        });
    }
    // Métodos que não alteram estado são liberados
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }
    // Se for teste ou rota que dispensar explicitamente
    if (process.env.NODE_ENV === 'test' && !req.headers['x-csrf-token'] && !req.cookies?.zc_csrf) {
        return next();
    }
    const clientToken = req.headers['x-csrf-token'] || req.body?._csrf;
    if (!clientToken || clientToken !== csrfToken) {
        return res.status(403).json({
            error: 'Token CSRF inválido ou ausente. Recarregue a página e tente novamente.',
        });
    }
    next();
}
