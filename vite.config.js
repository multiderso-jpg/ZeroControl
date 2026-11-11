import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
export default defineConfig({
    root: 'src/client',
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            '@shared': path.resolve(__dirname, './src/shared'),
            '@client': path.resolve(__dirname, './src/client'),
        },
    },
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
            },
            '/uploads': {
                target: 'http://localhost:3001',
                changeOrigin: true,
            },
        },
    },
    build: {
        outDir: '../../dist/client',
        emptyOutDir: true,
    },
});
