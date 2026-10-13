export const FAQS = [
  {
    q: "What does 'with the mother' mean?",
    a: "The 'mother' refers to the natural strands of proteins, enzymes and beneficial bacteria that form during fermentation. It appears as a cloudy sediment and is a sign of a raw, unfiltered product.",
  },
  {
    q: "How should I store the vinegar?",
    a: "Store in a cool, dry place away from direct sunlight. Refrigeration is not required. Once opened, consume within 12 months for best quality.",
  },
  {
    q: "Do you deliver nationwide in Ghana?",
    a: "Yes. We deliver to all 16 regions of Ghana. Delivery times vary by location — typically 1–3 business days for Accra and Kumasi, 3–5 days for other regions.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept MTN Mobile Money, Telecel Cash, AirtelTigo Money, and Cash on Delivery.",
  },
  {
    q: "Can I buy in bulk for my shop or business?",
    a: "Yes. We offer wholesale and trade pricing for retailers, health stores, and distributors. Visit our Trade page or call us directly.",
  },
];

export const PROCESS_STEPS = [
  {
    title: "Source Harvesting",
    text: "We manually select healthy, unblemished apples from the orchards in South Africa.",
    specs: [{ label: "Standard", val: "Organic Grade A" }, { label: "Method", val: "Hand-picked" }],
  },
  {
    title: "Cold Press Extraction",
    text: "Apples are washed and cold-pressed within 24 hours of harvest to preserve delicate enzymes.",
    specs: [{ label: "Temp", val: "< 4°C" }, { label: "Yield", val: "Pure Juice" }],
  },
  {
    title: "Oak Barrel Fermentation",
    text: "The critical 'Double Fermentation'. First, yeast converts sugars to alcohol. Second, bacteria convert alcohol to acetic acid (5-20%), forming the 'Mother'.",
    specs: [{ label: "Vessel", val: "French Oak" }, { label: "Acidity", val: "5-20%" }],
  },
  {
    title: "Mature Cider Bottling",
    text: "Bottled raw and unfiltered. No pasteurization ensures enzymes and probiotics remain biologically active and structurally potent.",
    specs: [{ label: "State", val: "Raw/Unfiltered" }, { label: "Pasteurized", val: "No" }],
  },
];

// Add every branch here — the list and the map pick them up automatically.
export const BRANCHES = [
  {
    name: "University of Cape Coast HQ",
    type: "Factory Store",
    address: "Plot No. 78,79 Amamoma, UCC, Cape Coast",
    phone: "+233 50 715 4818",
    mapQuery: "Gid's Beverages & Health Products, Amamoma, Cape Coast, Ghana",
  },
];

export const OPENINGS = [
  { role: "Sales Representative", title: "Sales Representative", meta: "Accra & Kumasi • Full Time" },
  { role: "Fermentation Specialist", title: "Brew / Fermentation Specialist", meta: "Cape Coast HQ • Full Time" },
  { role: "Wholesale Partner", title: "Wholesale Partner", meta: "Nationwide • B2B Partnership" },
];

export const TESTIMONIALS = [
  {
    name: "Abena K.",
    location: "Accra",
    text: "I've tried other brands but Gid's is the only one that actually smells and tastes right. The mother is always there. Proper quality.",
    rating: 5,
  },
  {
    name: "Kofi A.",
    location: "Kumasi",
    text: "Use it in my cooking every day. Delivery was fast and the bottle was well sealed. Will order again.",
    rating: 5,
  },
  {
    name: "Maame D.",
    location: "Cape Coast",
    text: "Love that it's made locally. Good to know where it comes from. The 1L bottle is great value.",
    rating: 5,
  },
];
