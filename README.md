# Eneko Ruiz - CV Web

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)

Este es el código fuente de mi currículum web interactivo. Decidí hacerlo completamente desde cero (Vanilla HTML, CSS y JS) en lugar de usar un framework, buscando el máximo rendimiento y control sobre cada detalle del diseño.

Puedes ver el resultado en directo aquí: [eneko-ruiz.vercel.app](https://eneko-ruiz.vercel.app)

## Características principales

* **Cero dependencias:** No hay `package.json`, ni React, ni Tailwind. El peso total es mínimo (menos de 100KB) y saca 100/100 en Lighthouse.
* **Internacionalización (i18n) a medida:** Soporta 19 idiomas modificando el DOM en tiempo real. Guarda el estado en la URL (`?lang=en`) y adapta la lectura de derecha a izquierda (RTL) automáticamente para idiomas como el árabe o el hebreo.
* **Motor de impresión A4:** Al intentar imprimir la web (Ctrl+P), un `@media print` reestructura todo el layout para que encaje exactamente en un solo folio A4 a sangre (sin bordes blancos), e inyecta un código QR dinámico.
* **Dark Mode nativo:** Respeta las preferencias del sistema (`prefers-color-scheme`) desde el `<head>` para evitar parpadeos blancos al cargar, y guarda la elección del usuario en `localStorage`.
* **Accesible:** Soporte para navegación por teclado, semántica cuidada y adaptado para `prefers-reduced-motion`.
* **Easter Egg en consola:** Si abres las DevTools (F12) te encontrarás una pequeña interfaz de terminal programada con JS asíncrono.

## Cómo usarlo

Como no hay dependencias ni proceso de build, probar este código es tan simple como:

1. Clonar el repositorio.
2. Abrir `index.html` en cualquier navegador.

Si quieres usarlo como plantilla para tu propio currículum, solo tienes que editar el diccionario de traducciones (`const T`) que está dentro de la etiqueta `<script>` y modificar los enlaces de la cabecera.

## Licencia

Código abierto. Siéntete libre de hacer un fork, echarle un ojo a cómo están hechas las cosas o usarlo como base para tu propio CV.
