import { Router } from 'express';
import { ApplicationService } from '../services/applicationService';
import { requireAuth } from '../middleware/auth';
import { createApplicationSchema } from '../../shared/validation';
const router = Router();
router.use(requireAuth);
// Candidatar-se / Enviar manifestação de interesse
router.post('/posts/:postId/apply', async (req, res, next) => {
    try {
        const validated = createApplicationSchema.parse(req.body);
        const application = await ApplicationService.apply(req.params.postId, req.user.id, validated.message, validated.proposed_amount_cents);
        res.status(201).json({
            message: 'Manifestação de interesse enviada com sucesso!',
            application,
        });
    }
    catch (err) {
        next(err);
    }
});
// Retirar candidatura
router.post('/:id/withdraw', async (req, res, next) => {
    try {
        await ApplicationService.withdraw(req.params.id, req.user.id);
        res.json({ message: 'Candidatura retirada com sucesso.' });
    }
    catch (err) {
        next(err);
    }
});
// Selecionar candidato (Transacional / Atômico)
router.post('/:id/select', async (req, res, next) => {
    try {
        const { postId } = req.body;
        if (!postId) {
            return res.status(400).json({ error: 'O postId da oportunidade é obrigatório.' });
        }
        const application = await ApplicationService.selectCandidate(postId, req.params.id, req.user.id);
        res.json({
            message: 'Candidato selecionado com sucesso! A oportunidade agora está em andamento.',
            application,
        });
    }
    catch (err) {
        next(err);
    }
});
// Listar candidaturas recebidas para um anúncio (Apenas autor)
router.get('/posts/:postId', async (req, res, next) => {
    try {
        const applications = await ApplicationService.listByPost(req.params.postId, req.user.id);
        res.json({ applications });
    }
    catch (err) {
        next(err);
    }
});
// Minhas candidaturas enviadas
router.get('/my', async (req, res, next) => {
    try {
        const applications = await ApplicationService.listMyApplications(req.user.id);
        res.json({ applications });
    }
    catch (err) {
        next(err);
    }
});
export default router;
