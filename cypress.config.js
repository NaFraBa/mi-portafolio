const { defineConfig } = require('cypress');

module.exports = defineConfig({
  allowCypressEnv: false, // Quita el warning de seguridad de Cypress 15.19
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports',
    charts: true,
    reportPageTitle: 'Reporte QA - Portfolio Tech',
    embeddedScreenshots: true,
    inlineAssets: true,
  },
  e2e: {
    baseUrl: 'https://nafraba.github.io/mi-portafolio',
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
    },
  },
});


