"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { UNIT_FEATURES, COMMUNITY_AMENITIES } from "@/lib/fixtures";

type Props = {
  open: boolean;
  onClose: () => void;
  matchingCount: number;
};

type Selection = {
  label: string;
  /** true = must-have (rules places out); false = nice-to-have (ranks only) */
  mustHave: boolean;
  /** whether this came from the search-bar parse */
  fromSearch: boolean;
};

const PREVIEW_COUNT = 5;

// Selections live in a Map to preserve insertion order — toggling a row's
// must-have state should NOT reorder the list. Sorting only happens when
// the sheet is initially seeded.
export function FilterSheet({ open, onClose, matchingCount }: Props) {
  const parse = useStore((s) => s.parse);
  const [selections, setSelections] = useState<Map<string, Selection>>(
    () => new Map()
  );
  const [unitExpanded, setUnitExpanded] = useState(false);
  const [amenitiesExpanded, setAmenitiesExpanded] = useState(false);

  // Seed selections from the dealbreaker parse whenever the sheet opens.
  // Search-bar items default to must-have = true. Order: search-bar items
  // first (in parse order), then any non-search picks already chosen.
  useEffect(() => {
    if (!open) return;
    setSelections((prev) => {
      const next = new Map<string, Selection>();
      parse.forEach((d) => {
        next.set(d.label, {
          label: d.label,
          mustHave: true,
          fromSearch: true,
        });
      });
      prev.forEach((s, label) => {
        if (!s.fromSearch && !next.has(label)) next.set(label, s);
      });
      return next;
    });
  }, [open, parse]);

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

  const toggleSelect = (label: string) => {
    setSelections((prev) => {
      const next = new Map(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        // Newly selected items go to the end of the list with must-have OFF
        next.set(label, { label, mustHave: false, fromSearch: false });
      }
      return next;
    });
  };

  const setMustHave = (label: string, mustHave: boolean) => {
    setSelections((prev) => {
      const next = new Map(prev);
      const cur = next.get(label);
      if (cur) next.set(label, { ...cur, mustHave });
      return next;
    });
  };

  const removeSelection = (label: string) => {
    setSelections((prev) => {
      const next = new Map(prev);
      next.delete(label);
      return next;
    });
  };

  const clearAll = () => setSelections(new Map());

  // No sort — preserves insertion order so toggling never reshuffles rows.
  const selectionList = Array.from(selections.values());

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
        {/* Selected (with per-row must-have toggle) */}
        <section className="mt-2">
          <h3 className="font-serif text-[20px] leading-tight mb-2">
            Your filters
          </h3>
          <p className="text-xs text-muted-foreground italic">
            Must-haves rule places out. Nice-to-haves boost ranking but
            won&rsquo;t filter results.
          </p>
          {selectionList.length > 0 ? (
            <div className="mt-3 space-y-2">
              {selectionList.map((s) => (
                <SelectionRow
                  key={s.label}
                  selection={s}
                  onToggleMustHave={(v) => setMustHave(s.label, v)}
                  onRemove={() => removeSelection(s.label)}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground mt-3 italic">
              Nothing selected yet. Pick from below.
            </p>
          )}
        </section>

        <div className="h-px bg-border my-5" />

        {/* Unit features */}
        <ExpandableList
          title="Unit features"
          items={UNIT_FEATURES}
          isSelected={(l) => selections.has(l)}
          onToggle={toggleSelect}
          expanded={unitExpanded}
          onExpandToggle={() => setUnitExpanded((v) => !v)}
        />

        <div className="h-px bg-border my-5" />

        {/* Community amenities */}
        <ExpandableList
          title="Community amenities"
          items={COMMUNITY_AMENITIES}
          isSelected={(l) => selections.has(l)}
          onToggle={toggleSelect}
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

function SelectionRow({
  selection,
  onToggleMustHave,
  onRemove,
}: {
  selection: Selection;
  onToggleMustHave: (v: boolean) => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-2xl border px-3 py-2.5 transition-colors ${
        selection.mustHave
          ? "bg-success/15 border-success/40"
          : "bg-card border-border"
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={onRemove}
          aria-label={`Remove ${selection.label}`}
          className="w-5 h-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground"
        >
          <X size={12} strokeWidth={2} />
        </button>
        <span className="text-[15px] truncate">{selection.label}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-muted-foreground">Must-have</span>
        <Toggle value={selection.mustHave} onChange={onToggleMustHave} />
      </div>
    </div>
  );
}

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        value ? "bg-success" : "bg-muted"
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow flex items-center justify-center transition-transform ${
          value ? "translate-x-5" : "translate-x-0.5"
        }`}
      >
        {value && (
          <Check
            size={11}
            strokeWidth={2.5}
            className="text-success-foreground"
          />
        )}
      </span>
    </button>
  );
}

function ExpandableList({
  title,
  items,
  isSelected,
  onToggle,
  expanded,
  onExpandToggle,
}: {
  title: string;
  items: string[];
  isSelected: (label: string) => boolean;
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
          const active = isSelected(label);
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
