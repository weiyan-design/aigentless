// Centralized icon mapping for the dealbreaker IDs, so fixtures stay data-only
// and rendering components import a single lucide-based component.
import {
  Dog,
  WashingMachine,
  ShowerHead,
  Sun,
  Volume2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const DEALBREAKER_ICONS: Record<string, LucideIcon> = {
  pet: Dog,
  laundry: WashingMachine,
  shower: ShowerHead,
  light: Sun,
  quiet: Volume2,
};
