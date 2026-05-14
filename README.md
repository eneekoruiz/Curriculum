# Eneko Ruiz Mollón — Curriculum Vitae Interactivo

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/es/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/es/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/es/docs/Web/JavaScript)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

Este repositorio contiene el código fuente de mi currículum web interactivo, diseñado y desarrollado desde cero para ofrecer una experiencia técnica impecable, minimalista y altamente funcional.

🚀 **Ver versión en vivo:** [https://eneko-ruiz-curriculum.vercel.app/](https://eneko-ruiz-curriculum.vercel.app/)

---

## 💎 Filosofía del Proyecto

A diferencia de los currículums convencionales basados en plantillas o frameworks pesados, este proyecto apuesta por la **pureza técnica**:
- **Vanilla Stack:** Cero dependencias externas (sin librerías ni frameworks).
- **Rendimiento Extremo:** Carga instantánea con un peso total de assets inferior a 100KB.
- **Control Total:** Cada línea de CSS y JS ha sido escrita para maximizar la accesibilidad y el diseño premium.

---

## 🌟 Características Destacadas

### 🌎 Internacionalización (i18n) Nativa
Soporte completo para **20 idiomas** con:
- Detección automática del idioma del navegador.
- Persistencia de selección mediante parámetros en la URL.
- Soporte para lectura de derecha a izquierda (RTL) en idiomas como árabe o hebreo.

### 📄 Motor de Exportación a PDF
Incluye una API serverless desarrollada para Vercel que utiliza **Puppeteer** para renderizar el CV y generar un PDF en formato A4 perfecto, respetando estilos de impresión específicos (`@media print`) y eliminando elementos innecesarios para la lectura en papel.

### 🌓 Diseño Adaptativo y Modo Oscuro
- Interfaz fluida (Responsive Design) que se adapta desde relojes inteligentes hasta pantallas 4K.
- Soporte para `prefers-color-scheme` con opción de cambio manual persistente.
- Estética minimalista con tipografías premium (Cormorant Garamond y DM Sans).

### ♿ Accesibilidad y SEO
- Cumplimiento de estándares WCAG para navegación por teclado y lectores de pantalla.
- Optimización SEO completa con metadatos dinámicos, Open Graph, Twitter Cards y Sitemap XML.

---

## 🛠️ Tecnologías

- **Frontend:** HTML5 semántico, CSS3 avanzado (Variables, Flexbox, Grid), JavaScript (ES6+).
- **Backend (API):** Node.js, Puppeteer Core, Sparticuz Chromium.
- **Despliegue:** Vercel (Edge Functions & Functions).

---

## 📦 Uso Local

Al ser un proyecto Vanilla, no requiere un proceso de construcción (`build`):

1. Clona el repositorio.
2. Abre `index.html` en cualquier navegador moderno.
3. Para probar la generación de PDF localmente, necesitarás instalar las dependencias con `npm install`.

---

## 📜 Licencia

Este proyecto está bajo la licencia **MIT**. Puedes usarlo como base para tu propio CV, siempre y cuando se respete la autoría original.

---
*Desarrollado con ❤️ por Eneko Ruiz Mollón.*
