"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpDown,
  SearchX,
  Check,
  Info,
  Bed,
  Bath,
  Square,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchModal } from "@/components/search-modal";
import { FilterSheet } from "@/components/filter-sheet";
import { useStore } from "@/lib/store";
import {
  STRETCHED_RESULT_IDS,
  STRETCH_AMOUNT,
  getUnit,
  type Unit,
} from "@/lib/fixtures";

const REQUIRED_BUDGET_FOR_RESULTS = 1900;

export default function ResultsPage() {
  const router = useRouter();
  const { location, budget, bedrooms, bathrooms, moveIn, parse, setLayer1 } =
    useStore();
  const [mounted, setMounted] = useState(false);
  const [editing, setEditing] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // Budget-driven results: take the demo result set, filter by rent ≤ budget
  const matchingUnits: Unit[] = STRETCHED_RESULT_IDS.map(
    (id) => getUnit(id)!
  ).filter((u) => u.rent <= budget);
  const hasResults = matchingUnits.length > 0;

  return (
    <main className="min-h-dvh pb-8">
      {/* Header */}
      <div className="px-5 pt-12">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/")}
            className="w-11 h-11 flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft size={20} strokeWidth={1.75} />
          </button>
          <button
            onClick={() => setEditing(true)}
            className="flex-1 bg-card border border-border rounded-2xl px-4 py-2.5 text-center hover:border-foreground/20 transition-colors"
          >
            <div className="text-[15px] font-medium leading-tight">
              Home in {location || "—"}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5 leading-tight">
              {[
                moveIn ? shortDate(moveIn) : null,
                `${bedrooms === 0 ? "Studio" : `${bedrooms} bed`}`,
                `${bathrooms} bath`,
                parse.length > 0
                  ? `${parse.length} must-have${parse.length === 1 ? "" : "s"}`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </div>
          </button>
          <button
            onClick={() => setFilterOpen(true)}
            className="w-11 h-11 flex items-center justify-center"
            aria-label="Filter"
          >
            <SlidersHorizontal size={20} strokeWidth={1.75} />
          </button>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-foreground">
            <span className="font-medium">
              {matchingUnits.length} floorplan{matchingUnits.length === 1 ? "" : "s"}
            </span>
            <span className="text-muted-foreground">
              {" "}· ${budget.toLocaleString()} max
            </span>
          </div>
          <button className="text-sm text-foreground/70 inline-flex items-center gap-1.5">
            <ArrowUpDown size={14} strokeWidth={1.75} />
            Sort by price
          </button>
        </div>
      </div>

      <div className="h-px bg-border my-5 mx-5" />

      {/* States */}
      {!hasResults ? (
        <ZeroResults
          budget={budget}
          onStretch={() => setLayer1({ budget: REQUIRED_BUDGET_FOR_RESULTS })}
          onEditSearch={() => setEditing(true)}
        />
      ) : (
        <ResultsList units={matchingUnits} />
      )}

      <SearchModal
        open={editing}
        onClose={() => setEditing(false)}
        onSubmit={() => setEditing(false)}
      />
      <FilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        matchingCount={matchingUnits.length}
      />
    </main>
  );
}

// Take a moveIn display string from store ("Jun 15, 2026" or "Aug 2026")
// and condense to "6/15" or "Aug" for the header pill.
function shortDate(s: string): string {
  // "Jun 15, 2026" → "6/15"
  const dayMatch = s.match(/^([A-Z][a-z]{2}) (\d{1,2}),/);
  if (dayMatch) {
    const m = MONTHS_SHORT.indexOf(dayMatch[1]) + 1;
    return `${m}/${dayMatch[2]}`;
  }
  // "Jun 15–Jul 1, 2026" → "6/15–7/1"
  const rangeMatch = s.match(/^([A-Z][a-z]{2}) (\d{1,2})[–-](\d{1,2}),/);
  if (rangeMatch) {
    const m = MONTHS_SHORT.indexOf(rangeMatch[1]) + 1;
    return `${m}/${rangeMatch[2]}–${rangeMatch[3]}`;
  }
  // Otherwise just return as-is (e.g. "Aug 2026", "Within 1 month")
  return s;
}

const MONTHS_SHORT = [
  "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",
];

function ZeroResults({
  budget,
  onStretch,
  onEditSearch,
}: {
  budget: number;
  onStretch: () => void;
  onEditSearch: () => void;
}) {
  const gap = Math.max(0, REQUIRED_BUDGET_FOR_RESULTS - budget);
  const stretchAmount = gap > 0 ? gap : STRETCH_AMOUNT;
  return (
    <div className="px-5">
      <div className="flex flex-col items-center text-center mt-10">
        <div className="w-28 h-28 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
          <SearchX size={44} strokeWidth={1.5} />
        </div>
        <h2 className="font-serif text-[26px] leading-tight mt-6 max-w-xs">
          Nothing matches in your budget — yet
        </h2>
      </div>

      <div className="mt-8 bg-card border border-border rounded-3xl p-5 shadow-sm">
        <p className="text-[15px] leading-relaxed">
          Stretch your budget by{" "}
          <span className="font-medium">${stretchAmount}/mo</span> and{" "}
          <span className="font-medium">3 places</span> match all your must-haves.
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <SuccessChip>Pet-friendly</SuccessChip>
          <SuccessChip>In-unit laundry</SuccessChip>
          <SuccessChip>Walk-in shower</SuccessChip>
        </div>

        <div className="mt-3 text-xs text-muted-foreground italic">
          → Your must-haves stay protected
        </div>

        <Button
          onClick={onStretch}
          className="w-full h-12 text-base rounded-full mt-5"
        >
          See 3 units at ${REQUIRED_BUDGET_FOR_RESULTS.toLocaleString()}
        </Button>
      </div>

      <div className="text-center mt-5">
        <button
          onClick={onEditSearch}
          className="text-sm text-foreground/70 underline underline-offset-2"
        >
          Or edit your search
        </button>
      </div>

      <div className="text-center mt-6 text-xs text-muted-foreground">
        Budget shown: ${budget.toLocaleString()}/mo
      </div>
    </div>
  );
}

function ResultsList({ units }: { units: Unit[] }) {
  return (
    <div className="px-5 space-y-4">
      {units.map((u) => (
        <Link
          key={u.id}
          href={`/units/${u.id}`}
          className="block bg-card border border-border rounded-3xl overflow-hidden active:scale-[0.99] transition-transform"
        >
          <img
            src={u.coverImage}
            alt={u.name}
            className="w-full h-48 object-cover bg-secondary"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${u.id}/900/600`;
            }}
          />
          <div className="px-4 py-4 space-y-1.5">
            {/* Row 1 — price range + available date */}
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-serif text-[22px] leading-tight">
                ${u.rent.toLocaleString()}–${u.rentMax.toLocaleString()}
                <span className="text-sm text-muted-foreground font-sans font-normal">
                  /mo
                </span>
              </span>
              <span className="text-[15px] font-medium text-foreground/80 whitespace-nowrap">
                Available {u.availableDate}
              </span>
            </div>
            {/* Row 2 — address */}
            <p className="text-sm text-muted-foreground">{u.address}</p>
            {/* Row 3 — specs */}
            <div className="flex items-center gap-4 text-sm text-foreground/80 pt-0.5">
              <span className="inline-flex items-center gap-1">
                <Bed size={14} strokeWidth={1.75} />
                {u.beds === 0 ? "Studio" : u.beds}
              </span>
              <span className="inline-flex items-center gap-1">
                <Bath size={14} strokeWidth={1.75} />
                {u.baths}
              </span>
              <span className="inline-flex items-center gap-1">
                <Square size={14} strokeWidth={1.75} />
                {u.sqft.toLocaleString()} ft²
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function SuccessChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-success/30 text-success-foreground">
      <Check size={12} strokeWidth={2} />
      {children}
    </span>
  );
}

function WarnChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-warn/50 text-warn-foreground">
      <Info size={12} strokeWidth={2} />
      {children}
    </span>
  );
}
