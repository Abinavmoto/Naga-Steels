/* ============================================================
   NAGA STEELS, static page generator
   ------------------------------------------------------------
   Run:  node build/build.js

   Writes the ~24 generated pages plus sitemap.xml and the
   redirect stubs for the retired short slugs.

   The OUTPUT IS COMMITTED. GitHub Pages serves plain static
   files; this script is a convenience for maintaining shared
   chrome across 27 pages, never a runtime dependency.

   index.html, products/, contact/ and 404.html are hand-written
   and are deliberately NOT regenerated here, because they carry
   bespoke layout the generator does not model.
   ============================================================ */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { BUSINESS, AREAS, AREAS_NEARBY } from '../assets/js/data/business.js';
import { SERVICES, DELIVERY_TIERS, DELIVERY_NOTE, PROCESS } from '../assets/js/data/services.js';
import {
  head, header, footer, crumb, quoteBand, related,
  breadcrumbLd, webPageLd, productLd, faqLd, ICON,
} from './partials.js';
import { PRODUCT_PAGES, APPLICATION_PAGES, BRAND_PAGES } from './pages.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/* Hand-authored pages. These carry bespoke sections the generator does not
   model (the chain-link variants grid, the GI wire SWG reference tables),
   so the generator must never flatten them back to the standard template.
   Remove a slug from this list only if you also delete the hand-written
   file and are happy with the generated version. */
const HAND_AUTHORED = new Set([
  'chain-link-fencing-madurai/',
  'gi-wire-supplier-madurai/',
  'products/',
  'contact/',
]);

const write = (slug, html) => {
  if (HAND_AUTHORED.has(slug)) {
    console.log(`  – ${slug} (hand-authored, skipped)`);
    return;
  }
  const out = join(ROOT, slug, 'index.html');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html, 'utf8');
  console.log(`  ✓ ${slug}`);
};

/** Strip the HTML entities we allow in copy so JSON-LD stays clean text. */
const plain = (s) => String(s).replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');

const depthOf = (slug) => slug.replace(/\/$/, '').split('/').length;

/* ============================================================
   Product detail pages
   ============================================================ */

function buildProduct(p) {
  const depth = depthOf(p.slug);
  const trail = [['Home', ''], ['Products', 'products/'], [plain(p.h1.replace(/\.$/, '')), p.slug]];

  const ld = [
    breadcrumbLd(p.slug, trail),
    webPageLd(p.slug, plain(p.title)),
    productLd(p.slug, plain(p.h1.replace(/\.$/, '')), plain(p.description)),
    faqLd(p.slug, p.faq.map(([q, a]) => [plain(q), plain(a)])),
  ];

  const specs = p.specs
    .map(([k, v]) => `        <div><dt>${k}</dt><dd>${v}</dd></div>`)
    .join('\n');

  const uses = p.uses
    .map(([k, v], i) => `        <li><span>${String(i + 1).padStart(2, '0')}</span><p><strong>${k}.</strong> ${v}</p></li>`)
    .join('\n');

  const faq = p.faq
    .map(([q, a]) => `      <details>\n        <summary>${q}</summary>\n        <div><p>${a}</p></div>\n      </details>`)
    .join('\n');

  return head({ title: p.title, description: p.description, slug: p.slug, depth, jsonld: ld })
    + header({ depth, current: p.slug })
    + `
<section class="detail-hero">
  <div class="wrap">
${crumb(depth, trail)}
    <div class="detail-hero__grid">
      <div>
        <p class="eyebrow">${p.eyebrow}</p>
        <h1>${p.h1}</h1>
        <p class="detail-lead">${p.lead}</p>
      </div>
      <aside>
        <span>${p.asideLabel}</span>
        <strong>${p.asideTitle}</strong>
        <p>${p.asideNote}</p>
      </aside>
    </div>
  </div>
</section>

<section class="detail-section detail-section--paper">
  <div class="wrap">
    <div class="detail-visual" data-reveal>
      <figure class="concept-figure">
        <div class="concept-image">
          <img src="${'../'.repeat(depth)}assets/img/${p.img}" width="1536" height="1024"
               alt="${p.imgAlt}" loading="lazy" decoding="async">
        </div>
        <figcaption><span>Application study</span>${p.imgCaption}</figcaption>
      </figure>
    </div>

    <div class="dual" data-reveal>
      <div>
        <p class="section-index">Overview</p>
        <div class="prose">
${p.intro.map((x) => `          <p>${x}</p>`).join('\n')}
        </div>
      </div>
      <div>
        <p class="section-index">Key buying details</p>
        <dl class="spec-list">
${specs}
        </dl>
      </div>
    </div>
  </div>
</section>

<section class="detail-section">
  <div class="wrap dual" data-reveal>
    <div>
      <p class="section-index">Where it is used</p>
      <h2>Typical applications.</h2>
      <ol class="numbered">
${uses}
      </ol>
    </div>
    <div>
      <p class="section-index">Buying guide</p>
      <h2>${p.guide.title}</h2>
      <div class="prose">
${p.guide.body.map((x) => `        <p>${x}</p>`).join('\n')}
      </div>
    </div>
  </div>
</section>

<section class="faq-section">
  <div class="wrap faq__grid">
    <div data-reveal>
      <p class="eyebrow">Questions before an enquiry</p>
      <h2>Useful answers.</h2>
    </div>
    <div class="faq" data-reveal>
${faq}
    </div>
  </div>
</section>
`
    + related(depth, p.related)
    + quoteBand(depth)
    + footer({ depth });
}

