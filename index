<!DOCTYPE html>

<html lang="es" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Eneko Ruiz Mollón — Ingeniero Informático</title>

  <!-- SEO -->

  <meta name="description"  content="Eneko Ruiz Mollón — Estudiante de Ingeniería Informática en UPV/EHU. Python, Java, C++, Git." />
  <meta name="author"       content="Eneko Ruiz Mollón" />
  <meta name="robots"       content="index, follow" />
  <link rel="canonical"     href="https://eneko-ruiz.vercel.app" />

  <!-- Open Graph -->

  <meta property="og:type"        content="profile" />
  <meta property="og:title"       content="Eneko Ruiz Mollón — Ingeniero Informático" />
  <meta property="og:description" content="Grado en Ingeniería Informática · Python · Java · C++ · Git · UPV/EHU" />
  <meta property="og:url"         content="https://eneko-ruiz.vercel.app" />
  <meta property="og:image"       content="https://eneko-ruiz.vercel.app/og.png" />
  <meta name="twitter:card"       content="summary_large_image" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

  <style>
    /* ══════════════════════════════════════════════════════
       TOKENS
    ══════════════════════════════════════════════════════ */
    :root {
      --bg:       #f8f6f2;
      --surface:  #ffffff;
      --rule:     #e2ddd7;
      --rule-2:   #cdc7bf;
      --ink:      #161412;
      --ink-2:    #46403a;
      --ink-3:    #9a9088;
      --accent:   #7a6240;
      --accent-h: #5e4a2e;

      --f-serif: 'Cormorant Garamond', Georgia, serif;
      --f-sans:  'DM Sans', system-ui, sans-serif;
      --f-mono:  'JetBrains Mono', monospace;

      --ease: cubic-bezier(.4,0,.2,1);
      --t:    200ms;

      /* print dimensions */
      --a4-w: 210mm;
      --a4-h: 297mm;
    }

    [data-theme="dark"] {
      --bg:      #100f0d;
      --surface: #1a1814;
      --rule:    #2c2921;
      --rule-2:  #3d3830;
      --ink:     #f0ebe2;
      --ink-2:   #bdb5aa;
      --ink-3:   #6e6860;
      --accent:  #c4965a;
      --accent-h:#e0b476;
    }

    /* ══════════════════════════════════════════════════════
       RESET
    ══════════════════════════════════════════════════════ */
    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
    html  { scroll-behavior:smooth; -webkit-text-size-adjust:100%; }
    body  {
      font-family: var(--f-sans);
      background:  var(--bg);
      color:       var(--ink);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      transition:  background var(--t) var(--ease), color var(--t) var(--ease);
    }
    a  { color:inherit; text-decoration:none; }

    /* ══════════════════════════════════════════════════════
       TOPBAR — language dropdown + theme
    ══════════════════════════════════════════════════════ */
    #topbar {
      position: fixed;
      inset: 0 0 auto 0;
      z-index: 300;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 6px;
      padding: 14px clamp(20px,5vw,56px);
      background: linear-gradient(to bottom, var(--bg) 55%, transparent 100%);
      pointer-events: none;
    }
    #topbar > * { pointer-events: auto; }

    /* ── Language dropdown ── */
    #lang-wrap { position: relative; }

    #lang-trigger {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--surface);
      border: 1px solid var(--rule-2);
      border-radius: 4px;
      padding: 5px 10px 5px 12px;
      cursor: pointer;
      font-family: var(--f-mono);
      font-size: 10.5px;
      letter-spacing: .1em;
      text-transform: uppercase;
      color: var(--ink-2);
      transition: border-color var(--t) var(--ease), color var(--t) var(--ease);
      white-space: nowrap;
    }
    #lang-trigger:hover { border-color: var(--accent); color: var(--accent); }
    #lang-trigger svg   { width:11px; height:11px; opacity:.6; flex-shrink:0;
                          transition: transform var(--t) var(--ease); }
    #lang-trigger.open svg { transform: rotate(180deg); }

    #lang-menu {
      position: absolute;
      top: calc(100% + 6px);
      right: 0;
      background: var(--surface);
      border: 1px solid var(--rule-2);
      border-radius: 4px;
      min-width: 168px;
      overflow: hidden;
      display: none;
      flex-direction: column;
      /* no box-shadow — pure border */
    }
    #lang-menu.open { display: flex; }

    .lm-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 14px;
      cursor: pointer;
      background: none;
      border: none;
      width: 100%;
      text-align: left;
      font-family: var(--f-sans);
      font-size: 12.5px;
      color: var(--ink-2);
      border-bottom: 1px solid var(--rule);
      transition: background var(--t) var(--ease), color var(--t) var(--ease);
    }
    .lm-item:last-child { border-bottom: none; }
    .lm-item:hover      { background: color-mix(in srgb, var(--accent) 6%, transparent); color: var(--ink); }
    .lm-item.active     { color: var(--accent); font-weight: 500; }

    .lm-iso {
      font-family: var(--f-mono);
      font-size: 10px;
      letter-spacing: .08em;
      color: var(--ink-3);
    }
    .lm-item.active .lm-iso { color: var(--accent); opacity: .8; }

    /* ── Theme button ── */
    #theme-btn {
      width: 32px; height: 32px;
      display: flex; align-items: center; justify-content: center;
      background: var(--surface);
      border: 1px solid var(--rule-2);
      border-radius: 4px;
      cursor: pointer;
      color: var(--ink-3);
      transition: border-color var(--t) var(--ease), color var(--t) var(--ease);
    }
    #theme-btn:hover { border-color: var(--accent); color: var(--accent); }
    #theme-btn svg   { width: 13px; height: 13px; }

    /* ══════════════════════════════════════════════════════
       FADE — language switch
    ══════════════════════════════════════════════════════ */
    #cv-root           { opacity:1; transition: opacity .15s ease; }
    #cv-root.fading    { opacity:0; }

    /* ══════════════════════════════════════════════════════
       WRAPPER
    ══════════════════════════════════════════════════════ */
    .wrap {
      max-width: 1080px;
      margin:    0 auto;
      padding:   clamp(72px,11vw,108px) clamp(20px,6vw,56px) clamp(56px,8vw,80px);
    }

    /* ══════════════════════════════════════════════════════
       HEADER
    ══════════════════════════════════════════════════════ */
    .site-header {
      display:         grid;
      grid-template-columns: 1fr auto;
      gap:             32px 48px;
      align-items:     end;
      padding-bottom:  36px;
      border-bottom:   1px solid var(--rule);
      margin-bottom:   36px;
    }

    .eyebrow {
      font-family:    var(--f-mono);
      font-size:      10px;
      letter-spacing: .22em;
      text-transform: uppercase;
      color:          var(--accent);
      margin-bottom:  14px;
    }

    h1 {
      font-family:    var(--f-serif);
      font-size:      clamp(2.4rem,5.5vw,4.4rem);
      font-weight:    300;
      color:          var(--ink);
      line-height:    .96;
      letter-spacing: -.02em;
    }
    h1 strong { font-weight:600; color:inherit; }

    .tagline {
      margin-top: 12px;
      font-size:  12.5px;
      color:      var(--ink-3);
      display:    flex;
      gap:        8px;
      flex-wrap:  wrap;
      align-items:center;
    }
    .tagline-sep { color: var(--rule-2); }

    /* ── Contact ── */
    .contacts {
      display:        flex;
      flex-direction: column;
      align-items:    flex-end;
      gap:            7px;
      font-style:     normal;
    }

    /* Social pills — GitHub & LinkedIn share style */
    .contact-social {
      display:     flex;
      align-items: center;
      gap:         7px;
      font-family: var(--f-mono);
      font-size:   10.5px;
      font-weight: 500;
      color:       var(--ink-2);
      padding:     6px 11px;
      border:      1px solid var(--rule-2);
      border-radius: 3px;
      transition:  border-color var(--t) var(--ease), color var(--t) var(--ease);
    }
    .contact-social:hover          { border-color: var(--accent); color: var(--accent); }
    .contact-social svg            { width:14px; height:14px; flex-shrink:0; }
    .contact-socials               { display:flex; flex-direction:column; gap:5px; margin-bottom:4px; }

    .contact-row {
      display:     flex;
      align-items: center;
      gap:         6px;
      font-size:   12px;
      color:       var(--ink-3);
      transition:  color var(--t) var(--ease);
    }
    .contact-row:hover  { color: var(--ink-2); }
    .contact-row svg    { width:12px; height:12px; flex-shrink:0; opacity:.55; }

    /* PDF button */
    .pdf-btn {
      display:     inline-flex;
      align-items: center;
      gap:         6px;
      font-family: var(--f-mono);
      font-size:   10px;
      letter-spacing:.1em;
      text-transform:uppercase;
      color:       var(--ink-3);
      border:      1px solid var(--rule);
      border-radius:3px;
      padding:     5px 11px;
      margin-top:  4px;
      transition:  color var(--t) var(--ease), border-color var(--t) var(--ease);
    }
    .pdf-btn:hover       { color: var(--accent); border-color: var(--accent); }
    .pdf-btn svg         { width:11px; height:11px; }

    /* ══════════════════════════════════════════════════════
       PROFILE
    ══════════════════════════════════════════════════════ */
    .profile {
      display:       grid;
      grid-template-columns: 72px 1fr;
      gap:           12px;
      align-items:   baseline;
      padding-bottom:32px;
      border-bottom: 1px solid var(--rule);
      margin-bottom: 36px;
    }
    .profile-label {
      font-family:    var(--f-mono);
      font-size:      9.5px;
      letter-spacing: .2em;
      text-transform: uppercase;
      color:          var(--ink-3);
      padding-top:    3px;
    }
    .profile-text {
      font-size:   13.5px;
      line-height: 1.72;
      color:       var(--ink-2);
    }

    /* ══════════════════════════════════════════════════════
       DASHBOARD
    ══════════════════════════════════════════════════════ */
    .dashboard {
      display:               grid;
      grid-template-columns: 1fr 300px;
      gap:                   48px;
      align-items:           start;
    }
    .col-main { display:flex; flex-direction:column; gap:36px; }
    .col-side { display:flex; flex-direction:column; gap:32px; }

    /* ══════════════════════════════════════════════════════
       SECTION HEADING
    ══════════════════════════════════════════════════════ */
    .sec-title {
      font-family:    var(--f-mono);
      font-size:      9.5px;
      letter-spacing: .2em;
      text-transform: uppercase;
      color:          var(--ink-3);
      padding-bottom: 8px;
      border-bottom:  1px solid var(--rule);
      margin-bottom:  20px;
    }

    /* ══════════════════════════════════════════════════════
       TIMELINE
    ══════════════════════════════════════════════════════ */
    .tl-item {
      display: grid;
      grid-template-columns: 88px 1fr;
      gap:     0 20px;
      padding-bottom: 20px;
    }
    .tl-item:last-child        { padding-bottom: 0; }
    .tl-item.compact           { padding-bottom: 14px; }
    .tl-item.compact:last-child{ padding-bottom: 0; }

    .tl-date {
      font-family: var(--f-mono);
      font-size:   9.5px;
      color:       var(--ink-3);
      text-align:  right;
      padding-top: 2px;
      line-height: 1.35;
    }

    .tl-body {
      border-left: 1px solid var(--rule);
      padding-left: 18px;
      position:     relative;
      transition:   border-color var(--t) var(--ease);
    }
    .tl-body::before {
      content:  '';
      position: absolute;
      left: -4px; top: 5px;
      width:7px; height:7px;
      border-radius:50%;
      background: var(--bg);
      border: 1px solid var(--rule);
      transition: border-color var(--t) var(--ease), background var(--t) var(--ease);
    }
    .tl-item:hover .tl-body             { border-color: var(--accent); }
    .tl-item:hover .tl-body::before     { border-color: var(--accent); background: var(--accent); }

    .tl-title { font-size:13.5px; font-weight:500; color:var(--ink); line-height:1.25; }
    .tl-org   { font-size:12px;   color:var(--accent); font-style:italic; margin-top:2px; }
    .tl-desc  { font-size:12px;   color:var(--ink-3);  line-height:1.58; margin-top:5px; }

    /* ══════════════════════════════════════════════════════
       SKILLS
    ══════════════════════════════════════════════════════ */
    .skill-group             { margin-bottom: 14px; }
    .skill-group:last-child  { margin-bottom: 0; }
    .sg-label {
      font-family:    var(--f-mono);
      font-size:      9px;
      letter-spacing: .15em;
      text-transform: uppercase;
      color:          var(--ink-3);
      margin-bottom:  7px;
    }
    .pills { display:flex; flex-wrap:wrap; gap:5px; }
    .pill {
      font-size:    12px;
      color:        var(--ink-2);
      border:       1px solid var(--rule);
      padding:      3px 9px;
      border-radius:2px;
      background:   transparent;
      transition:   border-color var(--t) var(--ease), color var(--t) var(--ease);
      cursor:       default;
    }
    .pill:hover             { border-color:var(--accent); color:var(--accent); }
    .pill.primary           { font-weight:500; color:var(--ink); border-color:var(--rule-2); }
    .pill.primary:hover     { border-color:var(--accent); color:var(--accent); }

    /* ══════════════════════════════════════════════════════
       LANGUAGES
    ══════════════════════════════════════════════════════ */
    .lang-list { display:flex; flex-direction:column; gap:8px; }
    .lang-row  {
      display:          flex;
      justify-content:  space-between;
      align-items:      baseline;
      padding-bottom:   8px;
      border-bottom:    1px solid var(--rule);
    }
    .lang-row:last-child  { border-bottom:none; padding-bottom:0; }
    .lang-name            { font-size:13px; font-weight:500; color:var(--ink); }
    .lang-level           { font-family:var(--f-mono); font-size:9.5px; color:var(--ink-3); }

    /* ══════════════════════════════════════════════════════
       COURSES
    ══════════════════════════════════════════════════════ */
    .course-list { display:flex; flex-direction:column; gap:12px; }
    .course-item {
      padding-left: 14px;
      border-left:  1px solid var(--rule);
      transition:   border-color var(--t) var(--ease);
    }
    .course-item:hover  { border-color: var(--accent); }
    .course-name        { font-size:13px; font-weight:500; color:var(--ink); line-height:1.3; }
    .course-inst        { font-size:11.5px; color:var(--ink-3); font-style:italic; margin-top:2px; }

    /* ══════════════════════════════════════════════════════
       SCROLL REVEAL
    ══════════════════════════════════════════════════════ */
    .reveal {
      opacity:   0;
      transform: translateY(8px);
      transition: opacity .4s var(--ease), transform .4s var(--ease);
    }
    .reveal.visible { opacity:1; transform:none; }

    /* ══════════════════════════════════════════════════════
       RESPONSIVE
    ══════════════════════════════════════════════════════ */
    @media (max-width: 820px) {
      .dashboard { grid-template-columns:1fr; gap:36px; }
      .col-side  { order:-1; }
    }
    @media (max-width: 600px) {
      .site-header { grid-template-columns:1fr; }
      .contacts    { align-items:flex-start; }
      .profile     { grid-template-columns:1fr; gap:6px; }
      .tl-item     { grid-template-columns:72px 1fr; gap:0 14px; }
    }
    @media (max-width: 340px) {
      .tl-item   { grid-template-columns:1fr; }
      .tl-date   { text-align:left; margin-bottom:4px; }
    }

    /* ══════════════════════════════════════════════════════
       SCROLLBAR
    ══════════════════════════════════════════════════════ */
    ::-webkit-scrollbar       { width:4px; }
    ::-webkit-scrollbar-track { background:transparent; }
    ::-webkit-scrollbar-thumb { background:var(--rule-2); border-radius:2px; }

    /* ══════════════════════════════════════════════════════
       FOCUS
    ══════════════════════════════════════════════════════ */
    :focus-visible { outline:1px solid var(--accent); outline-offset:3px; }

    /* ══════════════════════════════════════════════════════
       RTL (Arabic)
    ══════════════════════════════════════════════════════ */
    [dir="rtl"] .contacts            { align-items:flex-start; }
    [dir="rtl"] .tl-body             { border-left:none; border-right:1px solid var(--rule); padding-left:0; padding-right:18px; }
    [dir="rtl"] .tl-body::before     { left:auto; right:-4px; }
    [dir="rtl"] .tl-date             { text-align:left; }
    [dir="rtl"] .course-item         { padding-left:0; border-left:none; padding-right:14px; border-right:1px solid var(--rule); }
    [dir="rtl"] .course-item:hover   { border-right-color:var(--accent); }
    [dir="rtl"] #lang-menu           { right:auto; left:0; }

    /* ══════════════════════════════════════════════════════
       PRINT — pixel-perfect A4
       Strategy: @page removes margins, body resets to A4
       dimensions, topbar hidden, all colors forced exact.
    ══════════════════════════════════════════════════════ */
    @media print {
      @page {
        size:   A4 portrait;
        margin: 14mm 16mm 14mm 16mm;
      }

      /* Force light theme for print regardless of user setting */
      :root {
        --bg:      #ffffff;
        --surface: #ffffff;
        --rule:    #d8d3cc;
        --rule-2:  #c0bab2;
        --ink:     #0e0c0a;
        --ink-2:   #3e3830;
        --ink-3:   #888078;
        --accent:  #6a5230;
      }

      html, body {
        background: #ffffff !important;
        color:      #0e0c0a !important;
        font-size:  11px !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust:         exact !important;
      }

      /* Hide interactive chrome */
      #topbar { display:none !important; }

      #cv-root { opacity:1 !important; }

      .wrap {
        max-width: 100% !important;
        padding:   0 !important;
        margin:    0 !important;
      }

      /* Fit layout to A4 — single column for reliable paging */
      .site-header {
        grid-template-columns: 1fr auto !important;
        gap:          16px 24px !important;
        padding-bottom:16px !important;
        margin-bottom: 16px !important;
      }

      h1 { font-size: 28pt !important; }
      .eyebrow { font-size: 7pt !important; }
      .tagline { font-size: 9pt !important; }

      .contacts        { gap: 4px !important; }
      .contact-social  { padding: 3px 7px !important; font-size: 8pt !important; }
      .contact-row     { font-size: 9pt !important; }
      .pdf-btn         { display: none !important; }

      .profile {
        padding-bottom: 12px !important;
        margin-bottom:  14px !important;
      }
      .profile-text { font-size: 9pt !important; }

      /* Two-column dashboard preserved */
      .dashboard {
        grid-template-columns: 1fr 220px !important;
        gap: 28px !important;
      }
      .col-main { gap: 20px !important; }
      .col-side { gap: 18px !important; }

      /* Section headings */
      .sec-title { font-size: 7pt !important; padding-bottom: 4px !important; margin-bottom: 10px !important; }

      /* Timeline */
      .tl-item         { grid-template-columns: 72px 1fr !important; gap: 0 12px !important; padding-bottom: 12px !important; }
      .tl-item.compact { padding-bottom:  8px !important; }
      .tl-title        { font-size: 9.5pt !important; }
      .tl-org          { font-size: 8.5pt !important; }
      .tl-desc         { font-size: 8pt   !important; margin-top: 3px !important; }
      .tl-date         { font-size: 7.5pt !important; }

      /* Skills */
      .skill-group     { margin-bottom: 8px !important; }
      .sg-label        { font-size: 7pt !important; }
      .pill            { font-size: 8pt !important; padding: 2px 6px !important; }

      /* Languages & courses */
      .lang-name       { font-size: 9pt !important; }
      .lang-level      { font-size: 7.5pt !important; }
      .course-name     { font-size: 9pt !important; }
      .course-inst     { font-size: 8pt !important; }

      /* Reveal — make sure everything is visible */
      .reveal          { opacity:1 !important; transform:none !important; }

      /* Avoid breaking sections mid-page */
      section          { break-inside: avoid; }
      .tl-item         { break-inside: avoid; }
      .course-item     { break-inside: avoid; }
    }
  </style>

