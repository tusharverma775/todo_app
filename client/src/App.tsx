import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "./lib/api";
import type { Task, TaskInput, Status } from "./lib/types";
import { groupByWeek, weekKey } from "./lib/dates";
import WeekCard from "./components/WeekCard";
import TaskForm from "./components/TaskForm";
import SearchScreen from "./components/SearchScreen";
import { PlusIcon, SearchIcon } from "./components/Icons";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [form, setForm] = useState<{ task: Task | null } | null>(null);
  const [searching, setSearching] = useState(false);
  const [version, setVersion] = useState(0);
  const [toDelete, setToDelete] = useState<Task | null>(null);

  const load = useCallback(async () => {
    try { setTasks(await api.list()); setError(""); }
    catch (e) { setError((e as Error).message || "Could not reach the server"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const weeks = useMemo(() => groupByWeek(tasks), [tasks]);
  // expand the current week by default on first load
  useEffect(() => {
    const cur = weeks.find((w) => w.isCurrent);
    if (cur) setExpanded((s) => (s.size ? s : new Set([cur.key])));
  }, [weeks.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = async () => { await load(); setVersion((v) => v + 1); };

  const save = async (input: TaskInput, id?: string) => {
    const saved = id ? await api.update(id, input) : await api.create(input);
    setForm(null);
    await refresh();
    // open the week the task landed in
    setExpanded((s) => new Set(s).add(weekKey(new Date(saved.dueAt))));
  };
  const setStatus = async (t: Task, status: Status) => {
    setTasks((prev) => prev.map((x) => (x._id === t._id ? { ...x, status } : x))); // optimistic
    try { await api.update(t._id, { status }); setVersion((v) => v + 1); } catch { await refresh(); }
  };
  const confirmDelete = async () => {
    if (!toDelete) return;
    const t = toDelete; setToDelete(null); setForm(null);
    try { await api.remove(t._id); } finally { await refresh(); }
  };
  const toggle = (k: string) => setExpanded((s) => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n; });

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-slate-100 sm:my-0 sm:shadow-xl">
      {searching ? (
        <SearchScreen version={version} onBack={() => setSearching(false)} onOpenTask={(t) => setForm({ task: t })} onStatus={setStatus} onDelete={setToDelete} />
      ) : (
        <>
          <header className="rounded-b-[2rem] bg-brand px-5 pb-8 pt-10 text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/70">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
                <h1 className="mt-1 text-3xl font-bold">My Tasks</h1>
              </div>
              <button aria-label="Search" onClick={() => setSearching(true)} className="rounded-full bg-white/15 p-3 hover:bg-white/25"><SearchIcon /></button>
            </div>
          </header>
          <main className="-mt-4 space-y-4 px-4 pb-28 pt-2">
            {loading && <p className="py-16 text-center text-slate-400">Loading…</p>}
            {error && <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error} <button onClick={load} className="ml-1 font-semibold underline">Retry</button></div>}
            {!loading && !error && weeks.length === 0 && (
              <div className="py-16 text-center"><p className="text-lg font-semibold text-slate-700">No tasks yet</p><p className="mt-1 text-slate-400">Tap + to add your first task</p></div>
            )}
            {weeks.map((w) => (
              <WeekCard key={w.key} week={w} open={expanded.has(w.key)} onToggle={() => toggle(w.key)}
                onOpenTask={(t) => setForm({ task: t })} onStatus={setStatus} onDelete={setToDelete} />
            ))}
          </main>
          <button aria-label="Add task" onClick={() => setForm({ task: null })}
            className="fixed bottom-6 right-5 z-30 flex items-center gap-2 rounded-full bg-brand px-5 py-4 font-semibold text-white shadow-xl shadow-brand/40 active:bg-brand-dark md:right-[calc(50%-12rem)]">
            <PlusIcon />Add Task
          </button>
        </>
      )}

      {form && <TaskForm task={form.task} onClose={() => setForm(null)} onSave={save} onDelete={setToDelete} />}

      {toDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-6" onClick={() => setToDelete(null)}>
          <div className="w-full max-w-xs rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold">Delete task?</h3>
            <p className="mt-1 text-sm text-slate-500">“{toDelete.title}” will be removed permanently.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => setToDelete(null)} className="rounded-xl bg-slate-100 py-2.5 font-medium">Cancel</button>
              <button onClick={confirmDelete} className="rounded-xl bg-red-500 py-2.5 font-semibold text-white">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
