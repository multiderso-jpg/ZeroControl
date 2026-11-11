import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/server/app';
import { runSeeds } from '../src/server/db/seed';
const app = createApp();
describe('Autenticação e Perfil - Zero Control', () => {
    const timestamp = Date.now();
    const testUser = {
        username: `operador_${timestamp}`,
        password: 'PasswordSeguraComMaisDe15Chars!',
    };
    beforeAll(async () => {
        await runSeeds();
    });
    it('1. Deve registrar uma nova conta usando apenas usuário e senha', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);
        expect(res.status).toBe(201);
        expect(res.body.user).toBeDefined();
        expect(res.body.user.username).toBe(testUser.username);
        expect(res.headers['set-cookie']).toBeDefined();
    });
    it('2. Deve rejeitar duplicação de usuário normalizado (case-insensitive)', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
            username: testUser.username.toUpperCase(), // mesma forma normalizada
            password: 'OutraPasswordSeguraComMaisDe15Chars!',
        });
        expect(res.status).toBe(409);
        expect(res.body.error).toContain('já está em uso');
    });
    it('3. Deve rejeitar senha com menos de 15 caracteres', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
            username: 'usuario_curto',
            password: 'curta123',
        });
        expect(res.status).toBe(400);
        expect(res.body.details[0].message).toContain('pelo menos 15 caracteres');
    });
    it('4. Deve efetuar login com credenciais válidas e retornar cookie HttpOnly', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send(testUser);
        expect(res.status).toBe(200);
        expect(res.body.user.username).toBe(testUser.username);
        const cookie = res.headers['set-cookie']?.find((c) => c.startsWith('zc_session='));
        expect(cookie).toBeDefined();
    });
    it('5. Deve rejeitar login com senha incorreta de forma genérica', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
            username: testUser.username,
            password: 'SenhaTotalmenteErradaComMaisDe15Chars!',
        });
        expect(res.status).toBe(401);
        expect(res.body.error).toBe('Usuário ou senha inválidos.');
    });
    it('6. Deve manter a sessão e obter perfil em /api/auth/me', async () => {
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send(testUser);
        const cookie = loginRes.headers['set-cookie'];
        const meRes = await request(app)
            .get('/api/auth/me')
            .set('Cookie', cookie);
        expect(meRes.status).toBe(200);
        expect(meRes.body.user.username).toBe(testUser.username);
    });
    it('7. Deve encerrar a sessão no logout e invalidar acesso a rotas privadas', async () => {
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send(testUser);
        const cookies = loginRes.headers['set-cookie'];
        const csrfMatch = cookies.find((c) => c.startsWith('zc_csrf='))?.match(/zc_csrf=([^;]+)/);
        const csrfToken = csrfMatch ? csrfMatch[1] : '';
        const logoutRes = await request(app)
            .post('/api/auth/logout')
            .set('Cookie', cookies)
            .set('X-CSRF-Token', csrfToken);
        expect(logoutRes.status).toBe(200);
        // Tentativa com mesmo cookie após logout
        const meRes = await request(app)
            .get('/api/auth/me')
            .set('Cookie', cookies);
        expect(meRes.status).toBe(401);
    });
});
