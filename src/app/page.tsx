"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SearchModal } from "@/components/search-modal";
import { useStore } from "@/lib/store";
import { UNITS } from "@/lib/fixtures";

// Discovery listings on the home view — units NOT in the demo result set
// so the demo flow stays clean.
const DISCOVERY_IDS = ["audley-studio", "post-chicago", "ascent-homes"];

export default function HomePage() {
  const router = useRouter();
  const { location, resetAll } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
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

        <h1 className="font-serif text-[32px] leading-[1.05] mt-5 tracking-tight">
          Find your next place
        </h1>

        {/* Search bar — full width, tap to open modal */}
        <button
          onClick={() => setModalOpen(true)}
          className="mt-5 w-full flex items-center gap-3 bg-card border border-border rounded-full px-4 py-3.5 text-left hover:border-foreground/20 transition-colors"
        >
          <SearchIcon />
          <span className={`text-[15px] flex-1 ${location ? "text-foreground" : "text-muted-foreground"}`}>
            {location || "Search city or neighborhood"}
          </span>
        </button>

        {/* Compact filter + sort row */}
        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={() => setModalOpen(true)}
            className="w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center"
            aria-label="Filter"
          >
            <FilterIcon />
          </button>
          <button className="inline-flex items-center gap-1.5 text-sm text-foreground/80">
            <SortIcon />
            Sort by price
          </button>
        </div>
      </div>

      <div className="h-px bg-border my-5 mx-5" />

      {/* Discovery listings */}
      <div className="px-5">
        <div className="text-xs text-muted-foreground mb-3">
          Recommended for you
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
            <NavItem icon="🔍" label="Search" />
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
    </main>
  );
}

function ListingCard({
  unit,
}: {
  unit: (typeof UNITS)[number];
}) {
  return (
    <div className="block bg-card border border-border rounded-3xl overflow-hidden">
      <div
        className={`h-48 bg-gradient-to-br ${unit.imageBg} flex items-end justify-end p-4`}
      >
        <span className="text-7xl opacity-60 drop-shadow-sm">{unit.image}</span>
      </div>
      <div className="p-4">
        <h3 className="font-serif text-[22px] leading-tight">{unit.name}</h3>
        <p className="text-sm text-muted-foreground mt-0.5">{unit.address}</p>
        <div className="flex items-center gap-4 text-sm text-foreground/80 mt-3">
          <span>🛏 {unit.beds === 0 ? "Studio" : unit.beds}</span>
          <span>🛁 {unit.baths}</span>
          <span>⬚ {unit.sqft} ft²</span>
          <span className="ml-auto font-medium">
            ${unit.rent.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <button
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

function FilterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="14" y2="6" />
      <line x1="18" y1="6" x2="20" y2="6" />
      <circle cx="16" cy="6" r="2" />
      <line x1="4" y1="12" x2="6" y2="12" />
      <line x1="10" y1="12" x2="20" y2="12" />
      <circle cx="8" cy="12" r="2" />
      <line x1="4" y1="18" x2="14" y2="18" />
      <line x1="18" y1="18" x2="20" y2="18" />
      <circle cx="16" cy="18" r="2" />
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
