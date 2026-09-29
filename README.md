# Eneko Ruiz Mollón - Curriculum Vitae Interactivo

Interactive CV built with HTML, CSS, and JavaScript.

It includes:

- a multilingual layout
- an ATS-friendly, single-column A4 print/PDF layout (`print.css`)
- dark mode support
- basic accessibility and SEO metadata

Live version: https://eneko-ruiz-curriculum.vercel.app/

## Local use

```bash
npm install
# open index.html in a browser
```

PDF generation uses the Node dependencies required by the Vercel function.

## Architecture

The CV is a static site with no build step. HTML provides the document structure, `index.css` holds the screen layout, `print.css` the ATS-friendly A4 layout (single column, real text in reading order, no letter-spaced headings), and a JavaScript translation dictionary updates the selected language in the browser. GSAP is loaded only for optional entrance motion.

All 24 languages carry the full CV content. The page opens in the visitor's browser language when it is supported (English otherwise); `?lang=xx` forces one.

ATS rules the print layout follows: single column, text painted in DOM order (no `position`/`float` in `print.css`, which would scramble the extracted text), no ligatures (so "offline-first" is not stored as "ofﬂine-ﬁrst"), numeric dates (MM/YYYY), real `mailto:`/`tel:`/`https:` links, and a one-page guarantee: `window.fitPrintToOnePage()` scales the layout to fill exactly one A4 page (up to +12% when there is room, smaller when a language runs long).

`Eneko_Ruiz_CV_ES.pdf` is the pre-rendered Spanish PDF; other languages are rendered on demand by `api/pdf.js` (Puppeteer, print media).

## Links

- DeepWiki: https://deepwiki.com/eneekoruiz/Curriculum

## License

MIT
