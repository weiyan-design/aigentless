"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Info, Mail, ShowerHead, Bed, Bath, Square } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmailSheet } from "@/components/email-sheet";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/toast";
import { DEALBREAKER_ICONS } from "@/lib/icons";
import { getUnit } from "@/lib/fixtures";

export default function UnitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const unit = getUnit(id);
  const { showerVerified, verifyShower, parse } = useStore();
  const showToast = useToast((s) => s.show);
  const [emailOpen, setEmailOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!unit) return notFound();
  if (!mounted) return null;

  const hasUnknownShower = unit.matched.shower === null;
  const showerStatus =
    !hasUnknownShower
      ? "confirmed"
      : showerVerified
      ? "verified"
      : "unknown";

  const onSendEmail = () => {
    setEmailOpen(false);
    showToast("Sent. Agent usually replies in under an hour.");
    setTimeout(() => {
      verifyShower();
    }, 3800);
  };

  return (
    <main className="min-h-dvh pb-32">
      {/* Header / back */}
      <div className="px-5 pt-12">
        <button
          onClick={() => router.push("/results")}
          className="w-11 h-11 rounded-full bg-card border border-border flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft size={18} strokeWidth={1.75} />
        </button>
      </div>

      {/* Hero */}
      <div
        className={`mt-4 mx-5 h-60 rounded-3xl bg-gradient-to-br ${unit.imageBg} flex items-end justify-end p-5`}
      >
        <span className="text-8xl opacity-60 drop-shadow-sm">{unit.image}</span>
      </div>

      {/* Info */}
      <div className="px-5 mt-5">
        <h1 className="font-serif text-[32px] leading-tight">{unit.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {unit.address} · {unit.city}
        </p>
        <p className="text-[15px] text-foreground/80 mt-2 inline-flex items-center gap-3 flex-wrap">
          <span className="font-medium">${unit.rent.toLocaleString()}/mo</span>
          <span className="inline-flex items-center gap-1">
            <Bed size={14} strokeWidth={1.75} />
            {unit.beds === 0 ? "Studio" : `${unit.beds} bd`}
          </span>
          <span className="inline-flex items-center gap-1">
            <Bath size={14} strokeWidth={1.75} />
            {unit.baths} ba
          </span>
          <span className="inline-flex items-center gap-1">
            <Square size={14} strokeWidth={1.75} />
            {unit.sqft} ft²
          </span>
        </p>
      </div>

      {/* Must-haves section */}
      <section className="px-5 mt-7">
        <div className="smallcaps text-muted-foreground mb-3">
          Your must-haves
        </div>

        <div className="space-y-3">
          {parse
            .filter((d) => d.id === "pet" || d.id === "laundry")
            .map((d) => {
              const Icon = DEALBREAKER_ICONS[d.id];
              return (
                <MustHaveRow
                  key={d.id}
                  Icon={Icon}
                  label={d.label}
                  status="confirmed"
                />
              );
            })}

          {/* Walk-in shower row */}
          <MustHaveRow
            Icon={ShowerHead}
            label="Walk-in shower"
            status={showerStatus}
            onVerifyClick={() => setEmailOpen(true)}
          />
        </div>
      </section>

      {/* Other details */}
      <section className="px-5 mt-7 space-y-3">
        <div className="bg-card border border-border rounded-2xl p-4">
          <h3 className="font-medium text-[15px]">About this place</h3>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Renovated 2024. Wood floors, large windows, modern kitchen with
            stainless appliances. Building amenities include shared rooftop and
            secure bike storage.
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <h3 className="font-medium text-[15px]">Neighborhood</h3>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Lincoln Park · 7-minute walk to brown line · Whole Foods 0.4 mi
          </p>
        </div>
      </section>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-20 pointer-events-none">
        <div className="phone-frame !min-h-0 pointer-events-auto">
          <div className="px-5 py-4 bg-gradient-to-t from-background via-background/95 to-transparent pt-8">
            <Button
              onClick={() => router.push(`/tour/${unit.id}`)}
              className="w-full h-14 text-base rounded-full"
            >
              Book a tour
            </Button>
          </div>
        </div>
      </div>

      <EmailSheet
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        unitName={unit.name}
        unitAddress={unit.address}
        attribute="Walk-in shower"
        onSend={onSendEmail}
      />
    </main>
  );
}

function MustHaveRow({
  Icon,
  label,
  status,
  onVerifyClick,
}: {
  Icon?: LucideIcon;
  label: string;
  status: "confirmed" | "unknown" | "verified";
  onVerifyClick?: () => void;
}) {
  if (status === "confirmed") {
    return (
      <div className="flex items-start gap-3">
        <span className="w-7 h-7 shrink-0 rounded-full bg-success/40 text-success-foreground flex items-center justify-center">
          <Check size={14} strokeWidth={2} />
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {Icon && <Icon size={16} strokeWidth={1.75} className="text-foreground/70" />}
            <span className="text-[15px] font-medium">{label}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Confirmed from listing
          </p>
        </div>
      </div>
    );
  }

  if (status === "verified") {
    return (
      <div className="flex items-start gap-3 sheet-backdrop-enter">
        <span className="w-7 h-7 shrink-0 rounded-full bg-success/40 text-success-foreground flex items-center justify-center">
          <Check size={14} strokeWidth={2} />
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {Icon && <Icon size={16} strokeWidth={1.75} className="text-foreground/70" />}
            <span className="text-[15px] font-medium">{label}</span>
          </div>
          <p className="text-xs text-success-foreground mt-0.5">
            Confirmed by Maple Hill mgmt, just now
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 bg-warn/30 border border-warn rounded-2xl p-3">
      <span className="w-7 h-7 shrink-0 rounded-full bg-warn text-warn-foreground flex items-center justify-center">
        <Info size={14} strokeWidth={2} />
      </span>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} strokeWidth={1.75} className="text-foreground/70" />}
          <span className="text-[15px] font-medium">{label}</span>
        </div>
        <p className="text-xs text-warn-foreground mt-0.5">
          Not in our database
        </p>
        <button
          onClick={onVerifyClick}
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium bg-card border border-border rounded-full px-3 py-1.5 hover:bg-secondary transition-colors"
        >
          <Mail size={14} strokeWidth={1.75} />
          Email agent to confirm
        </button>
      </div>
    </div>
  );
}