</head>

<body>

<!-- ── TOPBAR ─────────────────────────────────── -->

<div id="topbar" role="toolbar" aria-label="Controles">

  <!-- Language dropdown -->

  <div id="lang-wrap">
    <button id="lang-trigger" aria-haspopup="listbox" aria-expanded="false">
      <span id="lang-label">Español</span>
      <!-- chevron down -->
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
      </svg>
    </button>
    <div id="lang-menu" role="listbox" aria-label="Idioma"></div>
  </div>

  <!-- Theme toggle -->

  <button id="theme-btn" aria-label="Cambiar tema">
    <svg id="icon-sun" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/>
    </svg>
    <svg id="icon-moon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" style="display:none">
      <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"/>
    </svg>
  </button>

</div>

<!-- ── CONTENT ─────────────────────────────────── -->

<div id="cv-root">
<div class="wrap">

  <!-- HEADER -->

  <header class="site-header">
    <div>
      <p class="eyebrow" data-i18n="eyebrow">Ingeniero Informático</p>
      <h1><strong>Eneko</strong> Ruiz Mollón</h1>
      <p class="tagline">
        <span data-i18n="tagline1">Ingeniería Informática</span>
        <span class="tagline-sep" aria-hidden="true">—</span>
        <span data-i18n="tagline2">Universidad del País Vasco</span>
      </p>
    </div>

