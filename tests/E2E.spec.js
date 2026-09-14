import { test, expect } from '@playwright/test';

test.describe('Pruebas E2E - Portafolio', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://nafraba.github.io/mi-portafolio/');
    });

    test('Carga inicial y verificación de título', async ({ page }) => {
        await expect(page).toHaveTitle(/.+/);
    });

    test('Navegación e interacción con componentes', async ({ page }) => {
        // Ejemplo de selección accesible mediante roles ARIA
        const contactoBtn = page.getByText(/contacto/i).first();
        await expect(contactoBtn).toBeVisible();
        await contactoBtn.click();
    });
});