/* ============================================================
   Application pages
   ============================================================ */

function buildApplication(a) {
  const depth = depthOf(a.slug);
  const trail = [['Home', ''], ['Applications', '#applications'], [plain(a.h1.replace(/\.$/, '')), a.slug]];

  const ld = [
    breadcrumbLd(a.slug, [['Home', ''], [plain(a.h1.replace(/\.$/, '')), a.slug]]),
    webPageLd(a.slug, plain(a.title)),
  ];

  const rec = a.rec
    .map(([k, v], i) => `        <li><span>${String(i + 1).padStart(2, '0')}</span><p><strong>${k}.</strong> ${v}</p></li>`)
    .join('\n');

  return head({ title: a.title, description: a.description, slug: a.slug, depth, jsonld: ld })
    + header({ depth })
    + `
<section class="detail-hero">
  <div class="wrap">
${crumb(depth, trail)}
    <div class="detail-hero__grid">
      <div>
        <p class="eyebrow">${a.eyebrow}</p>
        <h1>${a.h1}</h1>
        <p class="detail-lead">${a.lead}</p>
      </div>
      <aside>
        <span>Scope</span>
        <strong>Material supply</strong>
        <p>We supply the fencing and steel material. Civil work, foundations and erection are a separate scope.</p>
      </aside>
    </div>
  </div>
</section>

<section class="detail-section detail-section--paper">
  <div class="wrap">
    <div class="detail-visual" data-reveal>
      <figure class="concept-figure">
        <div class="concept-image">
          <img src="${'../'.repeat(depth)}assets/img/applications/${a.img}" width="1536" height="1024"
               alt="${a.imgAlt}" loading="lazy" decoding="async">
        </div>
        <figcaption><span>Application study</span>${a.imgCaption}</figcaption>
      </figure>
    </div>

    <div class="dual" data-reveal>
      <div>
        <p class="section-index">The requirement</p>
        <div class="prose">
${a.intro.map((x) => `          <p>${x}</p>`).join('\n')}
        </div>
      </div>
      <div>
        <p class="section-index">Recommended specification</p>
        <ol class="numbered">
${rec}
        </ol>
      </div>
    </div>
  </div>
</section>

<section class="detail-section">
  <div class="wrap guide__grid" data-reveal>
    <div>
      <p class="section-index">Specifying it</p>
      <h2>What to get right first time.</h2>
    </div>
    <div class="prose">
${a.body.map((x) => `      <p>${x}</p>`).join('\n')}
    </div>
  </div>
</section>
`
    + related(depth, a.related)
    + quoteBand(depth)
    + footer({ depth });
}

