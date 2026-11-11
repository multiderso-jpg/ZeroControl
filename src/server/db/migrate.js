import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from './index';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export async function runMigrations() {
    console.log('[DB] Iniciando migração do esquema Zero Control...');
    const db = await getDb();
    const schemaPath = path.resolve(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    // Executa comandos múltiplos do DDL
    await db.exec(schemaSql);
    console.log('[DB] Migração concluída com sucesso!');
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    runMigrations()
        .then(async () => {
        const db = await getDb();
        await db.close();
        process.exit(0);
    })
        .catch((err) => {
        console.error('[DB] Erro na migração:', err);
        process.exit(1);
    });
}
