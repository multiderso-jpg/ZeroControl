import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db';
import { Application } from '../../shared/types';

export class ApplicationService {
  static async apply(
    postId: string,
    applicantId: string,
    message: string,
    proposedAmountCents?: number | null
  ): Promise<Application> {
    const db = await getDb();

    // 1. Verificar post e autor
    const postRes = await db.query(
      `SELECT author_id, status FROM posts WHERE id = $1`,
      [postId]
    );

    if (postRes.rows.length === 0) {
      const err = new Error('Publicação não encontrada.');
      (err as any).statusCode = 404;
      throw err;
    }

    const post = postRes.rows[0];

    if (post.author_id === applicantId) {
      const err = new Error('O autor não pode se candidatar na própria publicação.');
      (err as any).statusCode = 400;
      throw err;
    }

    if (post.status !== 'aberta') {
      const err = new Error('Esta publicação não está mais aceitando novas candidaturas.');
      (err as any).statusCode = 400;
      throw err;
    }

    // 2. Verificar se já existe candidatura
    const existing = await db.query(
      `SELECT id, status FROM applications WHERE post_id = $1 AND applicant_id = $2`,
      [postId, applicantId]
    );

    if (existing.rows.length > 0) {
      const app = existing.rows[0];
      if (app.status === 'retirada') {
        // Permite reativar caso tenha retirado anteriormente
        await db.query(
          `UPDATE applications
           SET message = $1, proposed_amount_cents = $2, status = 'enviada', updated_at = CURRENT_TIMESTAMP
           WHERE id = $3`,
          [message, proposedAmountCents || null, app.id]
        );
        return (await this.getApplicationById(app.id))!;
      }
      const err = new Error('Você já possui uma candidatura ativa para esta oportunidade.');
      (err as any).statusCode = 409;
      throw err;
    }

    const appId = uuidv4();
    await db.query(
      `INSERT INTO applications (id, post_id, applicant_id, message, proposed_amount_cents, status)
       VALUES ($1, $2, $3, $4, $5, 'enviada')`,
      [appId, postId, applicantId, message, proposedAmountCents || null]
    );

    return (await this.getApplicationById(appId))!;
  }