/* ============================================================
   Brand pages
   ============================================================ */

function buildBrand(b) {
  const depth = depthOf(b.slug);
  const trail = [['Home', ''], [plain(b.h1.replace(/\.$/, '')), b.slug]];
  const u = '../'.repeat(depth);

  const ld = [breadcrumbLd(b.slug, trail), webPageLd(b.slug, plain(b.title))];

  const sub = b.sub
    ? `
<section class="detail-section">
  <div class="wrap">
    <p class="section-index">Product brands</p>
    <div class="material-list" data-reveal>
${b.sub.map(([id, name], i) => `      <a href="#${id}" id="${id}"><span>${String(i + 1).padStart(2, '0')}</span><h3>${name}</h3><p>Supplied</p><i aria-hidden="true">→</i></a>`).join('\n')}
    </div>
    <div class="prose" style="margin-top:var(--s-6);max-width:none">
${b.sub.map(([, name, note]) => `      <p><strong>${name}.</strong> ${note}</p>`).join('\n')}
    </div>
  </div>
</section>`
    : '';

  return head({ title: b.title, description: b.description, slug: b.slug, depth, jsonld: ld })
    + header({ depth, current: b.slug })
    + `
<section class="detail-hero">
  <div class="wrap">
${crumb(depth, trail)}
    <div class="detail-hero__grid">
      <div>
        <p class="eyebrow">${b.eyebrow}</p>
        <h1>${b.h1}</h1>
        <p class="detail-lead">${b.lead}</p>
      </div>
      <aside>
        <span>Relationship</span>
        <strong>${b.eyebrow}</strong>
        <p>Availability and current manufacturer specifications are confirmed at the time of quotation.</p>
      </aside>
    </div>
  </div>
</section>

<section class="detail-section detail-section--paper">
  <div class="wrap guide__grid" data-reveal>
    <div>
      <p class="section-index">Overview</p>
      <h2>What this covers.</h2>
    </div>
    <div class="prose">
${b.intro.map((x) => `      <p>${x}</p>`).join('\n')}
    </div>
  </div>
</section>${sub}

<section class="detail-section${b.sub ? ' detail-section--paper' : ''}">
  <div class="wrap">
    <p class="section-index">Continue</p>
    <div class="related__links rule-top">
      <a href="${u}products/">Complete catalogue <span aria-hidden="true">→</span></a>
      <a href="${u}chain-link-fencing-madurai/">Chain link fencing <span aria-hidden="true">→</span></a>
      <a href="${u}gi-wire-supplier-madurai/">GI wire <span aria-hidden="true">→</span></a>
    </div>
  </div>
</section>
`
    + quoteBand(depth)
    + footer({ depth });
}

/* ============================================================
   Services & delivery
   ============================================================ */

