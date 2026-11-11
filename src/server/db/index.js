import fs from 'fs';
import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';
import { config } from '../config';
class PGliteDb {
    pglite;
    constructor(pglite) {
        this.pglite = pglite;
    }
    async query(sql, params) {
        const res = await this.pglite.query(sql, params || []);
        return {
            rows: (res.rows || []),
            rowCount: res.affectedRows ?? res.rows?.length ?? 0,
        };
    }
    async exec(sql) {
        await this.pglite.exec(sql);
    }
    async transaction(callback) {
        return await this.pglite.transaction(async (tx) => {
            const txWrapper = {
                query: async (sql, params) => {
                    const res = await tx.query(sql, params || []);
                    return {
                        rows: (res.rows || []),
                        rowCount: res.affectedRows ?? res.rows?.length ?? 0,
                    };
                },
                exec: async (sql) => {
                    await tx.exec(sql);
                },
                transaction: async () => {
                    throw new Error('Nested transactions are not supported.');
                },
                close: async () => { },
            };
            return await callback(txWrapper);
        });
    }
    async close() {
        await this.pglite.close();
    }
}
class PgPoolDb {
    pool;
    constructor(pool) {
        this.pool = pool;
    }
    async query(sql, params) {
        const res = await this.pool.query(sql, params || []);
        return {
            rows: (res.rows || []),
            rowCount: res.rowCount ?? 0,
        };
    }
    async exec(sql) {
        await this.pool.query(sql);
    }
    async transaction(callback) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const txWrapper = {
                query: async (sql, params) => {
                    const res = await client.query(sql, params || []);
                    return {
                        rows: (res.rows || []),
                        rowCount: res.rowCount ?? 0,
                    };
                },
                exec: async (sql) => {
                    await client.query(sql);
                },
                transaction: async () => {
                    throw new Error('Nested transactions are not supported.');
                },
                close: async () => { },
            };
            const result = await callback(txWrapper);
            await client.query('COMMIT');
            return result;
        }
        catch (err) {
            await client.query('ROLLBACK');
            throw err;
        }
        finally {
            client.release();
        }
    }
    async close() {
        await this.pool.end();
    }
}
let dbInstance = null;
export async function getDb() {
    if (dbInstance)
        return dbInstance;
    if (config.databaseUrl && config.databaseUrl.trim().length > 0) {
        const pool = new pg.Pool({
            connectionString: config.databaseUrl,
            max: 20,
            idleTimeoutMillis: 30000,
        });
        dbInstance = new PgPoolDb(pool);
    }
    else {
        fs.mkdirSync(config.pgliteDir, { recursive: true });
        const pglite = new PGlite(config.pgliteDir);
        dbInstance = new PGliteDb(pglite);
    }
    return dbInstance;
}
