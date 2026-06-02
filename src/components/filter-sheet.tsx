"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UNIT_FEATURES, COMMUNITY_AMENITIES } from "@/lib/fixtures";

type Props = {
  open: boolean;
  onClose: () => void;
  matchingCount: number;
};

const PREVIEW_COUNT = 5;

export function FilterSheet({
  open,
  onClose,
  matchingCount,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [unitExpanded, setUnitExpanded] = useState(false);
  const [amenitiesExpanded, setAmenitiesExpanded] = useState(false);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  if (!open || typeof window === "undefined") return null;

  const niceToHaves = [...selected];

  const toggle = (label: string) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const clearAll = () => setSelected(new Set());

  return createPortal(
    <div className="fixed inset-0 z-50 bg-background flex flex-col sheet-backdrop-enter">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
        <div className="text-sm font-medium">Filters</div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="w-10 h-10 flex items-center justify-center"
        >
          <X size={18} strokeWidth={1.75} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 pb-5">
        {/* Nice-to-haves */}
        <section className="mt-2">
          <h3 className="font-serif text-[20px] leading-tight mb-3">
            Nice-to-haves
          </h3>
          {niceToHaves.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {niceToHaves.map((label) => (
                <button
                  key={label}
                  onClick={() => toggle(label)}
                  className="inline-flex items-center gap-1.5 text-xs bg-accent/40 text-accent-foreground px-2.5 py-1.5 rounded-full hover:bg-accent/60"
                >
                  {label}
                  <X size={11} strokeWidth={2} />
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              Pick what would make a place better — they&rsquo;ll boost
              ranking but won&rsquo;t rule places out.
            </p>
          )}
        </section>

        <div className="h-px bg-border my-5" />

        {/* Unit features */}
        <ExpandableList
          title="Unit features"
          items={UNIT_FEATURES}
          selected={selected}
          onToggle={toggle}
          expanded={unitExpanded}
          onExpandToggle={() => setUnitExpanded((v) => !v)}
        />

        <div className="h-px bg-border my-5" />

        {/* Community amenities */}
        <ExpandableList
          title="Community amenities"
          items={COMMUNITY_AMENITIES}
          selected={selected}
          onToggle={toggle}
          expanded={amenitiesExpanded}
          onExpandToggle={() => setAmenitiesExpanded((v) => !v)}
        />
      </div>

      {/* Footer */}
      <div className="px-5 pb-6 pt-3 shrink-0 bg-background border-t border-border flex items-center justify-between gap-4">
        <button
          onClick={clearAll}
          className="text-[15px] underline underline-offset-4 text-foreground"
        >
          Clear all
        </button>
        <Button onClick={onClose} className="px-6 h-12 rounded-full">
          Show {matchingCount} place{matchingCount === 1 ? "" : "s"}
        </Button>
      </div>
    </div>,
    document.body
  );
}

function ExpandableList({
  title,
  items,
  selected,
  onToggle,
  expanded,
  onExpandToggle,
}: {
  title: string;
  items: string[];
  selected: Set<string>;
  onToggle: (label: string) => void;
  expanded: boolean;
  onExpandToggle: () => void;
}) {
  const visible = expanded ? items : items.slice(0, PREVIEW_COUNT);
  return (
    <section>
      <h3 className="font-serif text-[20px] leading-tight mb-3">{title}</h3>
      <div className="flex flex-wrap gap-1.5">
        {visible.map((label) => {
          const active = selected.has(label);
          return (
            <button
              key={label}
              onClick={() => onToggle(label)}
              className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border ${
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border hover:border-foreground/30"
              }`}
            >
              {active && <Check size={11} strokeWidth={2.25} />}
              {label}
            </button>
          );
        })}
      </div>
      {items.length > PREVIEW_COUNT && (
        <button
          onClick={onExpandToggle}
          className="mt-3 inline-flex items-center gap-1 text-xs text-foreground/80 underline underline-offset-2"
        >
          {expanded ? "Show less" : `Show all ${items.length}`}
          <ChevronDown
            size={12}
            strokeWidth={2}
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </section>
  );
}
