"use client";

import { useRef, useState, useEffect, useMemo } from "react";

type Props = {
  min: number;
  max: number;
  onChange: (v: { min: number; max: number }) => void;
  /** [absoluteMin, absoluteMax] of the slider track */
  range?: [number, number];
  /** Step size for quantizing values */
  step?: number;
  /** Minimum gap between thumbs */
  gap?: number;
  /** Number of histogram bars */
  buckets?: number;
};

export function PriceRangeSlider({
  min,
  max,
  onChange,
  range = [500, 5000],
  step = 50,
  gap = 100,
  buckets = 32,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<"min" | "max" | null>(null);
  const [activeThumb, setActiveThumb] = useState<"min" | "max" | null>(null);

  // Synthetic bell-curve distribution for the histogram
  const histogram = useMemo(() => {
    const peak = (range[0] + range[1]) / 2.4; // skew slightly toward lower prices
    const spread = (range[1] - range[0]) / 4;
    return Array.from({ length: buckets }, (_, i) => {
      const v = range[0] + (i + 0.5) * ((range[1] - range[0]) / buckets);
      const z = (v - peak) / spread;
      const base = Math.exp(-(z * z) / 2);
      // Add tiny variation so it doesn't look too perfect
      const wobble = 0.92 + ((i * 7) % 17) / 100;
      return Math.max(0.04, base * wobble);
    });
  }, [range, buckets]);

  const pct = (v: number) =>
    ((v - range[0]) / (range[1] - range[0])) * 100;

  const fromClientX = (clientX: number): number => {
    if (!trackRef.current) return min;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const raw = range[0] + ratio * (range[1] - range[0]);
    return Math.round(raw / step) * step;
  };

  const onPointerDown = (which: "min" | "max") => (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragging.current = which;
    setActiveThumb(which);
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const value = fromClientX(e.clientX);
      if (dragging.current === "min") {
        onChange({ min: Math.min(value, max - gap), max });
      } else {
        onChange({ min, max: Math.max(value, min + gap) });
      }
    };
    const onUp = () => {
      dragging.current = null;
      setActiveThumb(null);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [min, max, range, step, gap]);

  // Track-click: jump nearer thumb to position
  const onTrackPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).dataset.thumb) return; // ignore if hit a thumb
    const value = fromClientX(e.clientX);
    const distMin = Math.abs(value - min);
    const distMax = Math.abs(value - max);
    if (distMin <= distMax) {
      onChange({ min: Math.min(value, max - gap), max });
      dragging.current = "min";
      setActiveThumb("min");
    } else {
      onChange({ min, max: Math.max(value, min + gap) });
      dragging.current = "max";
      setActiveThumb("max");
    }
  };

  // Input handlers — sync from text fields
  const onMinInput = (v: string) => {
    const n = parseInt(v.replace(/[^0-9]/g, ""), 10);
    if (isNaN(n)) return;
    const clamped = Math.max(range[0], Math.min(n, max - gap));
    onChange({ min: clamped, max });
  };
  const onMaxInput = (v: string) => {
    const n = parseInt(v.replace(/[^0-9]/g, ""), 10);
    if (isNaN(n)) return;
    const clamped = Math.min(range[1], Math.max(n, min + gap));
    onChange({ min, max: clamped });
  };

  const fmt = (n: number) => `$${n.toLocaleString()}`;

  return (
    <div>
      {/* Histogram + slider area */}
      <div className="relative h-24 select-none">
        {/* Histogram bars */}
        <div className="absolute inset-x-0 bottom-4 top-0 flex items-end gap-[2px] pointer-events-none">
          {histogram.map((h, i) => {
            const bucketCenter =
              range[0] + (i + 0.5) * ((range[1] - range[0]) / buckets);
            const active = bucketCenter >= min && bucketCenter <= max;
            return (
              <div
                key={i}
                className="flex-1 rounded-t-sm transition-colors"
                style={{
                  height: `${h * 100}%`,
                  backgroundColor: active
                    ? "var(--primary)"
                    : "var(--muted-foreground)",
                  opacity: active ? 0.85 : 0.18,
                }}
              />
            );
          })}
        </div>

        {/* Track */}
        <div
          ref={trackRef}
          onPointerDown={onTrackPointerDown}
          className="absolute inset-x-0 bottom-3 h-1 rounded-full bg-border cursor-pointer"
        >
          {/* Filled portion between thumbs */}
          <div
            className="absolute h-full rounded-full bg-primary"
            style={{ left: `${pct(min)}%`, right: `${100 - pct(max)}%` }}
          />
          {/* Min thumb */}
          <button
            type="button"
            data-thumb="min"
            onPointerDown={onPointerDown("min")}
            aria-label="Minimum price"
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-card border-2 border-primary shadow-md touch-none transition-transform ${
              activeThumb === "min" ? "scale-110" : ""
            }`}
            style={{ left: `${pct(min)}%` }}
          />
          {/* Max thumb */}
          <button
            type="button"
            data-thumb="max"
            onPointerDown={onPointerDown("max")}
            aria-label="Maximum price"
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-card border-2 border-primary shadow-md touch-none transition-transform ${
              activeThumb === "max" ? "scale-110" : ""
            }`}
            style={{ left: `${pct(max)}%` }}
          />
        </div>
      </div>

      {/* Min / Max inputs */}
      <div className="mt-3 flex items-center gap-3">
        <PriceField label="Minimum" value={min} format={fmt} onChange={onMinInput} />
        <span className="text-muted-foreground">–</span>
        <PriceField label="Maximum" value={max} format={fmt} onChange={onMaxInput} />
      </div>
    </div>
  );
}

function PriceField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  format: (n: number) => string;
  onChange: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    if (!editing) setDraft(String(value));
  }, [value, editing]);

  return (
    <label className="flex-1 block border border-border rounded-xl px-3 py-2 bg-card">
      <span className="block text-[10px] text-muted-foreground smallcaps">
        {label}
      </span>
      <div className="flex items-baseline gap-0.5 mt-0.5">
        <span className="text-foreground text-[15px]">$</span>
        <input
          type="text"
          inputMode="numeric"
          value={editing ? draft : value.toLocaleString()}
          onFocus={() => {
            setEditing(true);
            setDraft(String(value));
          }}
          onBlur={() => {
            setEditing(false);
            onChange(draft);
          }}
          onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ""))}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          className="w-full bg-transparent text-[15px] focus:outline-none"
          aria-label={`${label} price`}
        />
      </div>
    </label>
  );
}
