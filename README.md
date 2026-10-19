# Portafolio Web & Suite de Calidad QA Automatizada (CI/CD)

[![Pipeline CI - QA Completo](https://github.com/NaFraBa/mi-portafolio/actions/workflows/ci.yml/badge.svg)](https://github.com/NaFraBa/mi-portafolio/actions/workflows/ci.yml)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-2563EB?style=flat&logo=github)](https://nafraba.github.io/mi-portafolio/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E%20&%20Smoke-45BA4B?style=flat&logo=playwright&logoColor=white)](https://playwright.dev/)
[![Cypress](https://img.shields.io/badge/Cypress-Component%20&%20E2E-17202C?style=flat&logo=cypress)](https://cypress.io/)
[![Python](https://img.shields.io/badge/Python-Excel%20Reporting-3776AB?style=flat&logo=python&logoColor=white)](https://python.org/)

Repositorio que alberga el código fuente del portafolio personal y su **infraestructura profesional de Aseguramiento de Calidad (QA)** con integración continua (CI/CD) automatizada mediante GitHub Actions.

👉 **Despliegue en producción:** [https://nafraba.github.io/mi-portafolio/](https://nafraba.github.io/mi-portafolio/)

---

## 🚀 Pipeline de Integración Continua (CI/CD con GitHub Actions)

Cada vez que se realiza un `push` o `pull_request` a la rama principal (`main`), se dispara automáticamente el flujo [`.github/workflows/ci.yml`](file:///.github/workflows/ci.yml) en un contenedor limpio de Ubuntu (`ubuntu-latest`).

```text
[ Push a main ]
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1. Preparación: Checkout, Node.js 22, Python 3.12 y Navegadores │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Playwright: Smoke Tests, Pruebas de Carga y Flujos E2E       │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. Cypress: Navegación, Componentes e Interacción UI            │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. Python: Consolidación y Generación de Dashboard Excel        │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. Publicación de Artefactos: Pack-Completo-Reportes-QA (14 d)  │
└─────────────────────────────────────────────────────────────────┘
```

### Evidencias y Artefactos Generados en la Nube
Al finalizar el pipeline, GitHub Actions empaqueta automáticamente y deja disponible para descarga:
* **Reporte interactivo HTML de Playwright:** Trazas, tiempos y capturas paso a paso.
* **Reporte Mochawesome de Cypress:** Métricas de aserciones y navegación.
* **Dashboard Ejecutivo en Excel (`QA_Executive_Dashboard.xlsx`):** KPIs consolidados (Pass Rate %, Total Pruebas, Fallos y Gráficos dinámicos).

---

## 📁 Estructura del Proyecto

```text
Portfolio/
├── .github/
│   └── workflows/
│       └── ci.yml             # Definición del pipeline CI/CD en GitHub Actions
├── assets/                    # Recursos estáticos (imágenes, iconos, tipografías)
├── cypress/                   # Framework de pruebas con Cypress
│   ├── e2e/                   # Specs (smoke.cy.js, carga.cy.js, navegacion.cy.js)
│   ├── reports/               # Reportes HTML y JSON generados por Mochawesome
│   └── support/               # Comandos personalizados y utilidades de entorno
├── excel-dashboard/           # Automatización de métricas ejecutivas en Excel
│   ├── generate_dashboard.py  # Script Python que procesa JSONs y genera Excel
│   └── QA_Executive_Dashboard.xlsx # Dashboard compilado con gráficos y KPIs
├── tests/                     # Framework de pruebas con Playwright
│   ├── smoke.spec.js          # Smoke tests (Hero, títulos, disponibilidad HTTP)
│   ├── carga.spec.js          # Validaciones de tiempo de respuesta y carga
│   └── E2E.spec.js            # Flujos integrales de usuario y accesibilidad
├── app.js                     # Interactividad, lógica dinámica y animaciones de la UI
├── cypress.config.js          # Configuración de Cypress y persistencia de reportes
├── index.html                 # Estructura semántica principal del portafolio
├── package.json               # Dependencias de testing y scripts automatizados
├── playwright.config.js       # Configuración de Playwright (headless, workers, reportes)
├── requirements.txt           # Dependencias de Python para el dashboard (openpyxl)
├── README.md                  # Documentación técnica integral
└── styles.css                 # Sistema de diseño, CSS moderno y responsive design
```

---

## 🛠️ Tecnologías y Herramientas

* **Frontend:** HTML5 semántico, CSS3 moderno (Variables CSS, Flexbox/Grid, Animaciones), JavaScript moderno (ES6+).
* **Testing E2E & Automatización:**
  * **Playwright:** Ejecución en paralelo ultra-rápida, modo *headless*, inspector interactivo con `--ui` y grabación con *Codegen*.
  * **Cypress:** Pruebas funcionales de interfaz, motor Mochawesome para reportes estructurados.
* **Métricas & QA Reporting:** Python 3 + `openpyxl` para modelado de datos, tablas dinámicas, fórmulas de *Pass Rate* y gráficos en Excel.
* **DevOps / CI-CD:** GitHub Actions y GitHub Pages.

---

## ⚡ Comandos Rápidos de Ejecución (Scripts de NPM)

Desde la terminal en la raíz del proyecto:

### 🌟 Ejecución Completa QA
Ejecuta Playwright + Cypress + Generación del Excel de una sola vez:
```bash
npm run qa:full
```

### 🎭 Pruebas con Playwright
```bash
# Ejecutar todas las pruebas en segundo plano (rápido y silencioso)
npm run test:playwright

# Ejecutar únicamente los Smoke Tests
npm run test:playwright:smoke

# Ejecutar pruebas de carga
npm run test:playwright:carga

# Ejecutar pruebas End-to-End
npm run test:playwright:e2e

# Modo interactivo visual con panel de control paso a paso
npm run test:playwright:ui

# Abrir el último reporte HTML generado
npm run report:playwright
```

### 🌲 Pruebas con Cypress
```bash
# Ejecutar todas las pruebas de Cypress por consola
npm run test:cypress

# Ejecutar solo Smoke Tests de Cypress
npm run test:cypress:smoke

# Ejecutar pruebas de Navegación de Cypress
npm run test:cypress:navegacion

# Abrir la interfaz gráfica interactiva (Test Runner)
npm run cypress:open
```

### 📊 Generación del Dashboard Ejecutivo en Excel
```bash
# Procesa los reportes JSON de Playwright y Cypress y crea el Excel
npm run report:excel
```

---

## ⚙️ Configuración de Entornos

### Playwright (`playwright.config.js`)
Configurado para ejecución óptima tanto en local como en GitHub Actions:
* **Headless:** Habilitado de fondo para máxima velocidad sin saturar el escritorio.
* **Workers:** Paralelismo automático según los núcleos del procesador.
* **Reporters:** Genera reporte interactivo HTML (`playwright-report`) y volcado de datos en JSON (`results.json`).

### Cypress (`cypress.config.js`)
* **Reporter:** `cypress-mochawesome-reporter` con gráficos y capturas integradas.
* **`saveJson: true`:** Mantiene los reportes individuales en `.jsons/` para que el script de Python pueda consolidar las métricas de Cypress en el Excel.

---

## 📊 Matriz de Cobertura QA

| Módulo / Área Web | Herramienta | Tipo de Prueba | Criterio de Aceptación |
| :--- | :---: | :---: | :--- |
| **Disponibilidad & Hero** | Playwright / Cypress | Smoke / HTTP | Respuesta 200, renderizado del Hero y títulos de identidad. |
| **Navegación & Menú** | Cypress / Playwright | E2E / Funcional | Enlaces ancla realizan scroll suave y actualizan el hash en la URL. |
| **Módulo de Skills** | Playwright / Cypress | Interactivo / DOM | Carga dinámica de habilidades técnicas (FrontEnd, Testing, Teleco). |
| **Proyectos Destacados** | Playwright / Cypress | UI / Componente | Pestañas alternan tarjetas de Telecomunicaciones y Testing & QA. |
| **Contacto & Redes** | Playwright / Cypress | Enlaces / CV | Enlaces de correo (`mailto:`), LinkedIn, GitHub y descarga de CV válidos. |
| **Rendimiento y Carga** | Playwright / Cypress | Performance | Tiempos de carga y estabilidad por debajo de los umbrales límite. |

---

## 📤 Publicación de Cambios en Git

Para subir actualizaciones a GitHub y activar el pipeline automático:

```bash
# 1. Comprobar archivos modificados
git status

# 2. Añadir los cambios
git add .

# 3. Crear commit descriptivo
git commit -m "docs: actualizar README con arquitectura de pipeline CI/CD y badges"

# 4. Enviar a GitHub (dispara el pipeline CI automáticamente)
git push origin main
```
