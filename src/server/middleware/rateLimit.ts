import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export function createRateLimiter(options: { windowMs: number; max: number; message: string }) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Em testes unitários, não bloqueia
    if (process.env.NODE_ENV === 'test') return next();

    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${req.path}:${ip}`;
    const now = Date.now();

    const record = rateLimitStore.get(key);
    if (!record || now > record.resetAt) {
      rateLimitStore.set(key, { count: 1, resetAt: now + options.windowMs });
      return next();
    }

    if (record.count >= options.max) {
      const waitSeconds = Math.ceil((record.resetAt - now) / 1000);
      return res.status(429).json({
        error: options.message,
        retryAfter: waitSeconds,
      });
    }

    record.count++;
    next();
  };
}
