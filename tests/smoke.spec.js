const { test, expect } = require('@playwright/test');

test.describe('Smoke Tests Pool - Portfolio Ignacio Fraile @smoke', () => {

  test.beforeEach(async ({ page }) => {
    const response = await page.goto('./');
    expect(response?.status()).toBe(200);
  });

  test('ST-01: Respuesta del servidor y carga del Hero', async ({ page }) => {
    await expect(page).toHaveTitle(/Ignacio Fraile/i);
    await expect(page.locator('text=Ignacio Fraile').first()).toBeVisible();
    await expect(page.locator('text=Profesional IT').first()).toBeVisible();
  });

  test('ST-02: Navegación del menú ancla a secciones clave', async ({ page }) => {
    // Usamos el botón/enlace 'Ver Proyectos' o 'Proyectos' que es visible desde el inicio
    const btnProyectos = page.locator('text=Ver Proyectos').first();
    await btnProyectos.click();

    // Verificamos que la sección My Projects se muestra en pantalla
    await expect(page.locator('text=My Projects').first()).toBeVisible();
  });

  test('ST-03: Módulo interactivo de Skills', async ({ page }) => {
    const loadSkillsBtn = page.getByRole('button', { name: /Cargar Habilidades/i });
    if (await loadSkillsBtn.isVisible()) {
      await loadSkillsBtn.click();
    }

    await expect(page.locator('text=FrontEnd').first()).toBeVisible();
    await expect(page.locator('text=Testing').first()).toBeVisible();
    await expect(page.locator('text=Teleco').first()).toBeVisible();
  });

  test('ST-04: Renderizado de tarjetas y pestañas de proyectos', async ({ page }) => {
    // 1. La pestaña activa por defecto (Telecomunicaciones) debe ser visible
    await expect(page.locator('text=Ingeniería de Telecomunicaciones').first()).toBeVisible();

    // 2. Hacemos clic en la pestaña 'Testing & QA' para revelar el proyecto de QA
    const tabQA = page.locator('text=Testing & QA').first();
    if (await tabQA.isVisible()) {
      await tabQA.click();
    }

    // 3. Verificamos que el proyecto de QA esté cargado en el DOM
    await expect(page.locator('text=Aseguramiento de Calidad').first()).toBeAttached();
  });

  test('ST-05: Verificación de canales de contacto, redes sociales y descarga de CV', async ({ page }) => {
    const contactSection = page.locator('#contact');

    // 1. Correo electrónico
    const mailLink = contactSection.getByRole('link', { name: /Correo|Email/i }).first();
    await expect(mailLink).toBeVisible();
    const mailHref = await mailLink.getAttribute('href');
    expect(mailHref).toMatch(/^mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);

    // 2. LinkedIn
    const linkedInLink = contactSection.getByRole('link', { name: /LinkedIn/i }).first();
    await expect(linkedInLink).toBeVisible();
    expect(await linkedInLink.getAttribute('href')).toContain('linkedin.com');

    // 3. GitHub (sección Contacto)
    const gitHubLink = contactSection.getByRole('link', { name: /GitHub/i }).first();
    await expect(gitHubLink).toBeVisible();
    expect(await gitHubLink.getAttribute('href')).toContain('github.com');

    // 4. Descarga CV
    const cvLink = contactSection.getByRole('link', { name: /Descargar CV/i }).first();
    await expect(cvLink).toBeVisible();
    expect(await cvLink.getAttribute('href')).toBeTruthy();

    // 5. Ubicación
    await expect(page.locator('text=Madrid, España').first()).toBeVisible();
  });

});


