import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/server/app';
import { runSeeds } from '../src/server/db/seed';

const app = createApp();

describe('Candidaturas e Seleção Transacional - Zero Control', () => {
  let authorCookie: string[];
  let authorCsrf: string;
  let cand1Cookie: string[];
  let cand1Csrf: string;
  let cand2Cookie: string[];
  let cand2Csrf: string;
  let postId: string;
  let cand1AppId: string;
  let cand2AppId: string;

  beforeAll(async () => {
    await runSeeds();
    const t = Date.now();

    // 1. Autor
    const rAuthor = await request(app).post('/api/auth/register').send({
      username: `autor_app_${t}`,
      password: 'PasswordSeguraComMaisDe15Chars!',
    });
    const c0 = rAuthor.headers['set-cookie'];
    authorCookie = Array.isArray(c0) ? c0 : [c0 || ''];
    const m0 = authorCookie.find((c) => c.startsWith('zc_csrf='))?.match(/zc_csrf=([^;]+)/);
    authorCsrf = m0 ? m0[1] : '';

    // 2. Candidato 1
    const rCand1 = await request(app).post('/api/auth/register').send({
      username: `cand1_${t}`,
      password: 'PasswordSeguraComMaisDe15Chars!',
    });
    const c1 = rCand1.headers['set-cookie'];
    cand1Cookie = Array.isArray(c1) ? c1 : [c1 || ''];
    const m1 = cand1Cookie.find((c) => c.startsWith('zc_csrf='))?.match(/zc_csrf=([^;]+)/);
    cand1Csrf = m1 ? m1[1] : '';

    // 3. Candidato 2
    const rCand2 = await request(app).post('/api/auth/register').send({
      username: `cand2_${t}`,
      password: 'PasswordSeguraComMaisDe15Chars!',
    });
    const c2 = rCand2.headers['set-cookie'];
    cand2Cookie = Array.isArray(c2) ? c2 : [c2 || ''];
    const m2 = cand2Cookie.find((c) => c.startsWith('zc_csrf='))?.match(/zc_csrf=([^;]+)/);
    cand2Csrf = m2 ? m2[1] : '';

    // Cria oportunidade aberta pelo autor
    const pRes = await request(app)
      .post('/api/posts')
      .set('Cookie', authorCookie)
      .set('X-CSRF-Token', authorCsrf)
      .send({
        intention: 'Preciso de um serviço',
        title: 'Criação de Identidade Visual Completa',
        description: 'Preciso de designer sênior para desenvolver o manual de marca, logotipo e tipografia.',
        opportunity_type_slug: 'freelancer',
        service_category_slug: 'design-e-criacao',
        modality: 'Remoto',
        compensation_type: 'valor_fixo',
        amount_cents: 250000,
      });

    postId = pRes.body.post.id;
  });

  it('1. Deve impedir que o autor se candidate na própria publicação', async () => {
    const res = await request(app)
      .post(`/api/applications/posts/${postId}/apply`)
      .set('Cookie', authorCookie)
      .set('X-CSRF-Token', authorCsrf)
      .send({
        message: 'Tenho interesse no meu próprio serviço.',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('O autor não pode se candidatar');
  });

  it('2. Deve permitir que candidato envie interesse com proposta opcional', async () => {
    const res = await request(app)
      .post(`/api/applications/posts/${postId}/apply`)
      .set('Cookie', cand1Cookie)
      .set('X-CSRF-Token', cand1Csrf)
      .send({
        message: 'Olá, tenho mais de 8 anos de experiência com branding e design system.',
        proposed_amount_cents: 240000,
      });

    expect(res.status).toBe(201);
    expect(res.body.application.status).toBe('enviada');
    cand1AppId = res.body.application.id;
  });

  it('3. Deve impedir candidatura duplicada ativa para a mesma vaga', async () => {
    const res = await request(app)
      .post(`/api/applications/posts/${postId}/apply`)
      .set('Cookie', cand1Cookie)
      .set('X-CSRF-Token', cand1Csrf)
      .send({
        message: 'Tentativa de enviar segunda candidatura.',
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toContain('já possui uma candidatura ativa');
  });

  it('4. Candidato 2 também deve conseguir se candidatar', async () => {
    const res = await request(app)
      .post(`/api/applications/posts/${postId}/apply`)
      .set('Cookie', cand2Cookie)
      .set('X-CSRF-Token', cand2Csrf)
      .send({
        message: 'Sou ilustrador e designer, portfólio disponível no meu perfil.',
        proposed_amount_cents: 250000,
      });

    expect(res.status).toBe(201);
    cand2AppId = res.body.application.id;
  });

  it('5. Apenas o autor deve visualizar a lista de candidaturas recebidas', async () => {
    // Tentativa por usuário não-autor
    const forbidden = await request(app)
      .get(`/api/applications/posts/${postId}`)
      .set('Cookie', cand1Cookie);

    expect(forbidden.status).toBe(403);

    // Consulta pelo autor autorizado
    const allowed = await request(app)
      .get(`/api/applications/posts/${postId}`)
      .set('Cookie', authorCookie);

    expect(allowed.status).toBe(200);
    expect(allowed.body.applications.length).toBe(2);
  });

  it('6. Seleção transacional: autor seleciona Candidato 1, recusando os demais e atualizando o anúncio', async () => {
    const selectRes = await request(app)
      .post(`/api/applications/${cand1AppId}/select`)
      .set('Cookie', authorCookie)
      .set('X-CSRF-Token', authorCsrf)
      .send({ postId });

    expect(selectRes.status).toBe(200);
    expect(selectRes.body.application.status).toBe('selecionada');

    // Verifica que Candidato 2 ficou recusado automaticamente
    const appsRes = await request(app)
      .get(`/api/applications/posts/${postId}`)
      .set('Cookie', authorCookie);

    const app2 = appsRes.body.applications.find((a: any) => a.id === cand2AppId);
    expect(app2.status).toBe('recusada');

    // Verifica que o anúncio mudou para em_andamento
    const postRes = await request(app).get(`/api/posts/${postId}`);
    expect(postRes.body.post.status).toBe('em_andamento');
  });

  it('7. Concorrência/Integridade: Deve recusar segunda seleção em oportunidade já preenchida', async () => {
    const secondSelect = await request(app)
      .post(`/api/applications/${cand2AppId}/select`)
      .set('Cookie', authorCookie)
      .set('X-CSRF-Token', authorCsrf)
      .send({ postId });

    expect(secondSelect.status).toBe(400);
    expect(secondSelect.body.error).toContain('já possui um candidato selecionado');
  });
});
