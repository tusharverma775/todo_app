export type Status = "TODO" | "IN_PROGRESS" | "DONE";
export type Priority = "LOW" | "MEDIUM" | "HIGH";
export interface Task {
  _id: string; title: string; description: string;
  dueAt: string; status: Status; priority: Priority;
}
export interface TaskInput {
  title: string; description?: string; dueAt: string; priority?: Priority; status?: Status;
}