```
<address class="contacts">
  <!-- Social profiles -->
  <div class="contact-socials">
    <a class="contact-social" href="https://github.com/eneekoruiz" target="_blank" rel="noopener noreferrer" aria-label="GitHub: eneekoruiz">
      <!-- GitHub -->
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
      </svg>
      eneekoruiz
    </a>
    <a class="contact-social" href="https://linkedin.com/in/eneekoruiz" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn: eneekoruiz">
      <!-- LinkedIn -->
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
      eneekoruiz
    </a>
  </div>

  <a class="contact-row" href="mailto:eneekoruiz@gmail.com">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/></svg>
    eneekoruiz@gmail.com
  </a>

  <a class="contact-row" href="tel:+34600025161">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 6.75Z"/></svg>
    +34 600 02 51 61
  </a>

  <span class="contact-row">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
    Rentería, Gipuzkoa
  </span>

  <a class="pdf-btn" href="./eneko-ruiz-mollon-cv.pdf" download>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>
    <span data-i18n="pdfBtn">Descargar CV</span>
  </a>
</address>
```

  </header>

  <!-- PROFILE -->

  <div class="profile reveal">
    <p class="profile-label" data-i18n="profileLabel">Perfil</p>
    <p class="profile-text"  data-i18n="profileText">Estudiante de Ingeniería Informática con dominio de Python, Java y C++, y trabajo habitual con Git. Orientado a la resolución de problemas técnicos, con gran capacidad de aprendizaje autónomo. C1 de inglés certificado por Cambridge.</p>
  </div>

  <!-- DASHBOARD -->

  <div class="dashboard">

