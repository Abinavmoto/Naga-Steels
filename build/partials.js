/* ============================================================
   NAGA STEELS, shared page chrome
   ------------------------------------------------------------
   Why a build step on a no-framework static site:

   The site is ~27 pages and every one carries an identical
   utility bar, header, mega-menu, mobile drawer, footer and
   action bar. That is roughly 200 lines of chrome per page. Kept
   by hand it guarantees drift: a phone number gets corrected on
   nine pages and missed on the tenth, and the tenth is the one
   the customer lands on.

   So the chrome lives here once, the pages are generated, and
   the GENERATED HTML IS COMMITTED. GitHub Pages still serves
   plain static files with no runtime dependency, no hydration
   and no client-side routing. The build is a convenience for us,
   never a requirement for the visitor.

   Run:  node build/build.js
   ============================================================ */

import { BUSINESS } from '../assets/js/data/business.js';

/** Relative prefix from a page at `depth` directories deep. */
export const up = (depth) => (depth === 0 ? '' : '../'.repeat(depth));

export const WA_GENERIC =
  `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent('Hi Naga Steels, I would like a quote.')}`;

/* ---- SVG icons, inlined so there is no sprite request ----------------- */

export const ICON = {
  wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5 0-.2 0-.4 0-.5 0-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.2-.6-.4M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Z"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 1.9.6 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.8.6a2 2 0 0 1 1.7 2Z"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/></svg>',
};

/* ---- Navigation model -------------------------------------------------
   One array. Both the desktop mega-menu and the mobile drawer render from
   it, so a new product page cannot appear in one and not the other.     */

export const PRODUCT_NAV = [
  ['chain-link-fencing-madurai/', 'Chain Link Fencing', '8 – 12 SWG · woven to spec'],
  ['gi-sheet-dealer-madurai/', 'GI Sheets &amp; Plate', 'Plain, shutter, cut to size'],
  ['gi-wire-supplier-madurai/', 'GI Wire &amp; Rope', '8 – 18 SWG · binding · rope'],
  ['ms-sheet-dealer-madurai/', 'MS Sheets &amp; Plate', '1 – 6 mm · IS 2062'],
  ['wire-mesh-supplier-madurai/', 'Wire Mesh', 'Woven GI mesh rolls'],
  ['weld-mesh-supplier-madurai/', 'Weld Mesh', 'Rolls &amp; rigid panels'],
  ['barbed-wire-supplier-madurai/', 'Barbed Wire', 'IS 278 · boundary runs'],
  ['colour-coated-sheet-supplier-madurai/', 'Roofing Sheets', 'Cut to rafter length'],
  ['steel-hardware-supplier-madurai/', 'Nails, Bolts &amp; Hardware', 'By size and weight'],
  ['products/', 'All six families', 'Complete catalogue'],
];

const COMPANY_NAV = [
  ['fencing-manufacturer-madurai/', 'Naga Fencing', 'Our fencing brand'],
  ['tata-wiron-dealer-madurai/', 'Tata Wiron', 'Dealer supply'],
  ['vnc-products-distributor-madurai/', 'VNC Products', 'Distributor supply'],
  ['services-delivery/', 'Services &amp; Delivery', 'South Tamil Nadu'],
  ['about/', 'About', 'Since 2002'],
  ['contact/', 'Contact', 'Madurai 625001'],
];

/* ---- Head -------------------------------------------------------------- */

/* Copy routinely contains inch marks: `1" to 3" aperture`, `½" to 4" grid`.
   Dropped raw into content="..." that terminates the attribute early and
   silently truncates the description, so every attribute value is escaped.
   & is handled first or it would double-escape the entities that follow. */
