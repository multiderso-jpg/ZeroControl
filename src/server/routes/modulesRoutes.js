import { Router } from 'express';
import { ModulesService } from '../services/modulesService';
import { requireAuth } from '../middleware/auth';
import { MODULES, OPPORTUNITY_TYPES, SERVICE_CATEGORIES } from '../../shared/constants';
import { createQuoteRequestSchema, createSupportRequestSchema } from '../../shared/validation';
const router = Router();
// Metadados públicos do sistema
router.get('/meta', (req, res) => {
    res.json({
        modules: MODULES,
        opportunity_types: OPPORTUNITY_TYPES,
        service_categories: SERVICE_CATEGORIES,
    });
});
// --- FORJA ---
router.get('/forja/offerings', async (req, res, next) => {
    try {
        const offerings = await ModulesService.listServiceOfferings();
        res.json({ offerings });
    }
    catch (err) {
        next(err);
    }
});
router.post('/forja/quotes', requireAuth, async (req, res, next) => {
    try {
        const validated = createQuoteRequestSchema.parse(req.body);
        const quote = await ModulesService.createQuoteRequest(req.user.id, validated.service_title, validated.description, validated.estimated_budget);
        res.status(201).json({
            message: 'Solicitação de orçamento enviada para a Phantom Troupe.',
            quote,
        });
    }
    catch (err) {
        next(err);
    }
});
router.get('/forja/quotes/my', requireAuth, async (req, res, next) => {
    try {
        const quotes = await ModulesService.listMyQuoteRequests(req.user.id);
        res.json({ quotes });
    }
    catch (err) {
        next(err);
    }
});
// --- ALIANÇA ---
router.get('/alianca/partners', async (req, res, next) => {
    try {
        const partnerships = await ModulesService.listPartnerships();
        res.json({ partnerships });
    }
    catch (err) {
        next(err);
    }
});
// --- MISSÕES ---
router.get('/missoes/quests', async (req, res, next) => {
    try {
        const quests = await ModulesService.listQuests();
        res.json({ quests });
    }
    catch (err) {
        next(err);
    }
});
// --- COMPANHIA ---
router.get('/companhia/teams', requireAuth, async (req, res, next) => {
    try {
        const teams = await ModulesService.listTeams(req.user.id);
        res.json({ teams });
    }
    catch (err) {
        next(err);
    }
});
// --- JORNADA ---
router.get('/jornada/engagements', requireAuth, async (req, res, next) => {
    try {
        const engagements = await ModulesService.listEngagements(req.user.id);
        res.json({ engagements });
    }
    catch (err) {
        next(err);
    }
});
// --- MUTIRÃO ---
router.get('/mutirao/actions', async (req, res, next) => {
    try {
        const actions = await ModulesService.listVolunteerActions(req.user?.id);
        res.json({ actions });
    }
    catch (err) {
        next(err);
    }
});
router.post('/mutirao/actions/:id/join', requireAuth, async (req, res, next) => {
    try {
        await ModulesService.joinVolunteerAction(req.params.id, req.user.id);
        res.json({ message: 'Participação voluntária confirmada com sucesso!' });
    }
    catch (err) {
        next(err);
    }
});
// --- EMBAIXADA ---
router.get('/embaixada/directory', requireAuth, async (req, res, next) => {
    try {
        const directory = await ModulesService.listDirectory();
        res.json({ directory });
    }
    catch (err) {
        next(err);
    }
});
// --- COMANDO ---
router.get('/comando/indicators', requireAuth, async (req, res, next) => {
    try {
        const indicators = await ModulesService.getCommandIndicators(req.user.id, req.user.role);
        res.json({ indicators });
    }
    catch (err) {
        next(err);
    }
});
// --- TESOURARIA ---
router.get('/tesouraria/records', requireAuth, async (req, res, next) => {
    try {
        const financial = await ModulesService.getFinancialRecords(req.user.id);
        res.json(financial);
    }
    catch (err) {
        next(err);
    }
});
// --- FUNDAÇÃO ---
router.post('/fundacao/support', requireAuth, async (req, res, next) => {
    try {
        const validated = createSupportRequestSchema.parse(req.body);
        const support = await ModulesService.createSupportRequest(req.user.id, validated.subject, validated.category, validated.message);
        res.status(201).json({
            message: 'Solicitação de suporte registrada com sucesso.',
            support,
        });
    }
    catch (err) {
        next(err);
    }
});
router.get('/fundacao/support/my', requireAuth, async (req, res, next) => {
    try {
        const requests = await ModulesService.listMySupportRequests(req.user.id);
        res.json({ requests });
    }
    catch (err) {
        next(err);
    }
});
export default router;