```
<!-- ─── LEFT ─── -->
<div class="col-main">

  <section class="reveal" aria-labelledby="h-edu">
    <h2 class="sec-title" id="h-edu" data-i18n="secEducation">Formación Académica</h2>
    <div class="tl-item">
      <p class="tl-date" data-i18n="edu1date">2023 – Hoy</p>
      <div class="tl-body">
        <p class="tl-title" data-i18n="edu1title">Grado en Ingeniería Informática</p>
        <p class="tl-org"   data-i18n="edu1org">Universidad del País Vasco (UPV/EHU)</p>
        <p class="tl-desc"  data-i18n="edu1desc">Algoritmos, estructuras de datos, sistemas operativos, redes y desarrollo de software. Actualmente en 2.º curso.</p>
      </div>
    </div>
    <div class="tl-item">
      <p class="tl-date">2021 – 2023</p>
      <div class="tl-body">
        <p class="tl-title" data-i18n="edu2title">Bachillerato Científico-Tecnológico</p>
        <p class="tl-org">Koldo Mitxelena Herri Ikastetxea</p>
      </div>
    </div>
  </section>

  <section class="reveal" aria-labelledby="h-train">
    <h2 class="sec-title" id="h-train" data-i18n="secTraining">Formación Complementaria</h2>
    <div class="course-list">
      <div class="course-item"><p class="course-name" data-i18n="course1name">Aplicaciones avanzadas de IA generativa</p><p class="course-inst" data-i18n="course1inst">Universidad de Burgos</p></div>
      <div class="course-item"><p class="course-name" data-i18n="course2name">Introducción a Python</p><p class="course-inst">Coursera</p></div>
      <div class="course-item"><p class="course-name" data-i18n="course3name">Marketing Digital</p><p class="course-inst" data-i18n="course3inst">Google Actívate</p></div>
      <div class="course-item"><p class="course-name" data-i18n="course4name">Microsoft Word Avanzado</p><p class="course-inst" data-i18n="course4inst">Gobierno Vasco</p></div>
    </div>
  </section>

  <section class="reveal" aria-labelledby="h-exp">
    <h2 class="sec-title" id="h-exp" data-i18n="secExperience">Experiencia</h2>
    <div class="tl-item compact"><p class="tl-date" data-i18n="exp1date">Jun–Sep 2025</p><div class="tl-body"><p class="tl-title" data-i18n="exp1title">Ayudante de Dependiente</p><p class="tl-org">Eroski · Rentería</p></div></div>
    <div class="tl-item compact"><p class="tl-date" data-i18n="exp2date">Dic 2023 – Ene 2025</p><div class="tl-body"><p class="tl-title" data-i18n="exp2title">Promotor de Marca</p><p class="tl-org">Staff Global Group</p></div></div>
    <div class="tl-item compact"><p class="tl-date" data-i18n="exp3date">Jul–Sep 2023</p><div class="tl-body"><p class="tl-title" data-i18n="exp3title">Ayudante de Conductor</p><p class="tl-org" data-i18n="exp3org">Tren "Txu-Txu" · Zarautz</p></div></div>
    <div class="tl-item compact"><p class="tl-date" data-i18n="exp4date">Jul–Ago 2022</p><div class="tl-body"><p class="tl-title" data-i18n="exp4title">Dependiente de Calzado</p><p class="tl-org">Caravanas Oiartzun</p></div></div>
  </section>

</div><!-- /col-main -->

<!-- ─── RIGHT ─── -->
<div class="col-side">

  <section class="reveal" aria-labelledby="h-stack">
    <h2 class="sec-title" id="h-stack" data-i18n="secStack">Stack Técnico</h2>
    <div class="skill-group"><p class="sg-label" data-i18n="sgLangs">Lenguajes</p><div class="pills"><span class="pill primary">Python</span><span class="pill primary">Java</span><span class="pill primary">C++</span></div></div>
    <div class="skill-group"><p class="sg-label" data-i18n="sgVcs">Control de Versiones</p><div class="pills"><span class="pill primary">Git</span><span class="pill">GitHub</span></div></div>
    <div class="skill-group"><p class="sg-label" data-i18n="sgTools">Entornos y Herramientas</p><div class="pills"><span class="pill">VS Code</span><span class="pill">IntelliJ IDEA</span><span class="pill">Linux</span><span class="pill">CLI</span></div></div>
    <div class="skill-group"><p class="sg-label" data-i18n="sgOffice">Ofimática</p><div class="pills"><span class="pill">Microsoft Office</span></div></div>
  </section>

  <section class="reveal" aria-labelledby="h-soft">
    <h2 class="sec-title" id="h-soft" data-i18n="secSoft">Competencias</h2>
    <div class="pills">
      <span class="pill" data-i18n="soft1">Resolución de Problemas</span>
      <span class="pill" data-i18n="soft2">Trabajo en Equipo</span>
      <span class="pill" data-i18n="soft3">Comunicación</span>
      <span class="pill" data-i18n="soft4">Gestión del Tiempo</span>
      <span class="pill" data-i18n="soft5">Adaptabilidad</span>
      <span class="pill" data-i18n="soft6">Autoaprendizaje</span>
    </div>
  </section>

  <section class="reveal" aria-labelledby="h-langs">
    <h2 class="sec-title" id="h-langs" data-i18n="secLanguages">Idiomas</h2>
    <div class="lang-list">
      <div class="lang-row"><span class="lang-name" data-i18n="lang1name">Castellano</span><span class="lang-level" data-i18n="lang1level">Nativo</span></div>
      <div class="lang-row"><span class="lang-name" data-i18n="lang2name">Inglés</span><span class="lang-level">C1 · Cambridge</span></div>
      <div class="lang-row"><span class="lang-name" data-i18n="lang3name">Euskera</span><span class="lang-level">C1 · HABE</span></div>
    </div>
  </section>

</div><!-- /col-side -->
```

  </div><!-- /dashboard -->
</div><!-- /wrap -->
</div><!-- /cv-root -->

