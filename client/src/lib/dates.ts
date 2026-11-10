import type { Task } from "./types";

/** Monday 00:00 (local) of the week containing d. */
export function weekStart(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (x.getDay() + 6) % 7; // Mon=0 … Sun=6
  x.setDate(x.getDate() - day);
  return x;
}
export const weekKey = (d: Date) => {
  const s = weekStart(d);
  return `${s.getFullYear()}-${String(s.getMonth() + 1).padStart(2, "0")}-${String(s.getDate()).padStart(2, "0")}`;
};
const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => d.toLocaleDateString("en-US", o);
export function weekLabel(start: Date): string {
  const end = new Date(start); end.setDate(end.getDate() + 6);
  const sameMonth = start.getMonth() === end.getMonth();
  return `${fmt(start, { month: "short", day: "numeric" })} – ${sameMonth ? end.getDate() : fmt(end, { month: "short", day: "numeric" })}`;
}
export const timeLabel = (iso: string) => new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
export const dayLabel = (iso: string) => fmt(new Date(iso), { weekday: "short", month: "short", day: "numeric" });

/** ISO string -> value for <input type="datetime-local"> in local time. */
export function toLocalInput(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export interface WeekGroup { key: string; start: Date; label: string; isCurrent: boolean; tasks: Task[]; open: number; done: number; }
export function groupByWeek(tasks: Task[]): WeekGroup[] {
  const map = new Map<string, WeekGroup>();
  const current = weekKey(new Date());
  for (const t of tasks) {
    const d = new Date(t.dueAt); const key = weekKey(d);
    if (!map.has(key)) {
      const start = weekStart(d);
      map.set(key, { key, start, label: weekLabel(start), isCurrent: key === current, tasks: [], open: 0, done: 0 });
    }
    const g = map.get(key)!; g.tasks.push(t);
    if (t.status === "DONE") g.done++; else g.open++;
  }
  const groups = [...map.values()];
  groups.forEach((g) => g.tasks.sort((a, b) => +new Date(a.dueAt) - +new Date(b.dueAt)));
  return groups.sort((a, b) => +a.start - +b.start);
}
