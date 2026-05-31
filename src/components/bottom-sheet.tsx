"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Optional max-height; defaults to 88dvh */
  maxHeight?: string;
};

export function BottomSheet({ open, onClose, children, maxHeight = "88dvh" }: Props) {
  const startY = useRef<number | null>(null);
  const translateY = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;
  if (typeof window === "undefined") return null;

  const onTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current == null || !sheetRef.current) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) {
      translateY.current = delta;
      sheetRef.current.style.transform = `translateY(${delta}px)`;
    }
  };
  const onTouchEnd = () => {
    if (!sheetRef.current) return;
    if (translateY.current > 120) {
      onClose();
    } else {
      sheetRef.current.style.transform = "";
    }
    startY.current = null;
    translateY.current = 0;
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 sheet-backdrop-enter"
      />
      <div
        ref={sheetRef}
        className="relative bg-background rounded-t-3xl shadow-xl sheet-enter overflow-y-auto"
        style={{ maxHeight }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="sticky top-0 z-10 pt-2 pb-3 bg-background flex justify-center">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>
        <div className="px-6 pb-8">{children}</div>
      </div>
    </div>,
    document.body
  );
}