<script>
/* ────────────────────────────────────────────────────────
   i18n DICTIONARY
──────────────────────────────────────────────────────── */
const LANGS={es:{name:'Español',iso:'ES',dir:'ltr',t:{eyebrow:'Ingeniero Informático',tagline1:'Ingeniería Informática',tagline2:'Universidad del País Vasco',profileLabel:'Perfil',profileText:'Estudiante de Ingeniería Informática con dominio de Python, Java y C++, y trabajo habitual con Git. Orientado a la resolución de problemas técnicos, con gran capacidad de aprendizaje autónomo. C1 de inglés certificado por Cambridge.',secEducation:'Formación Académica',secTraining:'Formación Complementaria',secExperience:'Experiencia',secStack:'Stack Técnico',secSoft:'Competencias',secLanguages:'Idiomas',edu1date:'2023 – Hoy',edu1title:'Grado en Ingeniería Informática',edu1org:'Universidad del País Vasco (UPV/EHU)',edu1desc:'Algoritmos, estructuras de datos, sistemas operativos, redes y desarrollo de software. Actualmente en 2.º curso.',edu2title:'Bachillerato Científico-Tecnológico',course1name:'Aplicaciones avanzadas de IA generativa',course1inst:'Universidad de Burgos',course2name:'Introducción a Python',course3name:'Marketing Digital',course3inst:'Google Actívate',course4name:'Microsoft Word Avanzado',course4inst:'Gobierno Vasco',exp1date:'Jun–Sep 2025',exp1title:'Ayudante de Dependiente',exp2date:'Dic 2023 – Ene 2025',exp2title:'Promotor de Marca',exp3date:'Jul–Sep 2023',exp3title:'Ayudante de Conductor',exp3org:'Tren "Txu-Txu" · Zarautz',exp4date:'Jul–Ago 2022',exp4title:'Dependiente de Calzado',sgLangs:'Lenguajes',sgVcs:'Control de Versiones',sgTools:'Entornos y Herramientas',sgOffice:'Ofimática',soft1:'Resolución de Problemas',soft2:'Trabajo en Equipo',soft3:'Comunicación',soft4:'Gestión del Tiempo',soft5:'Adaptabilidad',soft6:'Autoaprendizaje',lang1name:'Castellano',lang1level:'Nativo',lang2name:'Inglés',lang3name:'Euskera',pdfBtn:'Descargar CV'}},eu:{name:'Euskera',iso:'EU',dir:'ltr',t:{eyebrow:'Informatika Ingeniaria',tagline1:'Informatika Ingeniaritza',tagline2:'Euskal Herriko Unibertsitatea',profileLabel:'Profila',profileText:'Informatika Ingeniaritzako ikaslea, Python, Java eta C++ menperatzen dituena eta Git erabiltzen ohitua. Arazo teknikoak ebazteko gaitasuna du eta ikaskuntza autonomorako joera handia. Cambridge C1 mailako ingelesa.',secEducation:'Hezkuntza',secTraining:'Prestakuntza Osagarria',secExperience:'Lan Esperientzia',secStack:'Pila Teknikoa',secSoft:'Gaitasunak',secLanguages:'Hizkuntzak',edu1date:'2023 – Gaur',edu1title:'Informatika Ingeniaritzako Gradua',edu1org:'Euskal Herriko Unibertsitatea (UPV/EHU)',edu1desc:'Algoritmoak, datu-egiturak, sistema eragileak, sareak eta software garapena. 2. mailan dago gaur egun.',edu2title:'Batxilergo Zientifiko-Teknologikoa',course1name:'IA sortzailearen aplikazio aurreratuak',course1inst:'Burgoseko Unibertsitatea',course2name:'Python-en sarrera',course3name:'Marketing Digitala',course3inst:'Google Actívate',course4name:'Microsoft Word Aurreratua',course4inst:'Eusko Jaurlaritza',exp1date:'Eka–Ira 2025',exp1title:'Dendako Laguntzailea',exp2date:'Abe 2023 – Urt 2025',exp2title:'Markaren Sustatzailea',exp3date:'Eka–Ira 2023',exp3title:'Gidariaren Laguntzailea',exp3org:'Txu-Txu Trena · Zarautz',exp4date:'Eka–Abu 2022',exp4title:'Oinetako Saltzailea',sgLangs:'Programazio Hizkuntzak',sgVcs:'Bertsio Kontrola',sgTools:'Inguruneak eta Tresnak',sgOffice:'Bulegotika',soft1:'Arazo Ebazpena',soft2:'Talde Lana',soft3:'Komunikazioa',soft4:'Denbora Kudeaketa',soft5:'Egokitzapena',soft6:'Autokuntza',lang1name:'Gaztelania',lang1level:'Ama-hizkuntza',lang2name:'Ingelesa',lang3name:'Euskara',pdfBtn:'CV Deskargatu'}},en:{name:'English',iso:'EN',dir:'ltr',t:{eyebrow:'Computer Engineer',tagline1:'Computer Engineering',tagline2:'University of the Basque Country',profileLabel:'Profile',profileText:'Computer Engineering student proficient in Python, Java and C++, with solid Git version control habits. Problem-solver with strong autonomous learning skills and experience in high-demand environments. C1 English certified by Cambridge.',secEducation:'Education',secTraining:'Additional Training',secExperience:'Experience',secStack:'Technical Stack',secSoft:'Skills',secLanguages:'Languages',edu1date:'2023 – Present',edu1title:'BSc in Computer Engineering',edu1org:'University of the Basque Country (UPV/EHU)',edu1desc:'Algorithms, data structures, operating systems, networks and software development. Currently in 2nd year.',edu2title:'Scientific-Technological Baccalaureate',course1name:'Advanced Applications of Generative AI',course1inst:'University of Burgos',course2name:'Introduction to Python',course3name:'Digital Marketing',course3inst:'Google Actívate',course4name:'Advanced Microsoft Word',course4inst:'Basque Government',exp1date:'Jun–Sep 2025',exp1title:'Retail Assistant',exp2date:'Dec 2023 – Jan 2025',exp2title:'Brand Ambassador',exp3date:'Jul–Sep 2023',exp3title:"Driver's Assistant",exp3org:'Tourist Train · Zarautz',exp4date:'Jul–Aug 2022',exp4title:'Sales Assistant',sgLangs:'Languages',sgVcs:'Version Control',sgTools:'Environments & Tools',sgOffice:'Office',soft1:'Problem Solving',soft2:'Teamwork',soft3:'Communication',soft4:'Time Management',soft5:'Adaptability',soft6:'Self-learning',lang1name:'Spanish',lang1level:'Native',lang2name:'English',lang3name:'Basque',pdfBtn:'Download CV'}},fr:{name:'Français',iso:'FR',dir:'ltr',t:{eyebrow:'Ingénieur Informaticien',tagline1:'Génie Informatique',tagline2:"Université du Pays Basque",profileLabel:'Profil',profileText:"Étudiant en génie informatique maîtrisant Python, Java et C++, avec de solides habitudes Git. Orienté vers la résolution de problèmes techniques, avec grande capacité d'apprentissage autonome. Anglais C1 Cambridge.",secEducation:'Formation',secTraining:'Formation Complémentaire',secExperience:'Expérience',secStack:'Stack Technique',secSoft:'Compétences',secLanguages:'Langues',edu1date:"2023 – Auj.",edu1title:"Licence en Génie Informatique",edu1org:"Université du Pays Basque (UPV/EHU)",edu1desc:"Algorithmes, structures de données, systèmes d'exploitation, réseaux et développement logiciel. Actuellement en 2e année.",edu2title:'Baccalauréat Scientifique-Technologique',course1name:"Applications avancées de l'IA générative",course1inst:"Université de Burgos",course2name:"Introduction à Python",course3name:"Marketing Digital",course3inst:"Google Actívate",course4name:"Word Avancé",course4inst:"Gouvernement Basque",exp1date:'Juin–Sep 2025',exp1title:'Assistant de Vente',exp2date:'Déc 2023 – Jan 2025',exp2title:'Ambassadeur de Marque',exp3date:'Juil–Sep 2023',exp3title:'Assistant Conducteur',exp3org:'Train Touristique · Zarautz',exp4date:'Juil–Août 2022',exp4title:'Vendeur Chaussures',sgLangs:'Langages',sgVcs:'Contrôle de Version',sgTools:'Outils et Environnements',sgOffice:'Bureautique',soft1:'Résolution de Problèmes',soft2:'Travail en Équipe',soft3:'Communication',soft4:'Gestion du Temps',soft5:'Adaptabilité',soft6:'Autoformation',lang1name:'Espagnol',lang1level:'Natif',lang2name:'Anglais',lang3name:'Basque',pdfBtn:'Télécharger CV'}},de:{name:'Deutsch',iso:'DE',dir:'ltr',t:{eyebrow:'Informatik-Ingenieur',tagline1:'Informatik-Ingenieurwesen',tagline2:'Universität des Baskenlandes',profileLabel:'Profil',profileText:'Informatikstudent mit Kenntnissen in Python, Java und C++, regelmäßiger Git-Nutzung. Lösungsorientiert mit starker Selbstlernkompetenz. Englisch C1, zertifiziert von Cambridge.',secEducation:'Bildung',secTraining:'Weiterbildung',secExperience:'Erfahrung',secStack:'Technischer Stack',secSoft:'Kompetenzen',secLanguages:'Sprachen',edu1date:'2023 – Heute',edu1title:'Bachelor Informatik',edu1org:'Universität des Baskenlandes (UPV/EHU)',edu1desc:'Algorithmen, Datenstrukturen, Betriebssysteme, Netzwerke und Softwareentwicklung. Derzeit im 2. Studienjahr.',edu2title:'Wissenschaftlich-Technologisches Abitur',course1name:'Fortgeschrittene Anwendungen Generativer KI',course1inst:'Universität Burgos',course2name:'Einführung in Python',course3name:'Digitales Marketing',course3inst:'Google Actívate',course4name:'Microsoft Word Fortgeschritten',course4inst:'Baskische Regierung',exp1date:'Jun–Sep 2025',exp1title:'Verkaufsassistent',exp2date:'Dez 2023 – Jan 2025',exp2title:'Markenbotschafter',exp3date:'Jul–Sep 2023',exp3title:'Fahrerassistent',exp3org:'Touristenzug · Zarautz',exp4date:'Jul–Aug 2022',exp4title:'Schuhverkäufer',sgLangs:'Programmiersprachen',sgVcs:'Versionskontrolle',sgTools:'Umgebungen & Tools',sgOffice:'Office',soft1:'Problemlösung',soft2:'Teamarbeit',soft3:'Kommunikation',soft4:'Zeitmanagement',soft5:'Anpassungsfähigkeit',soft6:'Selbstlernen',lang1name:'Spanisch',lang1level:'Muttersprache',lang2name:'Englisch',lang3name:'Baskisch',pdfBtn:'CV herunterladen'}},pt:{name:'Português',iso:'PT',dir:'ltr',t:{eyebrow:'Engenheiro Informático',tagline1:'Engenharia Informática',tagline2:'Universidade do País Basco',profileLabel:'Perfil',profileText:'Estudante de Engenharia Informática com domínio de Python, Java e C++, uso regular de Git. Orientado à resolução de problemas técnicos e grande capacidade de aprendizagem autónoma. Inglês C1 Cambridge.',secEducation:'Formação',secTraining:'Formação Complementar',secExperience:'Experiência',secStack:'Stack Técnico',secSoft:'Competências',secLanguages:'Idiomas',edu1date:'2023 – Hoje',edu1title:'Licenciatura em Engenharia Informática',edu1org:'Universidade do País Basco (UPV/EHU)',edu1desc:'Algoritmos, estruturas de dados, sistemas operativos, redes e desenvolvimento de software. Atualmente no 2.º ano.',edu2title:'Bacharelato Científico-Tecnológico',course1name:'Aplicações Avançadas de IA Generativa',course1inst:'Universidade de Burgos',course2name:'Introdução ao Python',course3name:'Marketing Digital',course3inst:'Google Actívate',course4name:'Microsoft Word Avançado',course4inst:'Governo Basco',exp1date:'Jun–Set 2025',exp1title:'Assistente de Balcão',exp2date:'Dez 2023 – Jan 2025',exp2title:'Promotor de Marca',exp3date:'Jul–Set 2023',exp3title:'Assistente de Condutor',exp3org:'Comboio Turístico · Zarautz',exp4date:'Jul–Ago 2022',exp4title:'Vendedor de Calçado',sgLangs:'Linguagens',sgVcs:'Controlo de Versão',sgTools:'Ambientes e Ferramentas',sgOffice:'Escritório',soft1:'Resolução de Problemas',soft2:'Trabalho em Equipa',soft3:'Comunicação',soft4:'Gestão do Tempo',soft5:'Adaptabilidade',soft6:'Autoaprendizagem',lang1name:'Espanhol',lang1level:'Nativo',lang2name:'Inglês',lang3name:'Basco',pdfBtn:'Descarregar CV'}},it:{name:'Italiano',iso:'IT',dir:'ltr',t:{eyebrow:'Ingegnere Informatico',tagline1:'Ingegneria Informatica',tagline2:"Università dei Paesi Baschi",profileLabel:'Profilo',profileText:"Studente di Ingegneria Informatica con padronanza di Python, Java e C++ e uso regolare di Git. Orientato alla risoluzione di problemi tecnici, con grande capacità di apprendimento autonomo. Inglese C1 Cambridge.",secEducation:'Formazione',secTraining:'Formazione Complementare',secExperience:'Esperienza',secStack:'Stack Tecnico',secSoft:'Competenze',secLanguages:'Lingue',edu1date:'2023 – Oggi',edu1title:'Laurea in Ingegneria Informatica',edu1org:"Università dei Paesi Baschi (UPV/EHU)",edu1desc:"Algoritmi, strutture dati, sistemi operativi, reti e sviluppo software. Attualmente al 2° anno.",edu2title:'Liceo Scientifico-Tecnologico',course1name:"Applicazioni Avanzate dell'IA Generativa",course1inst:"Università di Burgos",course2name:"Introduzione a Python",course3name:"Marketing Digitale",course3inst:"Google Actívate",course4name:"Microsoft Word Avanzato",course4inst:"Governo Basco",exp1date:'Giu–Set 2025',exp1title:'Assistente di Vendita',exp2date:'Dic 2023 – Gen 2025',exp2title:'Promotore di Marca',exp3date:'Lug–Set 2023',exp3title:'Assistente Autista',exp3org:'Trenino Turistico · Zarautz',exp4date:'Lug–Ago 2022',exp4title:'Commesso Calzature',sgLangs:'Linguaggi',sgVcs:'Controllo Versione',sgTools:'Ambienti e Strumenti',sgOffice:'Office',soft1:'Risoluzione Problemi',soft2:'Lavoro di Squadra',soft3:'Comunicazione',soft4:'Gestione del Tempo',soft5:'Adattabilità',soft6:'Autoformazione',lang1name:'Spagnolo',lang1level:'Madrelingua',lang2name:'Inglese',lang3name:'Basco',pdfBtn:'Scarica CV'}},ru:{name:'Русский',iso:'RU',dir:'ltr',t:{eyebrow:'Инженер-программист',tagline1:'Компьютерная инженерия',tagline2:'Университет Страны Басков',profileLabel:'Профиль',profileText:'Студент компьютерной инженерии, владеющий Python, Java и C++ с регулярным использованием Git. Ориентирован на решение технических задач, обладает высокой способностью к самостоятельному обучению. Английский C1 Cambridge.',secEducation:'Образование',secTraining:'Доп. обучение',secExperience:'Опыт работы',secStack:'Технический стек',secSoft:'Компетенции',secLanguages:'Языки',edu1date:'2023 – сейчас',edu1title:'Бакалавр компьютерной инженерии',edu1org:'Университет Страны Басков (UPV/EHU)',edu1desc:'Алгоритмы, структуры данных, ОС, сети и разработка ПО. Сейчас на 2 курсе.',edu2title:'Научно-технологический бакалавриат',course1name:'Продвинутые приложения генеративного ИИ',course1inst:'Университет Бургоса',course2name:'Введение в Python',course3name:'Цифровой маркетинг',course3inst:'Google Actívate',course4name:'Microsoft Word продвинутый',course4inst:'Правительство Страны Басков',exp1date:'Июн–Сен 2025',exp1title:'Помощник продавца',exp2date:'Дек 2023 – Янв 2025',exp2title:'Амбассадор бренда',exp3date:'Июл–Сен 2023',exp3title:'Помощник машиниста',exp3org:'Туристический поезд · Zarautz',exp4date:'Июл–Авг 2022',exp4title:'Продавец обуви',sgLangs:'Языки программирования',sgVcs:'Контроль версий',sgTools:'Среды и инструменты',sgOffice:'Офисные программы',soft1:'Решение проблем',soft2:'Командная работа',soft3:'Коммуникация',soft4:'Управление временем',soft5:'Адаптивность',soft6:'Самообучение',lang1name:'Испанский',lang1level:'Родной',lang2name:'Английский',lang3name:'Баскский',pdfBtn:'Скачать резюме'}},ar:{name:'العربية',iso:'AR',dir:'rtl',t:{eyebrow:'مهندس حاسوب',tagline1:'هندسة الحاسوب',tagline2:'جامعة البلاد الباسكية',profileLabel:'الملف الشخصي',profileText:'طالب هندسة حاسوب متقن لـ Python وJava وC++ مع استخدام يومي لـ Git. موجّه نحو حل المشكلات التقنية بقدرة عالية على التعلم الذاتي. C1 إنجليزية Cambridge.',secEducation:'التعليم',secTraining:'التدريب الإضافي',secExperience:'الخبرة',secStack:'المهارات التقنية',secSoft:'الكفاءات',secLanguages:'اللغات',edu1date:'2023 – الآن',edu1title:'بكالوريوس هندسة حاسوب',edu1org:'جامعة البلاد الباسكية (UPV/EHU)',edu1desc:'الخوارزميات، هياكل البيانات، أنظمة التشغيل، الشبكات وتطوير البرمجيات. حالياً في السنة الثانية.',edu2title:'بكالوريا علمية تكنولوجية',course1name:'التطبيقات المتقدمة للذكاء الاصطناعي التوليدي',course1inst:'جامعة بورغوس',course2name:'مقدمة في Python',course3name:'التسويق الرقمي',course3inst:'Google Actívate',course4name:'Microsoft Word المتقدم',course4inst:'حكومة البلاد الباسكية',exp1date:'يون–سبت 2025',exp1title:'مساعد مبيعات',exp2date:'ديس 2023 – يناير 2025',exp2title:'سفير علامة تجارية',exp3date:'يول–سبت 2023',exp3title:'مساعد سائق',exp3org:'قطار سياحي · Zarautz',exp4date:'يول–أغس 2022',exp4title:'بائع أحذية',sgLangs:'لغات البرمجة',sgVcs:'التحكم بالإصدارات',sgTools:'البيئات والأدوات',sgOffice:'برامج المكتب',soft1:'حل المشكلات',soft2:'العمل الجماعي',soft3:'التواصل',soft4:'إدارة الوقت',soft5:'التكيّف',soft6:'التعلم الذاتي',lang1name:'الإسبانية',lang1level:'اللغة الأم',lang2name:'الإنجليزية',lang3name:'الباسكية',pdfBtn:'تحميل السيرة الذاتية'}},zh:{name:'中文',iso:'ZH',dir:'ltr',t:{eyebrow:'计算机工程师',tagline1:'计算机工程',tagline2:'巴斯克大学',profileLabel:'简介',profileText:'计算机工程在读学生，熟练掌握 Python、Java 和 C++，日常使用 Git。专注于技术问题解决，具备强大的自主学习能力。剑桥 C1 英语认证。',secEducation:'教育经历',secTraining:'培训经历',secExperience:'工作经历',secStack:'技术栈',secSoft:'技能',secLanguages:'语言',edu1date:'2023 – 至今',edu1title:'计算机工程学士',edu1org:'巴斯克大学 (UPV/EHU)',edu1desc:'算法、数据结构、操作系统、网络与软件开发。目前大二。',edu2title:'科技高中',course1name:'生成式AI高级应用',course1inst:'布尔戈斯大学',course2name:'Python入门',course3name:'数字营销',course3inst:'Google Actívate',course4name:'Microsoft Word高级',course4inst:'巴斯克政府',exp1date:'2025年6–9月',exp1title:'销售助理',exp2date:'2023年12月–2025年1月',exp2title:'品牌大使',exp3date:'2023年7–9月',exp3title:'驾驶员助理',exp3org:'观光小火车 · Zarautz',exp4date:'2022年7–8月',exp4title:'鞋类销售员',sgLangs:'编程语言',sgVcs:'版本控制',sgTools:'开发环境与工具',sgOffice:'办公软件',soft1:'解决问题',soft2:'团队合作',soft3:'沟通能力',soft4:'时间管理',soft5:'适应能力',soft6:'自主学习',lang1name:'西班牙语',lang1level:'母语',lang2name:'英语',lang3name:'巴斯克语',pdfBtn:'下载简历'}},ja:{name:'日本語',iso:'JA',dir:'ltr',t:{eyebrow:'コンピュータエンジニア',tagline1:'コンピュータ工学',tagline2:'バスク大学',profileLabel:'プロフィール',profileText:'Python・Java・C++に熟練し、Gitを日常的に使用するコンピュータ工学の学生。技術的問題解決に強く、自律学習能力が高い。Cambridge C1英語認定取得。',secEducation:'学歴',secTraining:'研修・資格',secExperience:'職歴',secStack:'技術スタック',secSoft:'スキル',secLanguages:'言語',edu1date:'2023 – 現在',edu1title:'コンピュータ工学学士',edu1org:'バスク大学 (UPV/EHU)',edu1desc:'アルゴリズム、データ構造、OS、ネットワーク、ソフトウェア開発。現在2年次。',edu2title:'理工科バチレラート',course1name:'生成AI高度活用',course1inst:'ブルゴス大学',course2name:'Python入門',course3name:'デジタルマーケティング',course3inst:'Google Actívate',course4name:'Microsoft Word上級',course4inst:'バスク自治政府',exp1date:'2025年6–9月',exp1title:'販売アシスタント',exp2date:'2023年12月–2025年1月',exp2title:'ブランドアンバサダー',exp3date:'2023年7–9月',exp3title:'運転手補助',exp3org:'観光列車 · Zarautz',exp4date:'2022年7–8月',exp4title:'靴販売員',sgLangs:'プログラミング言語',sgVcs:'バージョン管理',sgTools:'開発環境・ツール',sgOffice:'オフィス',soft1:'問題解決',soft2:'チームワーク',soft3:'コミュニケーション',soft4:'時間管理',soft5:'適応力',soft6:'自律学習',lang1name:'スペイン語',lang1level:'母国語',lang2name:'英語',lang3name:'バスク語',pdfBtn:'履歴書ダウンロード'}},ko:{name:'한국어',iso:'KO',dir:'ltr',t:{eyebrow:'컴퓨터 엔지니어',tagline1:'컴퓨터공학',tagline2:'바스크대학교',profileLabel:'프로필',profileText:'Python, Java, C++에 능숙하고 Git을 일상적으로 사용하는 컴퓨터공학 학생. 기술적 문제 해결에 강하며 자기주도 학습 능력 우수. Cambridge C1 영어 인증 보유.',secEducation:'학력',secTraining:'추가 교육',secExperience:'경력',secStack:'기술 스택',secSoft:'역량',secLanguages:'언어',edu1date:'2023 – 현재',edu1title:'컴퓨터공학 학사',edu1org:'바스크대학교 (UPV/EHU)',edu1desc:'알고리즘, 자료구조, 운영체제, 네트워크 및 소프트웨어 개발. 현재 2학년.',edu2title:'이공계 바칠레라토',course1name:'생성형 AI 고급 응용',course1inst:'부르고스대학교',course2name:'Python 입문',course3name:'디지털 마케팅',course3inst:'Google Actívate',course4name:'Microsoft Word 고급',course4inst:'바스크 정부',exp1date:'2025년 6–9월',exp1title:'판매 보조원',exp2date:'2023년 12월–2025년 1월',exp2title:'브랜드 앰배서더',exp3date:'2023년 7–9월',exp3title:'운전 보조원',exp3org:'관광 열차 · Zarautz',exp4date:'2022년 7–8월',exp4title:'신발 판매원',sgLangs:'프로그래밍 언어',sgVcs:'버전 관리',sgTools:'개발 환경 및 도구',sgOffice:'오피스',soft1:'문제 해결',soft2:'팀워크',soft3:'커뮤니케이션',soft4:'시간 관리',soft5:'적응력',soft6:'자기주도 학습',lang1name:'스페인어',lang1level:'모국어',lang2name:'영어',lang3name:'바스크어',pdfBtn:'이력서 다운로드'}},hi:{name:'हिन्दी',iso:'HI',dir:'ltr',t:{eyebrow:'कंप्यूटर इंजीनियर',tagline1:'कंप्यूटर इंजीनियरिंग',tagline2:'बास्क विश्वविद्यालय',profileLabel:'प्रोफ़ाइल',profileText:'Python, Java और C++ में दक्ष कंप्यूटर इंजीनियरिंग छात्र, Git का नियमित उपयोग। तकनीकी समस्या-समाधान और स्वतंत्र सीखने में उत्कृष्ट। Cambridge C1 अंग्रेज़ी प्रमाणित।',secEducation:'शिक्षा',secTraining:'अतिरिक्त प्रशिक्षण',secExperience:'अनुभव',secStack:'तकनीकी स्टैक',secSoft:'दक्षताएँ',secLanguages:'भाषाएँ',edu1date:'2023 – अभी',edu1title:'कंप्यूटर इंजीनियरिंग स्नातक',edu1org:'बास्क विश्वविद्यालय (UPV/EHU)',edu1desc:'एल्गोरिदम, डेटा संरचनाएँ, OS, नेटवर्क और सॉफ़्टवेयर विकास। द्वितीय वर्ष।',edu2title:'वैज्ञानिक-तकनीकी बैचिलेराटो',course1name:'जनरेटिव AI के उन्नत अनुप्रयोग',course1inst:'बर्गोस विश्वविद्यालय',course2name:'Python का परिचय',course3name:'डिजिटल मार्केटिंग',course3inst:'Google Actívate',course4name:'Microsoft Word उन्नत',course4inst:'बास्क सरकार',exp1date:'जून–सित 2025',exp1title:'बिक्री सहायक',exp2date:'दिस 2023 – जन 2025',exp2title:'ब्रांड एम्बेसडर',exp3date:'जुल–सित 2023',exp3title:'ड्राइवर सहायक',exp3org:'पर्यटक ट्रेन · Zarautz',exp4date:'जुल–अग 2022',exp4title:'जूता विक्रेता',sgLangs:'प्रोग्रामिंग भाषाएँ',sgVcs:'संस्करण नियंत्रण',sgTools:'वातावरण और उपकरण',sgOffice:'ऑफिस सॉफ़्टवेयर',soft1:'समस्या समाधान',soft2:'टीम वर्क',soft3:'संचार',soft4:'समय प्रबंधन',soft5:'अनुकूलनशीलता',soft6:'स्व-शिक्षण',lang1name:'स्पेनिश',lang1level:'मूल भाषा',lang2name:'अंग्रेज़ी',lang3name:'बास्क',pdfBtn:'CV डाउनलोड करें'}},pl:{name:'Polski',iso:'PL',dir:'ltr',t:{eyebrow:'Inżynier Informatyki',tagline1:'Inżynieria Informatyczna',tagline2:'Uniwersytet Kraju Basków',profileLabel:'Profil',profileText:'Student informatyki biegły w Python, Java i C++, regularnie korzystający z Git. Zorientowany na rozwiązywanie problemów technicznych, z dużą zdolnością do samodzielnego uczenia się. Angielski C1 Cambridge.',secEducation:'Wykształcenie',secTraining:'Szkolenia',secExperience:'Doświadczenie',secStack:'Stack Techniczny',secSoft:'Kompetencje',secLanguages:'Języki',edu1date:'2023 – teraz',edu1title:'Licencjat z Informatyki',edu1org:'Uniwersytet Kraju Basków (UPV/EHU)',edu1desc:'Algorytmy, struktury danych, systemy operacyjne, sieci i wytwarzanie oprogramowania. Obecnie na 2. roku.',edu2title:'Matura Naukowo-Technologiczna',course1name:'Zaawansowane zastosowania generatywnej AI',course1inst:'Uniwersytet Burgos',course2name:'Wprowadzenie do Python',course3name:'Marketing Cyfrowy',course3inst:'Google Actívate',course4name:'Microsoft Word Zaawansowany',course4inst:'Rząd Baskijski',exp1date:'Cze–Wrz 2025',exp1title:'Asystent Sprzedaży',exp2date:'Gru 2023 – Sty 2025',exp2title:'Ambasador Marki',exp3date:'Lip–Wrz 2023',exp3title:'Asystent Kierowcy',exp3org:'Pociąg Turystyczny · Zarautz',exp4date:'Lip–Sie 2022',exp4title:'Sprzedawca Obuwia',sgLangs:'Języki Programowania',sgVcs:'Kontrola Wersji',sgTools:'Środowiska i Narzędzia',sgOffice:'Pakiet Biurowy',soft1:'Rozwiązywanie Problemów',soft2:'Praca Zespołowa',soft3:'Komunikacja',soft4:'Zarządzanie Czasem',soft5:'Adaptacja',soft6:'Samokształcenie',lang1name:'Hiszpański',lang1level:'Ojczysty',lang2name:'Angielski',lang3name:'Baskijski',pdfBtn:'Pobierz CV'}},tr:{name:'Türkçe',iso:'TR',dir:'ltr',t:{eyebrow:'Bilgisayar Mühendisi',tagline1:'Bilgisayar Mühendisliği',tagline2:'Bask Ülkesi Üniversitesi',profileLabel:'Profil',profileText:"Python, Java ve C++'da yetkin, Git kullanan Bilgisayar Mühendisliği öğrencisi. Teknik problem çözmeye yönelik, güçlü öz öğrenme kapasiteli. Cambridge C1 İngilizce sertifikalı.",secEducation:'Eğitim',secTraining:'Ek Eğitim',secExperience:'Deneyim',secStack:'Teknik Yığın',secSoft:'Yetkinlikler',secLanguages:'Diller',edu1date:'2023 – Günümüz',edu1title:'Bilgisayar Mühendisliği Lisansı',edu1org:'Bask Ülkesi Üniversitesi (UPV/EHU)',edu1desc:'Algoritmalar, veri yapıları, işletim sistemleri, ağlar ve yazılım geliştirme. Şu an 2. sınıf.',edu2title:'Bilimsel-Teknolojik Lise',course1name:'Üretici Yapay Zeka İleri Uygulamaları',course1inst:'Burgos Üniversitesi',course2name:"Python'a Giriş",course3name:'Dijital Pazarlama',course3inst:'Google Actívate',course4name:'Microsoft Word İleri Seviye',course4inst:'Bask Hükümeti',exp1date:'Haz–Eyl 2025',exp1title:'Satış Asistanı',exp2date:'Ara 2023 – Oca 2025',exp2title:'Marka Elçisi',exp3date:'Tem–Eyl 2023',exp3title:'Şoför Yardımcısı',exp3org:'Turistik Tren · Zarautz',exp4date:'Tem–Ağu 2022',exp4title:'Ayakkabı Satıcısı',sgLangs:'Programlama Dilleri',sgVcs:'Versiyon Kontrolü',sgTools:'Ortamlar ve Araçlar',sgOffice:'Ofis Yazılımları',soft1:'Problem Çözme',soft2:'Takım Çalışması',soft3:'İletişim',soft4:'Zaman Yönetimi',soft5:'Uyum Sağlama',soft6:'Öz Öğrenme',lang1name:'İspanyolca',lang1level:'Anadil',lang2name:'İngilizce',lang3name:'Baskça',pdfBtn:"CV'yi İndir"}}};

