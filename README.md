# Eneko Ruiz Mollón — Currículum Vitae Interactivo

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/es/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/es/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/es/docs/Web/JavaScript)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

Este repositorio contiene el código fuente de mi currículum web interactivo, diseñado y desarrollado desde cero con un enfoque de alto rendimiento, minimalismo estético y total accesibilidad.

🚀 **Ver versión en vivo:** [https://eneko-ruiz-curriculum.vercel.app/](https://eneko-ruiz-curriculum.vercel.app/)

---

## ⚖️ Enfoque Técnico y Simplicidad

En lugar de utilizar plantillas genéricas o frameworks robustos innecesarios para un documento de este tipo, el proyecto ha sido concebido bajo principios de **simplicidad y optimización nativa**:

- **Vanilla Stack:** Desarrollo puro sin dependencias externas, asegurando un ciclo de vida estable y compatibilidad garantizada.
- **Eficiencia de Recursos:** Carga optimizada con un tamaño total de recursos inferior a 100KB, logrando tiempos de respuesta inmediatos.
- **Código Artesanal:** Cada selector CSS y función de JavaScript ha sido escrita a mano para garantizar estándares elevados de accesibilidad (WCAG 2.1) y un diseño visual coherente y limpio.

---

## ⚙️ Características del Sistema

### 🌎 Internacionalización Nativa (i18n)

Soporte nativo y dinámico para **20 idiomas** mediante un motor propio que gestiona:

- Detección automática de la configuración regional del navegador.
- Persistencia del idioma mediante parámetros en la URL (`?lang=`) y almacenamiento local.
- Soporte completo para lenguajes con dirección de lectura de derecha a izquierda (RTL) como árabe y hebreo.

### 📄 Generación Automática de PDF

Servicio serverless optimizado para Vercel que utiliza **Puppeteer Core** y **Sparticuz Chromium** para generar un documento PDF A4 de alta fidelidad directamente desde el DOM. Incorpora hojas de estilo de impresión específicas (`@media print`) para omitir controles interactivos y garantizar una maquetación óptima en papel.

### 🌓 Interfaz Adaptable y Modo Oscuro

- Layout responsivo con soporte para múltiples densidades de píxeles y pantallas.
- Sincronización automática con las preferencias del sistema (`prefers-color-scheme`) y cambio manual persistente en el dispositivo.
- Jerarquía tipográfica basada en fuentes de alta legibilidad (Cormorant Garamond y DM Sans).

### ♿ Accesibilidad y SEO

- Accesibilidad alineada con pautas WCAG para navegación fluida mediante teclado e indicadores semánticos `aria-label`.
- Arquitectura preparada para motores de búsqueda con metadatos dinámicos, etiquetas Open Graph, Twitter Cards y generación de Sitemap XML.

---

## 🛠️ Tecnologías

- **Frontend:** HTML5 semántico, CSS3 avanzado (Variables, Flexbox, Grid), JavaScript (ES6+).
- **Backend (API):** Node.js, Puppeteer Core, Sparticuz Chromium.
- **Despliegue:** Vercel (Edge Functions & Functions).

---

## 📦 Uso Local

Al ser un proyecto Vanilla, no requiere un proceso de compilación (`build`):

1. Clona el repositorio.
2. Abre `index.html` en cualquier navegador moderno.
3. Para probar la generación de PDF localmente, necesitarás instalar las dependencias con `npm install`.

---

## 📜 Licencia

Este proyecto está bajo la licencia **MIT**. Puedes usarlo como base para tu propio CV, siempre y cuando se respete la autoría original.

---

*Desarrollado por Eneko Ruiz Mollón.*
