import path from 'path';

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL || '',
  pgliteDir: process.env.PGLITE_DIR || path.resolve(process.cwd(), 'data/pglite'),
  sessionSecret: process.env.SESSION_SECRET || 'zerocontrol_secret_key_session_must_be_random_in_prod',
  csrfSecret: process.env.CSRF_SECRET || 'zerocontrol_csrf_token_secret_32bytes_value',
  uploadDir: path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads'),
  avatarUploadDir: path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads', 'avatars'),
  postUploadDir: path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads', 'posts'),
  sessionDurationDays: 30,
  maxAvatarSizeBytes: 5 * 1024 * 1024, // 5 MB
  maxPostImageSizeBytes: 8 * 1024 * 1024, // 8 MB
  maxImageDimension: 4096,
  maxMegapixels: 20,
};
