describe('Suite QA - Porfolio Web Tech', () => {

    beforeEach(() => {
        // Visita la baseUrl configurada en cypress.config.js
        cy.visit('http://127.0.0.1:5502/index.html');
    });

    it('1. Debe cargar la página y mostrar el encabezado principal', () => {
        // Verifica que exista un título principal h1 visible
        cy.get('h1').should('be.visible');
    });

    it('2. Debe validar que existan enlaces o botones interactivos', () => {
        // Comprueba que el porfolio contenga elementos de interacción
        cy.get('a, button').should('have.length.greaterThan', 0);
    });

    it('3. Debe verificar que los enlaces externos se abran en nueva pestaña', () => {
        // Revisa enlaces externos (GitHub, LinkedIn, etc.)
        cy.get('a[href^="https://"]').each(($link) => {
            cy.wrap($link).should('have.attr', 'target', '_blank');
        });
    });

    it('4. Debe verificar la presencia del botón o sección de Proyectos', () => {
        // Valida la presencia de un botón/enlace clave
        cy.get('a, button').filter(':contains("Proyectos"), :contains("Ver")').should('exist');
    });

});