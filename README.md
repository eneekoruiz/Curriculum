# Eneko Ruiz Mollón - Curriculum Vitae Interactivo

Interactive CV built with HTML, CSS, and JavaScript, with a pre-rendered, ATS-friendly one-page PDF in 24 languages.

Live version: https://eneko-ruiz-curriculum.vercel.app/

## What's in the repo

| Path | What it is |
| --- | --- |
| `index.html`, `index.css`, `index.js`, `theme.js` | The site: no build step, no runtime dependencies |
| `translations.js` | Full CV copy in 24 languages (`T`) and language metadata (`M`) |
| `print.css` | ATS-friendly single-column A4 layout used for printing and PDFs |
| `pdf/Eneko_Ruiz_CV_XX.pdf` | Pre-rendered PDF per language (generated, see below) |
| `print-zoom.js` | Generated: per-language one-page scale (also used by Ctrl+P) and the PDF cache version |
| `og.png` | Social preview card shown when the link is shared (generated) |
| `qr/cv-qr.svg`, `qr/cv-qr.png` | QR codes to the online CV, ready to print (generated) |
| `api/pdf.js` | Vercel function that renders a PDF on demand; fallback if a pre-rendered one is missing |
| `scripts/` | Build and quality tools (Playwright), not deployed |

## After editing the CV

Any change to the content or to `print.css` needs the PDFs rebuilt; CI fails otherwise.

```bash
cd scripts
npm install
npx playwright install chromium   # first time only
npm run build    # pdf/*.pdf + print-zoom.js
npm run check    # everything CI checks (see below)
npm run og       # og.png, only if the header content changes
npm run qr       # qr/*, only if the URL changes
```

## Quality checks (CI: `.github/workflows/cv-quality.yml`)

- **PDFs**: exactly one A4 page in every language; the committed PDFs match the site; ATS rules hold (name first, reading order education → languages → experience → projects, no ligature glyphs, contact details present).
- **Web**: 24 languages with identical keys; the first screen shows the complete profile at 12 viewports (360×640 → 1920×1080); no horizontal overflow; no JavaScript errors; browser-language detection; Ctrl+P prints on one page.
- **Accessibility**: WCAG 2.1 AA audit with axe-core, light and dark themes, desktop and phone, LTR and RTL.

## Design notes

ATS rules the print layout follows: single column, text painted in DOM order (no `position`/`float` in `print.css`, which would scramble the extracted text), no ligatures (so "offline-first" is not stored as "ofﬂine-ﬁrst"), numeric dates (MM/YYYY) and real `mailto:`/`tel:`/`https:` links. `window.fitPrintToOnePage()` scales the layout to fill exactly one A4 page (up to +12% when there is room, smaller when a language runs long).

The page opens in the visitor's browser language when it is supported (English otherwise); `?lang=xx` forces one. Web Analytics (Vercel) counts visits once it is enabled in the Vercel dashboard.

## Links

- DeepWiki: https://deepwiki.com/eneekoruiz/Curriculum

## License

MIT
