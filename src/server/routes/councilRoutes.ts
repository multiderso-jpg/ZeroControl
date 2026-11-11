import { Router } from 'express';
import { CouncilService } from '../services/councilService';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth';
import { createReportSchema } from '../../shared/validation';

const router = Router();
router.use(requireAuth);

// Enviar denúncia (acessível a qualquer membro autenticado)
router.post('/reports', async (req: AuthenticatedRequest, res, next) => {
  try {
    const validated = createReportSchema.parse(req.body);
    const report = await CouncilService.submitReport(
      req.user!.id,
      validated.post_id,
      validated.category,
      validated.description
    );

    res.status(201).json({
      message: 'Denúncia recebida pelo Conselho e encaminhada para moderação.',
      report,
    });
  } catch (err) {
    next(err);
  }
});

// Fila de moderação do Conselho (apenas moderadores e administradores)
router.get('/reports', requireRole(['moderador', 'administrador']), async (req, res, next) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const reports = await CouncilService.listReports(status);
    res.json({ reports });
  } catch (err) {
    next(err);
  }
});

// Decisão de moderação (apenas moderadores e administradores)
router.post('/reports/:id/decide', requireRole(['moderador', 'administrador']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { decision, notes, suspendPost } = req.body;
    if (!['procedente', 'improcedente'].includes(decision)) {
      return res.status(400).json({ error: 'Decisão inválida. Use procedente ou improcedente.' });
    }

    const reportId = req.params.id as string;
    const updated = await CouncilService.decideReport(
      reportId,
      req.user!.id,
      decision,
      notes || 'Sem observações adicionais.',
      Boolean(suspendPost)
    );

    res.json({
      message: 'Decisão registrada no Conselho com sucesso.',
      report: updated,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
