import { Router } from 'express';
import multer from 'multer';
import { AuthService } from '../services/authService';
import { ImageService } from '../services/imageService';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';
import { updateProfileSchema } from '../../shared/validation';
import { config } from '../config';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.maxAvatarSizeBytes, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens JPEG, PNG ou WebP são permitidas.'));
    }
  },
});

router.use(requireAuth);

// Obter perfil
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const profile = await AuthService.getProfile(req.user!.id);
    res.json({ profile });
  } catch (err) {
    next(err);
  }
});

// Atualizar informações do perfil
router.patch('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const validated = updateProfileSchema.parse(req.body);
    const updated = await AuthService.updateProfile(req.user!.id, validated);
    res.json({ profile: updated });
  } catch (err) {
    next(err);
  }
});

// Upload de fotografia de avatar
router.post('/avatar', upload.single('avatar'), async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    const result = await ImageService.processAvatar(req.file.buffer, req.user!.id);
    res.json({
      message: 'Fotografia de avatar atualizada com sucesso!',
      avatar_url: result.relativeUrl,
    });
  } catch (err) {
    next(err);
  }
});

// Remover fotografia de avatar
router.delete('/avatar', async (req: AuthenticatedRequest, res, next) => {
  try {
    await ImageService.removeAvatar(req.user!.id);
    res.json({ message: 'Fotografia de avatar removida. Retornado ao avatar com iniciais.' });
  } catch (err) {
    next(err);
  }
});

export default router;
