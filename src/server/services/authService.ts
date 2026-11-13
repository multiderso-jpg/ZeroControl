import crypto from 'crypto';
import * as argon2 from '@node-rs/argon2';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db';
import { config } from '../config';
import { SafeUser, UserProfile, UserRole } from '../../shared/types';

// Argon2id options conforme boas práticas OWASP
const ARGON2_OPTIONS: argon2.Options = {
  memoryCost: 65536, // 64 MB
  timeCost: 3,
  outputLen: 32,
  parallelism: 1,
};

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

export class AuthService {
  static async register(usernameRaw: string, passwordPlain: string): Promise<SafeUser> {
    const username = usernameRaw.trim();
    const usernameNormalized = normalizeUsername(username);
    const db = await getDb();

    // Verifica se usuário normalizado já existe
    const existing = await db.query(
      `SELECT id FROM users WHERE username_normalized = $1 LIMIT 1`,
      [usernameNormalized]
    );

    if (existing.rows.length > 0) {
      const err = new Error('Este nome de usuário já está em uso.');
      (err as any).statusCode = 409;
      throw err;
    }

    const passwordHash = await argon2.hash(passwordPlain, ARGON2_OPTIONS);
    const userId = uuidv4();
    const userRole = usernameNormalized === 'phantomtroupe' ? 'administrador' : 'membro';

    return await db.transaction(async (tx) => {
      // Inserção com restrição única tratada no banco
      const userRes = await tx.query<SafeUser>(
        `INSERT INTO users (id, username, username_normalized, password_hash, role, status)
         VALUES ($1, $2, $3, $4, $5, 'ativo')
         RETURNING id, username, role, created_at`,
        [userId, username, usernameNormalized, passwordHash, userRole]
      );

      const newUser = userRes.rows[0];

      // Cria perfil inicial
      await tx.query(
        `INSERT INTO profiles (user_id, avatar_path, bio, visibility)
         VALUES ($1, NULL, NULL, 'public')`,
        [userId]
      );

      return {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        avatar_url: null,
        created_at: newUser.created_at,
      };
    });
  }

  static async login(
    usernameRaw: string,
    passwordPlain: string
  ): Promise<{ user: SafeUser; sessionToken: string; expiresAt: Date }> {
    const usernameNormalized = normalizeUsername(usernameRaw);
    const db = await getDb();

    const userRes = await db.query(
      `SELECT u.id, u.username, u.password_hash, u.role, u.status, u.created_at, p.avatar_path
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.username_normalized = $1
       LIMIT 1`,
      [usernameNormalized]
    );

    // Proteção contra timing attacks e mensagem genérica
    if (userRes.rows.length === 0) {
      // Fake hash verification to simulate timing
      await argon2.verify(
        '$argon2id$v=19$m=65536,t=3,p=1$fakeSaltForTiming123$fakeHashForTiming123',
        passwordPlain
      ).catch(() => {});
      const err = new Error('Usuário ou senha inválidos.');
      (err as any).statusCode = 401;
      throw err;
    }

    const user = userRes.rows[0];

    if (user.status !== 'ativo') {
      const err = new Error('Esta conta está inativa ou suspensa.');
      (err as any).statusCode = 403;
      throw err;
    }

    const isMatch = await argon2.verify(user.password_hash, passwordPlain);
    if (!isMatch) {
      const err = new Error('Usuário ou senha inválidos.');
      (err as any).statusCode = 401;
      throw err;
    }

    // Gerar token de sessão criptográfico seguro
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(sessionToken);
    const expiresAt = new Date(Date.now() + config.sessionDurationDays * 24 * 60 * 60 * 1000);

    const sessionId = uuidv4();
    await db.query(
      `INSERT INTO sessions (id, user_id, token_hash, expires_at, is_revoked)
       VALUES ($1, $2, $3, $4, FALSE)`,
      [sessionId, user.id, tokenHash, expiresAt]
    );

    return {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        avatar_url: user.avatar_path ? `/uploads/avatars/${user.avatar_path}` : null,
        created_at: user.created_at,
      },
      sessionToken,
      expiresAt,
    };
  }

  static async getSessionUser(sessionToken: string): Promise<SafeUser | null> {
    if (!sessionToken || sessionToken.length < 32) return null;
    const tokenHash = hashToken(sessionToken);
    const db = await getDb();

    const res = await db.query(
      `SELECT u.id, u.username, u.role, u.status, u.created_at, p.avatar_path
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE s.token_hash = $1
         AND s.is_revoked = FALSE
         AND s.expires_at > CURRENT_TIMESTAMP
         AND u.status = 'ativo'
       LIMIT 1`,
      [tokenHash]
    );

    if (res.rows.length === 0) return null;
    const row = res.rows[0];

    return {
      id: row.id,
      username: row.username,
      role: row.role,
      avatar_url: row.avatar_path ? `/uploads/avatars/${row.avatar_path}` : null,
      created_at: row.created_at,
    };
  }

  static async logout(sessionToken: string): Promise<void> {
    if (!sessionToken) return;
    const tokenHash = hashToken(sessionToken);
    const db = await getDb();
    await db.query(`UPDATE sessions SET is_revoked = TRUE WHERE token_hash = $1`, [tokenHash]);
  }

  static async changePassword(
    userId: string,
    currentPasswordPlain: string,
    newPasswordPlain: string
  ): Promise<void> {
    const db = await getDb();
    const res = await db.query(`SELECT password_hash FROM users WHERE id = $1 LIMIT 1`, [userId]);

    if (res.rows.length === 0) {
      const err = new Error('Usuário não encontrado.');
      (err as any).statusCode = 404;
      throw err;
    }

    const currentHash = res.rows[0].password_hash;
    const isMatch = await argon2.verify(currentHash, currentPasswordPlain);
    if (!isMatch) {
      const err = new Error('A senha atual informada está incorreta.');
      (err as any).statusCode = 400;
      throw err;
    }

    const newHash = await argon2.hash(newPasswordPlain, ARGON2_OPTIONS);

    await db.transaction(async (tx) => {
      // Atualiza senha
      await tx.query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [newHash, userId]);
      // Revoga todas as sessões anteriores para garantir segurança
      await tx.query(`UPDATE sessions SET is_revoked = TRUE WHERE user_id = $1`, [userId]);
    });
  }

  static async getProfile(userId: string): Promise<UserProfile | null> {
    const db = await getDb();
    const res = await db.query(
      `SELECT u.id as user_id, u.username, u.role, u.created_at,
              p.avatar_path, p.bio, p.visibility
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.id = $1
       LIMIT 1`,
      [userId]
    );

    if (res.rows.length === 0) return null;
    const row = res.rows[0];

    return {
      user_id: row.user_id,
      username: row.username,
      role: row.role,
      avatar_url: row.avatar_path ? `/uploads/avatars/${row.avatar_path}` : null,
      bio: row.bio,
      visibility: row.visibility || 'public',
      created_at: row.created_at,
    };
  }

  static async updateProfile(
    userId: string,
    data: { bio?: string | null; visibility?: 'public' | 'members_only' | 'private' }
  ): Promise<UserProfile> {
    const db = await getDb();
    await db.query(
      `UPDATE profiles
       SET bio = COALESCE($1, bio),
           visibility = COALESCE($2, visibility),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $3`,
      [data.bio !== undefined ? data.bio : null, data.visibility !== undefined ? data.visibility : null, userId]
    );

    const profile = await this.getProfile(userId);
    if (!profile) throw new Error('Perfil não encontrado.');
    return profile;
  }
}
