import type { Task, TaskInput } from "./types";
const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, { headers: { "Content-Type": "application/json" }, ...init });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const fieldMsg = body.errors ? Object.values(body.errors as Record<string, string>)[0] : undefined;
    throw new Error(fieldMsg || body.message || "Something went wrong");
  }
  return body as T;
}
export const api = {
  list: (q?: string) => req<{ data: Task[] }>("/tasks" + (q ? `?q=${encodeURIComponent(q)}` : "")).then((r) => r.data),
  create: (t: TaskInput) => req<{ data: Task }>("/tasks", { method: "POST", body: JSON.stringify(t) }).then((r) => r.data),
  update: (id: string, t: Partial<TaskInput>) => req<{ data: Task }>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(t) }).then((r) => r.data),
  remove: (id: string) => req<unknown>(`/tasks/${id}`, { method: "DELETE" })
};
