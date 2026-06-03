"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import confetti from "canvas-confetti";
import { ArrowLeft, ThumbsUp, ThumbsDown, Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { getUnit, MAPLE_HILL_CHECKLIST } from "@/lib/fixtures";

export default function MemoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const unit = getUnit(id);
  const captures = useStore((s) => s.captures[id] ?? {});
  const parse = useStore((s) => s.parse);
  const showerVerified = useStore((s) => s.showerVerified);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    // Subtle confetti burst from the top, brand-toned
    const fire = (opts: confetti.Options) =>
      confetti({
        particleCount: 18,
        spread: 70,
        startVelocity: 28,
        gravity: 1.1,
        ticks: 180,
        scalar: 0.85,
        origin: { x: 0.5, y: 0.18 },
        colors: ["#1a2b5c", "#c8a577", "#7d8a64", "#e8d9b8", "#f5f1ea"],
        ...opts,
      });
    fire({});
    setTimeout(() => fire({ angle: 60, origin: { x: 0.15, y: 0.2 } }), 180);
    setTimeout(() => fire({ angle: 120, origin: { x: 0.85, y: 0.2 } }), 320);
  }, [mounted]);

  if (!unit) return notFound();
  if (!mounted) return null;

  // Derive handled list from user's confirmed must-haves (matches the tour page)
  const handled = parse
    .filter(
      (d) =>
        d.status === "confirmed" || (d.id === "shower" && showerVerified)
    )
    .map((d) => ({
      id: `handled-${d.id}`,
      label: d.label,
      preResolved:
        d.id === "shower" && showerVerified
          ? "Confirmed by Maple Hill mgmt"
          : "Confirmed from listing",
    }));
  const yours = MAPLE_HILL_CHECKLIST.filter((c) => c.group === "yours");
  const recommended = MAPLE_HILL_CHECKLIST.filter(
    (c) => c.group === "recommended"
  );

  return (
    <main className="min-h-dvh pb-12">
      <div className="px-5 pt-12">
        <button
          onClick={() => router.push(`/results`)}
          className="w-11 h-11 rounded-full bg-card border border-border flex items-center justify-center"
          aria-label="Back"
        >
          <BackIcon />
        </button>
      </div>

      <div className="px-5 mt-5">
        <h1 className="font-serif text-[32px] leading-tight">
          Saved to your tour log
        </h1>
      </div>

      {/* Unit card */}
      <div className="px-5 mt-6">
        <div className="bg-card border border-border rounded-3xl overflow-hidden flex items-center gap-4 p-3 sheet-backdrop-enter">
          <div
            className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${unit.imageBg} flex items-center justify-center text-4xl shrink-0`}
          >
            <span className="opacity-70">{unit.image}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-serif text-[22px] leading-tight">{unit.name}</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Toured today, {formatTime()}
            </p>
          </div>
        </div>
      </div>

      {/* Captures */}
      <div className="px-5 mt-8">
        <div className="smallcaps text-muted-foreground mb-3">
          What you noticed
        </div>
        <div className="space-y-2.5">
          {/* Handled / pre-resolved */}
          {handled.map((c) => (
            <CaptureRow
              key={c.id}
              rating="confirmed"
              label={c.label}
              note={c.preResolved}
            />
          ))}
          {/* Yours */}
          {yours.map((c) => {
            const v = captures[c.id];
            if (!v) return null;
            return (
              <CaptureRow
                key={c.id}
                rating={v.rating === "skip" ? "skipped" : v.rating}
                label={c.label}
                note={v.note}
                accent
              />
            );
          })}
          {/* Recommended */}
          {recommended.map((c) => {
            const v = captures[c.id];
            if (!v) return null;
            return (
              <CaptureRow
                key={c.id}
                rating={v.rating === "skip" ? "skipped" : v.rating}
                label={c.label}
                note={v.note}
              />
            );
          })}
        </div>
      </div>

      {/* System message */}
      <div className="px-5 mt-8">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Next time you compare units, we&rsquo;ll surface what you cared about
          and what fell short.
        </p>
      </div>

      {/* CTAs */}
      <div className="px-5 mt-8 space-y-2">
        <Button
          onClick={() => router.push(`/results`)}
          className="w-full h-12 text-base rounded-full"
        >
          Back to results
        </Button>
        <Button
          variant="ghost"
          onClick={() => {}}
          className="w-full h-12 text-base rounded-full"
        >
          Compare tours
        </Button>
      </div>
    </main>
  );
}

function CaptureRow({
  rating,
  label,
  note,
  accent = false,
}: {
  rating: "up" | "down" | "skipped" | "confirmed";
  label: string;
  note?: string;
  accent?: boolean;
}) {
  const Icon =
    rating === "up"
      ? ThumbsUp
      : rating === "down"
      ? ThumbsDown
      : rating === "confirmed"
      ? Check
      : Minus;

  return (
    <div
      className={`flex items-start gap-3 ${
        accent ? "bg-accent/20 border border-accent/50" : "bg-card border border-border"
      } rounded-2xl px-4 py-3`}
    >
      <span
        className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center ${
          rating === "up" || rating === "confirmed"
            ? "bg-success/40 text-success-foreground"
            : rating === "down"
            ? "bg-warn/50 text-warn-foreground"
            : "bg-secondary text-muted-foreground"
        }`}
      >
        <Icon size={14} strokeWidth={rating === "confirmed" ? 2.25 : 1.75} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-medium">{label}</div>
        {note && (
          <div className="text-xs text-muted-foreground mt-0.5 italic">
            {rating === "confirmed" ? note : `“${note}”`}
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime() {
  const now = new Date();
  const hours = now.getHours();
  const mins = now.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${h12}:${mins} ${ampm}`;
}

function BackIcon() {
  return <ArrowLeft size={18} strokeWidth={1.75} />;
}
