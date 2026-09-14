# Portafolio Web & Suite de Testing Automatizado (Playwright & Cypress)

Repositorio que contiene el código fuente, la arquitectura de componentes y la suite completa de pruebas automatizadas End-to-End (E2E) para el portafolio web personal:
👉 **URL del proyecto:** [https://nafraba.github.io/mi-portafolio/](https://nafraba.github.io/mi-portafolio/)

---

## 📁 Estructura General del Proyecto

```text
Portfolio/
├── assets/                  # Recursos estáticos (imágenes, iconos, tipografías)
├── cypress/                 # Framework de testing E2E con Cypress
│   ├── e2e/                 # Suites de pruebas (navegacion.cy.js, etc.)
│   ├── reports/             # Reportes de ejecución generados
│   ├── screenshots/         # Capturas de pantalla de validación / fallos
│   └── support/             # Comandos personalizados y utilidades (e2e.js, commands.js)
├── excel-dashboard/         # Módulo de generación de reportes y métricas QA en Excel
├── tests/                   # Framework de testing E2E con Playwright
│   ├── E2E.spec.js          # Pruebas integrales de navegación, DOM y accesibilidad
│   └── portfolio.spec.js    # Verificaciones de carga, títulos e interactividad
├── .gitignore               # Exclusiones de Git (node_modules, reportes, cachés, .venv)
├── app.js                   # Lógica e interactividad de la aplicación web (DOM, animaciones)
├── cypress.config.js        # Configuración principal del entorno Cypress
├── index.html               # Estructura semántica principal de la web
├── package.json             # Dependencias del proyecto y scripts automatizados
├── playwright.config.js     # Configuración principal del entorno Playwright
├── README.md                # Documentación técnica completa
└── styles.css               # Estilos visuales, temas y diseño responsivo
```

---

## 🛠️ Tecnologías Empleadas

- **Frontend:** HTML5 semántico, CSS3 moderno (diseño responsivo, animaciones), JavaScript (ES6+).
- **Testing E2E & Automatización:**
  - **Playwright:** Ejecución multiplataforma (Chromium, Firefox, WebKit), modo `--ui`, inspección con Locator / ARIA tree y grabación con Codegen.
  - **Cypress:** Pruebas de integración visual, Test Runner interactivo, aserciones Chai/Mocha y generación de reportes.
- **Métricas & QA Reporting:** Scripts en Python con `openpyxl` en `excel-dashboard/` para consolidación de métricas de calidad.
- **Control de Versiones y Despliegue:** Git, GitHub Pages.

---

## 🚀 Requisitos e Instalación

1. **Clonar o situarse en el repositorio:**
   ```bash
   cd Portfolio
   ```

2. **Instalar dependencias de Node.js:**
   ```bash
   npm install
   ```

3. **Instalar los navegadores de Playwright:**
   ```bash
   npx playwright install
   ```

---

## 🎭 Pruebas con Playwright

Las pruebas de Playwright se encuentran en el directorio `tests/` y validan la carga rápida, la visibilidad de elementos clave y los flujos de interacción.

### Comandos de Ejecución

```bash
# Ejecutar todas las pruebas en segundo plano (Headless)
npx playwright test

# Ejecutar viendo el navegador interactuar en vivo (Headed)
npx playwright test --headed

# Abrir el entorno visual e interactivo (Playwright UI Mode)
npx playwright test --ui

# Generar y grabar pruebas automáticamente interactuando con la web
npx playwright codegen https://nafraba.github.io/mi-portafolio/

# Ver el último reporte HTML generado
npx playwright show-report
```

### Configuración (`playwright.config.js`)
```javascript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    headless: false,
    baseURL: 'https://nafraba.github.io/mi-portafolio/',
    trace: 'on-first-retry',
  },
});
```

---

## 🌲 Pruebas con Cypress

Las pruebas de Cypress residen en `cypress/e2e/` y validan el comportamiento funcional, los eventos de clic y la navegación fluida.

### Comandos de Ejecución

```bash
# Abrir la interfaz interactiva gráfica de Cypress (Test Runner)
npx cypress open

# Ejecutar todas las suites por consola en modo desatendido
npx cypress run

# Ejecutar un archivo de prueba específico
npx cypress run --spec "cypress/e2e/navegacion.cy.js"
```

### Configuración (`cypress.config.js`)
```javascript
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://nafraba.github.io/mi-portafolio/",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
```

---

## 📊 Cobertura de Pruebas

| ID | Herramienta | Caso de Prueba | Criterio de Aceptación |
| :---: | :---: | :--- | :--- |
| **TC-01** | Playwright | Verificación de carga y título | La página responde con HTTP 200 y el título no está vacío. |
| **TC-02** | Playwright | Navegación de secciones (Contacto/Proyectos) | Localización semántica del botón/enlace y scroll/apertura correcta. |
| **TC-03** | Playwright | Accesibilidad y roles ARIA | Elementos principales cuentan con accesibilidad e interactividad detectable. |
| **TC-04** | Cypress | Renderizado del DOM principal | Estructura `#root` o contenedores principales visibles sin errores en consola. |
| **TC-05** | Cypress | Interacción y transición de tarjetas | Clic en elementos de proyectos o habilidades despliega el contenido esperado. |

---

## 📤 Flujo de Trabajo en Git

Para registrar y sincronizar los cambios locales con el repositorio remoto en GitHub:

```bash
# 1. Comprobar archivos modificados y nuevos
git status

# 2. Agregar todos los cambios respetando las exclusiones de .gitignore
git add .

# 3. Crear commit descriptivo
git commit -m "docs: actualizar README y suite de pruebas E2E con Cypress y Playwright"

# 4. Subir los cambios a GitHub
git push
```
