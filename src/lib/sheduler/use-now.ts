"use client";

import { useEffect, useState } from "react";

/**
 * Re-renders consuming components every `intervalMs` so relative-time
 * strings ("in 2h 14m", "3d ago") stay accurate without a page refresh.
 * Auto-posting is fundamentally about timing — this is the one place
 * motion earns its keep rather than decorating.
 */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}

export function formatRelativeToNow(iso: string, now: number): string {
  const diffMs = new Date(iso).getTime() - now;
  const future = diffMs >= 0;
  const abs = Math.abs(diffMs);

  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  let label: string;
  if (abs < minute) {
    label = "moments";
  } else if (abs < hour) {
    const m = Math.round(abs / minute);
    label = `${m}m`;
  } else if (abs < day) {
    const h = Math.floor(abs / hour);
    const m = Math.round((abs % hour) / minute);
    label = m > 0 ? `${h}h ${m}m` : `${h}h`;
  } else {
    const d = Math.floor(abs / day);
    const h = Math.round((abs % day) / hour);
    label = h > 0 ? `${d}d ${h}h` : `${d}d`;
  }

  if (label === "moments") return future ? "posting now" : "just now";
  return future ? `in ${label}` : `${label} ago`;
}
