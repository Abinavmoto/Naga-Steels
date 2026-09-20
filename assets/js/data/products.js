/* ============================================================
   NAGA STEELS, Single source of truth
   ------------------------------------------------------------
   Feeds: the 3D configurator, the quote builder, the on-page
   spec tables and the Product JSON-LD.

   One file so a number can never disagree with itself across
   the site. If a spec is wrong, it is wrong in exactly one place.

   ⚠ PROVISIONAL. The gauges stocked, roll dimensions, kg/roll
   and coating grades below are industry-standard values, not
   values confirmed by Naga Steels. The IndiaMart listing carries
   no specifications at all. Confirm with the owner before launch;
   see OWNER-CHECKLIST.md.
   ============================================================ */

/* ---- Business constants ---------------------------------------------
   Every phone number, the GSTIN and the address live here. Changing a
   number is a one-line edit that propagates everywhere.                */

export const BUSINESS = {
  name: 'Naga Steels',
  proprietor: 'R. Kavitha',
  gstin: '33DGWPK4434F1Z7',
  legalStatus: 'Proprietorship',

  // Established 2002, NOT 2022. An earlier version of this site used 2022,
  // which is only the GST registration year, and it cost them two decades of
  // trading history on every page. Confirm with the owner before launch.
  established: 2002,
  gstRegistered: 2022,

  // Quote builder sends here (owner's WhatsApp line).
  whatsapp: '919943606823',
  // Call buttons + LocalBusiness schema use the Google-verified line.
  phone: '+919943606823',
  phoneDisplay: '+91 99436 06823',

  street: '124, Chitrakkara Street, Kamarajar Salai',
  locality: 'Madurai Main',
  city: 'Madurai',
  region: 'Tamil Nadu',
  postalCode: '625001',
  country: 'IN',

  // TODO_LATLNG: replace with the exact pin from the Google Business
  // Profile before launch. These are Madurai Main approximate coords.
  lat: 9.9195,
  lng: 78.1193,

  mapsUrl: 'https://maps.google.com/?q=Naga+Steels,124+Chitrakkara+Street,Madurai+625001',
  indiamart: 'https://www.indiamart.com/naga-steels-madurai/',

  // Mon–Sat 10:00–20:00, Sunday closed. ⚠ verify before launch.
  hours: { open: 10, close: 20, closedDays: [0] },
  hoursDisplay: 'Mon – Sat, 10:00 AM – 8:00 PM',
};

/* ---- Brands and supply partners --------------------------------------
   ⚠ The Tata Wiron and VNC relationships are carried over from the
   client's previous site and are NOT independently verified. Dealer and
   distributor claims are exactly what a brand owner challenges, so the
   word "authorised" must be confirmed in writing before launch. If it
   cannot be, delete the two entries rather than softening the wording:
   a vague claim is worse than no claim.                                 */

export const BRANDS = [
  {
    id: 'naga-steels',
    name: 'Naga Steels',
    role: 'Master brand',
    note: 'Steel, GI and MS sheet, plate, wire, mesh, roofing and hardware supply.',
    logo: null, // the site's own mark is already in the header
  },
  {
    id: 'naga-fencing',
    name: 'Naga Fencing',
    role: 'Our fencing brand',
    note: 'Chain link woven to your specification in our own works, plus barbed wire and boundary material.',
    logo: 'assets/img/brand/naga-fencing.webp',
  },
  {
    id: 'tata-wiron',
    name: 'Tata Wiron',
    role: 'Dealer',
    note: 'Galvanized wire, binding wire and fencing wire from the Tata Steel wire division.',
    logo: 'assets/img/brand/tata-wiron.svg',
  },
  {
    id: 'vnc',
    name: 'VNC Group',
    role: 'Distributor',
    note: 'Bestfence fencing systems, Bestwire wire products, Bestarc welding electrodes, Voltwire electric fencing.',
    logo: 'assets/img/brand/vnc-group.png',
  },
];

/* ---- Applications ----------------------------------------------------
   A second axis of navigation. People search by the job they are doing
   ("solar plant fencing") at least as often as by the product name.

   ⚠ The photographs are the ones used on the client's previous site,
   where every one carried the caption "Conceptual application visual
   only. It does not represent a completed Naga Steels project." That
   disclaimer is reproduced on the page and must stay until real yard
   photography replaces these images.                                    */

