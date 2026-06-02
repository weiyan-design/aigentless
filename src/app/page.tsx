"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SearchModal } from "@/components/search-modal";
import { SortSheet, SORT_LABELS, type SortOption } from "@/components/sort-sheet";
import { useStore } from "@/lib/store";
import { UNITS, type Unit } from "@/lib/fixtures";

// Discovery listings on the home view — units NOT in the demo result set
// so the demo flow stays clean.
const DISCOVERY_IDS = ["audley-studio", "post-chicago", "ascent-homes"];

export default function HomePage() {
  const router = useRouter();
  const { resetAll } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sort, setSort] = useState<SortOption>("distance");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    resetAll();
  }, [resetAll]);

  if (!mounted) return null;

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
          <SearchIcon />
          <span className="text-[16px] text-muted-foreground">
            Find your next place
          </span>
        </button>
      </div>

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
            <SortIcon />
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
            <NavItem icon="🏠" label="Home" active />
            <NavItem icon="🔍" label="Search" onClick={() => setModalOpen(true)} />
            <NavItem icon="👤" label="Profile" />
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

function ListingCard({ unit }: { unit: Unit }) {
  return (
    <div className="block bg-card border border-border rounded-3xl overflow-hidden">
      <div
        className={`h-48 bg-gradient-to-br ${unit.imageBg} flex items-end justify-end p-4`}
      >
        <span className="text-7xl opacity-60 drop-shadow-sm">{unit.image}</span>
      </div>
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
          <span>🛏 {unit.beds === 0 ? "Studio" : unit.beds}</span>
          <span>🛁 {unit.baths}</span>
          <span>⬚ {unit.sqft.toLocaleString()} ft²</span>
        </div>
      </div>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 px-4 py-1 ${
        active ? "text-foreground" : "text-muted-foreground"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function SortIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4v16M3 8l4-4 4 4M17 20V4M13 16l4 4 4-4" />
    </svg>
  );
}
