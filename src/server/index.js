import { createApp } from './app';
import { config } from './config';
import { runSeeds } from './db/seed';
import { ImageService } from './services/imageService';
async function bootstrap() {
    console.log('[ZERO CONTROL] Inicializando servidor...');
    // Garante diretórios de upload
    ImageService.ensureUploadDirs();
    // Executa migrações e seeds idempotentes
    await runSeeds();
    const app = createApp();
    app.listen(config.port, () => {
        console.log(`[ZERO CONTROL] Backend ativo na porta ${config.port} (Ambiente: ${config.nodeEnv})`);
        console.log(`[ZERO CONTROL] Banco de dados: ${config.databaseUrl ? 'PostgreSQL Externo' : 'PGlite Embutido'}`);
    });
}
bootstrap().catch((err) => {
    console.error('[ZERO CONTROL FATAL]', err);
    process.exit(1);
});
