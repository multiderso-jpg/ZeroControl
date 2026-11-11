import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db';
import { Report } from '../../shared/types';

export class CouncilService {
  static async submitReport(
    reporterId: string,
    postId: string,
    category: string,
    description: string
  ): Promise<Report> {
    const db = await getDb();

    // Validar existência da publicação
    const postRes = await db.query(`SELECT id, title FROM posts WHERE id = $1`, [postId]);
    if (postRes.rows.length === 0) {
      const err = new Error('Publicação referenciada não existe.');
      (err as any).statusCode = 404;
      throw err;
    }

    const reportId = uuidv4();
    await db.query(
      `INSERT INTO reports (id, reporter_id, post_id, category, description, status)
       VALUES ($1, $2, $3, $4, $5, 'pendente')`,
      [reportId, reporterId, postId, category, description]
    );

    return (await this.getReportById(reportId))!;
  }

  static async listReports(status?: string): Promise<Report[]> {
    const db = await getDb();
    const conditions = [];
    const values = [];

    if (status) {
      conditions.push(`r.status = $1`);
      values.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const res = await db.query(
      `SELECT r.*,
              u.username as reporter_username,
              p.title as post_title,
              d.username as decided_by_username
       FROM reports r
       JOIN users u ON u.id = r.reporter_id
       JOIN posts p ON p.id = r.post_id
       LEFT JOIN users d ON d.id = r.decided_by
       ${whereClause}
       ORDER BY r.created_at DESC`,
      values
    );

    return res.rows.map((r: any) => ({
      id: r.id,
      reporter_id: r.reporter_id,
      reporter_username: r.reporter_username,
      post_id: r.post_id,
      post_title: r.post_title,
      category: r.category,
      description: r.description,
      status: r.status,
      decision_notes: r.decision_notes,
      decided_by_username: r.decided_by_username,
      created_at: r.created_at,
      decided_at: r.decided_at,
    }));
  }

  static async decideReport(
    reportId: string,
    moderatorId: string,
    decision: 'procedente' | 'improcedente',
    notes: string,
    suspendPost: boolean
  ): Promise<Report> {
    const db = await getDb();

    return await db.transaction(async (tx) => {
      const repRes = await tx.query(`SELECT id, post_id FROM reports WHERE id = $1`, [reportId]);
      if (repRes.rows.length === 0) {
        const err = new Error('Denúncia não encontrada.');
        (err as any).statusCode = 404;
        throw err;
      }

      const report = repRes.rows[0];

      await tx.query(
        `UPDATE reports
         SET status = $1, decision_notes = $2, decided_by = $3, decided_at = CURRENT_TIMESTAMP
         WHERE id = $4`,
        [decision, notes, moderatorId, reportId]
      );

      if (suspendPost) {
        await tx.query(
          `UPDATE posts SET status = 'suspensa', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
          [report.post_id]
        );
      }

      const res = await tx.query<Report>(
        `SELECT r.*,
                u.username as reporter_username,
                p.title as post_title,
                d.username as decided_by_username
         FROM reports r
         JOIN users u ON u.id = r.reporter_id
         JOIN posts p ON p.id = r.post_id
         LEFT JOIN users d ON d.id = r.decided_by
         WHERE r.id = $1`,
        [reportId]
      );

      return res.rows[0];
    });
  }

  static async getReportById(id: string): Promise<Report | null> {
    const db = await getDb();
    const res = await db.query(
      `SELECT r.*,
              u.username as reporter_username,
              p.title as post_title,
              d.username as decided_by_username
       FROM reports r
       JOIN users u ON u.id = r.reporter_id
       JOIN posts p ON p.id = r.post_id
       LEFT JOIN users d ON d.id = r.decided_by
       WHERE r.id = $1`,
      [id]
    );

    if (res.rows.length === 0) return null;
    const r = res.rows[0];

    return {
      id: r.id,
      reporter_id: r.reporter_id,
      reporter_username: r.reporter_username,
      post_id: r.post_id,
      post_title: r.post_title,
      category: r.category,
      description: r.description,
      status: r.status,
      decision_notes: r.decision_notes,
      decided_by_username: r.decided_by_username,
      created_at: r.created_at,
      decided_at: r.decided_at,
    };
  }
}
