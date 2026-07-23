const { defineConfig } = require('cypress');

module.exports = defineConfig({
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
        reportDir: 'cypress/reports',
        charts: true,                // Genera los gráficos en el reporte
        reportPageTitle: 'Reporte QA - Porfolio Tech',
        embeddedScreenshots: true,   // Guarda fotos si algo falla
        inlineAssets: true,          // Todo en un solo archivo fácil de abrir
    },
    e2e: {
        // La dirección donde corre tu servidor local de VS Code / Antigravity
        baseUrl: 'http://127.0.0.1:5501/index.html',
        setupNodeEvents(on, config) {
            require('cypress-mochawesome-reporter/plugin')(on);
        },
    },
});