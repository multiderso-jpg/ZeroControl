import { Router } from 'express';
import multer from 'multer';
import { PostService } from '../services/postService';
import { ImageService } from '../services/imageService';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';
import { createPostSchema } from '../../shared/validation';
import { config } from '../config';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.maxPostImageSizeBytes, // 8MB
  },
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens JPEG, PNG ou WebP são permitidas.'));
    }
  },
});

// Listar publicações (Mural da Guilda com filtros e paginação)
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const {
      search,
      intention,
      opportunity_type_slug,
      service_category_slug,
      modality,
      city,
      state,
      min_cents,
      max_cents,
      status,
      sort,
      page,
      limit,
    } = req.query;

    const result = await PostService.listPosts({
      search: typeof search === 'string' ? search : undefined,
      intention: typeof intention === 'string' ? intention : undefined,
      opportunity_type_slug: typeof opportunity_type_slug === 'string' ? opportunity_type_slug : undefined,
      service_category_slug: typeof service_category_slug === 'string' ? service_category_slug : undefined,
      modality: typeof modality === 'string' ? modality : undefined,
      city: typeof city === 'string' ? city : undefined,
      state: typeof state === 'string' ? state : undefined,
      min_cents: min_cents ? parseInt(min_cents as string, 10) : undefined,
      max_cents: max_cents ? parseInt(max_cents as string, 10) : undefined,
      status: typeof status === 'string' ? status : undefined,
      sort: sort === 'deadline' ? 'deadline' : 'recent',
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 12,
      currentUserId: req.user?.id,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Minhas publicações
router.get('/user/my-posts', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const result = await PostService.listPosts({
      author_id: req.user!.id,
      currentUserId: req.user!.id,
      limit: 100,
    });
    res.json({ posts: result.posts });
  } catch (err) {
    next(err);
  }
});

// Publicações salvas / favoritas
router.get('/user/saved', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const posts = await PostService.listSavedPosts(req.user!.id);
    res.json({ posts });
  } catch (err) {
    next(err);
  }
});

// Obter detalhes de uma publicação
router.get('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const postId = req.params.id as string;
    const post = await PostService.getPostById(postId, req.user?.id);
    if (!post) {
      return res.status(404).json({ error: 'Publicação não encontrada.' });
    }
    res.json({ post });
  } catch (err) {
    next(err);
  }
});

// Criar nova publicação
router.post('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const validated = createPostSchema.parse(req.body);
    const post = await PostService.createPost(req.user!.id, validated);
    res.status(201).json({
      message: 'Publicação criada com sucesso!',
      post,
    });
  } catch (err) {
    next(err);
  }
});

// Atualizar publicação
router.patch('/:id', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const postId = req.params.id as string;
    const updated = await PostService.updatePost(postId, req.user!.id, req.body);
    res.json({
      message: 'Publicação atualizada com sucesso!',
      post: updated,
    });
  } catch (err) {
    next(err);
  }
});

// Encerrar publicação
router.post('/:id/close', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const postId = req.params.id as string;
    await PostService.closePost(postId, req.user!.id, req.user!.role);
    res.json({ message: 'Publicação encerrada com sucesso.' });
  } catch (err) {
    next(err);
  }
});

// Salvar / favoritar publicação
router.post('/:id/save', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const postId = req.params.id as string;
    const result = await PostService.toggleSave(postId, req.user!.id);
    res.json({
      saved: result.saved,
      message: result.saved ? 'Salvo em seus itens de interesse.' : 'Removido dos salvos.',
    });
  } catch (err) {
    next(err);
  }
});

// Upload de imagens para a publicação (de 1 a 5 fotos)
router.post(
  '/:id/images',
  requireAuth,
  upload.array('images', 5),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const postId = req.params.id as string;
      const post = await PostService.getPostById(postId, req.user!.id);

      if (!post) {
        return res.status(404).json({ error: 'Publicação não encontrada.' });
      }

      if (post.author_id !== req.user!.id) {
        return res.status(403).json({ error: 'Apenas o autor pode enviar fotos para este anúncio.' });
      }

      const files = (req.files as Express.Multer.File[]) || [];
      if (files.length === 0) {
        return res.status(400).json({ error: 'Nenhuma foto enviada.' });
      }

      if (post.images.length + files.length > 5) {
        return res.status(400).json({
          error: `O limite máximo é de 5 fotos por publicação. O anúncio já possui ${post.images.length} fotos.`,
        });
      }

      const results = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isCover = post.images.length === 0 && i === 0;
        const processed = await ImageService.processPostImage(
          file.buffer,
          req.user!.id,
          postId,
          post.images.length + i,
          isCover
        );
        results.push(processed);
      }

      const updatedPost = await PostService.getPostById(postId, req.user!.id);
      res.json({
        message: `${files.length} foto(s) anexada(s) com sucesso.`,
        post: updatedPost,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Excluir imagem de publicação
router.delete('/:id/images/:imageId', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const imageId = req.params.imageId as string;
    await ImageService.deletePostImage(imageId, req.user!.id);
    res.json({ message: 'Foto removida com sucesso.' });
  } catch (err) {
    next(err);
  }
});

export default router;
