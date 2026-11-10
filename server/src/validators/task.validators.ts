import { z } from "zod";
import { TASK_STATUSES, TASK_PRIORITIES } from "../types/task";

const titleSchema = z
  .string({ required_error: "Title is required" })
  .trim()
  .min(1, "Title is required")
  .max(100, "Title cannot exceed 100 characters");

const dueAtSchema = z
  .string({ required_error: "Date & time is required", invalid_type_error: "Invalid date & time" })
  .refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date & time")
  .transform((v) => new Date(v));

const descriptionSchema = z.string().trim().max(2000, "Description is too long");
const statusSchema = z.enum(TASK_STATUSES, { invalid_type_error: "Invalid status" });
const prioritySchema = z.enum(TASK_PRIORITIES, { invalid_type_error: "Invalid priority" });

export const createTaskSchema = z
  .object({
    title: titleSchema,
    description: descriptionSchema.optional(),
    dueAt: dueAtSchema,
    status: statusSchema.optional(),
    priority: prioritySchema.optional()
  })
  .strict();

/** PATCH: any subset of fields (edit + status change), at least one required. */
export const updateTaskSchema = z
  .object({
    title: titleSchema.optional(),
    description: descriptionSchema.optional(),
    dueAt: dueAtSchema.optional(),
    status: statusSchema.optional(),
    priority: prioritySchema.optional()
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, "At least one field is required");

export const taskQuerySchema = z
  .object({
    status: z.enum(TASK_STATUSES, { invalid_type_error: "Invalid status filter" }).optional(),
    q: z.string().trim().max(100, "Search term too long").optional()
  })
  .strict();

export const objectIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid task id")
});