export const APPLICATIONS = [
  {
    id: 'agricultural',
    name: 'Agricultural fencing',
    img: 'agricultural.webp',
    blurb: 'Farm and plot boundaries around Madurai, where cost per running foot over a long perimeter decides everything.',
    spec: '10 SWG chain link at 2" mesh, or barbed wire at five to seven strands for the longest runs.',
    to: 'chain-link-fencing',
  },
  {
    id: 'industrial',
    name: 'Industrial perimeter',
    img: 'industrial.webp',
    blurb: 'Factory and godown boundaries where the fence is a security measure rather than a marker.',
    spec: '8 SWG chain link, heavy zinc coating, with a three-strand barbed top or razor coil.',
    to: 'chain-link-fencing',
  },
  {
    id: 'warehouse',
    name: 'Warehouse & storage',
    img: 'warehouse.webp',
    blurb: 'Property boundaries, internal separation and protective storage cages inside a shed.',
    spec: 'Welded mesh panels for internal work, chain link for the outer boundary.',
    to: 'welded-wire-mesh',
  },
  {
    id: 'solar',
    name: 'Solar plant boundary',
    img: 'solar.webp',
    blurb: 'Long perimeter runs on project sites, usually driven by an approved drawing or BOQ.',
    spec: '8 to 10 SWG chain link, heavy coating, with a post and gate schedule priced alongside.',
    to: 'chain-link-fencing',
  },
  {
    id: 'residential',
    name: 'Residential & compound',
    img: 'residential.webp',
    blurb: 'Plots, compound walls and private land, where the fence has to look finished as well as work.',
    spec: 'PVC coated chain link at 1½" to 2" mesh. The green disappears into planting.',
    to: 'chain-link-fencing',
  },
  {
    id: 'contractor',
    name: 'Contractor supply',
    img: 'contractor.webp',
    blurb: 'Specification-led material for fabrication and project execution, quoted against a schedule.',
    spec: 'Binding wire, MS and GI sheet, weld mesh and fixings, on one bill and one lorry.',
    to: 'steel-sheets',
  },
];

/* ---- Standard Wire Gauge --------------------------------------------
   British SWG. These are exact imperial definitions converted to mm.
   This audience buys by SWG and by kilogram, so a wrong mapping here
   loses the sale on the spot.                                         */

export const SWG = [
  { swg: 8,  inch: 0.160, mm: 4.06, use: 'Heavy-duty chain link, industrial perimeter' },
  { swg: 10, inch: 0.128, mm: 3.25, use: 'Standard chain link, farm and site fencing' },
  { swg: 12, inch: 0.104, mm: 2.64, use: 'Light chain link, welded mesh' },
  { swg: 14, inch: 0.080, mm: 2.03, use: 'Welded mesh, poultry and garden mesh' },
  { swg: 16, inch: 0.064, mm: 1.63, use: 'Binding wire, light weaving' },
  { swg: 18, inch: 0.048, mm: 1.22, use: 'Binding wire, rebar tying' },
];

export const gaugeToMm = (swg) => SWG.find((g) => g.swg === swg)?.mm ?? null;

/* ---- Mesh apertures --------------------------------------------------
   Aperture is a change to the wire spine, so each of these needs its own
   built geometry in the 3D view. Never fake it by scaling the grid, because a
   contractor comparing 1" against 2" will notice immediately.          */

export const APERTURES = [
  { in: 1,   mm: 25,  label: '1"',  use: 'Security mesh, poultry, narrow-gap screening' },
  { in: 1.5, mm: 38,  label: '1½"', use: 'Compound walls, residential boundary' },
  { in: 2,   mm: 50,  label: '2"',  use: 'General purpose, the most commonly stocked size' },
  { in: 2.5, mm: 63,  label: '2½"', use: 'Farm and estate boundary, economy runs' },
  { in: 3,   mm: 75,  label: '3"',  use: 'Long agricultural runs, lowest cost per foot' },
];

/* ---- Coatings --------------------------------------------------------
   Colour / metalness / roughness feed the 3D material directly, so the
   swatch in the UI and the wire in the viewport can never drift apart. */

