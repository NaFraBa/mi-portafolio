import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    use: {
        headless: false,
        baseURL: 'https://nafraba.github.io/mi-portafolio/',
    },
});