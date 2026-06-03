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

  // Actions
  setLayer1: (p: Partial<{ location: string; budget: number; budgetMin: number; bedrooms: number; bathrooms: number; moveIn: string }>) => void;
  setDealbreaker: (text: string) => void;
  setParse: (parse: Dealbreaker[]) => void;
  verifyShower: () => void;
  capture: (unitId: string, itemId: string, value: CaptureValue) => void;
  resetCaptures: (unitId: string) => void;
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
      resetAll: () => set({ ...initial }),
    }),
    {
      name: "aigentless-demo",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
