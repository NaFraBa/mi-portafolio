describe('Smoke Tests Pool - Portfolio Ignacio Fraile (Producción)', () => {
  const liveUrl = 'https://github.io';

  beforeEach(() => {
    cy.visit('/');
  });

  it('ST-01: Respuesta del servidor y disponibilidad HTTP 200', () => {
    cy.request(liveUrl).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.duration).to.be.lessThan(3000);
    });
  });

  it('ST-02: Carga del Hero y elementos visuales de identidad', () => {
    cy.title().should('include', 'Ignacio Fraile');
    cy.contains(/Ignacio Fraile/i).should('be.visible');
    cy.contains(/Profesional IT/i).should('be.visible');
    cy.contains('a', /Ver Proyectos/i).should('be.visible');
    cy.contains('a', /Contactar/i).should('be.visible');
  });

  it('ST-03: Navegación a sección de Proyectos', () => {
    cy.contains('Ver Proyectos').first().click();
    cy.contains(/My Projects/i).scrollIntoView().should('be.visible');
  });

  it('ST-04: Carga dinámica del módulo de habilidades (Skills)', () => {
    // Hacemos scroll hasta la sección de Skills para activar la animación reveal-fade-in
    cy.contains('FrontEnd').scrollIntoView();

    cy.get('body').then(($body) => {
      const btn = $body.find('button:contains("Cargar Habilidades"), a:contains("Cargar Habilidades")');
      if (btn.length > 0) {
        cy.wrap(btn).scrollIntoView().click({ force: true });
      }
    });

    cy.contains('FrontEnd').scrollIntoView().should('be.visible');
    cy.contains('Testing').scrollIntoView().should('be.visible');
    cy.contains('Teleco').scrollIntoView().should('be.visible');
  });

  it('ST-05: Renderizado de tarjetas de proyectos destacados', () => {
    // Scroll hacia el proyecto para quitar el opacity: 0
    cy.contains(/Ingeniería de Telecomunicaciones/i).scrollIntoView().should('be.visible');
    cy.contains('Testing & QA').first().scrollIntoView().click({ force: true });
    cy.contains(/Aseguramiento de Calidad/i).should('exist');
  });

  it('ST-06: Verificación de canales de contacto, redes sociales y correo', () => {
    // Scroll al pie de página / sección de contacto para activar la animación
    cy.get('#contact').scrollIntoView();

    // 1. Enlace de Correo Electrónico (mailto)
    cy.get('#contact').contains('a', /Correo|Email/i)
      .should('be.visible')
      .and('have.attr', 'href')
      .then((href) => {
        expect(href).to.match(/^mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
      });

    // 2. Enlace a LinkedIn
    cy.get('#contact').contains('a', /LinkedIn/i)
      .scrollIntoView()
      .should('be.visible')
      .and('have.attr', 'href')
      .then((href) => {
        expect(href).to.include('linkedin.com');
      });

    cy.get('#contact').contains('a', /LinkedIn/i)
      .should('have.attr', 'target', '_blank');

    // 3. Enlace a GitHub (sección Contacto)
    cy.get('#contact').contains('a', /GitHub/i)
      .scrollIntoView()
      .should('be.visible')
      .and('have.attr', 'href')
      .then((href) => {
        expect(href).to.include('github.com');
      });

    cy.get('#contact').contains('a', /GitHub/i)
      .should('have.attr', 'target', '_blank');

    // 4. Enlace de Descarga de CV
    cy.get('#contact').contains('a', /Descargar CV/i)
      .scrollIntoView()
      .should('be.visible')
      .and('have.attr', 'href')
      .and('not.be.empty');

    // 5. Ubicación geográfica informativa
    cy.get('#contact').contains(/Madrid, España/i).scrollIntoView().should('be.visible');
  });
});
