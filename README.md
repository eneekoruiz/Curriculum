<div align="center">

# Eneko Ruiz Mollón

**Ingeniero de Software · Full Stack**

Ingeniería Informática — UPV/EHU · Inglés C1 · Euskera C1

<br>

[🌐 Ver CV online](https://eneko-ruiz-curriculum.vercel.app/) · [📄 Descargar PDF](https://eneko-ruiz-curriculum.vercel.app/pdf/Eneko_Ruiz_CV_ES.pdf)

</div>

---

CV interactivo construido con HTML, CSS y JavaScript vanilla — sin dependencias, sin build step. PDF pregenerado en 24 idiomas, optimizado para ATS y una sola página A4.

### Estructura

- **`index.html` · `index.css` · `index.js`** — La web completa, sin build
- **`translations.js`** — Contenido del CV en 24 idiomas
- **`print.css`** — Layout A4 de una columna, compatible con ATS
- **`pdf/`** — PDFs pregenerados por idioma
- **`og.png`** — Tarjeta social (WhatsApp, LinkedIn, Twitter)
- **`api/pdf.js`** — Función Vercel que renderiza PDF bajo demanda
- **`scripts/`** — Herramientas de build y calidad (Playwright)

### Tras editar el CV

```bash
cd scripts && npm install
npx playwright install chromium   # solo la primera vez
npm run build    # regenera pdf/*.pdf + print-zoom.js
npm run og       # regenera og.png
```

### Licencia

MIT
