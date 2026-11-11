import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/server/app';
import { runSeeds } from '../src/server/db/seed';
const app = createApp();
describe('Mural da Guilda e Publicações - Zero Control', () => {
    let user1Cookie;
    let user1Csrf;
    let user2Cookie;
    let user2Csrf;
    let createdPostId;
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
        user1Cookie = res1.headers['set-cookie'];
        const m1 = user1Cookie.find((c) => c.startsWith('zc_csrf='))?.match(/zc_csrf=([^;]+)/);
        user1Csrf = m1 ? m1[1] : '';
        // Cria Usuário 2
        const res2 = await request(app)
            .post('/api/auth/register')
            .send({
            username: `outro_usuario_${t}`,
            password: 'PasswordSeguraComMaisDe15Chars!',
        });
        user2Cookie = res2.headers['set-cookie'];
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
            intention: 'Preciso de um serviço',
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
        expect(res.body.details.some((d) => d.field === 'city')).toBe(true);
        expect(res.body.details.some((d) => d.field === 'state')).toBe(true);
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
});
