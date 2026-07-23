describe('Suite QA - Navegación y Menú Principal', () => {

    beforeEach(() => {
        // Carga la URL base configurada en cypress.config.js
        cy.visit('http://127.0.0.1:5502/index.html');
    });

    it('1. Debe mostrar el menú de navegación principal', () => {
        // Verifica que exista la barra de navegación o lista de links
        cy.get('nav').should('be.visible');
    });

    it('2. Debe contener los enlaces clave de la barra de navegación', () => {
        // Comprueba la presencia de secciones habituales (Inicio, Sobre mí, Proyectos, Contacto)
        cy.get('nav').within(() => {
            cy.get('a, button').filter(':contains("Inicio"), :contains("Sobre"), :contains("Proyectos"), :contains("Contacto")')
                .should('have.length.greaterThan', 0);
        });
    });

    it('3. Debe hacer scroll a la sección correspondiente al hacer clic en un enlace', () => {
        // Busca un enlace del menú que apunte a un ID interno (ej. href="#contacto" o href="#contact")
        cy.get('nav a[href^="#"]').first().then(($link) => {
            const targetId = $link.attr('href');

            // Hace clic en el enlace
            cy.wrap($link).click();

            // Verifica que el destino exista y sea visible en la pantalla
            cy.get(targetId).should('be.visible');
        });
    });

    it('4. Debe validar que la URL contenga el hash al navegar a una sección', () => {
        cy.get('nav a[href^="#"]').last().then(($link) => {
            const hash = $link.attr('href'); // Obtiene ej: "#contact"

            cy.wrap($link).click();

            // 1. Sincroniza el tiempo esperando a que la sección sea visible
            cy.get(hash).should('be.visible');

            // 2. Comprueba la URL una vez completada la animación de scroll
            cy.url().should('include', hash);
        });
    });

});