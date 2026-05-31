"use client";

import { create } from "zustand";
import { useEffect } from "react";

type ToastState = {
  message: string | null;
  show: (msg: string) => void;
  hide: () => void;
};

export const useToast = create<ToastState>((set) => ({
  message: null,
  show: (msg) => {
    set({ message: msg });
  },
  hide: () => set({ message: null }),
}));

export function ToastHost() {
  const { message, hide } = useToast();

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => hide(), 3500);
    return () => clearTimeout(t);
  }, [message, hide]);

  if (!message) return null;
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-4 max-w-[calc(100%-2rem)] pointer-events-none">
      <div className="bg-primary text-primary-foreground rounded-full px-5 py-3 text-sm shadow-lg sheet-backdrop-enter">
        {message}
      </div>
    </div>
  );
}
