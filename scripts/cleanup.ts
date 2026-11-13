import { getDb } from '../src/server/db';
import { runMigrations } from '../src/server/db/migrate';

async function main() {
  console.log('[CLEANUP] Executando migrações...');
  await runMigrations();
  const db = await getDb();

  console.log('[CLEANUP] Atualizando PhantomTroupe para administrador...');
  const admRes = await db.query(
    `UPDATE users SET role = 'administrador' WHERE LOWER(username) = 'phantomtroupe' RETURNING id, username, role`
  );
  console.log('PhantomTroupe atualizado:', admRes.rows);

  console.log('[CLEANUP] Removendo posts de teste...');
  const delRes = await db.query(
    `DELETE FROM posts WHERE title LIKE '%suspeito%' OR title LIKE '%Desenvolvimento de APIs%' OR title LIKE '%Criação de Identidade Visual%'`
  );
  console.log('Posts de teste removidos:', delRes.rowCount);

  const remaining = await db.query('SELECT count(*) as count FROM posts');
  console.log('Total de posts restantes no banco:', remaining.rows[0].count);

  await db.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('[CLEANUP ERROR]', err);
  process.exit(1);
});
