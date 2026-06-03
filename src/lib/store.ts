"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { LAYER1_DEFAULTS, type Dealbreaker } from "./fixtures";

export type CaptureValue = { rating: "up" | "down" | "skip"; note?: string };

type AigentlessState = {
  // Layer 1
  location: string;
  budget: number;       // max (kept for compat with existing demo logic)
  budgetMin: number;    // min of price range
  bedrooms: number;
  bathrooms: number;
  moveIn: string;

  // Dealbreaker
  dealbreakerText: string;
  parse: Dealbreaker[];

  // Flow flags
  showerVerified: boolean;

  // Tour captures: { [unitId]: { [itemId]: CaptureValue } }
  captures: Record<string, Record<string, CaptureValue>>;

  // Past tours logged from the memory screen — ordered most recent first.
  // Each entry snapshots the parse at log time so the past-tour view can
  // still reconstruct the 'Handled before your tour' section even after
  // the live parse is cleared by a new search.
  pastTours: { unitId: string; toured: number; parse: Dealbreaker[] }[];

  // Actions
  setLayer1: (p: Partial<{ location: string; budget: number; budgetMin: number; bedrooms: number; bathrooms: number; moveIn: string }>) => void;
  setDealbreaker: (text: string) => void;
  setParse: (parse: Dealbreaker[]) => void;
  verifyShower: () => void;
  capture: (unitId: string, itemId: string, value: CaptureValue) => void;
  resetCaptures: (unitId: string) => void;
  logTour: (unitId: string) => void;
  resetAll: () => void;
};

const initial = {
  location: LAYER1_DEFAULTS.location,
  budget: LAYER1_DEFAULTS.budget,
  budgetMin: 1000,
  bedrooms: LAYER1_DEFAULTS.bedrooms,
  bathrooms: 1,
  moveIn: LAYER1_DEFAULTS.moveIn,
  dealbreakerText: "",
  parse: [] as Dealbreaker[],
  showerVerified: false,
  captures: {} as Record<string, Record<string, CaptureValue>>,
  pastTours: [] as { unitId: string; toured: number; parse: Dealbreaker[] }[],
};

export const useStore = create<AigentlessState>()(
  persist(
    (set) => ({
      ...initial,
      setLayer1: (p) => set((s) => ({ ...s, ...p })),
      setDealbreaker: (text) => set({ dealbreakerText: text }),
      setParse: (parse) => set({ parse }),
      verifyShower: () =>
        set((s) => ({
          showerVerified: true,
          parse: s.parse.map((d) =>
            d.id === "shower" ? { ...d, status: "confirmed" as const } : d
          ),
        })),
      capture: (unitId, itemId, value) =>
        set((s) => ({
          captures: {
            ...s.captures,
            [unitId]: { ...(s.captures[unitId] ?? {}), [itemId]: value },
          },
        })),
      resetCaptures: (unitId) =>
        set((s) => {
          const next = { ...s.captures };
          delete next[unitId];
          return { captures: next };
        }),
      logTour: (unitId) =>
        set((s) => {
          const filtered = s.pastTours.filter((t) => t.unitId !== unitId);
          return {
            pastTours: [
              { unitId, toured: Date.now(), parse: s.parse },
              ...filtered,
            ],
          };
        }),
      resetAll: () =>
        // Preserve past tours AND their captures across resets so revisiting
        // a logged tour shows what the user actually noticed
        set((s) => ({
          ...initial,
          pastTours: s.pastTours,
          captures: Object.fromEntries(
            s.pastTours.map((t) => [t.unitId, s.captures[t.unitId] ?? {}])
          ),
        })),
    }),
    {
      name: "aigentless-demo",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
