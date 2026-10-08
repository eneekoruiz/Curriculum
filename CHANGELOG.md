# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.1] - 2026-10-08

### Changed
- Enlarged print profile headshot from 16mm to 28mm (~1.65× the QR code) for clear, recognizable facial detail on printed paper.
- Re-centered portrait framing with natural headroom, full neck, polo shirt collar, and shoulders, eliminating tight chin crop and clothing logos.
- Re-architected print header into an executive 2-row grid layout: top row features the 28mm portrait photo, unconstrained single-line role title, and interactive QR code; bottom row features a dedicated full-width contacts bar.
- Re-rendered all 23 language PDFs with 100% 1-page compliance, unscaled full-size role line across all locales, and full ATS pass.

## [2.2.0] - 2026-10-08

### Added
- Profile photo modal (`#photo-btn` / `#photo-dialog`): accessible interactive dialog to view the professional headshot on demand without cluttering the editorial web layout.
- Headshot integrated in print layout and pre-rendered PDFs (`16mm` portrait with subtle border mirroring the interactive QR code), preserving strict 1-page A4 format and ATS keyword extraction across all 23 languages.

## [2.1.1] - 2026-10-07

### Fixed
- The "PDF downloaded" notice was always in Spanish; it now uses the visitor's language.
- The official-certificate wording is back under both C1 levels ("Certificado oficial Cambridge" / "Certificado oficial HABE") in all 23 languages.
- PDF: the technology lists no longer glue a middle dot to the next word (`·TypeScript`), which broke keyword matching in ATS parsers; they are comma-separated.
- PDF: the role line no longer splits onto two lines. It is measured during the page fit and shrunk only where needed (stored per language in `print-zoom.js`, also used by Ctrl+P and `api/pdf.js`).
- Service Worker: the page's code (HTML, JS, CSS, JSON) is now network-first, so the first visit after a deployment no longer mixes new HTML with old scripts and the cache version no longer has to be bumped by hand. Offline still works.
- An unsupported `?lang=` (for example the removed Hebrew) now follows the same fallback as no `?lang=`: saved choice, browser language, English.

### Added
- `check-api-pdf`: runs `api/pdf.js` with its own Chromium, as Vercel does (CI, Linux only), so a Dependabot upgrade of `puppeteer-core` or `@sparticuz/chromium` cannot break the PDF fallback unnoticed.
- `check-headers`: loads the page under the production security headers from `vercel.json` and uses every control; any Content-Security-Policy violation fails the build.

### Security
- Removed the unused `cdn.jsdelivr.net` from the `script-src` of the Content-Security-Policy.

## [2.1.0] - 2026-10-05

### Added
- `.env*` exclusion in `.gitignore` to prevent secret leakage in any future extensions.
- Comprehensive deterministic verification pipeline validating 23 pre-rendered PDFs, 12 first-screen viewports, 18 responsive layouts, and WCAG 2.1 AA accessibility with 0 violations.

### Changed
- **Languages Section (UX / Content Architecture)**:
  - Cleaned Spanish language chip: "Nativo" is now scaled to match "C1" optically (26px mobile / 38-42px desktop) and cleanly centered, completely removing placeholder dashes or redundant subtitles.
  - Eradicated redundant repetitions ("Nativo / Lengua materna", "Ama-hizkuntza / Ama-hizkuntza", "Langue maternelle / Langue maternelle") across all 23 language sets in `translations.js`.
- **Mobile First-Screen Craft & Breathing Room**:
  - Increased spacing between contacts (LinkedIn, GitHub, etc.) and "Perfil profesional" on mobile with a clean dividing border and comfortable 36px touch targets.
  - Added dedicated compact media query for short screens (<=660px) ensuring zero vertical clipping.
- **SEO & i18n Technical Compliance**:
  - Removed ghost `he` (Hebrew) alternate link and `he_IL` locale from `index.html`, `sitemap.xml`, and `api/pdf.js`, strictly aligning metadata to the 23 active supported languages.
  - Rebuilt all 23 language PDFs with updated layout and synchronized SHA-1 source hashes.
  - Bumped Service Worker cache to `eneko-cv-cache-v23`.

### Removed
- Removed experimental scroll cue / chevron and obsolete motion tests to preserve minimal, high-craft aesthetics.
