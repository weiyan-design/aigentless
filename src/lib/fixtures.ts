// Hardcoded fixture data for the Aigentless tour-quality prototype.
// Everything is engineered so the demo path is deterministic.

export type DealbreakerStatus = "confirmed" | "verify" | "inperson";

export type Dealbreaker = {
  id: string;
  label: string;
  icon: string;
  status: DealbreakerStatus;
};

// The hardcoded parse output for the demo input
// "Quiet enough to study, good light, dog allowed, OCD so in-unit laundry, walk-in shower please."
export const DEMO_INPUT =
  "Quiet enough to study, good light, dog allowed, OCD so in-unit laundry, walk-in shower please.";

export const DEMO_PARSE: Dealbreaker[] = [
  { id: "pet", label: "Pet-friendly", icon: "🐾", status: "confirmed" },
  { id: "laundry", label: "In-unit laundry", icon: "🫧", status: "confirmed" },
  { id: "shower", label: "Walk-in shower", icon: "🚿", status: "verify" },
  { id: "light", label: "Good light", icon: "☀️", status: "inperson" },
  { id: "quiet", label: "Quiet", icon: "🤫", status: "inperson" },
];

export type Unit = {
  id: string;
  name: string;
  address: string;
  city: string;
  rent: number;        // "from" price — used for budget filter logic
  rentMax: number;     // display range upper bound
  availableDate: string; // "6/15", "7/1", etc.
  beds: number;
  baths: number;
  sqft: number;
  image: string; // gradient placeholder
  imageBg: string; // bg gradient classes
  matched: { pet: boolean; laundry: boolean; shower: boolean | null };
  showVerifyFlag?: boolean;
};

// 6 units engineered for the demo:
// At $1,800 budget → 0 match all hard requirements
// At $1,900 (stretched) → 3 match (one with verify flag)
export const UNITS: Unit[] = [
  {
    id: "maple-hill",
    name: "Maple Hill",
    address: "2740 N Hampden Ct, Chicago",
    city: "Chicago",
    rent: 1850,
    rentMax: 2120,
    availableDate: "6/15",
    beds: 1,
    baths: 1,
    sqft: 720,
    image: "🪴",
    imageBg: "from-emerald-200 via-stone-100 to-amber-100",
    matched: { pet: true, laundry: true, shower: null },
    showVerifyFlag: true,
  },
  {
    id: "lincoln-park-12",
    name: "Lincoln Park 12",
    address: "853 W Blackhawk St, Chicago",
    city: "Chicago",
    rent: 1890,
    rentMax: 2150,
    availableDate: "7/1",
    beds: 1,
    baths: 1,
    sqft: 680,
    image: "🏙",
    imageBg: "from-slate-200 via-stone-100 to-stone-200",
    matched: { pet: true, laundry: true, shower: true },
  },
  {
    id: "greenwich-flats",
    name: "Greenwich Flats",
    address: "412 W Greenwich Ave, Chicago",
    city: "Chicago",
    rent: 1895,
    rentMax: 2230,
    availableDate: "6/22",
    beds: 1,
    baths: 1,
    sqft: 705,
    image: "🛋",
    imageBg: "from-amber-100 via-stone-100 to-rose-100",
    matched: { pet: true, laundry: true, shower: true },
  },
  {
    id: "post-chicago",
    name: "Post Chicago",
    address: "1102 W Belmont Ave, Chicago",
    city: "Chicago",
    rent: 2260,
    rentMax: 2890,
    availableDate: "6/30",
    beds: 1,
    baths: 1,
    sqft: 640,
    image: "🍳",
    imageBg: "from-zinc-200 via-stone-100 to-zinc-100",
    matched: { pet: false, laundry: true, shower: true },
  },
  {
    id: "audley-studio",
    name: "Audley Studio",
    address: "190 N State St, Chicago",
    city: "Chicago",
    rent: 1980,
    rentMax: 2240,
    availableDate: "7/10",
    beds: 0,
    baths: 1,
    sqft: 380,
    image: "🪟",
    imageBg: "from-sky-100 via-stone-100 to-stone-100",
    matched: { pet: true, laundry: false, shower: true },
  },
  {
    id: "ascent-homes",
    name: "Ascent Apartment Homes",
    address: "99 Ascension Dr, Chicago",
    city: "Chicago",
    rent: 2400,
    rentMax: 2950,
    availableDate: "8/1",
    beds: 2,
    baths: 1,
    sqft: 1040,
    image: "🏡",
    imageBg: "from-stone-100 via-amber-100 to-stone-200",
    matched: { pet: true, laundry: true, shower: true },
  },
];

export function getUnit(id: string): Unit | undefined {
  return UNITS.find((u) => u.id === id);
}

// Units shown after the open-up trade
export const STRETCHED_RESULT_IDS = [
  "maple-hill",
  "lincoln-park-12",
  "greenwich-flats",
];

// Tour checklist for Maple Hill
export type ChecklistItem = {
  id: string;
  label: string;
  group: "handled" | "yours" | "recommended";
  preResolved?: string; // for handled section
};

export const MAPLE_HILL_CHECKLIST: ChecklistItem[] = [
  {
    id: "shower-confirmed",
    label: "Walk-in shower",
    group: "handled",
    preResolved: "Confirmed by Maple Hill mgmt",
  },
  { id: "good-light", label: "Good light", group: "yours" },
  { id: "quiet", label: "Quiet", group: "yours" },
  { id: "floorplan", label: "Floor plan matches listing", group: "recommended" },
  { id: "finish", label: "Finish quality", group: "recommended" },
  { id: "water-pressure", label: "Water pressure", group: "recommended" },
];

// Pre-baked capture results so demo Screen 7 always tells the same story
export const DEMO_CAPTURE_FALLBACK: Record<string, { rating: "up" | "down"; note?: string }> = {
  "good-light": { rating: "down", note: "north-facing, dim by 4pm" },
  quiet: { rating: "up" },
  floorplan: { rating: "up" },
  finish: { rating: "up" },
  "water-pressure": { rating: "down", note: "low in master bath" },
};

// Layer 1 defaults
export const LAYER1_DEFAULTS = {
  location: "Chicago",
  budget: 1800,
  bedrooms: 1,
  moveIn: "",
  moveInRange: "",
};

export const STRETCHED_BUDGET = 1900;
export const STRETCH_AMOUNT = 100;

// Filter sheet — unit features & community amenities
export const UNIT_FEATURES = [
  "In-unit laundry",
  "Dishwasher",
  "Hardwood floors",
  "Air conditioning",
  "Stainless steel appliances",
  "Walk-in closet",
  "Private balcony",
  "Furnished",
  "Floor-to-ceiling windows",
  "Walk-in shower",
  "Quartz countertops",
  "Kitchen island",
];

export const COMMUNITY_AMENITIES = [
  "Pool",
  "Fitness center",
  "Doorman",
  "Elevator",
  "Bike storage",
  "Rooftop deck",
  "Package room",
  "Co-working space",
  "Lounge",
  "Pet spa",
  "Dog run",
  "EV charging",
];