  static async withdraw(applicationId: string, applicantId: string): Promise<void> {
    const db = await getDb();
    const appRes = await db.query(
      `SELECT applicant_id, status FROM applications WHERE id = $1`,
      [applicationId]
    );

    if (appRes.rows.length === 0) {
      const err = new Error('Candidatura não encontrada.');
      (err as any).statusCode = 404;
      throw err;
    }

    if (appRes.rows[0].applicant_id !== applicantId) {
      const err = new Error('Apenas o próprio candidato pode retirar esta candidatura.');
      (err as any).statusCode = 403;
      throw err;
    }

    if (appRes.rows[0].status === 'selecionada') {
      const err = new Error('Candidatura já selecionada não pode ser retirada diretamente.');
      (err as any).statusCode = 400;
      throw err;
    }

    await db.query(
      `UPDATE applications SET status = 'retirada', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [applicationId]
    );
  }

  static async selectCandidate(
    postId: string,
    applicationId: string,
    authorId: string
  ): Promise<Application> {
    const db = await getDb();

    return await db.transaction(async (tx) => {
      // Bloqueio atômico de linha no post para concorrência
      const postRes = await tx.query(
        `SELECT author_id, status FROM posts WHERE id = $1 FOR UPDATE`,
        [postId]
      );

      if (postRes.rows.length === 0) {
        const err = new Error('Publicação não encontrada.');
        (err as any).statusCode = 404;
        throw err;
      }

      const post = postRes.rows[0];

      if (post.author_id !== authorId) {
        const err = new Error('Apenas o autor da publicação pode selecionar um candidato.');
        (err as any).statusCode = 403;
        throw err;
      }

      if (post.status !== 'aberta') {
        const err = new Error('Esta oportunidade já possui um candidato selecionado ou está encerrada.');
        (err as any).statusCode = 400;
        throw err;
      }

      // Verificar candidatura
      const appRes = await tx.query(
        `SELECT id, status FROM applications WHERE id = $1 AND post_id = $2 FOR UPDATE`,
        [applicationId, postId]
      );

      if (appRes.rows.length === 0) {
        const err = new Error('Candidatura não encontrada para este anúncio.');
        (err as any).statusCode = 404;
        throw err;
      }

      if (appRes.rows[0].status !== 'enviada') {
        const err = new Error('Esta candidatura não está mais disponível para seleção.');
        (err as any).statusCode = 400;
        throw err;
      }

      // 1. Marca candidatura escolhida como selecionada
      await tx.query(
        `UPDATE applications SET status = 'selecionada', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [applicationId]
      );

      // 2. Marca as demais candidaturas pendentes como recusadas
      await tx.query(
        `UPDATE applications
         SET status = 'recusada', updated_at = CURRENT_TIMESTAMP
         WHERE post_id = $1 AND id != $2 AND status = 'enviada'`,
        [postId, applicationId]
      );

      // 3. Atualiza estado da publicação para em andamento
      await tx.query(
        `UPDATE posts SET status = 'em_andamento', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [postId]
      );

      const finalRes = await tx.query<Application>(
        `SELECT a.*, u.username as applicant_username
         FROM applications a
         JOIN users u ON u.id = a.applicant_id
         WHERE a.id = $1`,
        [applicationId]
      );

      return finalRes.rows[0];
    });
  }

  static async listByPost(postId: string, authorId: string): Promise<Application[]> {
    const db = await getDb();
    // Verifica permissão do autor
    const postRes = await db.query(`SELECT author_id FROM posts WHERE id = $1`, [postId]);
    if (postRes.rows.length === 0 || postRes.rows[0].author_id !== authorId) {
      const err = new Error('Acesso restrito ao autor da publicação.');
      (err as any).statusCode = 403;
      throw err;
    }

    const res = await db.query(
      `SELECT a.*,
              u.username as applicant_username,
              p.avatar_path as applicant_avatar_path
       FROM applications a
       JOIN users u ON u.id = a.applicant_id
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE a.post_id = $1
       ORDER BY a.created_at ASC`,
      [postId]
    );

    return res.rows.map((r: any) => ({
      id: r.id,
      post_id: r.post_id,
      applicant_id: r.applicant_id,
      applicant_username: r.applicant_username,
      applicant_avatar_url: r.applicant_avatar_path ? `/uploads/avatars/${r.applicant_avatar_path}` : null,
      message: r.message,
      proposed_amount_cents: r.proposed_amount_cents,
      status: r.status,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));
  }

  static async listMyApplications(applicantId: string): Promise<Application[]> {
    const db = await getDb();
    const res = await db.query(
      `SELECT a.*,
              p.title as post_title,
              u.username as author_username
       FROM applications a
       JOIN posts p ON p.id = a.post_id
       JOIN users u ON u.id = p.author_id
       WHERE a.applicant_id = $1
       ORDER BY a.created_at DESC`,
      [applicantId]
    );

    return res.rows.map((r: any) => ({
      id: r.id,
      post_id: r.post_id,
      applicant_id: r.applicant_id,
      applicant_username: '',
      applicant_avatar_url: null,
      message: r.message,
      proposed_amount_cents: r.proposed_amount_cents,
      status: r.status,
      created_at: r.created_at,
      updated_at: r.updated_at,
      post_title: r.post_title,
      author_username: r.author_username,
    }));
  }

  static async getApplicationById(id: string): Promise<Application | null> {
    const db = await getDb();
    const res = await db.query(
      `SELECT a.*,
              u.username as applicant_username,
              p.avatar_path as applicant_avatar_path
       FROM applications a
       JOIN users u ON u.id = a.applicant_id
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE a.id = $1`,
      [id]
    );

    if (res.rows.length === 0) return null;
    const r = res.rows[0];

    return {
      id: r.id,
      post_id: r.post_id,
      applicant_id: r.applicant_id,
      applicant_username: r.applicant_username,
      applicant_avatar_url: r.applicant_avatar_path ? `/uploads/avatars/${r.applicant_avatar_path}` : null,
      message: r.message,
      proposed_amount_cents: r.proposed_amount_cents,
      status: r.status,
      created_at: r.created_at,
      updated_at: r.updated_at,
    };
  }
}