export const COATINGS = [
  {
    id: 'gi',
    label: 'Hot-Dip GI',
    full: 'Hot-Dip Galvanized',
    hex: '#B9BEC4',
    metalness: 0.95,
    roughness: 0.28,
    life: '15–25 years',
    note: 'Zinc bonded to the steel after weaving. Coated at every cut and knuckle, so there is no bare edge to start rusting.',
  },
  {
    id: 'pvc',
    label: 'PVC Green',
    full: 'PVC Coated (Green)',
    hex: '#1E6B3C',
    metalness: 0.0,
    roughness: 0.45,
    life: '20–30 years',
    note: 'Galvanized core sealed in a PVC jacket. The usual choice near the coast, and where a fence should disappear into greenery.',
  },
  {
    id: 'ec',
    label: 'Electro GI',
    full: 'Electro-Galvanized',
    hex: '#D6DBE1',
    metalness: 0.88,
    roughness: 0.2,
    life: '5–8 years',
    note: 'A thin, bright, even zinc layer. Economical for indoor use, temporary site barricades and short-term work.',
  },
];

/* ---- Zinc coating grades, IS 4826 ----------------------------------- */

export const ZINC_GRADES = [
  { grade: 'Commercial',   gsm: '40 – 60',   life: '5 – 8 yrs',   use: 'Indoor partitions, temporary barricades, short-term site work' },
  { grade: 'Medium',       gsm: '80 – 120',  life: '10 – 15 yrs', use: 'Residential compound walls, garden and poultry fencing' },
  { grade: 'Heavy',        gsm: '200 – 275', life: '20 – 25 yrs', use: 'Farm boundary, solar parks, industrial perimeter' },
  { grade: 'Extra Heavy',  gsm: '275+',      life: '25 yrs +',    use: 'Coastal installations, chemical plants, highway boundary' },
];

/* ---- Product catalogue ----------------------------------------------
   Grouped by buyer intent, not by the IndiaMart taxonomy, because people search
   by the job they are doing, not by a supplier's category tree.        */

export const CATEGORIES = [
  {
    id: 'chain-link',
    slug: 'chain-link-fencing',
    name: 'GI Chain Link Fencing',
    short: 'Chain Link Fencing',
    tagline: 'Farm, compound and industrial perimeter fencing',
    blurb: 'Hot-dip galvanized, PVC-coated and heavy-duty slatted chain link, woven to your aperture and gauge. Supplied in rolls cut to the running length you need.',
    chips: ['8 – 12 SWG', '1" – 3" mesh', 'GI / PVC', '3ft – 8ft'],
    configurable: true,
    gauges: [8, 10, 12],
    apertures: [1, 1.5, 2, 2.5, 3],
    coatings: ['gi', 'pvc', 'ec'],
    heights: ['3 ft', '4 ft', '5 ft', '6 ft', '7 ft', '8 ft'],
    unit: 'running feet',
    // IndiaMart-listed items that roll up into this cluster
    covers: ['Chain Link', 'Slatted Chain Link', 'Heavy Duty Chain Link Fence',
             'Galvanized Chain-Link Fencing', 'PVC Coated Chain-Link Fencing',
             'Colour Coated Chainlink', 'Ultimate Chain Link', 'Chain Link Fence'],
  },
  {
    id: 'weld-mesh',
    slug: 'welded-wire-mesh',
    name: 'GI Welded Wire Mesh',
    short: 'Welded Wire Mesh',
    tagline: 'Rigid panels and rolls for construction and screening',
    blurb: 'Electrically welded at every intersection for a flat, rigid sheet that will not sag. Used in RCC wall plaster, cattle and poultry enclosures, and machine guarding.',
    chips: ['10 – 16 SWG', '½" – 4" grid', 'Rolls & panels', 'GI'],
    configurable: true,
    gauges: [10, 12, 14, 16],
    apertures: [1, 1.5, 2, 2.5, 3],
    coatings: ['gi', 'pvc', 'ec'],
    heights: ['2 ft', '3 ft', '4 ft', '5 ft', '6 ft'],
    unit: 'square feet',
    covers: ['Welded Mesh', 'Welded Wire Mesh', 'Weld Mesh', 'GI Weld Mesh', 'GI Wire Mesh', 'Wire Mesh', 'Mesh'],
  },
  {
    id: 'barbed-wire',
    slug: 'barbed-wire',
    name: 'Barbed Wire',
    short: 'Barbed Wire',
    tagline: 'Agricultural boundary and perimeter topping',
    blurb: 'Double-strand galvanized barbed wire with consistent barb spacing, plus concertina coils for security topping. The most economical way to close a long agricultural boundary.',
    chips: ['12 × 14 SWG', 'IS 278', '3" – 6" barb', '~500 m coil'],
    configurable: false,
    unit: 'kilograms',
    covers: ['Barbed Wire', 'Mesh Wire Fencing', 'Barbed Wiremesh'],
  },
  {
    id: 'gi-wire',
    slug: 'gi-wire',
    name: 'GI Wire & Binding Wire',
    short: 'GI Wire',
    tagline: 'Binding, tying, weaving and tension wire',
    blurb: 'Galvanized iron wire from 8 to 18 SWG in commercial and heavy zinc coating. Rebar binding wire, fence tension line wire and weaving wire, supplied by the coil or by weight.',
    chips: ['8 – 18 SWG', '40 – 275 GSM', 'Coil / bundle', 'IS 280'],
    configurable: false,
    unit: 'kilograms',
    covers: ['GI Wire', 'GI Wires'],
  },
  {
    id: 'sheets',
    slug: 'steel-sheets',
    name: 'GI, MS & Steel Sheets',
    short: 'Steel Sheets',
    tagline: 'Plain sheet, shutter sheet and plate, cut to size',
    blurb: 'Galvanized plain sheet, GI rolling shutter sheet, mild steel sheet and steel plate from 0.30 mm to 6 mm. Cut to size from stock, so you buy the piece rather than the offcut.',
    chips: ['0.30 – 6 mm', 'GI / MS / plate', 'Cut to size', 'IS 277 / 2062'],
    configurable: false,
    unit: 'kilograms',
    covers: ['GI Plain Sheet', 'GI Sheet', 'GI Rolling Sheets', 'GI Sheets',
             'Steel Plate Sheet', 'MS Sheet', 'Steel Sheets'],
  },
  {
    id: 'roofing',
    slug: 'roofing-sheets',
    name: 'Roofing Sheets',
    short: 'Roofing Sheets',
    tagline: 'Colour coated, galvalume and corrugated profiles',
    blurb: 'Corrugated colour-coated sheet, galvalume (GL) and GI roofing sheet with ridge caps and flashing. Cut to your rafter length so there is no overlap waste on site.',
    chips: ['0.30 – 0.80 mm', 'Cut to length', 'GI / GL / PPGI', 'Colour range'],
    configurable: false,
    unit: 'square feet',
    // Plain sheet, shutter sheet and plate now live under `sheets`. Roofing
    // keeps only the profiled and coated products, so the two pages target
    // different searches instead of competing for the same one.
    covers: ['Roofing Sheet', 'Color Roofing Sheet', 'GL Sheet', 'GI Steel Sheets',
             'Corrugated Sheet', 'Ridge and flashing'],
  },
  {
    id: 'hardware',
    slug: 'steel-hardware',
    name: 'Nails, Ropes & Fasteners',
    short: 'Steel Hardware',
    tagline: 'Wire nails, steel wire rope and GI bolts',
    blurb: 'Mild steel wire nails by size and weight, galvanized and ungalvanized steel wire rope for rigging and lifting, and GI nuts, bolts and fencing fittings.',
    chips: ['MS wire nails', '6 – 20 mm rope', 'GI bolts', 'By weight'],
    configurable: false,
    unit: 'kilograms',
    covers: ['Steel Nail', 'Nails', 'Steel Rope', 'GI Rope', 'GI Bolts'],
  },
];

