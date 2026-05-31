"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ParseSheet } from "@/components/parse-sheet";
import { useStore } from "@/lib/store";
import { DEMO_INPUT, LAYER1_DEFAULTS } from "@/lib/fixtures";

const MOVE_IN_PRESETS = ["Now–2 wks", "2 wks–1 mo", "1–2 mo", "2+ mo", "Custom"];
const MOVE_IN_RANGES: Record<string, string> = {
  "Now–2 wks": "May 30 – Jun 13, 2026",
  "2 wks–1 mo": "Jun 13 – Jun 30, 2026",
  "1–2 mo": "Sep 1 – Oct 15, 2026",
  "2+ mo": "Aug 1, 2026 onwards",
  Custom: "Pick dates",
};
const BUDGETS = [1500, 1800, 2000, 2500, 3000];
const BEDROOMS = ["Studio", "1", "2", "3", "4+"];

export default function IntakePage() {
  const {
    location,
    budget,
    bedrooms,
    moveIn,
    dealbreakerText,
    setLayer1,
    setDealbreaker,
    resetAll,
  } = useStore();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    resetAll();
  }, [resetAll]);

  if (!mounted) return null;

  const startListening = () => {
    if (listening) return;
    setListening(true);
    const text = DEMO_INPUT;
    setDealbreaker("");
    setTimeout(() => {
      let i = 0;
      const id = setInterval(() => {
        i += 3;
        setDealbreaker(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(id);
          setListening(false);
        }
      }, 35);
    }, 1100);
  };

  const onSearch = () => {
    if (dealbreakerText.trim().length > 0) {
      setSheetOpen(true);
    }
  };

  return (
    <main className="min-h-dvh px-5 pt-12 pb-8">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>aigentless</span>
        <span className="opacity-50">prototype</span>
      </div>

      <h1 className="font-serif text-[40px] leading-[1.05] mt-6 tracking-tight">
        Find your
        <br />
        next place.
      </h1>

      <div className="mt-10 space-y-7">
        <Field label="Where">
          <input
            type="text"
            value={location}
            onChange={(e) => setLayer1({ location: e.target.value })}
            className="w-full bg-card border border-border rounded-2xl px-4 py-3.5 text-[16px] focus:outline-none focus:ring-2 focus:ring-ring/40"
            placeholder="City"
          />
        </Field>

        <Field label="Max rent">
          <Segmented
            value={String(budget)}
            options={BUDGETS.map((b) => ({
              value: String(b),
              label: `$${b.toLocaleString()}`,
            }))}
            onChange={(v) => setLayer1({ budget: Number(v) })}
            wrap
          />
        </Field>

        <Field label="Bedrooms">
          <Segmented
            value={String(bedrooms)}
            options={BEDROOMS.map((b) => ({
              value: b === "Studio" ? "0" : b.replace("+", ""),
              label: b,
            }))}
            onChange={(v) => setLayer1({ bedrooms: Number(v) })}
          />
        </Field>

        <Field label="Move-in window">
          <Segmented
            value={moveIn}
            options={MOVE_IN_PRESETS.map((p) => ({ value: p, label: p }))}
            onChange={(v) => setLayer1({ moveIn: v })}
            wrap
          />
          <p className="mt-2 text-xs text-muted-foreground pl-1">
            → {MOVE_IN_RANGES[moveIn] ?? MOVE_IN_RANGES[LAYER1_DEFAULTS.moveIn]}
          </p>
        </Field>

        <div className="h-px bg-border my-2" />

        <div>
          <h2 className="font-serif text-[22px] leading-tight">
            Anything that would rule a place out?
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Optional, but we&rsquo;ll use it to protect your tour.
          </p>

          <div className="mt-4 relative">
            <Textarea
              value={dealbreakerText}
              onChange={(e) => setDealbreaker(e.target.value)}
              placeholder="e.g. dog has to be allowed, in-unit laundry, quiet"
              rows={5}
              className="bg-card text-[16px] leading-relaxed rounded-2xl pr-14 min-h-[140px]"
              disabled={listening}
            />
            <button
              type="button"
              onClick={startListening}
              aria-label="Capture voice"
              className={`absolute bottom-3 right-3 w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
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
              <div className="absolute -bottom-6 right-3 text-xs text-muted-foreground">
                Listening…
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={onSearch}
          disabled={dealbreakerText.trim().length === 0 || listening}
          className="w-full h-14 text-base rounded-full mt-8"
        >
          Search
        </Button>
      </div>

      <ParseSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        navigateOnConfirm
      />
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function Segmented({
  value,
  options,
  onChange,
  wrap = false,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  wrap?: boolean;
}) {
  return (
    <div className={`flex gap-2 ${wrap ? "flex-wrap" : ""}`}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-4 py-2.5 rounded-full text-sm transition-all border ${
              active
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:border-foreground/30"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function MicIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}
