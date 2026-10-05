# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2026-10-05

### Added
- `.env*` exclusion in `.gitignore` to prevent secret leakage in any future extensions.
- Comprehensive deterministic verification pipeline validating 23 pre-rendered PDFs, 12 first-screen viewports, 18 responsive layouts, and WCAG 2.1 AA accessibility with 0 violations.

### Changed
- **Languages Section (UX / Content Architecture)**:
  - Cleaned Spanish language chip: "Nativo" is now the primary highlighted level cleanly centered, completely removing placeholder dashes or redundant subtitles.
  - Eradicated redundant repetitions ("Nativo / Lengua materna", "Ama-hizkuntza / Ama-hizkuntza", "Langue maternelle / Langue maternelle") across all 23 language sets in `translations.js`.
  - Added dedicated styling for native certification subtitle in `index.css` and `print.css`.
- **SEO & i18n Technical Compliance**:
  - Removed ghost `he` (Hebrew) alternate link and `he_IL` locale from `index.html`, `sitemap.xml`, and `api/pdf.js`, strictly aligning metadata to the 23 active supported languages.
  - Rebuilt all 23 language PDFs with updated layout and synchronized SHA-1 source hashes.
  - Bumped Service Worker cache to `eneko-cv-cache-v21`.

### Removed
- Removed experimental scroll cue / chevron and obsolete motion tests to preserve minimal, high-craft aesthetics.
