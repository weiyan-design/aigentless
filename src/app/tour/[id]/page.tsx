"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Eye, ThumbsUp, ThumbsDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore, type CaptureValue } from "@/lib/store";
import { getUnit, MAPLE_HILL_CHECKLIST, DEMO_CAPTURE_FALLBACK } from "@/lib/fixtures";

type HandledItem = { id: string; label: string; preResolved: string };

export default function TourPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const unit = getUnit(id);
  const { captures, capture, resetCaptures, parse, showerVerified } = useStore();
  const [mounted, setMounted] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    setMounted(true);
    resetCaptures(id);
  }, [id, resetCaptures]);

  if (!unit) return notFound();
  if (!mounted) return null;

  const checklist = MAPLE_HILL_CHECKLIST;
  // Derive 'handled' from the user's actual must-haves so all checked-out
  // items show here, not just the walk-in shower.
  const handled: HandledItem[] = parse
    .filter(
      (d) =>
        d.status === "confirmed" ||
        (d.id === "shower" && showerVerified)
    )
    .map((d) => ({
      id: `handled-${d.id}`,
      label: d.label,
      preResolved:
        d.id === "shower" && showerVerified
          ? "Confirmed by Maple Hill mgmt"
          : "Confirmed from listing",
    }));
  const yours = checklist.filter((c) => c.group === "yours");
  const recommended = checklist.filter((c) => c.group === "recommended");
  const interactiveItems = [...yours, ...recommended];

  const unitCaptures = captures[id] ?? {};
  const capturedCount = interactiveItems.filter((i) => unitCaptures[i.id]).length;
  const allCaptured = capturedCount === interactiveItems.length;

  const onCapture = (itemId: string, value: CaptureValue) => {
    capture(id, itemId, value);
    const updated = { ...unitCaptures, [itemId]: value };
    const nextCount = interactiveItems.filter((i) => updated[i.id]).length;
    if (nextCount === interactiveItems.length) {
      // Fill in any "skips" with demo fallback so memory tells a complete story
      interactiveItems.forEach((i) => {
        const v = updated[i.id];
        if (v?.rating === "skip" && DEMO_CAPTURE_FALLBACK[i.id]) {
          capture(id, i.id, DEMO_CAPTURE_FALLBACK[i.id]);
        }
      });
      setTimeout(() => router.push(`/memory/${id}`), 350);
    }
  };

  return (
    <main className="min-h-dvh pb-32">
      <div className="px-5 pt-12">
        <button
          onClick={() => router.push(`/units/${id}`)}
          className="w-11 h-11 rounded-full bg-card border border-border flex items-center justify-center"
          aria-label="Back"
        >
          <BackIcon />
        </button>
      </div>

      <div className="px-5 mt-4">
        {!started ? (
          <>
            <h1 className="font-serif text-[32px] leading-tight">
              Your tour checklist
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {unit.name} · Tomorrow 6:00 PM
            </p>
            <p className="text-[15px] text-foreground/80 mt-4">
              Built from your must-haves.
            </p>
          </>
        ) : (
          <>
            <div className="text-xs text-muted-foreground">Tour: {unit.name}</div>
            <h1 className="font-serif text-[28px] leading-tight mt-1">
              {capturedCount} of {interactiveItems.length} checked
            </h1>
            <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width: `${(capturedCount / interactiveItems.length) * 100}%`,
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* Handled section */}
      {handled.length > 0 && (
        <section className="px-5 mt-7">
          <div className="smallcaps text-success-foreground inline-flex items-center gap-1.5 bg-success/30 px-2.5 py-1 rounded-full mb-3">
            <Check size={12} strokeWidth={2.25} />
            <span>Handled before your tour</span>
          </div>
          {handled.map((item) => (
            <div key={item.id} className="flex items-start gap-3 py-2">
              <span className="w-6 h-6 shrink-0 rounded-full bg-success/40 text-success-foreground flex items-center justify-center">
                <Check size={12} strokeWidth={2.25} />
              </span>
              <div>
                <div className="text-[15px] font-medium">{item.label}</div>
                {item.preResolved && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {item.preResolved}
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Your list */}
      <section className="px-5 mt-7">
        <div className="smallcaps text-accent-foreground inline-flex items-center gap-1.5 bg-accent/60 px-2.5 py-1 rounded-full mb-3">
          <Eye size={12} strokeWidth={2} />
          <span>On your list to check</span>
        </div>
        <div className="space-y-2">
          {yours.map((item) => (
            <ChecklistRow
              key={item.id}
              label={item.label}
              value={unitCaptures[item.id]}
              interactive={started}
              onCapture={(v) => onCapture(item.id, v)}
            />
          ))}
        </div>
      </section>

      {/* Recommended */}
      <section className="px-5 mt-7">
        <div className="smallcaps text-muted-foreground mb-3">
          We also recommend
        </div>
        <div className="space-y-2">
          {recommended.map((item) => (
            <ChecklistRow
              key={item.id}
              label={item.label}
              value={unitCaptures[item.id]}
              interactive={started}
              onCapture={(v) => onCapture(item.id, v)}
            />
          ))}
        </div>
      </section>

      {/* Sticky CTA pre-tour only */}
      {!started && (
        <div className="fixed bottom-0 left-0 right-0 z-20 pointer-events-none">
          <div className="phone-frame !min-h-0 pointer-events-auto">
            <div className="px-5 py-4 bg-gradient-to-t from-background via-background/95 to-transparent pt-8">
              <Button
                onClick={() => setStarted(true)}
                className="w-full h-14 text-base rounded-full"
              >
                I&rsquo;m here — start
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* When all captured, show finishing toast / spinner */}
      {started && allCaptured && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 text-sm text-muted-foreground z-30">
          Saving your notes…
        </div>
      )}
    </main>
  );
}

function ChecklistRow({
  label,
  value,
  interactive,
  onCapture,
}: {
  label: string;
  value: CaptureValue | undefined;
  interactive: boolean;
  onCapture: (v: CaptureValue) => void;
}) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");

  if (!interactive) {
    return (
      <div className="flex items-center gap-3 py-2.5">
        <span className="w-4 h-4 rounded-full border border-foreground/40" />
        <span className="text-[15px]">{label}</span>
      </div>
    );
  }

  if (value && value.rating !== "skip") {
    return (
      <div className="bg-card border border-border rounded-2xl px-4 py-3 sheet-backdrop-enter">
        <div className="flex items-center gap-2">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center ${
              value.rating === "up"
                ? "bg-success/40 text-success-foreground"
                : "bg-warn/50 text-warn-foreground"
            }`}
          >
            {value.rating === "up" ? (
              <ThumbsUp size={13} strokeWidth={1.75} />
            ) : (
              <ThumbsDown size={13} strokeWidth={1.75} />
            )}
          </span>
          <span className="text-[15px] flex-1">{label}</span>
        </div>
        {value.note && (
          <div className="mt-1 text-xs text-muted-foreground italic pl-7">
            “{value.note}”
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-[15px] flex-1 font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={() => onCapture({ rating: "up", note: note || undefined })}
          className="w-12 h-10 rounded-full bg-success/30 text-success-foreground flex items-center justify-center hover:bg-success/50 active:scale-95 transition-all"
          aria-label="Thumbs up"
        >
          <ThumbsUp size={18} strokeWidth={1.75} />
        </button>
        <button
          onClick={() => onCapture({ rating: "down", note: note || undefined })}
          className="w-12 h-10 rounded-full bg-warn/40 text-warn-foreground flex items-center justify-center hover:bg-warn/60 active:scale-95 transition-all"
          aria-label="Thumbs down"
        >
          <ThumbsDown size={18} strokeWidth={1.75} />
        </button>
        <button
          onClick={() => onCapture({ rating: "skip" })}
          className="px-3 h-10 rounded-full text-sm text-muted-foreground hover:bg-secondary"
        >
          skip
        </button>
        <button
          onClick={() => setNoteOpen((v) => !v)}
          className="ml-auto text-xs text-foreground/70 underline underline-offset-2 inline-flex items-center gap-0.5"
        >
          <Plus size={11} strokeWidth={2} /> note
        </button>
      </div>
      {noteOpen && (
        <input
          autoFocus
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="One-line note"
          className="mt-2 w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
        />
      )}
    </div>
  );
}

function BackIcon() {
  return <ArrowLeft size={18} strokeWidth={1.75} />;
}