/* ────────────────────────────────────────────────────────
   BUILD LANG MENU
──────────────────────────────────────────────────────── */
const menu = document.getElementById('lang-menu');
Object.entries(LANGS).forEach(([code, l]) => {
  const btn = document.createElement('button');
  btn.className   = 'lm-item';
  btn.dataset.lang = code;
  btn.setAttribute('role','option');
  btn.innerHTML   = `<span>${l.name}</span><span class="lm-iso">${l.iso}</span>`;
  btn.addEventListener('click', () => setLang(code));
  menu.appendChild(btn);
});

/* ────────────────────────────────────────────────────────
   THEME
──────────────────────────────────────────────────────── */
const html = document.documentElement;
const iconSun  = document.getElementById('icon-sun');
const iconMoon = document.getElementById('icon-moon');

function applyTheme(dark) {
  html.setAttribute('data-theme', dark ? 'dark' : 'light');
  iconSun.style.display  = dark ? 'none' : '';
  iconMoon.style.display = dark ? ''     : 'none';
  localStorage.setItem('cv-theme', dark ? 'dark' : 'light');
}

const savedTheme  = localStorage.getItem('cv-theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
applyTheme(savedTheme ? savedTheme === 'dark' : prefersDark);

document.getElementById('theme-btn').addEventListener('click', () => {
  applyTheme(html.getAttribute('data-theme') !== 'dark');
});
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (!localStorage.getItem('cv-theme')) applyTheme(e.matches);
});

