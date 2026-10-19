const { defineConfig } = require('cypress');

module.exports = defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports',
    charts: true,
    reportPageTitle: 'Reporte QA - Portfolio Tech',
    embeddedScreenshots: true,
    inlineAssets: true,
    saveJson: true,
  },
  e2e: {
    baseUrl: 'https://nafraba.github.io/mi-portafolio',
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
    },
  },
});


