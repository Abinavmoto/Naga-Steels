/* ============================================================
   NAGA STEELS, Product catalogue, single source of truth
   ------------------------------------------------------------
   Feeds: the configurator, the quote builder, the on-page spec
   tables, the catalogue grids and the Product JSON-LD.

   One file so a number can never disagree with itself across
   the site. If a spec is wrong, it is wrong in exactly one place.

   ⚠ PROVISIONAL. The gauges stocked, roll dimensions, kg/roll
   and coating grades below are industry-standard values, not
   values confirmed by Naga Steels. Confirm before launch;
   see OWNER-CHECKLIST.md.

   Re-exported here for backward compatibility with modules that
   still import BUSINESS / AREAS from this path.
   ============================================================ */

export { BUSINESS, AREAS, AREAS_NEARBY, ALL_AREA_NAMES, url } from './business.js';
export { BRANDS, VNC_BRANDS, brandById } from './brands.js';

/* ---- Standard Wire Gauge --------------------------------------------
   British SWG. Exact imperial definitions converted to mm. This audience
   buys by SWG and by kilogram, so a wrong mapping loses the sale.     */

export const SWG = [
  { swg: 8,  inch: 0.160, mm: 4.06, use: 'Heavy-duty chain link, industrial perimeter' },
  { swg: 10, inch: 0.128, mm: 3.25, use: 'Standard chain link, farm and site fencing' },
  { swg: 12, inch: 0.104, mm: 2.64, use: 'Light chain link, welded mesh' },
  { swg: 14, inch: 0.080, mm: 2.03, use: 'Welded mesh, poultry and garden mesh' },
  { swg: 16, inch: 0.064, mm: 1.63, use: 'Binding wire, light weaving' },
  { swg: 18, inch: 0.048, mm: 1.22, use: 'Binding wire, rebar tying' },
];

export const gaugeToMm = (swg) => SWG.find((g) => g.swg === swg)?.mm ?? null;

/* ---- Mesh apertures -------------------------------------------------- */

export const APERTURES = [
  { in: 1,   mm: 25, label: '1"',  use: 'Security mesh, poultry, narrow-gap screening' },
  { in: 1.5, mm: 38, label: '1½"', use: 'Compound walls, residential boundary' },
  { in: 2,   mm: 50, label: '2"',  use: 'General purpose, the most commonly stocked size' },
  { in: 2.5, mm: 63, label: '2½"', use: 'Farm and estate boundary, economy runs' },
  { in: 3,   mm: 75, label: '3"',  use: 'Long agricultural runs, lowest cost per foot' },
];

/* ---- Coatings -------------------------------------------------------- */

export const COATINGS = [
  {
    id: 'gi',
    label: 'Hot-Dip GI',
    full: 'Hot-Dip Galvanized',
    hex: '#B9BEC4',
    life: '15–25 years',
    note: 'Zinc bonded to the steel after weaving. Coated at every cut and knuckle, so there is no bare edge to start rusting.',
  },
  {
    id: 'pvc',
    label: 'PVC Green',
    full: 'PVC Coated (Green)',
    hex: '#1E6B3C',
    life: '20–30 years',
    note: 'Galvanized core sealed in a PVC jacket. The usual choice near the coast, and where a fence should disappear into greenery.',
  },
  {
    id: 'ec',
    label: 'Electro GI',
    full: 'Electro-Galvanized',
    hex: '#D6DBE1',
    life: '5–8 years',
    note: 'A thin, bright, even zinc layer. Economical for indoor use, temporary site barricades and short-term work.',
  },
];

/* ---- Zinc coating grades, IS 4826 ----------------------------------- */

export const ZINC_GRADES = [
  { grade: 'Commercial',  gsm: '40 – 60',   life: '5 – 8 yrs',   use: 'Indoor partitions, temporary barricades, short-term site work' },
  { grade: 'Medium',      gsm: '80 – 120',  life: '10 – 15 yrs', use: 'Residential compound walls, garden and poultry fencing' },
  { grade: 'Heavy',       gsm: '200 – 275', life: '20 – 25 yrs', use: 'Farm boundary, solar parks, industrial perimeter' },
  { grade: 'Extra Heavy', gsm: '275+',      life: '25 yrs +',    use: 'Coastal installations, chemical plants, highway boundary' },
];