function buildServices() {
  const slug = 'services-delivery/';
  const depth = 1;
  const trail = [['Home', ''], ['Services & delivery', slug]];
  const title = 'Services &amp; Delivery Madurai | Steel Supply &amp; Dispatch | Naga Steels';
  const description = 'Naga Steels services and delivery. Made-to-spec chain link, material supply, BOQ review and dispatch coordination across Madurai, Dindigul, Theni, Tirunelveli and South Tamil Nadu.';

  const ld = [
    breadcrumbLd(slug, trail),
    webPageLd(slug, plain(title)),
    ...SERVICES.map((s) => ({
      '@type': 'Service',
      '@id': `${BUSINESS.origin}/${slug}#${s.id}`,
      name: s.name,
      serviceType: s.name,
      provider: { '@id': `${BUSINESS.origin}/#organization` },
      areaServed: { '@type': 'State', name: 'Tamil Nadu' },
      description: plain(s.blurb),
    })),
  ];

  const services = SERVICES
    .map((s) => `      <article>
        <span>${s.n}</span>
        <h3>${s.name}</h3>
        <p>${s.detail}</p>
      </article>`)
    .join('\n');

  const tiers = DELIVERY_TIERS
    .map((t) => `        <div><span>${t.n}</span><p><strong>${t.name}</strong>${t.blurb}</p></div>`)
    .join('\n');

  const process = PROCESS
    .map((p) => `        <li><span>${p.n}</span><p><strong>${p.name}.</strong> ${p.blurb}</p></li>`)
    .join('\n');

  const areaRows = [...AREAS, ...AREAS_NEARBY]
    .map((a) => `        <tr><td>${a.label || a.name}</td><td class="num">${a.dist}</td><td style="color:var(--muted)">${a.note}</td></tr>`)
    .join('\n');

  return head({ title, description, slug, depth, jsonld: ld })
    + header({ depth, current: slug })
    + `
<section class="detail-hero services-hero">
  <div class="wrap">
${crumb(depth, trail)}
    <div class="detail-hero__grid">
      <div>
        <p class="eyebrow">Services &amp; delivery</p>
        <h1>From specification to scheduled supply.</h1>
        <p class="detail-lead">
          Clear scope, usable buying details and delivery planning — without treating
          material supply, civil work and installation as the same thing.
        </p>
      </div>
      <aside>
        <span>Scope boundary</span>
        <strong>Supply &amp; manufacture</strong>
        <p>We manufacture chain link and supply steel, mesh and hardware. We do not quote for civil work, foundations or erection.</p>
      </aside>
    </div>
  </div>
</section>

<section class="detail-section detail-section--paper">
  <div class="wrap">
    <div class="editorial-heading" data-reveal>
      <div>
        <p class="eyebrow">What we do</p>
        <h2>Four services, plainly stated.</h2>
      </div>
      <p>Each one is a thing we actually perform. Anything outside this list we will tell you we do not do, rather than subcontract a trade we cannot stand behind.</p>
    </div>
    <div class="service-detail-grid rule-top" data-reveal style="display:grid;grid-template-columns:repeat(2,1fr);column-gap:28px">
${services}
    </div>
  </div>
</section>

<section class="services" id="service-map">
  <div class="wrap">
    <div class="services__head" data-reveal>
      <div>
        <p class="eyebrow">Delivery coverage</p>
        <h2>Madurai first. Project routes reviewed.</h2>
      </div>
      <p>${DELIVERY_NOTE} Freight is always quoted separately from material, so you can see what the transport is costing and decide whether collection makes more sense.</p>
    </div>

    <div class="services__layout">
      <div data-reveal>
        <figure class="coverage-map" style="min-height:520px">
          <div class="coverage-map__kicker">
            <span>South Tamil Nadu</span>
            <strong>Delivery enquiry network</strong>
          </div>
          <div class="coverage-map__plot" id="coverage-plot" aria-hidden="true"></div>
          <figcaption>Coverage schematic, not a route map. Delivery is confirmed by product, quantity, vehicle access, unloading and required date.</figcaption>
        </figure>
      </div>

      <aside class="delivery-panel on-dark" data-reveal>
        <p class="section-index section-index--light">How coverage works</p>
        <h3>Three tiers, not a blanket promise.</h3>
        <div class="delivery-list">
${tiers}
        </div>
        <p class="delivery-note">${DELIVERY_NOTE}</p>
        <a class="btn btn--invert btn--sm" href="../contact/#quote">Send a delivery enquiry <span aria-hidden="true">→</span></a>
      </aside>
    </div>
  </div>
</section>

<section class="detail-section detail-section--paper">
  <div class="wrap">
    <div class="editorial-heading" data-reveal>
      <div>
        <p class="eyebrow">Named locations</p>
        <h2>Where we dispatch to.</h2>
      </div>
      <p>Distances are approximate road distances from Madurai. Lead times assume material is in stock and the vehicle can access and unload at the site.</p>
    </div>
    <div class="table-scroll panel" data-reveal style="padding:var(--s-5)">
      <table class="spectable">
        <caption class="visually-hidden">Delivery locations, approximate distance from Madurai and typical lead time</caption>
        <thead><tr><th scope="col">Location</th><th scope="col">Distance</th><th scope="col">Typical lead time</th></tr></thead>
        <tbody id="areas-table">
${areaRows}
        </tbody>
      </table>
    </div>
    <p class="disclaimer" data-reveal>
      ${ICON.info}
      <span>Lead times are indicative, not committed. Every dispatch is confirmed against
      material availability, quantity, route, vehicle access, unloading and the required date.</span>
    </p>
  </div>
</section>

<section class="detail-section">
  <div class="wrap guide__grid" data-reveal>
    <div>
      <p class="section-index">How an order runs</p>
      <h2>Enquiry to dispatch.</h2>
    </div>
    <div>
      <ol class="numbered">
${process}
      </ol>
    </div>
  </div>
</section>
`
    + quoteBand(depth)
    + footer({ depth });
}

