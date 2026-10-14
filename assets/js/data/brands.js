/* ============================================================
   NAGA STEELS, Brand architecture
   ------------------------------------------------------------
   Naga Steels is the master brand. Naga Fencing is its fencing
   sub-brand. Tata Wiron and VNC are supply relationships, not
   ownership.

   ⚠ The Tata Wiron and VNC relationships are carried over from
   the client's previous site and are NOT independently verified.
   Wording is deliberately "Dealer supply" / "Distributor supply"
   rather than "authorised", which is the claim a brand owner
   challenges. Confirm in writing before upgrading the wording.
   ============================================================ */

export const BRANDS = [
  {
    id: 'naga-steels',
    name: 'Naga Steels',
    role: 'Master brand',
    note: 'Steel, GI and MS sheet, plate, wire, mesh, roofing, nails, bolts and rope.',
    logo: 'assets/img/brand/naga-steels-main-logo.jpeg',
    w: 512, h: 512,
    to: 'about/',
  },
  {
    id: 'naga-fencing',
    name: 'Naga Fencing',
    role: 'Our fencing brand',
    note: 'Chain link woven to your specification, plus barbed wire and boundary material.',
    logo: 'assets/img/brand/naga-fencing-logo.svg',
    w: 512, h: 512,
    to: 'fencing-manufacturer-madurai/',
  },
  {
    id: 'tata-wiron',
    name: 'Tata Wiron',
    role: 'Dealer supply',
    note: 'Galvanized wire, binding wire and fencing wire from the Tata Steel wire division.',
    logo: 'assets/img/brand/tata-wiron-wordmark.svg',
    w: 520, h: 150,
    to: 'tata-wiron-dealer-madurai/',
  },
  {
    id: 'vnc',
    name: 'VNC Group',
    role: 'Distributor supply',
    note: 'Bestfence fencing systems, Bestwire wire products, Bestarc electrodes, Voltwire.',
    logo: 'assets/img/brand/vnc-group.svg',
    w: 520, h: 150,
    to: 'vnc-products-distributor-madurai/',
  },
];

/* ---- VNC product brands --------------------------------------------- */

/* All four render as type lockups rather than reproduced logos. Same
   reasoning as above: these are third-party registered marks and we do
   not hold written permission to reproduce them. The product name and
   the category are what a buyer actually searches for anyway. */

export const VNC_BRANDS = [
  { id: 'bestfence', name: 'Bestfence', short: 'BEST', accent: 'FENCE', note: 'Chain-link & fencing systems' },
  { id: 'bestwire',  name: 'Bestwire',  short: 'BEST', accent: 'WIRE',  note: 'GI, binding & wire products' },
  { id: 'bestarc',   name: 'Bestarc',   short: 'BEST', accent: 'ARC',   note: 'Welding electrodes' },
  { id: 'voltwire',  name: 'Voltwire',  short: 'VOLT', accent: 'WIRE',  note: 'Electric-fence wire products' },
];

export const brandById = (id) => BRANDS.find((b) => b.id === id);
