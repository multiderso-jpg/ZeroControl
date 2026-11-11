import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db';
export class ModulesService {
    // --- FORJA ---
    static async listServiceOfferings() {
        const db = await getDb();
        const res = await db.query(`SELECT * FROM service_offerings WHERE is_active = TRUE ORDER BY created_at ASC`);
        return res.rows;
    }
    static async createQuoteRequest(userId, title, description, budget) {
        const db = await getDb();
        const id = uuidv4();
        await db.query(`INSERT INTO quote_requests (id, requester_id, service_title, description, estimated_budget, status)
       VALUES ($1, $2, $3, $4, $5, 'pendente')`, [id, userId, title, description, budget || null]);
        const res = await db.query(`SELECT q.*, u.username as requester_username
       FROM quote_requests q
       JOIN users u ON u.id = q.requester_id
       WHERE q.id = $1`, [id]);
        return res.rows[0];
    }
    static async listMyQuoteRequests(userId) {
        const db = await getDb();
        const res = await db.query(`SELECT q.*, u.username as requester_username
       FROM quote_requests q
       JOIN users u ON u.id = q.requester_id
       WHERE q.requester_id = $1
       ORDER BY q.created_at DESC`, [userId]);
        return res.rows;
    }
    // --- ALIANÇA ---
    static async listPartnerships() {
        const db = await getDb();
        const res = await db.query(`SELECT * FROM partnerships WHERE status = 'ativo' ORDER BY created_at DESC`);
        return res.rows;
    }
    // --- MISSÕES ---
    static async listQuests() {
        const db = await getDb();
        const res = await db.query(`SELECT q.*, p.title as related_post_title
       FROM quests q
       LEFT JOIN posts p ON p.id = q.post_id
       ORDER BY q.created_at DESC`);
        return res.rows;
    }
    // --- COMPANHIA ---
    static async listTeams(userId) {
        const db = await getDb();
        const res = await db.query(`SELECT t.*, u.username as leader_username,
              (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as members_count,
              (SELECT status FROM team_members WHERE team_id = t.id AND user_id = $1) as my_status
       FROM teams t
       JOIN users u ON u.id = t.leader_id
       WHERE t.leader_id = $1 OR EXISTS (SELECT 1 FROM team_members WHERE team_id = t.id AND user_id = $1)
       ORDER BY t.created_at DESC`, [userId]);
        return res.rows;
    }
    // --- JORNADA ---
    static async listEngagements(userId) {
        const db = await getDb();
        const res = await db.query(`SELECT e.*,
              c.username as client_username,
              p.username as provider_username,
              po.title as post_title
       FROM engagements e
       JOIN users c ON c.id = e.client_id
       JOIN users p ON p.id = e.provider_id
       LEFT JOIN posts po ON po.id = e.post_id
       WHERE e.client_id = $1 OR e.provider_id = $1
       ORDER BY e.created_at DESC`, [userId]);
        return res.rows;
    }
    // --- MUTIRÃO ---
    static async listVolunteerActions(userId) {
        const db = await getDb();
        const res = await db.query(`SELECT v.*, u.username as coordinator_username,
              (SELECT COUNT(*) FROM volunteer_participations WHERE action_id = v.id) as participants_count,
              ${userId ? `EXISTS (SELECT 1 FROM volunteer_participations WHERE action_id = v.id AND user_id = '${userId}') as is_joined` : 'FALSE as is_joined'}
       FROM volunteer_actions v
       JOIN users u ON u.id = v.coordinator_id
       ORDER BY v.scheduled_time ASC`);
        return res.rows;
    }
    static async joinVolunteerAction(actionId, userId) {
        const db = await getDb();
        const id = uuidv4();
        await db.query(`INSERT INTO volunteer_participations (id, action_id, user_id, status)
       VALUES ($1, $2, $3, 'confirmado')
       ON CONFLICT (action_id, user_id) DO NOTHING`, [id, actionId, userId]);
    }
    // --- EMBAIXADA ---
    static async listDirectory() {
        const db = await getDb();
        const res = await db.query(`SELECT u.id, u.username, u.role, p.avatar_path, p.bio, p.created_at
       FROM users u
       JOIN profiles p ON p.user_id = u.id
       WHERE p.visibility IN ('public', 'members_only') AND u.status = 'ativo'
       ORDER BY u.username ASC
       LIMIT 50`);
        return res.rows.map((r) => ({
            id: r.id,
            username: r.username,
            role: r.role,
            avatar_url: r.avatar_path ? `/uploads/avatars/${r.avatar_path}` : null,
            bio: r.bio,
            created_at: r.created_at,
        }));
    }
    // --- COMANDO ---
    static async getCommandIndicators(userId, userRole) {
        const db = await getDb();
        // Indicadores pessoais reais
        const myPostsRes = await db.query(`SELECT COUNT(*) as count FROM posts WHERE author_id = $1`, [userId]);
        const myAppsRes = await db.query(`SELECT COUNT(*) as count FROM applications WHERE applicant_id = $1`, [userId]);
        const mySavedRes = await db.query(`SELECT COUNT(*) as count FROM saved_posts WHERE user_id = $1`, [userId]);
        const myIndicators = {
            my_posts_count: parseInt(myPostsRes.rows[0].count, 10),
            my_applications_count: parseInt(myAppsRes.rows[0].count, 10),
            my_saved_count: parseInt(mySavedRes.rows[0].count, 10),
        };
        // Se for moderador ou admin, agrega indicadores operacionais da plataforma
        let adminIndicators = null;
        if (userRole === 'administrador' || userRole === 'moderador') {
            const totalUsers = await db.query(`SELECT COUNT(*) as count FROM users`);
            const totalPosts = await db.query(`SELECT COUNT(*) as count FROM posts WHERE status = 'aberta'`);
            const totalReports = await db.query(`SELECT COUNT(*) as count FROM reports WHERE status = 'pendente'`);
            const totalQuotes = await db.query(`SELECT COUNT(*) as count FROM quote_requests WHERE status = 'pendente'`);
            adminIndicators = {
                total_users: parseInt(totalUsers.rows[0].count, 10),
                active_posts: parseInt(totalPosts.rows[0].count, 10),
                pending_reports: parseInt(totalReports.rows[0].count, 10),
                pending_quotes: parseInt(totalQuotes.rows[0].count, 10),
            };
        }
        return {
            personal: myIndicators,
            operational: adminIndicators,
            system_status: {
                database: 'conectado',
                storage: 'local/s3 compatível',
                security: 'Argon2id + CSRF + HttpOnly',
            },
        };
    }
    // --- TESOURARIA ---
    static async getFinancialRecords(userId) {
        const db = await getDb();
        const res = await db.query(`SELECT * FROM financial_records WHERE user_id = $1 ORDER BY created_at DESC`, [userId]);
        // Calcular totais
        let totalCents = 0;
        res.rows.forEach((r) => {
            totalCents += r.amount_cents;
        });
        return {
            records: res.rows,
            total_cents: totalCents,
            currency: 'BRL',
            note: 'Na V1, exibe referências registradas. Integrações de pagamento externas permanecem em evolução.',
        };
    }
    // --- FUNDAÇÃO ---
    static async createSupportRequest(userId, subject, category, message) {
        const db = await getDb();
        const id = uuidv4();
        await db.query(`INSERT INTO support_requests (id, requester_id, subject, category, message, status)
       VALUES ($1, $2, $3, $4, $5, 'aberto')`, [id, userId, subject, category, message]);
        const res = await db.query(`SELECT s.*, u.username as requester_username
       FROM support_requests s
       JOIN users u ON u.id = s.requester_id
       WHERE s.id = $1`, [id]);
        return res.rows[0];
    }
    static async listMySupportRequests(userId) {
        const db = await getDb();
        const res = await db.query(`SELECT s.*, u.username as requester_username
       FROM support_requests s
       JOIN users u ON u.id = s.requester_id
       WHERE s.requester_id = $1
       ORDER BY s.created_at DESC`, [userId]);
        return res.rows;
    }
}
