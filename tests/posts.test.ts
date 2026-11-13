import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { createApp } from '../src/server/app';
import { getDb } from '../src/server/db';
import { runSeeds } from '../src/server/db/seed';

const app = createApp();

describe('Mural da Guilda e Publicações - Zero Control', () => {
  let user1Cookie: string[];
  let user1Csrf: string;
  let user2Cookie: string[];
  let user2Csrf: string;
  let createdPostId: string;

  beforeAll(async () => {
    await runSeeds();
    const t = Date.now();

    // Cria Autor 1
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({
        username: `autor_post_${t}`,
        password: 'PasswordSeguraComMaisDe15Chars!',
      });
    const c1 = res1.headers['set-cookie'];
    user1Cookie = Array.isArray(c1) ? c1 : [c1 || ''];
    const m1 = user1Cookie.find((c) => c.startsWith('zc_csrf='))?.match(/zc_csrf=([^;]+)/);
    user1Csrf = m1 ? m1[1] : '';

    // Cria Usuário 2
    const res2 = await request(app)
      .post('/api/auth/register')
      .send({
        username: `outro_usuario_${t}`,
        password: 'PasswordSeguraComMaisDe15Chars!',
      });
    const c2 = res2.headers['set-cookie'];
    user2Cookie = Array.isArray(c2) ? c2 : [c2 || ''];
    const m2 = user2Cookie.find((c) => c.startsWith('zc_csrf='))?.match(/zc_csrf=([^;]+)/);
    user2Csrf = m2 ? m2[1] : '';
  });

  it('1. Deve criar uma publicação válida apenas com texto no Mural', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Cookie', user1Cookie)
      .set('X-CSRF-Token', user1Csrf)
      .send({
        intention: 'Ofereço um serviço',
        title: 'Desenvolvimento de APIs em Node e TypeScript',
        description: 'Desenvolvo microsserviços e APIs REST de alta performance, com documentação completa e testes.',
        opportunity_type_slug: 'freelancer',
        service_category_slug: 'tecnologia-e-programacao',
        modality: 'Remoto',
        compensation_type: 'a_combinar',
      });

    expect(res.status).toBe(201);
    expect(res.body.post.id).toBeDefined();
    expect(res.body.post.title).toBe('Desenvolvimento de APIs em Node e TypeScript');
    expect(res.body.post.opportunity_type_name).toBe('Freelancer');
    expect(res.body.post.service_category_name).toBe('Tecnologia e programação');
    expect(res.body.post.status).toBe('aberta');
    createdPostId = res.body.post.id;
  });

  it('2. Deve rejeitar publicação presencial sem cidade e estado', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Cookie', user1Cookie)
      .set('X-CSRF-Token', user1Csrf)
      .send({
        intention: 'Oportunidade de serviços',
        title: 'Instalação elétrica comercial',
        description: 'Preciso de eletricista qualificado para reforma completa da fiação em galpão.',
        opportunity_type_slug: 'autonomo',
        service_category_slug: 'eletrica',
        modality: 'Presencial',
        // Omitindo cidade e estado propositalmente
        compensation_type: 'valor_fixo',
        amount_cents: 150000,
      });

    expect(res.status).toBe(400);
    expect(res.body.details.some((d: any) => d.field === 'city')).toBe(true);
    expect(res.body.details.some((d: any) => d.field === 'state')).toBe(true);
  });

  it('3. Deve listar publicações com busca e filtros no servidor', async () => {
    const res = await request(app)
      .get('/api/posts')
      .query({
        search: 'APIs',
        opportunity_type_slug: 'freelancer',
        service_category_slug: 'tecnologia-e-programacao',
      });

    expect(res.status).toBe(200);
    expect(res.body.posts.length).toBeGreaterThanOrEqual(1);
    expect(res.body.posts[0].id).toBe(createdPostId);
  });

  it('4. Deve impedir que outro usuário edite publicação alheia', async () => {
    const res = await request(app)
      .patch(`/api/posts/${createdPostId}`)
      .set('Cookie', user2Cookie)
      .set('X-CSRF-Token', user2Csrf)
      .send({
        title: 'Tentativa maliciosa de alterar título',
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Apenas o autor pode editar');
  });

  it('5. Deve permitir ao autor encerrar a própria publicação', async () => {
    const res = await request(app)
      .post(`/api/posts/${createdPostId}/close`)
      .set('Cookie', user1Cookie)
      .set('X-CSRF-Token', user1Csrf);

    expect(res.status).toBe(200);

    const check = await request(app).get(`/api/posts/${createdPostId}`);
    expect(check.body.post.status).toBe('encerrada');
  });

  it('6. Deve permitir comentários no Job e listar os comentários', async () => {
    const commentRes = await request(app)
      .post(`/api/posts/${createdPostId}/comments`)
      .set('Cookie', user2Cookie)
      .set('X-CSRF-Token', user2Csrf)
      .send({ content: 'Tenho interesse nesta oportunidade! Posso começar na segunda-feira.' });

    expect(commentRes.status).toBe(201);
    expect(commentRes.body.comment.content).toContain('Tenho interesse');

    const listRes = await request(app).get(`/api/posts/${createdPostId}/comments`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.comments.length).toBe(1);
    expect(listRes.body.comments[0].author_username).toContain('outro_usuario_');
  });

  it('7. Deve permitir que a conta administradora PhantomTroupe exclua comentários e Jobs', async () => {
    // Garante senha e papel de administrador para PhantomTroupe
    const db = await getDb();
    const argon2 = await import('@node-rs/argon2');
    const hash = await argon2.hash('PasswordAdmin123!');
    const uCheck = await db.query(`SELECT id FROM users WHERE LOWER(username) = 'phantomtroupe'`);
    if (uCheck.rows.length === 0) {
      await db.query(
        `INSERT INTO users (id, username, username_normalized, password_hash, role)
         VALUES ($1, 'PhantomTroupe', 'phantomtroupe', $2, 'administrador')`,
        [uuidv4(), hash]
      );
    } else {
      await db.query(
        `UPDATE users SET password_hash = $1, role = 'administrador' WHERE LOWER(username) = 'phantomtroupe'`,
        [hash]
      );
    }

    // Login com PhantomTroupe
    const ptLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'PhantomTroupe', password: 'PasswordAdmin123!' });

    const rawPt = ptLogin.headers['set-cookie'];
    const ptCookie: string[] = Array.isArray(rawPt) ? rawPt : typeof rawPt === 'string' ? [rawPt] : [];
    const ptCsrfMatch = ptCookie.find((c: string) => c.startsWith('zc_csrf='))?.match(/zc_csrf=([^;]+)/);
    const ptCsrf = ptCsrfMatch ? ptCsrfMatch[1] : '';

    // Buscar comentário existente
    const listRes = await request(app).get(`/api/posts/${createdPostId}/comments`);
    const commentId = listRes.body.comments[0].id;

    // PhantomTroupe exclui comentário
    const delCommentRes = await request(app)
      .delete(`/api/posts/${createdPostId}/comments/${commentId}`)
      .set('Cookie', ptCookie)
      .set('X-CSRF-Token', ptCsrf);
    expect(delCommentRes.status).toBe(200);

    // PhantomTroupe exclui o Job
    const delPostRes = await request(app)
      .delete(`/api/posts/${createdPostId}`)
      .set('Cookie', ptCookie)
      .set('X-CSRF-Token', ptCsrf);
    expect(delPostRes.status).toBe(200);

    // Verificar se o Job foi realmente excluído
    const getRes = await request(app).get(`/api/posts/${createdPostId}`);
    expect(getRes.status).toBe(404);
  });
});
