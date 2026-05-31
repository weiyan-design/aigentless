"use client";

import { useRouter } from "next/navigation";
import { BottomSheet } from "./bottom-sheet";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import type { Dealbreaker } from "@/lib/fixtures";

type Props = {
  open: boolean;
  onClose: () => void;
  /** When set, "Looks right" navigates to /results instead of just closing */
  navigateOnConfirm?: boolean;
};

export function ParseSheet({ open, onClose, navigateOnConfirm = false }: Props) {
  const router = useRouter();
  const parse = useStore((s) => s.parse);

  const confirmed = parse.filter((d) => d.status === "confirmed");
  const verify = parse.filter((d) => d.status === "verify");
  const inperson = parse.filter((d) => d.status === "inperson");

  const onConfirm = () => {
    onClose();
    if (navigateOnConfirm) {
      router.push("/results");
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose}>
      <h2 className="font-serif text-[28px] leading-tight">
        Here&rsquo;s our read on your must-haves
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Everything you said becomes a must-have. We&rsquo;ll tell you what we did about each.
      </p>

      <div className="mt-6 space-y-6">
        <ParseGroup
          label="Checked out"
          tint="success"
          icon="✓"
          items={confirmed}
        />
        <ParseGroup
          label="Verify before tour"
          tint="warn"
          icon="ⓘ"
          items={verify}
          caption="We'll email the agent to confirm before you tour."
        />
        <ParseGroup
          label="Check in person"
          tint="accent"
          icon="👁"
          items={inperson}
          caption="We'll add these to your tour checklist as reminders."
        />
      </div>

      <div className="mt-8 space-y-2">
        <Button className="w-full h-12 text-base rounded-full" onClick={onConfirm}>
          Looks right — search
        </Button>
        <Button
          variant="ghost"
          className="w-full h-12 text-base rounded-full"
          onClick={onClose}
        >
          Edit
        </Button>
      </div>
    </BottomSheet>
  );
}

function ParseGroup({
  label,
  tint,
  icon,
  items,
  caption,
}: {
  label: string;
  tint: "success" | "warn" | "accent";
  icon: string;
  items: Dealbreaker[];
  caption?: string;
}) {
  if (items.length === 0) return null;

  const tints = {
    success: "bg-success/30 text-success-foreground",
    warn: "bg-warn/40 text-warn-foreground",
    accent: "bg-accent/60 text-accent-foreground",
  } as const;

  return (
    <div>
      <div
        className={`smallcaps inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${tints[tint]}`}
      >
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <ul className="mt-3 space-y-1.5">
        {items.map((d) => (
          <li
            key={d.id}
            className="flex items-center gap-2 text-[15px] text-foreground"
          >
            <span>{d.icon}</span>
            <span>{d.label}</span>
          </li>
        ))}
      </ul>
      {caption && (
        <p className="mt-2 text-xs text-muted-foreground">{caption}</p>
      )}
    </div>
  );
}
