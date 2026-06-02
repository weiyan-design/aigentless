"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  ArrowUpDown,
  SearchX,
  Check,
  Info,
  Eye,
  Bed,
  Bath,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchModal } from "@/components/search-modal";
import { useStore } from "@/lib/store";
import { DEALBREAKER_ICONS } from "@/lib/icons";
import {
  STRETCHED_RESULT_IDS,
  STRETCH_AMOUNT,
  getUnit,
  type Unit,
} from "@/lib/fixtures";

const REQUIRED_BUDGET_FOR_RESULTS = 1900;

export default function ResultsPage() {
  const router = useRouter();
  const { location, budget, parse, setLayer1 } = useStore();
  const [mounted, setMounted] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const confirmedAndVerify = parse.filter(
    (d) => d.status === "confirmed" || d.status === "verify"
  );
  const inperson = parse.filter((d) => d.status === "inperson");

  // Budget-driven results: take the demo result set, filter by rent ≤ budget
  const matchingUnits: Unit[] = STRETCHED_RESULT_IDS.map(
    (id) => getUnit(id)!
  ).filter((u) => u.rent <= budget);
  const hasResults = matchingUnits.length > 0;

  return (
    <main className="min-h-dvh pb-8">
      {/* Header */}
      <div className="px-5 pt-12">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="w-11 h-11 rounded-full bg-card border border-border flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft size={18} strokeWidth={1.75} />
          </button>
          <div className="flex-1 bg-card border border-border rounded-full px-4 py-2.5 text-sm text-foreground flex items-center gap-2">
            <Search size={16} strokeWidth={1.75} className="text-muted-foreground" />
            <span>{location}</span>
          </div>
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

      {/* Must-haves strip — only when there are results */}
      {hasResults && (
        <div className="px-5 mt-4">
          <div className="bg-card border border-border rounded-2xl px-4 py-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="smallcaps text-muted-foreground">Must-haves</span>
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-foreground/70 underline underline-offset-2"
              >
                Edit
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {confirmedAndVerify.map((d) => {
                const Icon = DEALBREAKER_ICONS[d.id];
                return (
                  <span
                    key={d.id}
                    className="inline-flex items-center gap-1.5 text-xs bg-success/30 text-success-foreground px-2 py-1 rounded-full"
                  >
                    {Icon && <Icon size={12} strokeWidth={1.75} />}
                    <span>{d.label}</span>
                  </span>
                );
              })}
            </div>
            {inperson.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5 items-center">
                <Eye size={12} strokeWidth={1.75} className="text-muted-foreground" />
                {inperson.map((d, i) => (
                  <span key={d.id} className="text-xs text-muted-foreground">
                    {d.label}
                    {i < inperson.length - 1 ? "," : ""}
                  </span>
                ))}
                <span className="text-xs text-muted-foreground/70">
                  · check in person
                </span>
              </div>
            )}
          </div>
        </div>
      )}

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
    </main>
  );
}

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
          <div
            className={`h-52 bg-gradient-to-br ${u.imageBg} flex items-end justify-end p-4`}
          >
            <span className="text-7xl opacity-60 drop-shadow-sm">
              {u.image}
            </span>
          </div>
          <div className="p-4">
            <h3 className="font-serif text-[22px] leading-tight">{u.name}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {u.address}
            </p>
            <div className="flex items-center gap-4 text-sm text-foreground/80 mt-3">
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
              <span className="ml-auto font-medium">
                ${u.rent.toLocaleString()}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              <SuccessChip>Pet</SuccessChip>
              <SuccessChip>Laundry</SuccessChip>
              {u.matched.shower === true && <SuccessChip>Shower</SuccessChip>}
              {u.matched.shower === null && (
                <WarnChip>1 to verify</WarnChip>
              )}
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
