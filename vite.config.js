import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
    ],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['resources/js/__tests__/setup.ts'],
        include: ['resources/js/__tests__/**/*.test.{ts,tsx}'],
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
        },
    },
});
