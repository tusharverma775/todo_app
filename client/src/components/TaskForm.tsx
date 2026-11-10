import { useState } from "react";
import type { Task, TaskInput, Priority, Status } from "../lib/types";
import { toLocalInput } from "../lib/dates";
import { CloseIcon, TrashIcon } from "./Icons";

interface Props {
  task?: Task | null; onClose: () => void;
  onSave: (input: TaskInput, id?: string) => Promise<void>; onDelete?: (t: Task) => void;
}
const PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH"];
const STATUSES: { v: Status; l: string }[] = [{ v: "IN_PROGRESS", l: "In progress" }, { v: "DONE", l: "Completed" }];

export default function TaskForm({ task, onClose, onSave, onDelete }: Props) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [when, setWhen] = useState(toLocalInput(task?.dueAt));
  const [priority, setPriority] = useState<Priority>(task?.priority ?? "MEDIUM");
  const [status, setStatus] = useState<Status>(task?.status ?? "IN_PROGRESS");
  const [errors, setErrors] = useState<{ title?: string; when?: string; api?: string }>({});
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!title.trim()) errs.title = "Title is required";
    else if (title.trim().length > 100) errs.title = "Max 100 characters";
    if (!when || Number.isNaN(Date.parse(when))) errs.when = "Date & time is required";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      await onSave({ title: title.trim(), description: description.trim(), dueAt: new Date(when).toISOString(), priority, status }, task?._id);
    } catch (err) {
      setErrors({ api: (err as Error).message }); setSaving(false);
    }
  };

  const label = "mb-1.5 block text-sm font-medium text-slate-700";
  const input = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/50 sm:items-center" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} noValidate
        className="animate-sheet safe-b max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-slate-50 p-5 sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{task ? "Edit task" : "New task"}</h2>
          <div className="flex items-center gap-1">
            {task && onDelete && <button type="button" aria-label="Delete" onClick={() => onDelete(task)} className="rounded-full p-2 text-red-500 hover:bg-red-50"><TrashIcon /></button>}
            <button type="button" aria-label="Close" onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-200"><CloseIcon /></button>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className={label} htmlFor="title">Title <span className="text-red-500">*</span></label>
            <input id="title" className={input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to be done?" maxLength={120} autoFocus />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>
          <div>
            <label className={label} htmlFor="desc">Description</label>
            <textarea id="desc" rows={3} className={input} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional details" />
          </div>
          <div>
            <label className={label} htmlFor="when">Date &amp; time <span className="text-red-500">*</span></label>
            <input id="when" type="datetime-local" className={input} value={when} onChange={(e) => setWhen(e.target.value)} />
            {errors.when && <p className="mt-1 text-sm text-red-600">{errors.when}</p>}
          </div>
          <div>
            <span className={label}>Priority</span>
            <div className="grid grid-cols-3 gap-2">
              {PRIORITIES.map((p) => (
                <button type="button" key={p} onClick={() => setPriority(p)}
                  className={`rounded-xl border py-2.5 text-sm font-medium ${priority === p ? "border-brand bg-brand text-white" : "border-slate-200 bg-white text-slate-600"}`}>
                  {p[0] + p.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
          {task && (
            <div>
              <span className={label}>Status</span>
              <div className="grid grid-cols-2 gap-2">
                {STATUSES.map((s) => (
                  <button type="button" key={s.v} onClick={() => setStatus(s.v)}
                    className={`rounded-xl border py-2.5 text-sm font-medium ${(status === "TODO" ? "IN_PROGRESS" : status) === s.v ? "border-brand bg-brand text-white" : "border-slate-200 bg-white text-slate-600"}`}>{s.l}</button>
                ))}
              </div>
            </div>
          )}
          {errors.api && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{errors.api}</p>}
          <button disabled={saving} className="w-full rounded-2xl bg-brand py-3.5 text-base font-semibold text-white shadow-lg shadow-brand/30 active:bg-brand-dark disabled:opacity-60">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