/* ---- Product catalogue ----------------------------------------------
   Grouped by buyer intent, not by a supplier taxonomy. Slugs are
   keyword-targeted because every search that produces a phone call is
   "<product> Madurai".                                                */

export const CATEGORIES = [
  {
    id: 'chain-link',
    family: 'fencing',
    slug: 'chain-link-fencing-madurai',
    name: 'GI Chain Link Fencing',
    short: 'Chain Link Fencing',
    listTitle: 'Chain-link fencing in Madurai',
    supply: 'Manufactured',
    tagline: 'Farm, compound and industrial perimeter fencing',
    blurb: 'Hot-dip galvanized, PVC-coated and heavy-duty slatted chain link, woven to your aperture and gauge. Supplied in rolls cut to the running length you need.',
    chips: ['8 – 12 SWG', '1" – 3" mesh', 'GI / PVC', '3ft – 8ft'],
    img: 'chain-link',
    configurable: true,
    gauges: [8, 10, 12],
    apertures: [1, 1.5, 2, 2.5, 3],
    coatings: ['gi', 'pvc', 'ec'],
    heights: ['3 ft', '4 ft', '5 ft', '6 ft', '7 ft', '8 ft'],
    unit: 'running feet',
    covers: ['Chain Link', 'Slatted Chain Link', 'Heavy Duty Chain Link Fence',
             'Galvanized Chain-Link Fencing', 'PVC Coated Chain-Link Fencing',
             'Colour Coated Chainlink', 'Ultimate Chain Link', 'Chain Link Fence'],
    legacy: 'chain-link-fencing',
  },
  {
    id: 'barbed-wire',
    family: 'fencing',
    slug: 'barbed-wire-supplier-madurai',
    name: 'Barbed Wire',
    short: 'Barbed Wire',
    listTitle: 'Barbed wire for boundary demarcation',
    supply: 'Supplied',
    tagline: 'Agricultural boundary and perimeter topping',
    blurb: 'Double-strand galvanized barbed wire with consistent barb spacing, plus concertina coils for security topping. The most economical way to close a long agricultural boundary.',
    chips: ['12 × 14 SWG', 'IS 278', '3" – 6" barb', '~500 m coil'],
    img: 'barbed-wire',
    configurable: false,
    unit: 'kilograms',
    covers: ['Barbed Wire', 'Mesh Wire Fencing', 'Barbed Wiremesh'],
    legacy: 'barbed-wire',
  },
  {
    id: 'gi-sheet',
    family: 'sheets',
    slug: 'gi-sheet-dealer-madurai',
    name: 'GI Sheets & Plate',
    short: 'GI Sheets',
    listTitle: 'GI sheets for practical requirements',
    supply: 'Supplied',
    tagline: 'Galvanized plain sheet, shutter sheet and plate, cut to size',
    blurb: 'Galvanized plain sheet and GI rolling shutter sheet from 0.30 mm upward. Cut to size from stock, so you buy the piece rather than the offcut.',
    chips: ['0.30 – 3 mm', 'Plain & shutter', 'Cut to size', 'IS 277'],
    img: 'gi-sheet',
    configurable: false,
    unit: 'kilograms',
    covers: ['GI Plain Sheet', 'GI Sheet', 'GI Rolling Sheets', 'GI Sheets'],
    legacy: 'steel-sheets',
  },
  {
    id: 'ms-sheet',
    family: 'sheets',
    slug: 'ms-sheet-dealer-madurai',
    name: 'MS Sheets & Steel Plate',
    short: 'MS Sheets',
    listTitle: 'MS sheets supplied in Madurai',
    supply: 'Supplied',
    tagline: 'Mild steel sheet and plate for fabrication',
    blurb: 'Mild steel sheet and steel plate up to 6 mm for fabrication, gates, shutters and structural work. Cut to size from stock against your schedule.',
    chips: ['1 – 6 mm', 'MS / plate', 'Cut to size', 'IS 2062'],
    img: 'ms-sheet',
    configurable: false,
    unit: 'kilograms',
    covers: ['Steel Plate Sheet', 'MS Sheet', 'Steel Sheets'],
  },
  {
    id: 'gi-wire',
    family: 'wire',
    slug: 'gi-wire-supplier-madurai',
    name: 'GI Wire, Binding Wire & Rope',
    short: 'GI Wire',
    listTitle: 'GI wire supplied from Madurai',
    supply: 'Supplied',
    tagline: 'Binding, tying, weaving, tension wire and steel wire rope',
    blurb: 'Galvanized iron wire from 8 to 18 SWG in commercial and heavy zinc coating, plus steel wire rope for rigging and lifting. Supplied by the coil or by weight.',
    chips: ['8 – 18 SWG', '40 – 275 GSM', '6 – 20 mm rope', 'IS 280'],
    img: 'gi-wire',
    configurable: false,
    unit: 'kilograms',
    covers: ['GI Wire', 'GI Wires', 'Steel Wire', 'Binding Wire', 'Steel Rope', 'GI Rope'],
    legacy: 'gi-wire',
  },
  {
    id: 'wire-mesh',
    family: 'mesh',
    slug: 'wire-mesh-supplier-madurai',
    name: 'GI Wire Mesh',
    short: 'Wire Mesh',
    listTitle: 'Wire mesh supplied in Madurai',
    supply: 'Supplied',
    tagline: 'Woven mesh rolls for screening and enclosure',
    blurb: 'Woven galvanized wire mesh in roll form for screening, plastering, poultry and general enclosure work, in the common apertures and gauges.',
    chips: ['12 – 16 SWG', '½" – 2" grid', 'Rolls', 'GI'],
    img: 'wire-mesh',
    configurable: false,
    unit: 'square feet',
    covers: ['Wire Mesh', 'GI Wire Mesh', 'Mesh', 'Mesh Rolls'],
  },
  {
    id: 'weld-mesh',
    family: 'mesh',
    slug: 'weld-mesh-supplier-madurai',
    name: 'GI Welded Wire Mesh',
    short: 'Weld Mesh',
    listTitle: 'Weld mesh for partitions and protection',
    supply: 'Supplied',
    tagline: 'Rigid panels and rolls for construction and screening',
    blurb: 'Electrically welded at every intersection for a flat, rigid sheet that will not sag. Used in RCC wall plaster, cattle and poultry enclosures, and machine guarding.',
    chips: ['10 – 16 SWG', '½" – 4" grid', 'Rolls & panels', 'GI'],
    img: 'weld-mesh',
    configurable: true,
    gauges: [10, 12, 14, 16],
    apertures: [1, 1.5, 2, 2.5, 3],
    coatings: ['gi', 'pvc', 'ec'],
    heights: ['2 ft', '3 ft', '4 ft', '5 ft', '6 ft'],
    unit: 'square feet',
    covers: ['Welded Mesh', 'Welded Wire Mesh', 'Weld Mesh', 'GI Weld Mesh', 'Mesh Panels'],
    legacy: 'welded-wire-mesh',
  },
  {
    id: 'roofing',
    family: 'roofing',
    slug: 'colour-coated-sheet-supplier-madurai',
    name: 'Colour Coated & Roofing Sheets',
    short: 'Roofing Sheets',
    listTitle: 'Colour-coated sheets supplied in Madurai',
    supply: 'Supplied',
    tagline: 'Colour coated, galvalume and corrugated profiles',
    blurb: 'Corrugated colour-coated sheet, galvalume (GL) and GI roofing sheet with ridge caps and flashing. Cut to your rafter length so there is no overlap waste on site.',
    chips: ['0.30 – 0.80 mm', 'Cut to length', 'GI / GL / PPGI', 'Colour range'],
    img: 'roofing',
    configurable: false,
    unit: 'square feet',
    covers: ['Roofing Sheet', 'Color Roofing Sheet', 'GL Sheet', 'GI Steel Sheets',
             'Corrugated Sheet', 'Ridge and flashing'],
    legacy: 'roofing-sheets',
  },
  {
    id: 'hardware',
    family: 'hardware',
    slug: 'steel-hardware-supplier-madurai',
    name: 'Nails, Bolts & Fasteners',
    short: 'Hardware',
    listTitle: 'Nails, bolts and fencing hardware',
    supply: 'Supplied',
    tagline: 'Wire nails, concrete nails and GI bolts',
    blurb: 'Mild steel wire nails and concrete nails by size and weight, GI nuts, bolts and fencing fittings, and the small items that otherwise hold up a delivery.',
    chips: ['MS wire nails', 'Concrete nails', 'GI bolts', 'By weight'],
    img: 'hardware',
    configurable: false,
    unit: 'kilograms',
    covers: ['Steel Nail', 'Nails', 'Concrete Nails', 'GI Bolts', 'Industrial Bolts'],
    legacy: 'steel-hardware',
  },
];

