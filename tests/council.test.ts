import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/server/app';
import { runSeeds } from '../src/server/db/seed';
import { getDb } from '../src/server/db';

const app = createApp();

describe('Conselho e Moderação - Zero Control', () => {
  let memberCookie: string[];
  let memberCsrf: string;
  let modCookie: string[];
  let modCsrf: string;
  let targetPostId: string;
  let reportId: string;

  beforeAll(async () => {
    await runSeeds();
    const t = Date.now();

    // 1. Membro comum
    const rMember = await request(app).post('/api/auth/register').send({
      username: `membro_denuncia_${t}`,
      password: 'PasswordSeguraComMaisDe15Chars!',
    });
    const c1 = rMember.headers['set-cookie'];
    memberCookie = Array.isArray(c1) ? c1 : [c1 || ''];
    const m1 = memberCookie.find((c) => c.startsWith('zc_csrf='))?.match(/zc_csrf=([^;]+)/);
    memberCsrf = m1 ? m1[1] : '';

    // 2. Moderador
    const rMod = await request(app).post('/api/auth/register').send({
      username: `moderador_${t}`,
      password: 'PasswordSeguraComMaisDe15Chars!',
    });
    const c2 = rMod.headers['set-cookie'];
    modCookie = Array.isArray(c2) ? c2 : [c2 || ''];
    const m2 = modCookie.find((c) => c.startsWith('zc_csrf='))?.match(/zc_csrf=([^;]+)/);
    modCsrf = m2 ? m2[1] : '';

    // Promove o usuário do moderador diretamente no banco
    const db = await getDb();
    await db.query(`UPDATE users SET role = 'moderador' WHERE username = $1`, [`moderador_${t}`]);

    // Cria um post para ser denunciado
    const pRes = await request(app)
      .post('/api/posts')
      .set('Cookie', memberCookie)
      .set('X-CSRF-Token', memberCsrf)
      .send({
        intention: 'Ofereço um serviço',
        title: 'Serviço suspeito ou fora das diretrizes',
        description: 'Descrição de teste para simulação do fluxo de denúncia e moderação do Conselho.',
        opportunity_type_slug: 'autonomo',
        service_category_slug: 'administracao-e-atendimento',
        modality: 'Remoto',
        compensation_type: 'a_combinar',
      });

    targetPostId = pRes.body.post.id;
  });

  it('1. Deve permitir envio de denúncia por membro autenticado', async () => {
    const res = await request(app)
      .post('/api/council/reports')
      .set('Cookie', memberCookie)
      .set('X-CSRF-Token', memberCsrf)
      .send({
        post_id: targetPostId,
        category: 'termos',
        description: 'Esta publicação viola as diretrizes de publicação da Guilda.',
      });

    expect(res.status).toBe(201);
    expect(res.body.report.status).toBe('pendente');
    expect(res.body.report.post_id).toBe(targetPostId);
    reportId = res.body.report.id;
  });

  it('2. Membro comum não deve conseguir acessar fila restrita de denúncias', async () => {
    const res = await request(app)
      .get('/api/council/reports')
      .set('Cookie', memberCookie);

    expect(res.status).toBe(403);
  });

  it('3. Moderador deve conseguir listar a fila de denúncias', async () => {
    const res = await request(app)
      .get('/api/council/reports')
      .set('Cookie', modCookie);

    expect(res.status).toBe(200);
    expect(res.body.reports.some((r: any) => r.id === reportId)).toBe(true);
  });

  it('4. Moderador deve julgar denúncia como procedente e suspender publicação', async () => {
    const res = await request(app)
      .post(`/api/council/reports/${reportId}/decide`)
      .set('Cookie', modCookie)
      .set('X-CSRF-Token', modCsrf)
      .send({
        decision: 'procedente',
        notes: 'Violação confirmada após análise dos termos da Guilda.',
        suspendPost: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.report.status).toBe('procedente');

    // Confirma que a publicação ficou suspensa
    const postRes = await request(app).get(`/api/posts/${targetPostId}`);
    expect(postRes.body.post.status).toBe('suspensa');
  });
});
