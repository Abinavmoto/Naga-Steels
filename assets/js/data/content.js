/* ============================================================
   NAGA STEELS, Editorial content
   ------------------------------------------------------------
   Trust figures, FAQ and the standards explainers. Kept out of
   the markup so the homepage FAQ and the FAQPage JSON-LD can
   never drift apart, which is a structured-data penalty waiting
   to happen.
   ============================================================ */

/* ---- Trust bar -------------------------------------------------------
   ⚠ "24 years" is derived from `established: 2002`. The Google rating
   is carried over from the previous site and is not independently
   verified; remove it rather than soften it if it cannot be confirmed. */

export const TRUST = [
  { icon: 'shield',  value: 'GSTIN Verified', label: '33DGWPK4434F1Z7', mono: true },
  { icon: 'clock',   value: '24 Years',       label: 'Trading since 2002' },
  { icon: 'grid',    value: '6 Families',     label: 'Fencing to fasteners' },
  { icon: 'truck',   value: '14 Districts',   label: 'South TN delivery' },
];

/* ---- Homepage note ---------------------------------------------------
   The Betafence-style homepage blocks (updates carousel, three-column
   hero, focus mosaic, "Why Naga Steels?" band and the range carousel)
   are authored as static HTML in index.html, not as data here.

   That is deliberate. All of it is indexable copy: hero headlines,
   product names, teaser text. Rendering it from JS would hide it from
   crawlers on a site whose entire purpose is local search, and holding
   it in a module that index.html does not read would just be a second
   source of truth waiting to drift. Image slots for those blocks are
   documented in CONTENT-SOURCES.md.                                     */

/* ---- Standards explainers ------------------------------------------- */

export const STANDARDS = [
  {
    std: 'IS 4826',
    title: 'Zinc coating, in GSM',
    body: 'The single number that decides lifespan. A 40 GSM commercial coating and a 275 GSM heavy coating look identical on the day they are installed. Four years later they do not. Always ask for the GSM in writing.',
  },
  {
    std: 'IS 280',
    title: 'Gauge, not "thickness"',
    body: 'Wire is sold by SWG. A drop from 10 SWG to 12 SWG removes about a third of the steel from every foot of fence. If one quote is unusually cheap, check the gauge before you check the rate.',
  },
  {
    std: 'IS 278',
    title: 'Barb spacing',
    body: 'Barbed wire is priced by weight, so a wider barb spacing means fewer barbs and less wire per kilogram. Compare the barb interval, not just the coil weight.',
  },
];

/* ---- FAQ -------------------------------------------------------------
   Rendered to the page AND to FAQPage JSON-LD from this one array.
   Answers are plain strings so they can be serialised safely; any
   inline markup belongs in `html`, which the JSON-LD path strips.     */

