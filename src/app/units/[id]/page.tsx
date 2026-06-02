"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Share2,
  Check,
  Info,
  Mail,
  ShowerHead,
  Bed,
  Bath,
  Square,
  Home as HomeIcon,
  Search,
  User,
  Sparkles,
  Wind,
  Wrench,
  ChefHat,
  WashingMachine,
  Square as SquareIcon,
  ChevronDown,
  Bike,
  Briefcase,
  TreePine,
  Dumbbell,
  Waves,
  PartyPopper,
  Sofa,
  Flame,
  Building2,
  PawPrint,
  Package,
  Wifi,
  Map as MapIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmailSheet } from "@/components/email-sheet";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/toast";
import { DEALBREAKER_ICONS } from "@/lib/icons";
import { getUnit } from "@/lib/fixtures";

// Unsplash interior images — using stable photo IDs with crop params.
// Plain <img> tags avoid the next.config.ts remotePatterns dance for a prototype.
const CAROUSEL_IMAGES = [
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&h=700&fit=crop",
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&h=700&fit=crop",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900&h=700&fit=crop",
  "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=900&h=700&fit=crop",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=900&h=700&fit=crop",
];
const COMMUNITY_IMAGE =
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&h=500&fit=crop";
const NEIGHBORHOOD_MAP =
  "https://maps.googleapis.com/maps/api/staticmap?center=Chicago&zoom=14&size=600x400&style=feature:all%7Celement:labels%7Cvisibility:off";

const TABS = [
  "Summary",
  "Unit Overview",
  "Building Details",
  "Neighborhood",
  "Fees",
] as const;
type Tab = (typeof TABS)[number];

const UNIT_FEATURES: { Icon: LucideIcon; label: string }[] = [
  { Icon: Wind, label: "Central A/C" },
  { Icon: ChefHat, label: "Custom Cabinetry" },
  { Icon: Wrench, label: "Dishwasher" },
  { Icon: WashingMachine, label: "In-Unit Laundry" },
  { Icon: SquareIcon, label: "LVT Flooring" },
  { Icon: Sparkles, label: "Quartz Countertop" },
];

const BUILDING_AMENITIES: { Icon: LucideIcon; label: string }[] = [
  { Icon: Bike, label: "Bike Room" },
  { Icon: Briefcase, label: "Co-Working & Business Center" },
  { Icon: TreePine, label: "Courtyard" },
  { Icon: Dumbbell, label: "Fitness Center" },
  { Icon: PartyPopper, label: "Game / Rec Room" },
  { Icon: Waves, label: "Hot Tub" },
  { Icon: Sofa, label: "Lounge" },
  { Icon: Flame, label: "Outdoor Grilling" },
  { Icon: Building2, label: "Outdoor Terrace" },
  { Icon: Package, label: "Package Room" },
  { Icon: PawPrint, label: "Pet Friendly" },
  { Icon: Wifi, label: "Community WiFi" },
];

