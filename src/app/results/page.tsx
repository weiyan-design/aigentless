"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SearchModal } from "@/components/search-modal";
import { useStore } from "@/lib/store";
import {
  STRETCHED_RESULT_IDS,
  STRETCHED_BUDGET,
  STRETCH_AMOUNT,
  getUnit,
} from "@/lib/fixtures";

export default function ResultsPage() {
  const router = useRouter();
  const { location, budget, budgetStretched, parse, stretchBudget } = useStore();
  const [mounted, setMounted] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const confirmedAndVerify = parse.filter(
    (d) => d.status === "confirmed" || d.status === "verify"
  );
  const inperson = parse.filter((d) => d.status === "inperson");

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
            <BackIcon />
          </button>
          <div className="flex-1 bg-card border border-border rounded-full px-4 py-2.5 text-sm text-foreground">
            🔍 <span className="ml-1.5">{location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-foreground">
            {budgetStretched ? (
              <>
                <span className="font-medium">3 floorplans</span>
                <span className="text-muted-foreground">
                  {" "}
                  · ${budget.toLocaleString()} max
                </span>
              </>
            ) : (
              <span className="font-medium">0 floorplans</span>
            )}
          </div>
          <button className="text-sm text-foreground/70 inline-flex items-center gap-1">
            <SortIcon />
            Sort by price
          </button>
        </div>
      </div>

      {/* Must-haves strip — only in results state */}
      {budgetStretched && (
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
              {confirmedAndVerify.map((d) => (
                <span
                  key={d.id}
                  className="inline-flex items-center gap-1 text-xs bg-success/30 text-success-foreground px-2 py-1 rounded-full"
                >
                  <span>{d.icon}</span>
                  <span>{d.label}</span>
                </span>
              ))}
            </div>
            {inperson.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5 items-center">
                <span className="text-xs text-muted-foreground">👁</span>
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
      {!budgetStretched ? (
        <ZeroResults
          budget={budget}
          onStretch={() => {
            stretchBudget();
          }}
        />
      ) : (
        <ResultsList />
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
}: {
  budget: number;
  onStretch: () => void;
}) {
  return (
    <div className="px-5">
      <div className="flex flex-col items-center text-center mt-10">
        <div className="w-28 h-28 rounded-full bg-secondary flex items-center justify-center text-5xl">
          📖
        </div>
        <h2 className="font-serif text-[26px] leading-tight mt-6 max-w-xs">
          Nothing matches in your budget — yet
        </h2>
      </div>

      <div className="mt-8 bg-card border border-border rounded-3xl p-5 shadow-sm">
        <p className="text-[15px] leading-relaxed">
          Stretch your budget by{" "}
          <span className="font-medium">${STRETCH_AMOUNT}/mo</span> and{" "}
          <span className="font-medium">3 places</span> match all your must-haves.
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <Chip tone="success">✓ Pet-friendly</Chip>
          <Chip tone="success">✓ In-unit laundry</Chip>
          <Chip tone="success">✓ Walk-in shower</Chip>
        </div>

        <div className="mt-3 text-xs text-muted-foreground italic">
          → Your must-haves stay protected
        </div>

        <Button
          onClick={onStretch}
          className="w-full h-12 text-base rounded-full mt-5"
        >
          See 3 units at ${STRETCHED_BUDGET.toLocaleString()}
        </Button>
      </div>

      <div className="text-center mt-5">
        <button className="text-sm text-foreground/70 underline underline-offset-2">
          Or edit your search
        </button>
      </div>

      <div className="text-center mt-6 text-xs text-muted-foreground">
        Budget shown: ${budget.toLocaleString()}/mo
      </div>
    </div>
  );
}

function ResultsList() {
  return (
    <div className="px-5 space-y-4">
      {STRETCHED_RESULT_IDS.map((id) => {
        const u = getUnit(id);
        if (!u) return null;
        return (
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
                <span>🛏 {u.beds === 0 ? "Studio" : u.beds}</span>
                <span>🛁 {u.baths}</span>
                <span>⬚ {u.sqft} ft²</span>
                <span className="ml-auto font-medium">
                  ${u.rent.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                <Chip tone="success">✓ Pet</Chip>
                <Chip tone="success">✓ Laundry</Chip>
                {u.matched.shower === true && <Chip tone="success">✓ Shower</Chip>}
                {u.matched.shower === null && (
                  <Chip tone="warn">ⓘ 1 to verify</Chip>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function Chip({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "success" | "warn" | "neutral";
}) {
  const tones = {
    success: "bg-success/30 text-success-foreground",
    warn: "bg-warn/50 text-warn-foreground",
    neutral: "bg-secondary text-foreground",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${tones[tone]}`}>
      {children}
    </span>
  );
}

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
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