/* ============================================================
   About
   ============================================================ */

function buildAbout() {
  const slug = 'about/';
  const depth = 1;
  const trail = [['Home', ''], ['About', slug]];
  const title = 'About Naga Steels Madurai | Steel Supplier Since 2002';
  const description = 'Naga Steels has supplied steel, GI and MS sheet, wire, mesh, roofing and fencing from Madurai since 2002. Naga Fencing is our chain link manufacturing brand. GSTIN 33DGWPK4434F1Z7.';

  const ld = [breadcrumbLd(slug, trail), webPageLd(slug, plain(title), 'AboutPage')];

  return head({ title, description, slug, depth, jsonld: ld })
    + header({ depth, current: slug })
    + `
<section class="detail-hero">
  <div class="wrap">
${crumb(depth, trail)}
    <div class="detail-hero__grid">
      <div>
        <p class="eyebrow">Since 2002</p>
        <h1>Built in Madurai. Built over time.</h1>
        <p class="detail-lead">
          Naga Steels combines fencing manufacturing with the trading and supply of steel,
          GI products, mesh and related materials. Two decades of the same trade, from the
          same street.
        </p>
      </div>
      <aside>
        <span>Registered details</span>
        <strong>Proprietorship</strong>
        <p>Proprietor: ${BUSINESS.proprietor}<br>GSTIN: <span class="mono">${BUSINESS.gstin}</span><br>Established ${BUSINESS.established}</p>
      </aside>
    </div>
  </div>
</section>

<section class="detail-section detail-section--paper">
  <div class="wrap guide__grid" data-reveal>
    <div>
      <p class="section-index">The business</p>
      <h2>A supplier, not a catalogue.</h2>
    </div>
    <div class="prose">
      <p>Naga Steels is a steel distributor, wholesaler and metal supplier based at 124 Chitrakara Street in Madurai. The business has traded since 2002 and registered for GST in 2022.</p>
      <p>What that means in practice is that the stock is held rather than ordered in. Collection from the godown is usually same-day, and the six product families sit under one roof so a single enquiry can close an entire material schedule instead of three.</p>
      <p>Naga Fencing is the dedicated brand for the fencing side. Chain link is woven to the wire size, mesh opening and height specified by the customer, which is the clearest difference between this business and a merchant reselling whatever the mill produced.</p>
      <p>The rest is supply: GI and MS sheet and plate, GI and steel wire and wire rope, woven and welded mesh, colour-coated and GI roofing sheet, and the nails, bolts and fittings that otherwise hold up a delivery.</p>
    </div>
  </div>
</section>

<section class="history on-dark">
  <div class="wrap history__grid" data-reveal>
    <div>
      <p class="eyebrow eyebrow--light">How we quote</p>
      <h2>Honest about scope.</h2>
    </div>
    <div>
      <p>We are a material supplier and a fencing manufacturer. We supply chain link, wire, mesh, sheet, roofing and fixings, and we review drawings and BOQs against them. We do not treat material supply, civil work and installation as the same thing, and we will say so rather than quote for work we do not perform.</p>
      <blockquote>The right material.<br>The right specification.<br>A dependable supply relationship.</blockquote>
      <a class="inline-link inline-link--light" href="../contact/">Send an enquiry <span aria-hidden="true">→</span></a>
    </div>
  </div>
</section>

<section class="detail-section">
  <div class="wrap dual" data-reveal>
    <div>
      <p class="section-index">What we hold</p>
      <h2>Six product families.</h2>
      <ol class="numbered">
        <li><span>01</span><p><strong>Fencing systems.</strong> Chain link in GI, PVC-coated and heavy-duty, plus barbed wire.</p></li>
        <li><span>02</span><p><strong>Sheets and plate.</strong> GI plain and shutter sheet, MS sheet and steel plate, cut to size.</p></li>
        <li><span>03</span><p><strong>Wire and rope.</strong> GI wire 8 to 18 SWG, binding wire and steel wire rope.</p></li>
        <li><span>04</span><p><strong>Mesh.</strong> Woven wire mesh and welded mesh in rolls and rigid panels.</p></li>
        <li><span>05</span><p><strong>Roofing.</strong> Colour-coated, galvalume and GI sheet cut to rafter length.</p></li>
        <li><span>06</span><p><strong>Hardware.</strong> Nails, concrete nails, GI bolts and fencing fittings.</p></li>
      </ol>
    </div>
    <div>
      <p class="section-index">Brands &amp; partners</p>
      <h2>Who we supply.</h2>
      <div class="prose">
        <p><strong>Naga Steels</strong> is the master brand across all six families.</p>
        <p><strong>Naga Fencing</strong> is the fencing brand, covering chain link variants, barbed wire and boundary material.</p>
        <p><strong>Tata Wiron</strong> galvanized, binding and fencing wire is supplied as a dealer.</p>
        <p><strong>VNC Group</strong> products are supplied as a distributor, including Bestfence, Bestwire, Bestarc and Voltwire. Availability and current manufacturer specifications are confirmed at the time of quotation.</p>
      </div>
    </div>
  </div>
</section>

<section class="detail-section detail-section--paper">
  <div class="wrap">
    <p class="section-index">Visit the yard</p>
    <div class="dual" data-reveal>
      <div>
        <h2>124, Chitrakara Street.</h2>
        <address style="font-style:normal;color:var(--muted);line-height:1.9;margin-top:var(--s-4)">
          Naga Steels<br>
          ${BUSINESS.street}<br>
          Madurai, Tamil Nadu ${BUSINESS.postalCode}<br><br>
          <a href="tel:${BUSINESS.phone}" class="mono">${BUSINESS.phoneDisplay}</a><br>
          <a href="mailto:${BUSINESS.email}">${BUSINESS.email}</a><br>
          ${BUSINESS.hoursDisplay}, closed Sunday
        </address>
        <p style="margin-top:var(--s-5)">
          <a class="inline-link" href="${BUSINESS.mapsUrl}" target="_blank" rel="noopener">Open in Google Maps <span aria-hidden="true">→</span></a>
        </p>
      </div>
      <div>
        <h2>Collection or delivery.</h2>
        <p style="color:var(--muted)">Collection from the godown is usually same-day because the stock is held rather than ordered in. For delivery, freight is quoted separately from the material so the transport cost is always visible.</p>
        <p style="color:var(--muted);margin-top:18px">Vehicle access and unloading are confirmed before a dispatch date is committed. A lorry that cannot turn into the site is a wasted day for both of us.</p>
        <p style="margin-top:18px"><a class="inline-link" href="../services-delivery/">Services &amp; delivery detail <span aria-hidden="true">→</span></a></p>
      </div>
    </div>
  </div>
</section>
`
    + quoteBand(depth)
    + footer({ depth });
}

