/* ============================================================
   NAGA STEELS, Business constants
   ------------------------------------------------------------
   Every phone number, the GSTIN, the address and the deployment
   origin live here. Changing one is a one-line edit that
   propagates to every page, every CTA and every JSON-LD block.

   ⚠ Items marked VERIFY are not independently confirmed.
   See OWNER-CHECKLIST.md.
   ============================================================ */

export const BUSINESS = {
  name: 'Naga Steels',
  fencingBrand: 'Naga Fencing',
  proprietor: 'R. Kavitha',
  gstin: '33DGWPK4434F1Z7',
  legalStatus: 'Proprietorship',

  /* Deployment origin. Defined once so moving to www.nagasteels.com
     is a single edit here plus a find-and-replace of the literal in
     the static HTML canonicals. */
  origin: 'https://nagasteels.github.io',
  futureDomain: 'https://www.nagasteels.com',

  /* Established 2002, NOT 2022. 2022 is only the GST registration year;
     using it cost two decades of trading history on every page. */
  established: 2002,
  gstRegistered: 2022,

  /* CONFIRMED by the owner. Calls, WhatsApp quotes, LocalBusiness
     telephone and the mobile action bar all use this one line. */
  whatsapp: '919943606823',
  phone: '+919943606823',
  phoneDisplay: '+91 99436 06823',
  email: 'nagasteelsindia@gmail.com',

  /* VERIFY: the business artwork reads "Chitrakara" (one k), Google
     Maps reads "Chitrakkara". One spelling must win everywhere, because
     Google scores NAP consistency across citations. Using the artwork. */
  street: '124, Chitrakara Street',
  locality: 'Madurai Main',
  city: 'Madurai',
  region: 'Tamil Nadu',
  postalCode: '625001',
  country: 'IN',

  /* VERIFY: approximate Madurai Main coordinates. Replace with the exact
     pin from the Google Business Profile before launch. */
  lat: 9.9195,
  lng: 78.1193,

  mapsUrl: 'https://maps.google.com/?q=Naga+Steels,124+Chitrakara+Street,Madurai+625001',
  indiamart: 'https://www.indiamart.com/naga-steels-madurai/',

  /* VERIFY: Mon–Sat 10:00–20:00, Sunday closed. */
  hours: { open: 10, close: 20, closedDays: [0] },
  hoursDisplay: 'Mon – Sat, 10:00 AM – 8:00 PM',

  tagline: 'The right material. The right specification.',
  positioning: 'Steel distributor · Wholesaler · Metal supplier · Est. 2002',
};

/** Absolute URL helper for canonicals, OG tags and JSON-LD @id values. */
export const url = (path = '') =>
  `${BUSINESS.origin}/${String(path).replace(/^\/+/, '')}`;

/* ---- Delivery corridor ------------------------------------------------
   Primary tier mirrors the named service areas on the business listing.
   Nearby tier is the Madurai-district ring that is realistically same or
   next day. One combined page, never one thin page per town: templated
   per-city pages are the textbook definition of a doorway page.        */

export const AREAS = [
  { name: 'Madurai',       dist: 'Local',   note: 'Same-day dispatch from the Chitrakara Street godown', hub: true, x: 50, y: 25 },
  { name: 'Dindigul',      dist: '65 km',   note: 'Next-day lorry',  x: 40, y: 8 },
  { name: 'Theni',         dist: '75 km',   note: 'Next-day lorry',  x: 18, y: 30 },
  { name: 'Sivaganga',     dist: '50 km',   note: 'Next-day lorry',  x: 73, y: 27 },
  { name: 'Virudhunagar',  dist: '45 km',   note: 'Next-day lorry',  x: 38, y: 43 },
  { name: 'Sivakasi',      dist: '75 km',   note: 'Next-day lorry',  x: 24, y: 50 },
  { name: 'Rajapalayam',   dist: '95 km',   note: '1 – 2 days',      x: 14, y: 61 },
  { name: 'Ramanathapuram',dist: '115 km',  note: '1 – 2 days',      x: 78, y: 49 },
  { name: 'Rameswaram',    dist: '170 km',  note: '1 – 2 days',      x: 91, y: 56 },
  { name: 'Kovilpatti',    dist: '115 km',  note: '1 – 2 days',      x: 44, y: 61 },
  { name: 'Thoothukudi',   dist: '140 km',  note: '1 – 2 days',      x: 68, y: 70 },
  { name: 'Tenkasi',       dist: '160 km',  note: '1 – 2 days',      x: 20, y: 76 },
  { name: 'Tirunelveli',   dist: '155 km',  note: '1 – 2 days',      x: 43, y: 79 },
  { name: 'Nagercoil',     dist: '230 km',  note: 'By arrangement',  x: 42, y: 96, label: 'Nagercoil / Kanyakumari' },
];

export const AREAS_NEARBY = [
  { name: 'Melur',         dist: '30 km', note: 'Same-day possible' },
  { name: 'Thirumangalam', dist: '22 km', note: 'Same-day possible' },
  { name: 'Usilampatti',   dist: '40 km', note: 'Next-day lorry' },
  { name: 'Aruppukottai',  dist: '50 km', note: 'Next-day lorry' },
  { name: 'Karaikudi',     dist: '85 km', note: 'Next-day lorry' },
];

/** Every town name the quote builder should suggest. */
export const ALL_AREA_NAMES = [...AREAS, ...AREAS_NEARBY].map((a) => a.name);
