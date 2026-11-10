import type { WeekGroup } from "../lib/dates";
import type { Task, Status } from "../lib/types";
import { ChevronIcon } from "./Icons";
import TaskItem from "./TaskItem";

interface Props {
  week: WeekGroup; open: boolean; onToggle: () => void;
  onOpenTask: (t: Task) => void; onStatus: (t: Task, s: Status) => void; onDelete: (t: Task) => void;
}
export default function WeekCard({ week, open, onToggle, onOpenTask, onStatus, onDelete }: Props) {
  const total = week.open + week.done;
  const pct = total ? Math.round((week.done / total) * 100) : 0;
  return (
    <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <button onClick={onToggle} aria-expanded={open} className="w-full text-left">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{week.isCurrent ? "This week" : "Week"}</p>
            <h2 className="text-lg font-bold text-slate-900">{week.label}</h2>
          </div>
          <span className="text-slate-400"><ChevronIcon open={open} /></span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-amber-50 p-3"><p className="text-2xl font-bold text-amber-600">{week.open}</p><p className="text-xs text-amber-700">Open tasks</p></div>
          <div className="rounded-2xl bg-emerald-50 p-3"><p className="text-2xl font-bold text-emerald-600">{week.done}</p><p className="text-xs text-emerald-700">Completed</p></div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} /></div>
      </button>
      {open && (
        <div className="mt-4 space-y-2.5">
          {week.tasks.map((t) => <TaskItem key={t._id} task={t} showDay onOpen={onOpenTask} onStatus={onStatus} onDelete={onDelete} />)}
        </div>
      )}
    </section>
  );
}
