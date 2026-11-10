import { Task } from "../models/Task";
import { NotFoundError } from "../utils/AppError";
import { TaskStatus, TaskPriority } from "../types/task";

interface CreateTaskInput {
  title: string;
  description?: string;
  dueAt: Date;
  status?: TaskStatus;
  priority?: TaskPriority;
}

type UpdateTaskInput = Partial<CreateTaskInput>;

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function createTask(input: CreateTaskInput) {
  return Task.create(input);
}

export async function listTasks(opts: { status?: TaskStatus; q?: string } = {}) {
  const filter: Record<string, unknown> = {};
  if (opts.status) filter.status = opts.status;
  if (opts.q) {
    const rx = new RegExp(escapeRegex(opts.q), "i");
    filter.$or = [{ title: rx }, { description: rx }];
  }
  return Task.find(filter).sort({ dueAt: 1, createdAt: 1 }).lean();
}

export async function updateTask(id: string, input: UpdateTaskInput) {
  const task = await Task.findByIdAndUpdate(id, input, { new: true, runValidators: true });
  if (!task) throw new NotFoundError("Task not found");
  return task;
}

export async function deleteTask(id: string) {
  const task = await Task.findByIdAndDelete(id);
  if (!task) throw new NotFoundError("Task not found");
  return task;
}
