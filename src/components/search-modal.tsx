"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MoveInPicker } from "@/components/move-in-picker";
import { PriceRangeSlider } from "@/components/price-range-slider";
import { useStore } from "@/lib/store";
import { DEMO_INPUT } from "@/lib/fixtures";

type SectionId = "where" | "when" | "beds" | "budget" | "deal";

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: "where", label: "Where" },
  { id: "when", label: "Move-in" },
  { id: "beds", label: "Beds & baths" },
  { id: "budget", label: "Budget" },
  { id: "deal", label: "Dealbreakers" },
];

// Typeahead source for the Where input
const CITY_DB = [
  "Austin, TX",
  "Boston, MA",
  "Brooklyn, NY",
  "Charlotte, NC",
  "Chicago, IL",
  "Dallas, TX",
  "Denver, CO",
  "Detroit, MI",
  "Houston, TX",
  "Los Angeles, CA",
  "Miami, FL",
  "Minneapolis, MN",
  "Nashville, TN",
  "New Orleans, LA",
  "New York, NY",
  "Newark, NJ",
  "Oakland, CA",
  "Orlando, FL",
  "Philadelphia, PA",
  "Phoenix, AZ",
  "Pittsburgh, PA",
  "Portland, OR",
  "Queens, NY",
  "Sacramento, CA",
  "San Antonio, TX",
  "San Diego, CA",
  "San Francisco, CA",
  "Seattle, WA",
  "Washington, DC",
];
const BED_OPTIONS = ["Studio", "1", "2", "3", "4+"];
const BATH_OPTIONS = ["1", "1.5", "2", "3", "4+"];

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

export function SearchModal({ open, onClose, onSubmit }: Props) {
  const {
    location,
    budget,
    budgetMin,
    bedrooms,
    bathrooms,
    moveIn,
    dealbreakerText,
    setLayer1,
    setDealbreaker,
  } = useStore();

  const [expanded, setExpanded] = useState<SectionId>("where");
  const [listening, setListening] = useState(false);

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      setExpanded("where");
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  if (!open || typeof window === "undefined") return null;

  const advance = (current: SectionId) => {
    const idx = SECTIONS.findIndex((s) => s.id === current);
    if (idx < SECTIONS.length - 1) setExpanded(SECTIONS[idx + 1].id);
  };

  const onSearch = () => {
    if (dealbreakerText.trim().length === 0) return;
    onSubmit();
  };

  const startListening = () => {
    if (listening) return;
    setListening(true);
    const text = DEMO_INPUT;
    setDealbreaker("");
    setTimeout(() => {
      let i = 0;
      const id = setInterval(() => {
        i += 4;
        setDealbreaker(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(id);
          setListening(false);
        }
      }, 30);
    }, 900);
  };

  const summary: Record<SectionId, string> = {
    where: location || "Add location",
    when: moveIn || "Add date",
    beds: `${bedrooms === 0 ? "Studio" : `${bedrooms} bd`} · ${bathrooms} ba`,
    budget: `$${budgetMin.toLocaleString()} – $${budget.toLocaleString()}`,
    deal: dealbreakerText
      ? dealbreakerText.slice(0, 32) + (dealbreakerText.length > 32 ? "…" : "")
      : "Optional — protect your tour",
  };

  return createPortal(
    <div className="fixed inset-0 z-50 bg-background flex flex-col sheet-backdrop-enter">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0">
        <button
          onClick={onClose}
          aria-label="Close"
          className="w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center"
        >
          <CloseIcon />
        </button>
        <div className="text-sm font-medium">Search</div>
        <div className="w-10" />
      </div>

      {/* Sections — fit in viewport, scroll only if absolutely needed */}
      <div className="flex-1 px-3 pb-3 flex flex-col gap-2 overflow-y-auto">
        {SECTIONS.map((s) => {
          const isOpen = expanded === s.id;
          return (
            <SectionCard
              key={s.id}
              id={s.id}
              label={s.label}
              summary={summary[s.id]}
              open={isOpen}
              onOpen={() => setExpanded(s.id)}
            >
              {s.id === "where" && (
                <WhereContent
                  value={location}
                  onChange={(v) => setLayer1({ location: v })}
                  onConfirm={() => advance("where")}
                />
              )}
              {s.id === "when" && (
                <MoveInPicker
                  value={moveIn}
                  onChange={(v) => setLayer1({ moveIn: v })}
                />
              )}
              {s.id === "beds" && (
                <BedsContent
                  beds={bedrooms}
                  baths={bathrooms}
                  onBeds={(b) => setLayer1({ bedrooms: b })}
                  onBaths={(b) => setLayer1({ bathrooms: b })}
                  onConfirm={() => advance("beds")}
                />
              )}
              {s.id === "budget" && (
                <PriceRangeSlider
                  min={budgetMin}
                  max={budget}
                  onChange={({ min, max }) =>
                    setLayer1({ budgetMin: min, budget: max })
                  }
                />
              )}
              {s.id === "deal" && (
                <DealContent
                  value={dealbreakerText}
                  onChange={setDealbreaker}
                  listening={listening}
                  onMic={startListening}
                />
              )}
            </SectionCard>
          );
        })}
      </div>

      {/* Sticky Search button */}
      <div className="px-5 pb-6 pt-3 shrink-0 bg-background border-t border-border">
        <Button
          onClick={onSearch}
          disabled={dealbreakerText.trim().length === 0 || listening}
          className="w-full h-13 text-base rounded-full"
        >
          <SearchIcon />
          <span className="ml-2">Search</span>
        </Button>
      </div>
    </div>,
    document.body
  );
}

