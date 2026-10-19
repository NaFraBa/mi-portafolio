import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Carpeta donde residen todos tus specs
  testDir: './tests',

  // Ejecución en paralelo para mayor rapidez
  fullyParallel: true,

  // Reintentos automáticos solo si está en CI (entorno de integración continua)
  retries: process.env.CI ? 2 : 0,

  // Reporter con dashboard web interactivo
   reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }], // <-- Añade esta línea
    ['list']
  ],


  use: {
    // URL base de tu portfolio en GitHub Pages (sin barra final para evitar duplicados en rutas)
    baseURL: 'https://nafraba.github.io/mi-portafolio/',

    // Abre el navegador visible tal como lo tenías configurado
    headless: false,

    // Captura trazas y screenshots si un test falla
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // Proyectos de navegadores
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
