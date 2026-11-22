# Curriculum Vitae Interactivo

Currículum vítae web interactivo y generador de PDF desarrollado en HTML5 semántico, CSS moderno y JavaScript vanilla, con soporte multiidioma y maquetación de impresión profesional A4.

- **Demo en vivo:** [curriculum-eneekoruiz.vercel.app](https://curriculum-eneekoruiz.vercel.app)

## Características y Valor Técnico

- **Arquitectura Vanilla Ultraligera:** Cero dependencias pesadas de framework para el frontend; carga instantánea y máxima compatibilidad en cualquier navegador.
- **Soporte Multiidioma (i18n):** Selector dinámico de idioma en tiempo real (Castellano, Euskara e Inglés) gestionado mediante diccionarios locales y atributos `data-i18n`.
- **Maquetación Tipográfica A4:** Reglas CSS avanzadas bajo `@media print` para asegurar saltos de página limpios, márgenes proporcionales y ajuste exacto a formato A4 estándar para selección de personal.
- **Generación de PDF en la Nube:** Endpoint serverless en Vercel (`api/pdf.js`) que renderiza y descarga el CV en PDF vectorial utilizando Puppeteer Core y Chromium headless (`@sparticuz/chromium`).

## Stack Técnico

- **Frontend:** HTML5 semántico, CSS3 moderno (Variables CSS, Flexbox/Grid, print styles), JavaScript (ES6+)
- **Generador de PDF:** Node.js, `puppeteer-core`, `@sparticuz/chromium`

## Puesta en Marcha Local

```bash
git clone https://github.com/eneekoruiz/Curriculum.git
cd Curriculum

# Servir localmente con cualquier servidor estático
npx serve .
# o con Python
python -m http.server 8080
```