function SectionCard({
  id,
  label,
  summary,
  open,
  onOpen,
  children,
}: {
  id: SectionId;
  label: string;
  summary: string;
  open: boolean;
  onOpen: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`bg-card border rounded-2xl transition-all ${
        open ? "border-foreground/30 shadow-sm" : "border-border"
      }`}
    >
      {!open ? (
        <button
          onClick={onOpen}
          className="w-full flex items-center justify-between px-4 py-3.5 text-left"
        >
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="text-[15px] font-medium truncate ml-3 text-foreground">
            {summary}
          </span>
        </button>
      ) : (
        <div className="px-4 pt-3 pb-4">
          <div className="text-sm text-muted-foreground mb-2">{label}</div>
          {children}
        </div>
      )}
    </div>
  );
}

function WhereContent({
  value,
  onChange,
  onConfirm,
}: {
  value: string;
  onChange: (v: string) => void;
  onConfirm: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const query = value.trim().toLowerCase();
  const matches =
    query.length > 0
      ? CITY_DB.filter((c) => c.toLowerCase().includes(query))
          .filter((c) => c.toLowerCase() !== value.toLowerCase())
          .slice(0, 4)
      : [];

  return (
    <div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="City or neighborhood"
        className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-ring/40"
      />
      {matches.length > 0 && (
        <ul className="mt-2 -mx-1">
          {matches.map((c) => (
            <li key={c}>
              <button
                onClick={() => {
                  onChange(c);
                  setTimeout(onConfirm, 180);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary text-left"
              >
                <span className="w-7 h-7 flex items-center justify-center rounded-md bg-secondary text-foreground/70">
                  <PinIcon />
                </span>
                <span className="text-[14px]">{c}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}


function BedsContent({
  beds,
  baths,
  onBeds,
  onBaths,
  onConfirm,
}: {
  beds: number;
  baths: number;
  onBeds: (n: number) => void;
  onBaths: (n: number) => void;
  onConfirm: () => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <div className="text-xs text-muted-foreground mb-1.5">Bedrooms</div>
        <div className="flex flex-wrap gap-1.5">
          {BED_OPTIONS.map((b) => {
            const num = b === "Studio" ? 0 : Number(b.replace("+", ""));
            const active = num === beds;
            return (
              <button
                key={b}
                onClick={() => onBeds(num)}
                className={`text-[13px] px-3 py-1.5 rounded-full border ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:border-foreground/30"
                }`}
              >
                {b}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <div className="text-xs text-muted-foreground mb-1.5">Bathrooms</div>
        <div className="flex flex-wrap gap-1.5">
          {BATH_OPTIONS.map((b) => {
            const num = Number(b.replace("+", ""));
            const active = num === baths;
            return (
              <button
                key={b}
                onClick={() => {
                  onBaths(num);
                  setTimeout(onConfirm, 180);
                }}
                className={`text-[13px] px-3 py-1.5 rounded-full border ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:border-foreground/30"
                }`}
              >
                {b}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DealContent({
  value,
  onChange,
  listening,
  onMic,
}: {
  value: string;
  onChange: (v: string) => void;
  listening: boolean;
  onMic: () => void;
}) {
  return (
    <div className="relative">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. dog has to be allowed, in-unit laundry, quiet"
        rows={3}
        disabled={listening}
        className="bg-background text-[15px] leading-relaxed rounded-xl pr-14 resize-none min-h-[88px]"
      />
      <button
        type="button"
        onClick={onMic}
        aria-label="Capture voice"
        className={`absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
          listening
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-foreground hover:bg-accent/60"
        }`}
      >
        <span className={`relative ${listening ? "mic-pulse" : ""}`}>
          <MicIcon />
        </span>
      </button>
      {listening && (
        <div className="absolute -bottom-5 right-3 text-xs text-muted-foreground">
          Listening…
        </div>
      )}
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}