export default function UnitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const unit = getUnit(id);
  const { showerVerified, verifyShower, parse } = useStore();
  const showToast = useToast((s) => s.show);
  const [emailOpen, setEmailOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("Summary");
  const [mounted, setMounted] = useState(false);
  const tabRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  if (!unit) return notFound();
  if (!mounted) return null;

  const hasUnknownShower = unit.matched.shower === null;
  const showerStatus =
    !hasUnknownShower
      ? "confirmed"
      : showerVerified
      ? "verified"
      : "unknown";

  const onSendEmail = () => {
    setEmailOpen(false);
    showToast("Sent. Agent usually replies in under an hour.");
    setTimeout(() => verifyShower(), 3800);
  };

  return (
    <main className="min-h-dvh pb-32">
      {/* Carousel header with overlay buttons */}
      <ImageCarousel images={CAROUSEL_IMAGES} />
      <div className="fixed top-12 left-5 right-5 z-10 flex items-center justify-between pointer-events-none">
        <button
          onClick={() => router.push("/results")}
          className="pointer-events-auto w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-sm"
          aria-label="Back"
        >
          <ArrowLeft size={18} strokeWidth={1.75} />
        </button>
        <button
          className="pointer-events-auto w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-sm"
          aria-label="Share"
        >
          <Share2 size={16} strokeWidth={1.75} />
        </button>
      </div>

      {/* Info */}
      <div className="px-5 mt-5">
        <h1 className="font-serif text-[32px] leading-tight">{unit.name}</h1>
        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
          <span>{unit.address}</span>
          <span className="inline-flex items-center gap-1">
            <SquareIcon size={14} strokeWidth={1.75} />
            A1.0
          </span>
        </p>
        <p className="text-[15px] text-foreground/80 mt-2">
          <span className="text-muted-foreground">From </span>
          <span className="font-medium">${unit.rent.toLocaleString()}/mo</span>
          <span className="text-muted-foreground">
            {" "}· Available {unit.availableDate}
          </span>
        </p>
        <div className="flex items-center gap-4 text-sm text-foreground/80 mt-3">
          <Stat Icon={Bed} value={unit.beds === 0 ? "Studio" : `${unit.beds} bed`} />
          <Divider />
          <Stat Icon={Bath} value={`${unit.baths} bath`} />
          <Divider />
          <Stat Icon={Square} value={`${unit.sqft.toLocaleString()} ft²`} />
        </div>
      </div>

      {/* Tabs */}
      <div
        ref={tabRef}
        className="mt-6 border-b border-border overflow-x-auto [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="flex gap-6 px-5 min-w-max">
          {TABS.map((t) => {
            const active = t === tab;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-3 pt-1 text-[15px] font-serif whitespace-nowrap border-b-2 -mb-px transition-colors ${
                  active
                    ? "text-foreground border-foreground"
                    : "text-muted-foreground border-transparent"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-5 mt-6">
        {tab === "Summary" && (
          <SummaryTab
            parse={parse}
            showerStatus={showerStatus}
            onVerify={() => setEmailOpen(true)}
            unit={unit}
          />
        )}
        {tab === "Unit Overview" && <UnitOverviewTab />}
        {tab === "Building Details" && <BuildingDetailsTab unit={unit} />}
        {tab === "Neighborhood" && <NeighborhoodTab />}
        {tab === "Fees" && <FeesTab />}
      </div>

      {/* Sticky bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-20 pointer-events-none">
        <div className="phone-frame !min-h-0 pointer-events-auto">
          <div className="px-5 pt-3 pb-3 bg-background border-t border-border">
            <div className="flex items-center gap-2 bg-card border border-accent rounded-full px-4 py-2.5 mb-3">
              <Sparkles size={14} strokeWidth={1.75} className="text-accent-foreground" />
              <span className="text-xs text-muted-foreground italic flex-1 font-serif">
                Ask me anything — does this place have an elevator?
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => router.push(`/tour/${unit.id}`)}
                className="h-12 text-base rounded-full"
              >
                Book a tour
              </Button>
              <Button
                variant="outline"
                className="h-12 text-base rounded-full border-2"
              >
                View availability
              </Button>
            </div>
          </div>
          <BottomNav />
        </div>
      </div>

      <EmailSheet
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        unitName={unit.name}
        unitAddress={unit.address}
        attribute="Walk-in shower"
        onSend={onSendEmail}
      />
    </main>
  );
}

// ─── CAROUSEL ────────────────────────────────────────────────────────

function ImageCarousel({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const onScroll = () => {
    if (!scrollRef.current) return;
    const idx = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
    setActive(idx);
  };

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {images.map((src, i) => (
          <div key={i} className="shrink-0 w-full snap-center">
            <img
              src={src}
              alt=""
              className="w-full h-[300px] object-cover bg-secondary"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://picsum.photos/seed/u${i}/900/700`;
              }}
            />
          </div>
        ))}
      </div>
      {/* Paging dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === active ? "w-4 bg-card" : "w-1.5 bg-card/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── TAB CONTENTS ─────────────────────────────────────────────────────

function SummaryTab({
  parse,
  showerStatus,
  onVerify,
  unit,
}: {
  parse: ReturnType<typeof useStore.getState>["parse"];
  showerStatus: "confirmed" | "unknown" | "verified";
  onVerify: () => void;
  unit: ReturnType<typeof getUnit>;
}) {
  return (
    <div className="space-y-7">
      <section>
        <div className="smallcaps text-muted-foreground mb-3">
          Your must-haves
        </div>
        <div className="space-y-3">
          {parse
            .filter((d) => d.id === "pet" || d.id === "laundry")
            .map((d) => {
              const Icon = DEALBREAKER_ICONS[d.id];
              return (
                <MustHaveRow
                  key={d.id}
                  Icon={Icon}
                  label={d.label}
                  status="confirmed"
                />
              );
            })}
          <MustHaveRow
            Icon={ShowerHead}
            label="Walk-in shower"
            status={showerStatus}
            onVerifyClick={onVerify}
          />
        </div>
      </section>

      <section>
        <div className="smallcaps text-muted-foreground mb-3">About</div>
        <p className="text-[15px] leading-relaxed text-foreground/85">
          Welcome to {unit?.name}, where elevated living meets true community
          in the heart of {unit?.city}. Thoughtfully designed apartment homes
          blend modern style with everyday comfort. Floor-to-ceiling windows
          flood the living room with natural light, the kitchen features
          quartz countertops and custom cabinetry, and the bedroom suite
          opens to a private balcony.
        </p>
      </section>
    </div>
  );
}

function UnitOverviewTab() {
  return (
    <div className="space-y-7">
      <section>
        <div className="grid grid-cols-2 gap-y-4 gap-x-6">
          {UNIT_FEATURES.map(({ Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon size={22} strokeWidth={1.5} className="text-foreground/80 shrink-0" />
              <span className="text-[15px] leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-medium text-[15px] mb-3">Floor plan</h3>
        <div className="bg-secondary/50 rounded-2xl h-48 flex items-center justify-center">
          <FloorPlanIllustration />
        </div>
      </section>

      <section>
        <h3 className="font-medium text-[15px] mb-3">Community Details</h3>
        <img
          src={COMMUNITY_IMAGE}
          alt="Community"
          className="w-full h-44 object-cover rounded-2xl bg-secondary"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://picsum.photos/seed/community/900/500";
          }}
        />
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          Shared rooftop with grills and lounge seating, secure bike room,
          24/7 fitness center, and a quiet co-working lounge.
        </p>
      </section>
    </div>
  );
}

function BuildingDetailsTab({ unit }: { unit: ReturnType<typeof getUnit> }) {
  return (
    <div className="space-y-7">
      <section>
        <p className="text-[15px] leading-relaxed text-foreground/85">
          {unit?.name} sits on a tree-lined block in a walkable
          neighborhood, with restaurants, parks, and transit minutes away.
          Built in 2024 with thoughtful materials and modern finishes — a
          place that feels both elevated and effortless.
        </p>
      </section>

      <section>
        <h3 className="smallcaps text-muted-foreground mb-3">
          Building amenities
        </h3>
        <div className="grid grid-cols-2 gap-y-4 gap-x-6">
          {BUILDING_AMENITIES.map(({ Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon size={22} strokeWidth={1.5} className="text-foreground/80 shrink-0" />
              <span className="text-[15px] leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="divide-y divide-border border-y border-border">
        <Stat2 label="Total # of Units" value="187" />
        <Stat2 label="Year Built" value="2024" />
        <Stat2 label="Parking Available" value="Yes" />
        <Stat2
          label="Website"
          value={`https://live${unit?.id ?? ""}.com`}
          valueClass="text-accent-foreground"
        />
      </section>

      <Button
        variant="outline"
        className="w-full h-12 text-base rounded-full border-2"
      >
        View full property page
      </Button>
    </div>
  );
}

function NeighborhoodTab() {
  return (
    <div className="space-y-7">
      <section>
        <h3 className="font-serif text-[22px] leading-tight mb-3">
          The Neighborhood
        </h3>
        <div className="rounded-2xl overflow-hidden bg-secondary relative">
          <img
            src={NEIGHBORHOOD_MAP}
            alt="Neighborhood map"
            className="w-full h-48 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://picsum.photos/seed/map/600/400";
            }}
          />
          <button
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-card/95 backdrop-blur-sm flex items-center justify-center shadow-sm"
            aria-label="Expand map"
          >
            <MapIcon size={16} strokeWidth={1.75} />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          Lincoln Park · 7-minute walk to the Brown line · Whole Foods 0.4 mi.
          Quiet residential block with weekend farmers market two blocks over.
        </p>
      </section>

      <section>
        <h3 className="smallcaps text-muted-foreground mb-3">
          Walk score
        </h3>
        <div className="flex items-center gap-3">
          <div className="text-3xl font-serif">94</div>
          <div className="text-sm text-muted-foreground">
            Walker&rsquo;s paradise — daily errands do not require a car.
          </div>
        </div>
      </section>
    </div>
  );
}

function FeesTab() {
  return (
    <div className="space-y-7">
      <h2 className="font-serif text-[26px] leading-tight">
        Fees and Policies
      </h2>

      <div className="bg-secondary/60 rounded-2xl p-5">
        <h3 className="font-serif text-[18px] leading-tight">
          This property manages fees and policies on their website
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          For the most up-to-date info, visit the website below.
        </p>
        <Button className="w-full h-12 text-base rounded-full mt-4">
          View all info
        </Button>
      </div>

      <section>
        <h3 className="font-medium text-[15px] mb-2">
          Equal Housing Opportunity Statement
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We are pledged to the letter and spirit of U.S. policy for the
          achievement of equal housing opportunity throughout the Nation.
          We encourage and support an affirmative advertising and marketing
          program in which there are no barriers to obtaining housing because
          of race, color, religion, sex, handicap, familial status, or
          national origin.
        </p>
      </section>
    </div>
  );
}

// ─── PIECES ──────────────────────────────────────────────────────────

function Stat({ Icon, value }: { Icon: LucideIcon; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon size={14} strokeWidth={1.75} />
      {value}
    </span>
  );
}
function Divider() {
  return <span className="text-muted-foreground/40">|</span>;
}
function Stat2({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-[15px] font-medium">{label}</span>
      <span className={`text-[15px] ${valueClass}`}>{value}</span>
    </div>
  );
}

function MustHaveRow({
  Icon,
  label,
  status,
  onVerifyClick,
}: {
  Icon?: LucideIcon;
  label: string;
  status: "confirmed" | "unknown" | "verified";
  onVerifyClick?: () => void;
}) {
  if (status === "confirmed") {
    return (
      <div className="flex items-start gap-3">
        <span className="w-7 h-7 shrink-0 rounded-full bg-success/40 text-success-foreground flex items-center justify-center">
          <Check size={14} strokeWidth={2} />
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {Icon && <Icon size={16} strokeWidth={1.75} className="text-foreground/70" />}
            <span className="text-[15px] font-medium">{label}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Confirmed from listing
          </p>
        </div>
      </div>
    );
  }
  if (status === "verified") {
    return (
      <div className="flex items-start gap-3 sheet-backdrop-enter">
        <span className="w-7 h-7 shrink-0 rounded-full bg-success/40 text-success-foreground flex items-center justify-center">
          <Check size={14} strokeWidth={2} />
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {Icon && <Icon size={16} strokeWidth={1.75} className="text-foreground/70" />}
            <span className="text-[15px] font-medium">{label}</span>
          </div>
          <p className="text-xs text-success-foreground mt-0.5">
            Confirmed by Maple Hill mgmt, just now
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3 bg-warn/30 border border-warn rounded-2xl p-3">
      <span className="w-7 h-7 shrink-0 rounded-full bg-warn text-warn-foreground flex items-center justify-center">
        <Info size={14} strokeWidth={2} />
      </span>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} strokeWidth={1.75} className="text-foreground/70" />}
          <span className="text-[15px] font-medium">{label}</span>
        </div>
        <p className="text-xs text-warn-foreground mt-0.5">
          Not in our database
        </p>
        <button
          onClick={onVerifyClick}
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium bg-card border border-border rounded-full px-3 py-1.5 hover:bg-secondary transition-colors"
        >
          <Mail size={14} strokeWidth={1.75} />
          Email agent to confirm
        </button>
      </div>
    </div>
  );
}

function FloorPlanIllustration() {
  return (
    <svg viewBox="0 0 200 140" className="w-48 h-32 text-foreground/60" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="10" y="10" width="180" height="120" rx="2" />
      <line x1="90" y1="10" x2="90" y2="80" />
      <line x1="90" y1="80" x2="190" y2="80" />
      <line x1="10" y1="80" x2="60" y2="80" />
      <line x1="60" y1="80" x2="60" y2="130" />
      <text x="40" y="48" fontSize="8" fill="currentColor" stroke="none">LIVING</text>
      <text x="125" y="50" fontSize="8" fill="currentColor" stroke="none">KITCHEN</text>
      <text x="25" y="108" fontSize="8" fill="currentColor" stroke="none">BATH</text>
      <text x="120" y="108" fontSize="8" fill="currentColor" stroke="none">BEDROOM</text>
    </svg>
  );
}

function BottomNav() {
  const router = useRouter();
  return (
    <nav className="bg-background border-t border-border flex items-center justify-around py-2 pb-6">
      <NavItem Icon={HomeIcon} label="Home" onClick={() => router.push("/")} />
      <NavItem Icon={Search} label="Search" active />
      <NavItem Icon={User} label="Profile" />
    </nav>
  );
}
function NavItem({
  Icon,
  label,
  active = false,
  onClick,
}: {
  Icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 px-4 py-1.5 ${
        active ? "text-foreground" : "text-muted-foreground"
      }`}
    >
      <Icon size={20} strokeWidth={active ? 2 : 1.5} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