/* ============================================================
   Privacy
   ============================================================ */

function buildPrivacy() {
  const slug = 'privacy/';
  const depth = 1;
  const trail = [['Home', ''], ['Privacy', slug]];
  const title = 'Privacy | Naga Steels Madurai';
  const description = 'How Naga Steels handles enquiry information. This website collects no personal data and sets no tracking cookies.';

  const ld = [breadcrumbLd(slug, trail), webPageLd(slug, plain(title))];

  return head({ title, description, slug, depth, jsonld: ld })
    + header({ depth, current: slug })
    + `
<section class="legal-page">
  <div class="wrap">
${crumb(depth, trail)}
    <div class="legal-content">
      <h1>Privacy.</h1>
      <p>Short, because there is very little to say.</p>

      <h2>What this website collects</h2>
      <p>Nothing. This is a static website. There is no server, no database, no contact form that posts anywhere, no analytics script and no tracking cookie.</p>

      <h2>The quote builder</h2>
      <p>The quote builder on this site runs entirely in your browser. It assembles the text of a WhatsApp message from the options you select and places that text into a link. Nothing is transmitted anywhere until you choose to tap send, at which point the message goes to WhatsApp in the normal way and WhatsApp's own privacy terms apply.</p>
      <p>The calculator and the configurator work the same way: everything is computed locally and nothing leaves your device.</p>

      <h2>Local storage</h2>
      <p>The site does not store personal information on your device. No advertising or analytics identifiers are set.</p>

      <h2>When you contact us</h2>
      <p>If you call, send a WhatsApp message or email ${BUSINESS.email}, we keep what you send for as long as it takes to quote and fulfil the enquiry, and for the record-keeping any business is required to maintain. We do not sell it, share it for marketing, or add you to a list.</p>

      <h2>Third parties</h2>
      <p>Links to Google Maps and WhatsApp leave this site. Once you follow them, those services apply their own terms. Fonts are self-hosted on this domain specifically so that loading a page here does not send a request to a third party.</p>

      <h2>Questions</h2>
      <p>Call <a href="tel:${BUSINESS.phone}" class="mono">${BUSINESS.phoneDisplay}</a> or email <a href="mailto:${BUSINESS.email}">${BUSINESS.email}</a>.</p>
    </div>
  </div>
</section>
`
    + footer({ depth });
}

