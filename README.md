# Eneko Ruiz — Curriculum Vitae

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)

Este es el código fuente de mi currículum web interactivo. Desarrollado completamente desde cero (Vanilla HTML, CSS y JS) para garantizar el máximo rendimiento, accesibilidad y control sobre el diseño.

Puedes ver la versión en vivo aquí: [eneko-ruiz-curriculum.vercel.app](https://eneko-ruiz-curriculum.vercel.app)

## Características principales

- **Cero dependencias:** Sin frameworks ni librerías externas. Peso total inferior a 100KB, optimizado para una carga instantánea.
- **Internacionalización (i18n):** Soporte completo para 20 idiomas con detección automática, persistencia en URL y soporte para lectura de derecha a izquierda (RTL).
- **Diseño Responsive & Dark Mode:** Interfaz adaptativa que respeta las preferencias del sistema y permite el cambio manual de tema.
- **Motor de Impresión Optimizado:** Configuración específica mediante `@media print` para generar un PDF en formato A4 perfecto, incluyendo un código QR dinámico.
- **Accesibilidad:** Cumplimiento de estándares de accesibilidad, navegación por teclado y soporte para reducción de movimiento.
- **API de Generación de PDF:** Incluye una función serverless (Vercel Functions) que utiliza Puppeteer para exportar el CV a PDF bajo demanda.

## Cómo usarlo

Al no requerir un proceso de compilación, puedes probarlo localmente de forma inmediata:

1. Clonar el repositorio.
2. Abrir `index.html` en tu navegador favorito.

Para personalizarlo, edita el diccionario de traducciones en `translations.js` y actualiza la información básica en `index.html`.

## Licencia

Código abierto bajo licencia MIT. Siéntete libre de usarlo como base para tu propio currículum o explorar la implementación.