const attr = (s) =>
  String(s)
    .replace(/&(?!(?:amp|lt|gt|quot|#\d+|nbsp);)/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

export function head({ title, description, slug, depth, jsonld = [], ogImage = 'assets/img/og-home.jpg' }) {
  const u = up(depth);
  const canonical = `${BUSINESS.origin}/${slug}`;
  const og = `${BUSINESS.origin}/${ogImage}`;
  const descAttr = attr(description);
  const titleAttr = attr(title);

  const graph = jsonld.length
    ? `\n<script type="application/ld+json">\n${JSON.stringify({ '@context': 'https://schema.org', '@graph': jsonld }, null, 2)}\n</script>`
    : '';

  return `<!DOCTYPE html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

<title>${title}</title>
<meta name="description" content="${descAttr}">
<link rel="canonical" href="${canonical}">

<meta name="theme-color" content="#006837">
<meta name="format-detection" content="telephone=yes">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1">
<meta name="geo.region" content="IN-TN">
<meta name="geo.placename" content="Madurai">

<meta property="og:type" content="website">
<meta property="og:site_name" content="Naga Steels">
<meta property="og:locale" content="en_IN">
<meta property="og:title" content="${titleAttr}">
<meta property="og:description" content="${descAttr}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">

<link rel="icon" href="${u}assets/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${u}assets/img/apple-touch-icon.png">

<link rel="preload" href="${u}assets/fonts/Inter-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${u}assets/fonts/Inter-600.woff2" as="font" type="font/woff2" crossorigin>

<link rel="stylesheet" href="${u}assets/css/fonts.css">
<link rel="stylesheet" href="${u}assets/css/tokens.css">
<link rel="stylesheet" href="${u}assets/css/base.css">
<link rel="stylesheet" href="${u}assets/css/components.css">
<link rel="stylesheet" href="${u}assets/css/sections.css">

<!-- If JS never runs, every [data-reveal] element must still be visible.
     Set before first paint so there is no flash of hidden content. -->
<script>document.documentElement.classList.add('js');</script>
<style>html:not(.js) [data-reveal]{opacity:1;transform:none}</style>${graph}
</head>

<body>
<a class="skip-link" href="#main">Skip to content</a>`;
}

/* ---- Utility bar + header + drawer ------------------------------------- */

export function header({ depth, current = '' }) {
  const u = up(depth);
  const on = (slug) => (slug === current ? ' aria-current="page"' : '');

  const megaItems = PRODUCT_NAV
    .map(([slug, name, sub]) => `          <a href="${u}${slug}"${on(slug)}><strong>${name}</strong><small>${sub}</small></a>`)
    .join('\n');

  const drawerProducts = PRODUCT_NAV
    .map(([slug, name, sub]) => `      <a href="${u}${slug}"${on(slug)}>${name} <i>${sub}</i></a>`)
    .join('\n');

  const drawerCompany = COMPANY_NAV
    .map(([slug, name, sub]) => `      <a href="${u}${slug}"${on(slug)}>${name} <i>${sub}</i></a>`)
    .join('\n');

  return `
<div class="utilbar">
  <div class="utilbar__inner">
    <div class="utilbar__group">
      <span>GSTIN <strong class="mono">${BUSINESS.gstin}</strong></span>
      <span>Mon&nbsp;–&nbsp;Sat, 10:00 AM&nbsp;–&nbsp;8:00 PM</span>
    </div>
    <div class="utilbar__group">
      <span class="pill" data-open-pill data-open="false" hidden><span class="pill__dot"></span><span data-open-text>Checking…</span></span>
      <a href="mailto:${BUSINESS.email}">${BUSINESS.email}</a>
      <a href="tel:${BUSINESS.phone}" class="mono">${BUSINESS.phoneDisplay}</a>
    </div>
  </div>
</div>

<header class="header">
  <div class="header__inner">
    <a class="brand" href="${u || './'}" aria-label="Naga Steels, home">
      <span class="brand__medallion"><img src="${u}assets/img/brand/naga-steels-main-logo.jpeg" width="512" height="512" alt=""></span>
      <span class="brand__text"><strong>Naga Steels</strong><small>Madurai · Since 2002</small></span>
    </a>

    <nav class="nav" aria-label="Primary">
      <div class="nav__group">
        <button class="nav__trigger" type="button" aria-expanded="false" aria-controls="nav-products">
          Products ${ICON.chev}
        </button>
        <div class="nav__panel" id="nav-products">
${megaItems}
          <span class="nav__panel-foot">
            <span>Six product families, one invoice, one lorry.</span>
            <span class="mono">Madurai 625001</span>
          </span>
        </div>
      </div>
      <a href="${u}fencing-manufacturer-madurai/"${on('fencing-manufacturer-madurai/')}>Naga Fencing</a>
      <a href="${u}tata-wiron-dealer-madurai/"${on('tata-wiron-dealer-madurai/')}>Tata Wiron</a>
      <a href="${u}#applications">Applications</a>
      <a href="${u}services-delivery/"${on('services-delivery/')}>Delivery</a>
      <a href="${u}about/"${on('about/')}>About</a>
      <a href="${u}contact/"${on('contact/')}>Contact</a>
      <a class="btn btn--sm" href="${u}contact/#quote">Get a Quote</a>
    </nav>

    <button class="burger" id="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="Open menu">
      <span></span><span></span>
    </button>
  </div>
</header>

<div class="menu" id="menu" data-open="false">
  <div class="menu__scrim"></div>
  <div class="menu__panel" role="dialog" aria-modal="true" aria-label="Site menu">
    <div class="menu__head">
      <span class="menu__label">Products &amp; Company</span>
      <button class="menu__close" type="button" aria-label="Close menu">${ICON.close}</button>
    </div>
    <nav aria-label="All pages">
${drawerProducts}
      <span class="menu__section">Brands &amp; company</span>
${drawerCompany}
    </nav>
    <div class="menu__foot">
      <a class="btn btn--wa btn--block" href="${WA_GENERIC}" target="_blank" rel="noopener">WhatsApp a quote</a>
      <a class="btn btn--ghost btn--block" href="tel:${BUSINESS.phone}">Call ${BUSINESS.phoneDisplay}</a>
    </div>
  </div>
</div>

<main id="main">`;
}

/* ---- Footer + action bar ------------------------------------------------ */

export function footer({ depth }) {
  const u = up(depth);
  return `
</main>

<footer class="footer">
  <div class="wrap">
    <div class="footer__grid">
      <div class="footer__brand">
        <span class="brand">
          <span class="brand__medallion"><img src="${u}assets/img/brand/naga-steels-main-logo.jpeg" width="512" height="512" alt=""></span>
          <span class="brand__text"><strong>Naga Steels</strong><small>Madurai · Since 2002</small></span>
        </span>
        <p>Steel distribution, metal supply and Naga Fencing manufacturing.</p>
        <address>
          ${BUSINESS.street},<br>Madurai, Tamil Nadu ${BUSINESS.postalCode}<br>
          <a href="tel:${BUSINESS.phone}" class="mono">${BUSINESS.phoneDisplay}</a><br>
          <a href="mailto:${BUSINESS.email}">${BUSINESS.email}</a><br>
          ${BUSINESS.hoursDisplay}<br><br>
          <span class="pill" data-open-pill data-open="false" hidden><span class="pill__dot"></span><span data-open-text>Checking…</span></span>
        </address>
      </div>

      <div>
        <h2 class="footer__h">Steel &amp; metal</h2>
        <ul>
          <li><a href="${u}products/">Complete product range</a></li>
          <li><a href="${u}gi-wire-supplier-madurai/">GI &amp; steel wire</a></li>
          <li><a href="${u}gi-sheet-dealer-madurai/">GI sheets &amp; plate</a></li>
          <li><a href="${u}ms-sheet-dealer-madurai/">MS sheets &amp; plate</a></li>
          <li><a href="${u}colour-coated-sheet-supplier-madurai/">Roofing sheets</a></li>
          <li><a href="${u}steel-hardware-supplier-madurai/">Nails, bolts &amp; hardware</a></li>
        </ul>
      </div>

      <div>
        <h2 class="footer__h">Brands &amp; fencing</h2>
        <ul>
          <li><a href="${u}fencing-manufacturer-madurai/">Naga Fencing</a></li>
          <li><a href="${u}chain-link-fencing-madurai/">Chain link fencing</a></li>
          <li><a href="${u}barbed-wire-supplier-madurai/">Barbed wire</a></li>
          <li><a href="${u}wire-mesh-supplier-madurai/">Wire mesh</a></li>
          <li><a href="${u}weld-mesh-supplier-madurai/">Weld mesh</a></li>
          <li><a href="${u}tata-wiron-dealer-madurai/">Tata Wiron products</a></li>
          <li><a href="${u}vnc-products-distributor-madurai/">VNC products</a></li>
        </ul>
      </div>

      <div>
        <h2 class="footer__h">Company</h2>
        <ul>
          <li><a href="${u}services-delivery/">Services &amp; delivery</a></li>
          <li><a href="${u}about/">About</a></li>
          <li><a href="${u}#applications">Applications</a></li>
          <li><a href="${u}contact/">Contact</a></li>
          <li><a href="${u}privacy/">Privacy</a></li>
        </ul>
      </div>
    </div>

    <div class="footer__bottom">
      <span>© <span id="yr">2026</span> Naga Steels. Proprietor: ${BUSINESS.proprietor}.</span>
      <span class="gstin">GSTIN ${BUSINESS.gstin}</span>
    </div>
  </div>
</footer>

<div class="actionbar">
  <a class="ab-call" href="tel:${BUSINESS.phone}">${ICON.phone} Call</a>
  <a class="ab-wa" id="ab-wa" href="${WA_GENERIC}" target="_blank" rel="noopener">${ICON.wa} WhatsApp Quote</a>
</div>

<script type="module" src="${u}assets/js/main.js"></script>
</body>
</html>
`;
}

/* ---- Reusable blocks ----------------------------------------------------- */

export const crumb = (depth, trail, light = false) => {
  const u = up(depth);
  const links = trail
    .slice(0, -1)
    .map(([name, slug]) => `<a href="${u}${slug}">${name}</a><span aria-hidden="true">/</span>`)
    .join('');
  return `    <nav class="crumb${light ? ' crumb--light' : ''}" aria-label="Breadcrumb">
      ${links}<span aria-current="page">${trail[trail.length - 1][0]}</span>
    </nav>`;
};

export const quoteBand = (depth) => {
  const u = up(depth);
  return `
<section class="quote-band on-dark">
  <div class="wrap quote-band__inner" data-reveal>
    <div>
      <p class="eyebrow eyebrow--light">Direct enquiry</p>
      <h2>Tell us the material. We will ask for the rest.</h2>
    </div>
    <div>
      <p>Product · dimensions · quantity · delivery location</p>
      <div class="quote-band__row">
        <a class="btn btn--invert" href="${u}contact/#quote">Request a quotation <span aria-hidden="true">→</span></a>
        <a class="btn btn--invert" href="tel:${BUSINESS.phone}">Call ${BUSINESS.phoneDisplay}</a>
      </div>
    </div>
  </div>
</section>`;
};

export const related = (depth, links) => {
  const u = up(depth);
  return `
<section class="related">
  <div class="wrap">
    <p class="section-index">Related ranges</p>
    <div class="related__links">
${links.map(([name, slug]) => `      <a href="${u}${slug}">${name} <span aria-hidden="true">→</span></a>`).join('\n')}
    </div>
  </div>
</section>`;
};

/* ---- JSON-LD helpers ------------------------------------------------------ */

export const breadcrumbLd = (slug, trail) => ({
  '@type': 'BreadcrumbList',
  '@id': `${BUSINESS.origin}/${slug}#breadcrumb`,
  itemListElement: trail.map(([name, s], i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name,
    item: `${BUSINESS.origin}/${s}`,
  })),
});

export const webPageLd = (slug, title, type = 'WebPage') => ({
  '@type': type,
  '@id': `${BUSINESS.origin}/${slug}#webpage`,
  url: `${BUSINESS.origin}/${slug}`,
  name: title,
  isPartOf: { '@id': `${BUSINESS.origin}/#website` },
  about: { '@id': `${BUSINESS.origin}/#organization` },
  inLanguage: 'en-IN',
  breadcrumb: { '@id': `${BUSINESS.origin}/${slug}#breadcrumb` },
});

export const productLd = (slug, name, description) => ({
  '@type': 'Product',
  '@id': `${BUSINESS.origin}/${slug}#product`,
  name,
  description,
  brand: { '@type': 'Brand', name: 'Naga Steels' },
  category: 'Steel and metal products',
  offers: {
    '@type': 'Offer',
    '@id': `${BUSINESS.origin}/${slug}#offer`,
    availability: 'https://schema.org/InStock',
    priceCurrency: 'INR',
    // No price. Steel rates move weekly with zinc and HR coil, and a
    // stale price in structured data is worse than none: Google will
    // surface it and the yard will not honour it.
    priceSpecification: {
      '@type': 'PriceSpecification',
      priceCurrency: 'INR',
      valueAddedTaxIncluded: false,
    },
    seller: { '@id': `${BUSINESS.origin}/#organization` },
    areaServed: { '@type': 'State', name: 'Tamil Nadu' },
  },
});

export const faqLd = (slug, items) => ({
  '@type': 'FAQPage',
  '@id': `${BUSINESS.origin}/${slug}#faq`,
  mainEntity: items.map(([q, a]) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
});