export const FAQ = [
  {
    q: 'Where is Naga Steels located?',
    a: 'Naga Steels is at 124, Chitrakara Street, Madurai 625001, Tamil Nadu. The godown is open Monday to Saturday, 10:00 AM to 8:00 PM, and closed on Sunday. Collection is usually same-day because we hold stock rather than ordering it in.',
  },
  {
    q: 'What products does Naga Steels supply?',
    a: 'Six families: fencing systems including chain link and barbed wire, GI and MS sheet and plate, GI and steel wire and wire rope, woven and welded mesh, colour-coated and GI roofing sheet, and nails, bolts and fencing hardware. Availability depends on the required specification.',
  },
  {
    q: 'What is Naga Fencing?',
    a: 'Naga Fencing is the dedicated Naga Steels brand for chain link, coated chain link, heavy-duty fencing, barbed wire and related boundary-fencing requirements. Naga Steels is the master brand covering all steel and metal supply.',
  },
  {
    q: 'What is the minimum order for chain link fencing in Madurai?',
    a: 'There is no fixed minimum for collection from our Chitrakara Street godown, because we cut from the roll. For delivery to other districts a lorry load is typically 500 kg or more, because below that the freight per kilogram stops making sense for you. Tell us your running feet on WhatsApp and we will confirm whether it is worth delivering or better collected.',
  },
  {
    q: 'Which gauge chain link should I use for farm fencing?',
    a: '10 SWG (3.25 mm) in a 2 inch mesh is the standard choice for agricultural boundary fencing and handles cattle pressure well. For a light garden or poultry boundary, 12 SWG (2.64 mm) is enough and costs less. For industrial perimeter, solar parks or anywhere security matters, use 8 SWG (4.06 mm).',
  },
  {
    q: 'What is the difference between hot-dip galvanized and PVC coated chain link?',
    a: 'Hot-dip galvanized wire is dipped in molten zinc so the coating bonds to the steel and covers every cut end and knuckle, giving roughly 15 to 25 years outdoors. PVC coated wire has a galvanized core sealed inside a plastic jacket, lasting 20 to 30 years and performing better in coastal or high-humidity conditions such as Ramanathapuram and Tirunelveli. PVC costs more per foot but is usually the cheaper choice over the life of the fence near the sea.',
  },
  {
    q: 'Is chain link sold by weight or by length?',
    a: 'Chain link is normally priced by weight, per kilogram, but quoted to you in running feet at a given height because that is how you buy it. The weight for a given length depends on the gauge and the mesh aperture. A heavier gauge or a tighter mesh puts more steel into the same running foot. Always compare quotes at the same gauge and the same aperture, otherwise you are not comparing the same fence.',
  },
  {
    q: 'How many fencing posts do I need for my boundary?',
    a: 'Posts are normally set at 10 foot centres for standard chain link, so the count is your perimeter divided by 10, plus one to close the run, plus extra struts at each corner and gate. The material calculator on this page works this out for you along with the number of rolls required.',
  },
  {
    q: 'What is the difference between wire mesh and weld mesh?',
    a: 'Wire mesh is woven, so the wires interlock and the sheet stays flexible, which suits screening, plastering and poultry work. Weld mesh is electrically welded at every intersection, which makes a flat, rigid panel that will not sag, and suits partitions, machine guarding and protective enclosures.',
  },
  {
    q: 'What thickness roofing sheet should I use for a shed?',
    a: 'For an agricultural godown or a domestic shed, 0.45 to 0.50 mm colour-coated sheet is the usual specification. For a factory shed or anywhere with a longer purlin span, go to 0.55 mm or above. We cut sheets to your rafter length so you do not pay for overlap waste.',
  },
  {
    q: 'Do you cut sheet and roofing to size?',
    a: 'Yes. GI and MS sheet is cut to size from stock, and roofing sheet is cut to your rafter length. You buy the piece you need rather than the offcut, and there is no overlap waste to carry on the invoice.',
  },
  {
    q: 'Do you supply Tata Wiron and VNC products?',
    a: 'Yes. We supply Tata Wiron galvanized, binding and fencing wire as a dealer, and VNC Group products as a distributor, including Bestfence fencing systems, Bestwire wire products, Bestarc welding electrodes and Voltwire electric-fence products. Product availability and current manufacturer specifications are confirmed during quotation.',
  },
  {
    q: 'Where does Naga Steels deliver?',
    a: 'Delivery enquiries are accepted across Madurai and South Tamil Nadu, including Dindigul, Theni, Sivaganga, Virudhunagar, Sivakasi, Ramanathapuram, Rameswaram, Kovilpatti, Thoothukudi, Tirunelveli, Tenkasi, Rajapalayam and Nagercoil or Kanyakumari. Every route remains subject to order and logistics confirmation.',
  },
  {
    q: 'Is freight included in the quoted rate?',
    a: 'No, and deliberately so. Material and transport are quoted separately, so you can always see what the freight is costing you and decide whether collection makes more sense. Unloading arrangements are agreed before dispatch.',
  },
  {
    q: 'What information do you need to give me a quotation?',
    a: 'Send the product, the dimensions or wire specification, an approximate quantity and the delivery location. A drawing, a bill of quantities or a reference photograph also helps. With that we can usually reply with a rate rather than four follow-up questions.',
  },
  {
    q: 'Do you provide installation or civil work?',
    a: 'We are a material supplier and a fencing manufacturer. We supply the chain link, posts material, wire and fixings, and we review drawings and BOQs against them, but we do not treat material supply, civil work and installation as the same thing. For erection we will say so plainly rather than quote for work we do not perform.',
  },
];

/* ---- Buying guide prose ---------------------------------------------- */

export const BUYING_GUIDE = [
  'The right fencing depends on the property, the security requirement, the budget and the expected service life. Those four decide the gauge and the coating long before they decide the supplier.',
  'Chain-link fencing provides a continuous mesh boundary and is commonly considered where visibility and full perimeter coverage are required. Barbed-wire fencing is generally considered where economical boundary demarcation over a long run is the priority.',
  'Wire mesh and welded mesh also support industrial partitions, protective enclosures, plastering and fabrication applications, which is why they sit in the same conversation as the boundary itself.',
  'For a quotation, share the required material, the dimensions or wire specification, the quantity and the delivery location. If something in the specification will cost more than it needs to, we will say so before we quote.',
];