/* ============================================================
   Redirect stubs for retired short slugs
   ------------------------------------------------------------
   GitHub Pages cannot issue a 301. A canonical link plus a
   meta refresh passes most of the signal, and the visible link
   covers clients that honour neither.
   ============================================================ */

const REDIRECTS = [
  ['chain-link-fencing/', 'chain-link-fencing-madurai/', 'Chain link fencing in Madurai'],
  ['welded-wire-mesh/', 'weld-mesh-supplier-madurai/', 'Weld mesh supplier in Madurai'],
  ['barbed-wire/', 'barbed-wire-supplier-madurai/', 'Barbed wire supplier in Madurai'],
  ['gi-wire/', 'gi-wire-supplier-madurai/', 'GI wire supplier in Madurai'],
  ['steel-sheets/', 'gi-sheet-dealer-madurai/', 'GI sheet dealer in Madurai'],
  ['roofing-sheets/', 'colour-coated-sheet-supplier-madurai/', 'Colour coated roofing sheet supplier in Madurai'],
  ['steel-hardware/', 'steel-hardware-supplier-madurai/', 'Steel hardware supplier in Madurai'],
  ['service-areas/', 'services-delivery/', 'Services and delivery'],
];

function buildRedirect([from, to, label]) {
  const depth = depthOf(from);
  const u = '../'.repeat(depth);
  return `<!DOCTYPE html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Moved: ${label} | Naga Steels</title>
<!-- This page has moved to a keyword-targeted slug. GitHub Pages cannot
     issue a 301, so this stub carries the canonical, a meta refresh and a
     visible link for any client that honours neither. -->
<link rel="canonical" href="${BUSINESS.origin}/${to}">
<meta http-equiv="refresh" content="0; url=${u}${to}">
<meta name="robots" content="noindex, follow">
<link rel="icon" href="${u}assets/img/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${u}assets/css/fonts.css">
<link rel="stylesheet" href="${u}assets/css/tokens.css">
<link rel="stylesheet" href="${u}assets/css/base.css">
<link rel="stylesheet" href="${u}assets/css/components.css">
<link rel="stylesheet" href="${u}assets/css/sections.css">
</head>
<body>
<main id="main" class="legal-page">
  <div class="wrap legal-content">
    <p class="eyebrow">This page has moved</p>
    <h1>${label}.</h1>
    <p>You are being redirected. If nothing happens, follow the link below.</p>
    <p style="margin-top:var(--s-5)">
      <a class="btn" href="${u}${to}">Continue to ${label} <span aria-hidden="true">→</span></a>
    </p>
    <p style="margin-top:var(--s-5)"><a class="inline-link" href="${u}">Naga Steels home <span aria-hidden="true">→</span></a></p>
  </div>
</main>
</body>
</html>
`;
}

