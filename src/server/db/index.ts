import fs from 'fs';
import path from 'path';
import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';
import { config } from '../config';

export interface DbQueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

export interface DbInterface {
  query<T = any>(sql: string, params?: any[]): Promise<DbQueryResult<T>>;
  exec(sql: string): Promise<void>;
  transaction<T>(callback: (tx: DbInterface) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

class PGliteDb implements DbInterface {
  private pglite: PGlite;

  constructor(pglite: PGlite) {
    this.pglite = pglite;
  }

  async query<T = any>(sql: string, params?: any[]): Promise<DbQueryResult<T>> {
    const res = await this.pglite.query<T>(sql, params || []);
    return {
      rows: (res.rows || []) as T[],
      rowCount: res.affectedRows ?? res.rows?.length ?? 0,
    };
  }

  async exec(sql: string): Promise<void> {
    await this.pglite.exec(sql);
  }

  async transaction<T>(callback: (tx: DbInterface) => Promise<T>): Promise<T> {
    return await this.pglite.transaction(async (tx) => {
      const txWrapper: DbInterface = {
        query: async <R = any>(sql: string, params?: any[]) => {
          const res = await tx.query<R>(sql, params || []);
          return {
            rows: (res.rows || []) as R[],
            rowCount: res.affectedRows ?? res.rows?.length ?? 0,
          };
        },
        exec: async (sql: string) => {
          await tx.exec(sql);
        },
        transaction: async () => {
          throw new Error('Nested transactions are not supported.');
        },
        close: async () => {},
      };
      return await callback(txWrapper);
    });
  }

  async close(): Promise<void> {
    await this.pglite.close();
  }
}

class PgPoolDb implements DbInterface {
  private pool: pg.Pool;

  constructor(pool: pg.Pool) {
    this.pool = pool;
  }

  async query<T = any>(sql: string, params?: any[]): Promise<DbQueryResult<T>> {
    const res = await this.pool.query<any>(sql, params || []);
    return {
      rows: (res.rows || []) as T[],
      rowCount: res.rowCount ?? 0,
    };
  }

  async exec(sql: string): Promise<void> {
    await this.pool.query(sql);
  }

  async transaction<T>(callback: (tx: DbInterface) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const txWrapper: DbInterface = {
        query: async <R = any>(sql: string, params?: any[]) => {
          const res = await client.query<any>(sql, params || []);
          return {
            rows: (res.rows || []) as R[],
            rowCount: res.rowCount ?? 0,
          };
        },
        exec: async (sql: string) => {
          await client.query(sql);
        },
        transaction: async () => {
          throw new Error('Nested transactions are not supported.');
        },
        close: async () => {},
      };
      const result = await callback(txWrapper);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

let dbInstance: DbInterface | null = null;

export async function getDb(): Promise<DbInterface> {
  if (dbInstance) return dbInstance;

  if (config.databaseUrl && config.databaseUrl.trim().length > 0) {
    const isSupabase = config.databaseUrl.includes('supabase.com') || config.databaseUrl.includes('pooler.supabase.com');
    const pool = new pg.Pool({
      connectionString: config.databaseUrl,
      max: process.env.VERCEL ? 3 : 20,
      idleTimeoutMillis: 30000,
      ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
    });
    dbInstance = new PgPoolDb(pool);
  } else {
    fs.mkdirSync(config.pgliteDir, { recursive: true });
    const pglite = new PGlite(config.pgliteDir);
    dbInstance = new PGliteDb(pglite);
  }

  return dbInstance;
}
