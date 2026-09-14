import { test, expect } from '@playwright/test';

test('Carga correcta del portafolio', async ({ page }) => {
    await page.goto('https://nafraba.github.io/mi-portafolio/');
    await expect(page).toHaveTitle(/.+/);
});