/* ============================================================
   Sitemap
   ============================================================ */

function buildSitemap(slugs) {
  const today = new Date().toISOString().slice(0, 10);
  const priority = (s) => {
    if (s === '') return '1.0';
    if (['products/', 'contact/', 'fencing-manufacturer-madurai/'].includes(s)) return '0.9';
    if (s.endsWith('-madurai/')) return '0.8';
    if (['services-delivery/', 'about/'].includes(s)) return '0.7';
    if (s === 'privacy/') return '0.3';
    return '0.6';
  };

  const urls = slugs
    .map((s) => `  <url>
    <loc>${BUSINESS.origin}/${s}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority(s)}</priority>
  </url>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated by build/build.js. Do not edit by hand.
     Retired short slugs are deliberately absent: they are noindex
     redirect stubs, and listing them would invite Google to crawl
     pages we are actively retiring. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

/* ============================================================
   Run
   ============================================================ */

console.log('\nNaga Steels, building static pages\n');

console.log('Product pages');
PRODUCT_PAGES.forEach((p) => write(p.slug, buildProduct(p)));

console.log('Application pages');
APPLICATION_PAGES.forEach((a) => write(a.slug, buildApplication(a)));

console.log('Brand pages');
BRAND_PAGES.forEach((b) => write(b.slug, buildBrand(b)));

console.log('Company pages');
write('services-delivery/', buildServices());
write('about/', buildAbout());
write('privacy/', buildPrivacy());

console.log('Redirect stubs');
REDIRECTS.forEach((r) => write(r[0], buildRedirect(r)));

console.log('Sitemap');
const SLUGS = [
  '',
  'products/',
  ...PRODUCT_PAGES.map((p) => p.slug),
  ...BRAND_PAGES.map((b) => b.slug),
  ...APPLICATION_PAGES.map((a) => a.slug),
  'services-delivery/',
  'about/',
  'contact/',
  'privacy/',
];
writeFileSync(join(ROOT, 'sitemap.xml'), buildSitemap(SLUGS), 'utf8');
console.log(`  ✓ sitemap.xml (${SLUGS.length} URLs)`);

console.log(`\nDone. ${SLUGS.length} indexable pages, ${REDIRECTS.length} redirect stubs.\n`);