/* ---- Six product families -------------------------------------------
   The homepage navigates by family; the detail pages are per category.
   `to` is the canonical landing page for the family.                   */

export const FAMILIES = [
  {
    id: 'fencing',
    n: '01',
    kicker: 'Naga Fencing',
    name: 'Fencing systems',
    summary: 'GI chain-link · Heavy-duty chain-link · PVC-coated chain-link · Barbed wire',
    blurb: 'Chain link woven to the gauge, mesh opening and height you specify, under our own Naga Fencing brand.',
    to: 'fencing-manufacturer-madurai/',
    brand: true,
    logo: 'assets/img/brand/naga-fencing-logo.webp',
    members: ['chain-link', 'barbed-wire'],
  },
  {
    id: 'sheets',
    n: '02',
    kicker: 'Sheets & plate',
    name: 'GI, MS and steel sheet',
    summary: 'GI plain sheets · GI rolling sheets · MS sheets · Steel plate',
    blurb: 'Galvanized and mild steel sheet from 0.30 mm to 6 mm, cut to size from stock.',
    to: 'gi-sheet-dealer-madurai/',
    members: ['gi-sheet', 'ms-sheet'],
  },
  {
    id: 'wire',
    n: '03',
    kicker: 'Wire & rope',
    name: 'Industrial wire products',
    summary: 'GI wire · Steel wire · Binding wire · Steel wire rope',
    blurb: 'Weaving, tying and tension wire by the coil or by weight, plus steel wire rope.',
    to: 'gi-wire-supplier-madurai/',
    members: ['gi-wire'],
  },
  {
    id: 'mesh',
    n: '04',
    kicker: 'Mesh',
    name: 'Wire and welded mesh',
    summary: 'Wire mesh · GI wire mesh · Weld mesh · Welded wire mesh',
    blurb: 'Woven and welded mesh in rolls and rigid panels for screening, plaster and enclosure.',
    to: 'wire-mesh-supplier-madurai/',
    members: ['wire-mesh', 'weld-mesh'],
  },
  {
    id: 'roofing',
    n: '05',
    kicker: 'Roofing',
    name: 'Roofing sheet supply',
    summary: 'Colour-coated sheets · GI roofing sheets · Corrugated sheets · Ridge and flashing',
    blurb: 'Profiled roofing cut to your rafter length, with the ridge and flashing to finish it.',
    to: 'colour-coated-sheet-supplier-madurai/',
    members: ['roofing'],
  },
  {
    id: 'hardware',
    n: '06',
    kicker: 'Fasteners & hardware',
    name: 'Nails, bolts and hardware',
    summary: 'Steel nails · Concrete nails · GI bolts · Industrial bolts',
    blurb: 'The fixings that close the job, billed on the same invoice as the material.',
    to: 'steel-hardware-supplier-madurai/',
    members: ['hardware'],
  },
];

export const byId = (id) => CATEGORIES.find((c) => c.id === id);
export const bySlug = (slug) => CATEGORIES.find((c) => c.slug === slug);
export const coatingById = (id) => COATINGS.find((c) => c.id === id);
export const familyById = (id) => FAMILIES.find((f) => f.id === id);
export const inFamily = (id) => CATEGORIES.filter((c) => c.family === id);

/** Ordered product index used by the homepage "product detail pages" rail. */
export const PRODUCT_INDEX = [
  'chain-link', 'gi-wire', 'gi-sheet', 'ms-sheet', 'wire-mesh',
  'weld-mesh', 'barbed-wire', 'roofing', 'hardware',
].map((id) => byId(id)).filter(Boolean);
