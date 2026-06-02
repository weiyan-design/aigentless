"use client";

import { BottomSheet } from "./bottom-sheet";

export type SortOption = "newest" | "distance" | "price-asc" | "price-desc";

export const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest",
  distance: "Distance",
  "price-asc": "Price (lowest first)",
  "price-desc": "Price (highest first)",
};

const ORDER: SortOption[] = ["newest", "distance", "price-asc", "price-desc"];

type Props = {
  open: boolean;
  onClose: () => void;
  value: SortOption;
  onChange: (v: SortOption) => void;
};

export function SortSheet({ open, onClose, value, onChange }: Props) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <h2 className="font-serif text-[24px] leading-tight">Sort by</h2>
      <div className="mt-4 -mx-2">
        {ORDER.map((opt) => {
          const active = opt === value;
          return (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-3.5 rounded-xl hover:bg-secondary text-left"
            >
              <span className={`text-[16px] ${active ? "font-medium" : ""}`}>
                {SORT_LABELS[opt]}
              </span>
              {active && <CheckIcon />}
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
