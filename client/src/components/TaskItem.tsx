import { useRef, useState } from "react";
import type { Task, Status } from "../lib/types";
import { CheckIcon, ClockIcon, TrashIcon } from "./Icons";
import { dayLabel, timeLabel } from "../lib/dates";

const PRIORITY: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700", MEDIUM: "bg-amber-100 text-amber-700", LOW: "bg-emerald-100 text-emerald-700"
};
const REVEAL = 88;

interface Props {
  task: Task; showDay?: boolean;
  onOpen: (t: Task) => void; onStatus: (t: Task, s: Status) => void; onDelete: (t: Task) => void;
}

/** Swipe left to reveal Delete (touch + mouse via pointer events). */
export default function TaskItem({ task, showDay, onOpen, onStatus, onDelete }: Props) {
  const [dx, setDx] = useState(0);
  const start = useRef<{ x: number; base: number } | null>(null);
  const moved = useRef(false);
  const done = task.status === "DONE";

  const down = (e: React.PointerEvent) => { start.current = { x: e.clientX, base: dx }; moved.current = false; };
  const move = (e: React.PointerEvent) => {
    if (!start.current) return;
    const delta = e.clientX - start.current.x;
    if (Math.abs(delta) > 6) moved.current = true;
    setDx(Math.max(-REVEAL, Math.min(0, start.current.base + delta)));
  };
  const up = () => { if (!start.current) return; start.current = null; setDx((v) => (v < -REVEAL / 2 ? -REVEAL : 0)); };

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <button aria-label="Delete task" onClick={() => onDelete(task)}
        className="absolute inset-y-0 right-0 flex w-[88px] flex-col items-center justify-center gap-1 bg-red-500 text-xs font-semibold text-white">
        <TrashIcon />Delete
      </button>
      <div onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up} onPointerCancel={up}
        style={{ transform: `translateX(${dx}px)`, touchAction: "pan-y", transition: start.current ? "none" : "transform .2s" }}
        className="relative flex items-start gap-3 rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-slate-200">
        <button aria-label={done ? "Mark as in progress" : "Mark as completed"}
          onClick={() => onStatus(task, done ? "IN_PROGRESS" : "DONE")}
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${done ? "border-brand bg-brand text-white" : "border-slate-300 text-transparent"}`}>
          <CheckIcon />
        </button>
        <div className="min-w-0 flex-1 cursor-pointer" onClick={() => { if (!moved.current) { dx ? setDx(0) : onOpen(task); } }}>
          <p className={`truncate font-semibold ${done ? "text-slate-400 line-through" : "text-slate-900"}`}>{task.title}</p>
          {task.description && <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">{task.description}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-slate-500"><ClockIcon />{showDay ? `${dayLabel(task.dueAt)}, ` : ""}{timeLabel(task.dueAt)}</span>
            <span className={`rounded-full px-2 py-0.5 font-medium ${PRIORITY[task.priority]}`}>{task.priority[0] + task.priority.slice(1).toLowerCase()}</span>
            {task.status === "IN_PROGRESS" && <span className="rounded-full bg-brand-soft px-2 py-0.5 font-medium text-brand">In progress</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
