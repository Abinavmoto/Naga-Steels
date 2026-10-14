/* ============================================================
   NAGA STEELS, Services and delivery scope
   ------------------------------------------------------------
   Four services, confirmed from the client's base content. The
   wording is deliberately scope-honest: material supply, civil
   work and installation are not treated as the same thing, and
   nothing here promises site execution we do not perform.
   ============================================================ */

export const SERVICES = [
  {
    n: '01',
    id: 'made-to-spec',
    name: 'Made-to-spec chain-link',
    blurb: 'Manufacturing enquiries reviewed by wire size, mesh opening, height, length and quantity.',
    detail: 'Chain link is woven to the specification you give us rather than sold from whatever happens to be on the shelf. Tell us the gauge, the mesh opening, the finished height and the running length, and we confirm what we can weave and in what lead time.',
  },
  {
    n: '02',
    id: 'material-supply',
    name: 'Material supply',
    blurb: 'GI wire and sheets, MS sheets, wire mesh, weld mesh, barbed wire, coated sheets and related hardware.',
    detail: 'Six product families on one invoice and, where quantities allow, one vehicle. Holding stock rather than ordering it in is what makes same-day collection from Madurai possible.',
  },
  {
    n: '03',
    id: 'requirement-review',
    name: 'Requirement review',
    blurb: 'Drawings, BOQs, reference photos and line-item schedules help convert a general request into a usable quotation.',
    detail: 'Send a drawing, a bill of quantities or even a photograph of the boundary. We will come back with a line-item schedule you can actually compare against another quote, at the same gauge and the same coating.',
  },
  {
    n: '04',
    id: 'dispatch',
    name: 'Dispatch coordination',
    blurb: 'Purchasing unit, quantity, address, vehicle access and required date are reviewed before delivery is confirmed.',
    detail: 'Freight is quoted separately from material so you can always see what the transport is costing. Vehicle access and unloading are checked before a dispatch date is committed, because a lorry that cannot turn into the site is a wasted day for both of us.',
  },
];

/* ---- Delivery tiers --------------------------------------------------
   Three tiers, not a promise of blanket statewide coverage.           */

export const DELIVERY_TIERS = [
  {
    n: '01',
    name: 'Madurai city & district',
    blurb: 'Primary area for direct material and fencing enquiries. Collection from Chitrakara Street is usually same-day.',
  },
  {
    n: '02',
    name: 'Nearby districts',
    blurb: 'Supply requests reviewed by route, order size and product availability. Typically next-day or one to two days by lorry.',
  },
  {
    n: '03',
    name: 'Tamil Nadu project locations',
    blurb: 'Planned or phased deliveries reviewed for project and contractor requirements against an approved schedule.',
  },
];

export const DELIVERY_NOTE =
  'Availability, transport charges, unloading arrangements and delivery dates are confirmed for each order.';

/* ---- Purchase process ------------------------------------------------ */

export const PROCESS = [
  { n: '01', name: 'Send the requirement', blurb: 'Product, dimensions or wire specification, approximate quantity and delivery location.' },
  { n: '02', name: 'Specification confirmed', blurb: 'We check gauge, coating, size and availability, and flag anything that will cost you more than it needs to.' },
  { n: '03', name: 'Rate and freight quoted', blurb: 'Material and transport are priced separately, so the comparison is honest.' },
  { n: '04', name: 'Dispatch or collection', blurb: 'Access, unloading and the required date are agreed before the vehicle is loaded.' },
];
