import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { config } from './config';
import { csrfMiddleware } from './middleware/csrf';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';
import postRoutes from './routes/postRoutes';
import applicationRoutes from './routes/applicationRoutes';
import councilRoutes from './routes/councilRoutes';
import modulesRoutes from './routes/modulesRoutes';

export function createApp() {
  const app = express();

  // Permite CORS do cliente em desenvolvimento
  app.use(
    cors({
      origin: config.clientOrigin,
      credentials: true,
    })
  );

  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Servir arquivos estáticos de uploads com cache apropriado
  app.use(
    '/uploads',
    express.static(config.uploadDir, {
      maxAge: '1d',
      setHeaders: (res) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
      },
    })
  );

  // Proteção CSRF e identificação de sessão
  app.use(csrfMiddleware);
  app.use(authMiddleware);

  // Rotas da API
  app.use('/api/auth', authRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/posts', postRoutes);
  app.use('/api/applications', applicationRoutes);
  app.use('/api/council', councilRoutes);
  app.use('/api/modules', modulesRoutes);

  // Healthcheck
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'online',
      system: 'Zero Control',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Servir frontend compilado em produção ou se a pasta dist/client existir
  const clientDistPath = path.resolve(process.cwd(), 'dist/client');
  app.use(express.static(clientDistPath));

  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    const indexHtml = path.join(clientDistPath, 'index.html');
    res.sendFile(indexHtml, (err) => {
      if (err) next();
    });
  });

  // Tratamento centralizado de erros
  app.use(errorHandler);

  return app;
}