/* ────────────────────────────────────────────────────────
   DROPDOWN OPEN/CLOSE
──────────────────────────────────────────────────────── */
const trigger = document.getElementById('lang-trigger');

trigger.addEventListener('click', e => {
  e.stopPropagation();
  const open = menu.classList.toggle('open');
  trigger.classList.toggle('open', open);
  trigger.setAttribute('aria-expanded', open);
});

document.addEventListener('click', () => {
  menu.classList.remove('open');
  trigger.classList.remove('open');
  trigger.setAttribute('aria-expanded', false);
});

menu.addEventListener('click', e => e.stopPropagation());

/* ────────────────────────────────────────────────────────
   i18n ENGINE
──────────────────────────────────────────────────────── */
const cvRoot = document.getElementById('cv-root');

function applyTranslations(code) {
  const { t, dir, name } = LANGS[code];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) el.textContent = t[key];
  });
  html.setAttribute('lang', code);
  html.setAttribute('dir',  dir);
  document.title = `Eneko Ruiz Mollón — ${t.eyebrow}`;
  document.getElementById('lang-label').textContent = name;
  document.querySelectorAll('.lm-item').forEach(b =>
    b.classList.toggle('active', b.dataset.lang === code)
  );
}

function setLang(code) {
  if (!LANGS[code]) return;
  menu.classList.remove('open');
  trigger.classList.remove('open');
  trigger.setAttribute('aria-expanded', false);
  cvRoot.classList.add('fading');
  setTimeout(() => {
    applyTranslations(code);
    localStorage.setItem('cv-lang', code);
    cvRoot.classList.remove('fading');
  }, 150);
}

/* ────────────────────────────────────────────────────────
   AUTO-DETECT language
──────────────────────────────────────────────────────── */
function detectLang() {
  const saved = localStorage.getItem('cv-lang');
  if (saved && LANGS[saved]) return saved;
  const code = (navigator.language || 'es').slice(0,2).toLowerCase();
  const map  = {es:'es',eu:'eu',en:'en',fr:'fr',de:'de',pt:'pt',
                it:'it',ru:'ru',ar:'ar',zh:'zh',ja:'ja',ko:'ko',
                hi:'hi',pl:'pl',tr:'tr'};
  return map[code] || 'en';
}
applyTranslations(detectLang());

/* ────────────────────────────────────────────────────────
   SCROLL REVEAL
──────────────────────────────────────────────────────── */
const ro = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); ro.unobserve(e.target); } });
}, { threshold:.06, rootMargin:'0px 0px -28px 0px' });

document.querySelectorAll('.reveal').forEach(el => ro.observe(el));
</script>

</body>
</html>