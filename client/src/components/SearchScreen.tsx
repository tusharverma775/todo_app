import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Task, Status } from "../lib/types";
import TaskItem from "./TaskItem";
import { BackIcon } from "./Icons";

interface Props {
  version: number; onBack: () => void;
  onOpenTask: (t: Task) => void; onStatus: (t: Task, s: Status) => void; onDelete: (t: Task) => void;
}
export default function SearchScreen({ version, onBack, onOpenTask, onStatus, onDelete }: Props) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  // debounced server-side search; re-runs after edits/deletes (version)
  useEffect(() => {
    const term = q.trim();
    if (!term) { setResults([]); return; }
    setLoading(true);
    const id = setTimeout(() => api.list(term).then(setResults).catch(() => setResults([])).finally(() => setLoading(false)), 250);
    return () => clearTimeout(id);
  }, [q, version]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 flex items-center gap-2 bg-slate-100/95 px-4 py-3 backdrop-blur">
        <button aria-label="Back" onClick={onBack} className="rounded-full p-2 text-slate-600 hover:bg-slate-200"><BackIcon /></button>
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title or description"
          className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
      </header>
      <div className="space-y-2.5 px-4 pb-10">
        {!q.trim() && <p className="py-16 text-center text-slate-400">Type a keyword to find tasks</p>}
        {q.trim() && !loading && results.length === 0 && <p className="py-16 text-center text-slate-400">No tasks match “{q.trim()}”</p>}
        {results.map((t) => <TaskItem key={t._id} task={t} showDay onOpen={onOpenTask} onStatus={onStatus} onDelete={onDelete} />)}
      </div>
    </div>
  );
}
