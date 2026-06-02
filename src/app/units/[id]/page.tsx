"use client";

import { useState, useEffect, use, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Share2,
  Check,
  Mail,
  ShowerHead,
  Bed,
  Bath,
  Square,
  Sparkles,
  Wind,
  Wrench,
  ChefHat,
  WashingMachine,
  Square as SquareIcon,
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
  Info,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmailSheet } from "@/components/email-sheet";
import { useStore, type CaptureValue } from "@/lib/store";
import { useToast } from "@/components/toast";
import { DEALBREAKER_ICONS } from "@/lib/icons";
import { getUnit, type Dealbreaker } from "@/lib/fixtures";

const OTHER_CAROUSEL_IMAGES = [
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&h=700&fit=crop",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900&h=700&fit=crop",
  "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=900&h=700&fit=crop",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=900&h=700&fit=crop",
];
const COMMUNITY_IMAGE =
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&h=500&fit=crop";
const NEIGHBORHOOD_MAP =
  "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&h=500&fit=crop";

const SECTIONS = [
  { id: "summary", label: "Summary" },
  { id: "overview", label: "Unit Overview" },
  { id: "building", label: "Building Details" },
  { id: "neighborhood", label: "Neighborhood" },
  { id: "fees", label: "Fees" },
] as const;
type SectionId = (typeof SECTIONS)[number]["id"];

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
  const [active, setActive] = useState<SectionId>("summary");
  const [mounted, setMounted] = useState(false);
  const programmaticScroll = useRef(false);

  useEffect(() => setMounted(true), []);

  // Scroll-spy: pick the section whose top is nearest the tab bar
  useEffect(() => {
    if (!mounted) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (programmaticScroll.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = visible[0].target.id as SectionId;
          if (SECTIONS.some((s) => s.id === id)) setActive(id);
        }
      },
      // Active = section whose top has crossed below the sticky tab bar (~60px)
      // and is still above 60% of viewport
      { rootMargin: "-70px 0px -55% 0px", threshold: 0 }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [mounted]);

  const scrollToSection = useCallback((sec: SectionId) => {
    setActive(sec);
    programmaticScroll.current = true;
    const el = document.getElementById(sec);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      programmaticScroll.current = false;
    }, 700);
  }, []);

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

  // Sort parse so anything needing action comes first
  const sortedParse: (Dealbreaker & { needsVerify?: boolean })[] = [
    ...parse
      .filter((d) => d.id === "shower" && showerStatus !== "confirmed")
      .map((d) => ({ ...d, needsVerify: true })),
    ...parse.filter((d) => !(d.id === "shower" && showerStatus !== "confirmed")),
  ];

  return (
    <main className="min-h-dvh pb-32">
      {/* Carousel header — unit cover first, then shared interior shots */}
      <ImageCarousel
        images={[
          unit.coverImage,
          ...OTHER_CAROUSEL_IMAGES.filter((u) => u !== unit.coverImage),
        ]}
      />
      <div className="fixed top-12 left-5 right-5 z-30 flex items-center justify-between pointer-events-none">
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

      {/* Sticky tab bar (anchor-link scroll-spy) */}
      <div className="sticky top-0 z-20 bg-background border-b border-border mt-6">
        <div
          className="overflow-x-auto [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="flex gap-6 px-5 min-w-max">
            {SECTIONS.map((s) => {
              const isActive = s.id === active;
              return (
                <button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className={`pb-3 pt-3 text-[15px] font-serif whitespace-nowrap border-b-2 -mb-px transition-colors ${
                    isActive
                      ? "text-foreground border-foreground"
                      : "text-muted-foreground border-transparent"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* All sections stacked */}
      <div className="px-5">
        <Section id="summary">
          <SummaryContent
            parse={sortedParse}
            showerStatus={showerStatus}
            onVerify={() => setEmailOpen(true)}
            unit={unit}
          />
        </Section>

        <Section id="overview">
          <UnitOverviewContent />
        </Section>

        <Section id="building">
          <BuildingDetailsContent unit={unit} />
        </Section>

        <Section id="neighborhood">
          <NeighborhoodContent />
        </Section>

        <Section id="fees">
          <FeesContent />
        </Section>
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

// ─── SECTION WRAPPER ─────────────────────────────────────────────────

function Section({ id, children }: { id: SectionId; children: React.ReactNode }) {
  // scroll-margin-top accounts for sticky tab bar height (~48px) so the
  // section title isn't hidden behind it when scrolled into view.
  return (
    <section id={id} className="pt-6 pb-2" style={{ scrollMarginTop: 56 }}>
      {children}
    </section>
  );
}

// ─── CAROUSEL ────────────────────────────────────────────────────────

function ImageCarousel({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const onScroll = () => {
    if (!scrollRef.current) return;
    const idx = Math.round(
      scrollRef.current.scrollLeft / scrollRef.current.clientWidth
    );
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

// ─── SECTION CONTENTS ────────────────────────────────────────────────

function SummaryContent({
  parse,
  showerStatus,
  onVerify,
  unit,
}: {
  parse: (Dealbreaker & { needsVerify?: boolean })[];
  showerStatus: "confirmed" | "unknown" | "verified";
  onVerify: () => void;
  unit: ReturnType<typeof getUnit>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <div className="smallcaps text-muted-foreground mb-2.5">
          Your must-haves
        </div>
        {/* Horizontally scrollable chip row */}
        <div
          className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-1 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none" }}
        >
          {parse.map((d) => {
            if (d.needsVerify) {
              return (
                <VerifyChip
                  key={d.id}
                  label={d.label}
                  Icon={DEALBREAKER_ICONS[d.id]}
                  onClick={onVerify}
                />
              );
            }
            if (d.status === "confirmed") {
              return (
                <ConfirmedChip
                  key={d.id}
                  label={d.label}
                  Icon={DEALBREAKER_ICONS[d.id]}
                  resolvedNow={d.id === "shower" && showerStatus === "verified"}
                />
              );
            }
            // inperson — neutral chip
            return (
              <InPersonChip
                key={d.id}
                label={d.label}
                Icon={DEALBREAKER_ICONS[d.id]}
              />
            );
          })}
        </div>
      </div>

      <div>
        <div className="smallcaps text-muted-foreground mb-2.5">About</div>
        <p className="text-[15px] leading-relaxed text-foreground/85">
          Welcome to {unit?.name}, where elevated living meets true community
          in the heart of {unit?.city}. Thoughtfully designed apartment homes
          blend modern style with everyday comfort. Floor-to-ceiling windows
          flood the living room with natural light, the kitchen features
          quartz countertops and custom cabinetry, and the bedroom suite
          opens to a private balcony.
        </p>
      </div>
    </div>
  );
}

function UnitOverviewContent() {
  return (
    <div className="space-y-7">
      <h2 className="font-serif text-[22px] leading-tight">Unit Overview</h2>
      <div className="grid grid-cols-2 gap-y-4 gap-x-6">
        {UNIT_FEATURES.map(({ Icon, label }) => (
          <div key={label} className="flex items-center gap-3">
            <Icon size={22} strokeWidth={1.5} className="text-foreground/80 shrink-0" />
            <span className="text-[15px] leading-tight">{label}</span>
          </div>
        ))}
      </div>
      <div>
        <h3 className="font-medium text-[15px] mb-3">Floor plan</h3>
        <div className="bg-secondary/50 rounded-2xl h-48 flex items-center justify-center">
          <FloorPlanIllustration />
        </div>
      </div>
      <div>
        <h3 className="font-medium text-[15px] mb-3">Community Details</h3>
        <img
          src={COMMUNITY_IMAGE}
          alt="Community"
          className="w-full h-44 object-cover rounded-2xl bg-secondary"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://picsum.photos/seed/community/900/500";
          }}
        />
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          Shared rooftop with grills and lounge seating, secure bike room,
          24/7 fitness center, and a quiet co-working lounge.
        </p>
      </div>
    </div>
  );
}

function BuildingDetailsContent({ unit }: { unit: ReturnType<typeof getUnit> }) {
  return (
    <div className="space-y-7">
      <h2 className="font-serif text-[22px] leading-tight">Building Details</h2>
      <p className="text-[15px] leading-relaxed text-foreground/85">
        {unit?.name} sits on a tree-lined block in a walkable neighborhood,
        with restaurants, parks, and transit minutes away. Built in 2024 with
        thoughtful materials and modern finishes — a place that feels both
        elevated and effortless.
      </p>
      <div>
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
      </div>
      <div className="divide-y divide-border border-y border-border">
        <Stat2 label="Total # of Units" value="187" />
        <Stat2 label="Year Built" value="2024" />
        <Stat2 label="Parking Available" value="Yes" />
        <Stat2
          label="Website"
          value={`live${unit?.id ?? ""}.com`}
          valueClass="text-accent-foreground underline underline-offset-2"
        />
      </div>
      <Button
        variant="outline"
        className="w-full h-12 text-base rounded-full border-2"
      >
        View full property page
      </Button>
    </div>
  );
}

function NeighborhoodContent() {
  return (
    <div className="space-y-7">
      <h2 className="font-serif text-[22px] leading-tight">Neighborhood</h2>
      <div className="rounded-2xl overflow-hidden bg-secondary relative">
        <img
          src={NEIGHBORHOOD_MAP}
          alt="Neighborhood map"
          className="w-full h-48 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://picsum.photos/seed/map/900/500";
          }}
        />
        <button
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-card/95 backdrop-blur-sm flex items-center justify-center shadow-sm"
          aria-label="Expand map"
        >
          <MapIcon size={16} strokeWidth={1.75} />
        </button>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Lincoln Park · 7-minute walk to the Brown line · Whole Foods 0.4 mi.
        Quiet residential block with a weekend farmers market two blocks over.
      </p>
      <div>
        <h3 className="smallcaps text-muted-foreground mb-2">Walk score</h3>
        <div className="flex items-center gap-3">
          <div className="text-3xl font-serif">94</div>
          <div className="text-sm text-muted-foreground">
            Walker&rsquo;s paradise — daily errands do not require a car.
          </div>
        </div>
      </div>
    </div>
  );
}

function FeesContent() {
  return (
    <div className="space-y-6">
      <h2 className="font-serif text-[22px] leading-tight">Fees and Policies</h2>
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
      <div>
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
      </div>
    </div>
  );
}

// ─── MUST-HAVE CHIPS ─────────────────────────────────────────────────

// All three chips share the same h-9 height and consistent inner padding.
const CHIP_BASE =
  "shrink-0 inline-flex items-center gap-1.5 h-9 rounded-full text-[13px] whitespace-nowrap";

function VerifyChip({
  label,
  Icon,
  onClick,
}: {
  label: string;
  Icon?: LucideIcon;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`${CHIP_BASE} bg-warn/40 border border-warn text-warn-foreground pl-3 pr-1 hover:bg-warn/60 transition-colors`}
    >
      {Icon && <Icon size={13} strokeWidth={1.75} />}
      <span className="font-medium">{label}</span>
      <span className="w-7 h-7 rounded-full bg-warn-foreground text-warn flex items-center justify-center ml-1">
        <Mail size={13} strokeWidth={1.75} />
      </span>
    </button>
  );
}

function ConfirmedChip({
  label,
  Icon,
  resolvedNow,
}: {
  label: string;
  Icon?: LucideIcon;
  resolvedNow?: boolean;
}) {
  return (
    <span
      className={`${CHIP_BASE} bg-success/30 text-success-foreground px-3 ${
        resolvedNow ? "sheet-backdrop-enter" : ""
      }`}
    >
      <Check size={12} strokeWidth={2.25} />
      {Icon && <Icon size={13} strokeWidth={1.75} />}
      <span>{label}</span>
    </span>
  );
}

function InPersonChip({ label, Icon }: { label: string; Icon?: LucideIcon }) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [tipPos, setTipPos] = useState<{ x: number; y: number } | null>(null);

  // Auto-dismiss + tap-away
  useEffect(() => {
    if (!tipPos) return;
    const t = window.setTimeout(() => setTipPos(null), 2500);
    const close = () => setTipPos(null);
    // Defer adding listeners by a tick so the opening tap doesn't immediately close it
    const armId = window.setTimeout(() => {
      window.addEventListener("touchstart", close, { passive: true });
      window.addEventListener("mousedown", close);
      window.addEventListener("scroll", close, { passive: true, capture: true });
    }, 0);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(armId);
      window.removeEventListener("touchstart", close);
      window.removeEventListener("mousedown", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [tipPos]);

  const onTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!btnRef.current) return;
    if (tipPos) {
      setTipPos(null);
      return;
    }
    const rect = btnRef.current.getBoundingClientRect();
    setTipPos({ x: rect.left + rect.width / 2, y: rect.top });
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={onTap}
        className={`${CHIP_BASE} bg-accent/40 text-accent-foreground px-3 hover:bg-accent/60 transition-colors`}
        aria-label={`${label} — check in person`}
      >
        {Icon && <Icon size={13} strokeWidth={1.75} />}
        <span>{label}</span>
        <Info size={12} strokeWidth={2} />
      </button>
      {tipPos &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            role="tooltip"
            className="fixed z-[60] -translate-x-1/2 -translate-y-full whitespace-nowrap bg-foreground text-background text-xs px-2.5 py-1.5 rounded-md shadow-md pointer-events-none sheet-backdrop-enter"
            style={{ left: tipPos.x, top: tipPos.y - 6 }}
          >
            Check it in person
            <span className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 rotate-45 bg-foreground" />
          </div>,
          document.body
        )}
    </>
  );
}

// ─── BITS ────────────────────────────────────────────────────────────

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

