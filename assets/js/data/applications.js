/* ============================================================
   NAGA STEELS, Applications
   ------------------------------------------------------------
   A second axis of navigation. People search by the job they are
   doing ("solar plant fencing") at least as often as by product.

   ⚠ Every photograph here is a conceptual application visual.
   None of them shows a completed Naga Steels project, and the
   `disclaimer` string is rendered as a visible caption on every
   card. It stays until real yard photography replaces them.
   Presenting illustrative images as our own work would be the
   one thing on this site that is not true.
   ============================================================ */

export const APPLICATIONS = [
  {
    id: 'agricultural',
    n: '01',
    slug: 'agricultural-fencing',
    name: 'Fencing for agricultural land',
    short: 'Agricultural fencing',
    img: 'agricultural.webp',
    alt: 'Conceptual galvanised chain-link and barbed-wire agricultural boundary near Madurai',
    blurb: 'Boundary material choices for farms, plots and agricultural land around Madurai, where cost per running foot over a long perimeter decides everything.',
    spec: '10 SWG chain link at 2" mesh, or barbed wire at five to seven strands for the longest runs.',
    disclaimer: 'Conceptual application visual. It explains a fencing context and is not a claim of a completed Naga Steels project.',
    to: 'chain-link-fencing-madurai/',
  },
  {
    id: 'industrial',
    n: '02',
    slug: 'industrial-fencing',
    name: 'Boundaries for industrial sites',
    short: 'Industrial perimeter',
    img: 'industrial.webp',
    alt: 'Conceptual galvanised chain-link and welded-mesh boundary at an industrial factory',
    blurb: 'Perimeter, separation and protective-mesh requirements for factories and industrial property, where the fence is a security measure rather than a marker.',
    spec: '8 SWG chain link, heavy zinc coating, with a three-strand barbed top or razor coil.',
    disclaimer: 'Conceptual application visual. No project history or installation claim is implied.',
    to: 'chain-link-fencing-madurai/',
  },
  {
    id: 'warehouse',
    n: '03',
    slug: 'warehouse-fencing',
    name: 'Perimeters and partitions for warehouses',
    short: 'Warehouse & storage',
    img: 'warehouse.webp',
    alt: 'Conceptual wire-mesh partition and chain-link perimeter at a warehouse',
    blurb: 'Material for property boundaries, internal separation and protective storage areas inside a shed.',
    spec: 'Welded mesh panels for internal work, chain link for the outer boundary.',
    disclaimer: 'Conceptual application visual. The image is not presented as an actual customer installation.',
    to: 'weld-mesh-supplier-madurai/',
  },
  {
    id: 'solar',
    n: '04',
    slug: 'solar-plant-fencing',
    name: 'Perimeter material for solar sites',
    short: 'Solar plant boundary',
    img: 'solar.webp',
    alt: 'Conceptual chain-link perimeter around a solar-panel site in Tamil Nadu',
    blurb: 'Project-based boundary material for solar and infrastructure locations, usually driven by an approved drawing or BOQ.',
    spec: '8 to 10 SWG chain link, heavy coating, with a post and gate schedule priced alongside.',
    disclaimer: 'Conceptual application visual only. It does not represent a completed Naga Steels solar project.',
    to: 'chain-link-fencing-madurai/',
  },
  {
    id: 'residential',
    n: '05',
    slug: 'residential-fencing',
    name: 'Clear boundaries for private land',
    short: 'Residential & compound',
    img: 'residential.webp',
    alt: 'Conceptual chain-link boundary around a private plot near Madurai',
    blurb: 'Straightforward fencing choices for plots, compounds and privately owned land, where the fence has to look finished as well as work.',
    spec: 'PVC coated chain link at 1½" to 2" mesh. The green disappears into planting.',
    disclaimer: 'Conceptual application visual. Site, house and fence are illustrative rather than a project reference.',
    to: 'chain-link-fencing-madurai/',
  },
  {
    id: 'contractor',
    n: '06',
    slug: 'contractor-steel-supply',
    name: 'Materials for contractors and fabricators',
    short: 'Contractor supply',
    img: 'contractor.webp',
    alt: 'Conceptual staging area with steel sheets, wire coils, mesh and fencing materials',
    blurb: 'Specification-led material enquiries for fabrication, fencing and project execution, quoted against a schedule.',
    spec: 'Binding wire, MS and GI sheet, weld mesh and fixings, on one bill and one lorry.',
    disclaimer: 'Conceptual material visual. Items shown illustrate categories, not confirmed stock or a customer order.',
    to: 'gi-sheet-dealer-madurai/',
  },
];

export const applicationById = (id) => APPLICATIONS.find((a) => a.id === id);