export const byId = (id) => CATEGORIES.find((c) => c.id === id);
export const coatingById = (id) => COATINGS.find((c) => c.id === id);

/* ---- Delivery corridor ------------------------------------------------
   One service-areas page listing these, NOT one thin page per town.
   Templated per-city pages are the textbook definition of a doorway page
   and get judged near-duplicate, dragging the whole site down.         */

export const AREAS = [
  { name: 'Madurai',      dist: 'Local',  note: 'Same-day dispatch from the Chitrakkara Street godown' },
  { name: 'Dindigul',     dist: '65 km',  note: 'Next-day lorry' },
  { name: 'Virudhunagar', dist: '45 km',  note: 'Next-day lorry' },
  { name: 'Theni',        dist: '75 km',  note: 'Next-day lorry' },
  { name: 'Sivakasi',     dist: '75 km',  note: 'Next-day lorry' },
  { name: 'Ramanathapuram', dist: '115 km', note: '1 – 2 days' },
  { name: 'Tirunelveli',  dist: '155 km', note: '1 – 2 days' },
  { name: 'Karaikudi',    dist: '85 km',  note: 'Next-day lorry' },
  { name: 'Usilampatti',  dist: '40 km',  note: 'Next-day lorry' },
  { name: 'Melur',        dist: '30 km',  note: 'Same-day possible' },
  { name: 'Thirumangalam', dist: '22 km', note: 'Same-day possible' },
  { name: 'Aruppukottai', dist: '50 km',  note: 'Next-day lorry' },
];
