"use client";

import { useRef, useState } from "react";

type Tab = "dates" | "months" | "flexible";

type Props = {
  value: string;
  onChange: (displayValue: string) => void;
};

export function MoveInPicker({ value, onChange }: Props) {
  const [tab, setTab] = useState<Tab>("dates");

  return (
    <div>
      {/* Tabs */}
      <div className="bg-secondary rounded-full p-1 flex relative">
        {(["dates", "months", "flexible"] as Tab[]).map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 text-[13px] py-2 rounded-full transition-colors ${
                active
                  ? "bg-card text-foreground font-medium shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              {t === "dates" ? "Dates" : t === "months" ? "Months" : "Flexible"}
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        {tab === "dates" && <DatesView onPick={onChange} currentValue={value} />}
        {tab === "months" && <MonthsView onPick={onChange} currentValue={value} />}
        {tab === "flexible" && <FlexibleView onPick={onChange} currentValue={value} />}
      </div>
    </div>
  );
}

// ─── DATES TAB ────────────────────────────────────────────────────────

function DatesView({
  onPick,
  currentValue,
}: {
  onPick: (v: string) => void;
  currentValue: string;
}) {
  const today = startOfDay(new Date());
  const [viewMonth, setViewMonth] = useState(startOfMonth(today));
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const chipsRef = useRef<HTMLDivElement>(null);

  const onSelectDate = (d: Date) => {
    if (!start || (start && end)) {
      setStart(d);
      setEnd(null);
      onPick(fmtDate(d));
    } else {
      if (d.getTime() < start.getTime()) {
        setStart(d);
        setEnd(null);
        onPick(fmtDate(d));
      } else {
        setEnd(d);
        onPick(fmtRange(start, d));
      }
    }
  };

  const goToMonth = (m: Date) => {
    setViewMonth(startOfMonth(m));
  };

  // Generate month chips from current month → Dec 2027
  const monthChips: Date[] = [];
  let cur = startOfMonth(today);
  const end2027 = new Date(2027, 11, 1);
  while (cur <= end2027) {
    monthChips.push(new Date(cur));
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }

  return (
    <div>
      <Calendar
        viewMonth={viewMonth}
        onPrev={() => {
          const prev = new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1);
          if (prev >= startOfMonth(today)) setViewMonth(prev);
        }}
        onNext={() =>
          setViewMonth(
            new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1)
          )
        }
        canPrev={
          viewMonth.getTime() > startOfMonth(today).getTime()
        }
        today={today}
        start={start}
        end={end}
        onSelect={onSelectDate}
      />

      {/* Month-jump chips */}
      <div className="mt-3 -mx-4">
        <div
          ref={chipsRef}
          className="flex gap-1.5 overflow-x-auto px-4 pb-1 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none" }}
        >
          {monthChips.map((m) => {
            const active =
              m.getFullYear() === viewMonth.getFullYear() &&
              m.getMonth() === viewMonth.getMonth();
            return (
              <button
                key={m.toISOString()}
                onClick={() => goToMonth(m)}
                className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:border-foreground/30"
                }`}
              >
                {fmtMonthShort(m)}
              </button>
            );
          })}
        </div>
      </div>

      {currentValue && (
        <p className="mt-3 text-xs text-muted-foreground">
          Selected: <span className="text-foreground font-medium">{currentValue}</span>
        </p>
      )}
    </div>
  );
}

// ─── MONTHS TAB ───────────────────────────────────────────────────────

function MonthsView({
  onPick,
  currentValue,
}: {
  onPick: (v: string) => void;
  currentValue: string;
}) {
  const today = startOfDay(new Date());
  const months: Date[] = [];
  let cur = startOfMonth(today);
  const end2027 = new Date(2027, 11, 1);
  while (cur <= end2027) {
    months.push(new Date(cur));
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-2.5">
        Pick a move-in month
      </p>
      <div className="grid grid-cols-3 gap-1.5 max-h-[280px] overflow-y-auto">
        {months.map((m) => {
          const label = fmtMonthShort(m);
          const active = currentValue === label;
          return (
            <button
              key={m.toISOString()}
              onClick={() => onPick(label)}
              className={`text-[13px] px-3 py-2.5 rounded-xl border ${
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border hover:border-foreground/30"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── FLEXIBLE TAB ─────────────────────────────────────────────────────

const FLEXIBLE_OPTIONS = [
  "Within 2 weeks",
  "Within 1 month",
  "Within 3 months",
  "I'm flexible",
];

function FlexibleView({
  onPick,
  currentValue,
}: {
  onPick: (v: string) => void;
  currentValue: string;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-2.5">
        How soon are you looking to move?
      </p>
      <div className="space-y-2">
        {FLEXIBLE_OPTIONS.map((o) => {
          const active = currentValue === o;
          return (
            <button
              key={o}
              onClick={() => onPick(o)}
              className={`w-full text-left text-[14px] px-4 py-3 rounded-xl border ${
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border hover:border-foreground/30"
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── CALENDAR GRID ────────────────────────────────────────────────────

function Calendar({
  viewMonth,
  onPrev,
  onNext,
  canPrev,
  today,
  start,
  end,
  onSelect,
}: {
  viewMonth: Date;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  today: Date;
  start: Date | null;
  end: Date | null;
  onSelect: (d: Date) => void;
}) {
  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  // Sunday as first day
  const firstDayOffset = monthStart.getDay();
  const daysInMonth = monthEnd.getDate();

  // Build the grid: 42 cells (6 weeks)
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDayOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const inRange = (d: Date) => {
    if (!start || !end) return false;
    return d.getTime() > start.getTime() && d.getTime() < end.getTime();
  };

  const isStart = (d: Date) => start && sameDay(d, start);
  const isEnd = (d: Date) => end && sameDay(d, end);

  return (
    <div>
      {/* Header: month name + nav */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={onPrev}
          disabled={!canPrev}
          className={`w-7 h-7 flex items-center justify-center rounded-full ${
            canPrev
              ? "hover:bg-secondary text-foreground"
              : "text-muted-foreground/40"
          }`}
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="text-[15px] font-medium">
          {fmtMonthLong(viewMonth)}
        </div>
        <button
          onClick={onNext}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-secondary"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Day-of-week header */}
      <div className="grid grid-cols-7 text-center text-[11px] text-muted-foreground mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="py-1">{d}</div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const disabled = d.getTime() < today.getTime();
          const selectedStart = isStart(d);
          const selectedEnd = isEnd(d);
          const within = inRange(d);
          const isToday = sameDay(d, today);

          return (
            <button
              key={i}
              disabled={disabled}
              onClick={() => onSelect(d)}
              className={`relative h-9 text-[14px] flex items-center justify-center ${
                disabled ? "text-muted-foreground/30" : "text-foreground"
              } ${within ? "bg-accent/40" : ""} ${
                selectedStart && end ? "rounded-l-full bg-accent/40" : ""
              } ${selectedEnd ? "rounded-r-full bg-accent/40" : ""}`}
            >
              <span
                className={`relative z-10 w-9 h-9 flex items-center justify-center rounded-full ${
                  selectedStart || selectedEnd
                    ? "bg-primary text-primary-foreground font-medium"
                    : isToday
                    ? "ring-1 ring-foreground/30"
                    : ""
                }`}
              >
                {d.getDate()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── DATE UTILS ───────────────────────────────────────────────────────

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
const MONTHS_LONG = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function fmtMonthLong(d: Date) {
  return `${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}
function fmtMonthShort(d: Date) {
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}
function fmtDate(d: Date) {
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
function fmtRange(a: Date, b: Date) {
  const sameYear = a.getFullYear() === b.getFullYear();
  const sameMonth = sameYear && a.getMonth() === b.getMonth();
  if (sameMonth) {
    return `${MONTHS_SHORT[a.getMonth()]} ${a.getDate()}–${b.getDate()}, ${a.getFullYear()}`;
  }
  if (sameYear) {
    return `${MONTHS_SHORT[a.getMonth()]} ${a.getDate()} – ${MONTHS_SHORT[b.getMonth()]} ${b.getDate()}, ${a.getFullYear()}`;
  }
  return `${fmtDate(a)} – ${fmtDate(b)}`;
}
