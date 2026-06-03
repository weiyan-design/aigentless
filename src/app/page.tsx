"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Home as HomeIcon,
  Search,
  User,
  Bed,
  Bath,
  Square,
  ArrowUpDown,
} from "lucide-react";
import Link from "next/link";
import { SearchModal } from "@/components/search-modal";
import { SortSheet, SORT_LABELS, type SortOption } from "@/components/sort-sheet";
import { useStore } from "@/lib/store";
import { UNITS, getUnit, type Unit } from "@/lib/fixtures";

// Discovery listings on the home view — units NOT in the demo result set
// so the demo flow stays clean.
const DISCOVERY_IDS = ["audley-studio", "post-chicago", "ascent-homes"];

export default function HomePage() {
  const router = useRouter();
  const { resetAll, pastTours } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sort, setSort] = useState<SortOption>("distance");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    resetAll();
  }, [resetAll]);

  if (!mounted) return null;

  const pastTourUnits = pastTours
    .map((t) => ({ unit: getUnit(t.unitId), toured: t.toured }))
    .filter((t): t is { unit: Unit; toured: number } => Boolean(t.unit));

  const discoveryUnits = DISCOVERY_IDS.map(
    (id) => UNITS.find((u) => u.id === id)!
  );

  return (
    <main className="min-h-dvh pb-24">
      {/* Header */}
      <div className="px-5 pt-12">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>aigentless</span>
          <span className="opacity-50">prototype</span>
        </div>

        {/* Centered search bar */}
        <button
          onClick={() => setModalOpen(true)}
          className="mt-6 w-full flex items-center justify-center gap-2 bg-card border border-border rounded-full px-5 py-4 hover:border-foreground/20 transition-colors"
        >
          <Search size={18} strokeWidth={1.75} className="text-muted-foreground" />
          <span className="text-[16px] text-muted-foreground">
            Find your next place
          </span>
        </button>
      </div>

      {/* Past tours */}
      {pastTourUnits.length > 0 && (
        <div className="px-5 mt-7">
          <div className="smallcaps text-muted-foreground mb-3">Your tours</div>
          <div
            className="flex gap-3 overflow-x-auto -mx-5 px-5 pb-1 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none" }}
          >
            {pastTourUnits.map(({ unit, toured }) => (
              <Link
                key={unit.id}
                href={`/memory/${unit.id}`}
                className="shrink-0 w-44 bg-card border border-border rounded-2xl overflow-hidden active:scale-[0.99] transition-transform"
              >
                <img
                  src={unit.coverImage}
                  alt={unit.name}
                  className="w-full h-24 object-cover bg-secondary"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${unit.id}/440/240`;
                  }}
                />
                <div className="p-3">
                  <h3 className="font-serif text-[16px] leading-tight truncate">
                    {unit.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Toured {relativeTime(toured)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Discovery listings */}
      <div className="px-5 mt-7">
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-xs text-muted-foreground smallcaps">
            Recommended for you
          </span>
          <button
            onClick={() => setSortOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs text-foreground/80 px-2.5 py-1 rounded-full hover:bg-secondary"
          >
            <ArrowUpDown size={14} strokeWidth={1.75} />
            {SORT_LABELS[sort]}
          </button>
        </div>
        <div className="space-y-4">
          {discoveryUnits.map((u) => (
            <ListingCard key={u.id} unit={u} />
          ))}
        </div>
      </div>

      {/* Bottom nav — for fidelity */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 pointer-events-none">
        <div className="phone-frame !min-h-0 pointer-events-auto">
          <div className="bg-background border-t border-border flex items-center justify-around py-2 pb-6">
            <NavItem Icon={HomeIcon} label="Home" active />
            <NavItem Icon={Search} label="Search" onClick={() => setModalOpen(true)} />
            <NavItem Icon={User} label="Profile" />
          </div>
        </div>
      </nav>

      <SearchModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={() => {
          setModalOpen(false);
          router.push("/results");
        }}
      />
      <SortSheet
        open={sortOpen}
        onClose={() => setSortOpen(false)}
        value={sort}
        onChange={setSort}
      />
    </main>
  );
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.floor(hr / 24);
  if (day === 1) return "yesterday";
  if (day < 7) return `${day} days ago`;
  const wk = Math.floor(day / 7);
  if (wk < 4) return `${wk} wk ago`;
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function ListingCard({ unit }: { unit: Unit }) {
  return (
    <div className="block bg-card border border-border rounded-3xl overflow-hidden">
      <img
        src={unit.coverImage}
        alt={unit.name}
        className="w-full h-48 object-cover bg-secondary"
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${unit.id}/900/600`;
        }}
      />
      <div className="px-4 py-4 space-y-1.5">
        {/* Row 1 — price range + available date, prominent */}
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-serif text-[22px] leading-tight">
            ${unit.rent.toLocaleString()}–${unit.rentMax.toLocaleString()}
            <span className="text-sm text-muted-foreground font-sans font-normal">
              /mo
            </span>
          </span>
          <span className="text-[15px] font-medium text-foreground/80 whitespace-nowrap">
            Available {unit.availableDate}
          </span>
        </div>
        {/* Row 2 — address */}
        <p className="text-sm text-muted-foreground">{unit.address}</p>
        {/* Row 3 — specs */}
        <div className="flex items-center gap-4 text-sm text-foreground/80 pt-0.5">
          <span className="inline-flex items-center gap-1">
            <Bed size={14} strokeWidth={1.75} />
            {unit.beds === 0 ? "Studio" : unit.beds}
          </span>
          <span className="inline-flex items-center gap-1">
            <Bath size={14} strokeWidth={1.75} />
            {unit.baths}
          </span>
          <span className="inline-flex items-center gap-1">
            <Square size={14} strokeWidth={1.75} />
            {unit.sqft.toLocaleString()} ft²
          </span>
        </div>
      </div>
    </div>
  );
}

function NavItem({
  Icon,
  label,
  active = false,
  onClick,
}: {
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
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
