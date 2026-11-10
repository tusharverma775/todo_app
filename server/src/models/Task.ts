import { Schema, model, InferSchemaType } from "mongoose";
import { TASK_STATUSES, TASK_PRIORITIES } from "../types/task";

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"]
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    dueAt: {
      type: Date,
      required: [true, "Date & time is required"]
    },
    status: {
      type: String,
      enum: TASK_STATUSES,
      default: "TODO"
    },
    priority: {
      type: String,
      enum: TASK_PRIORITIES,
      default: "MEDIUM"
    }
  },
  { timestamps: true }
);

taskSchema.index({ status: 1, dueAt: 1 });
taskSchema.index({ dueAt: 1 });

export type TaskDocument = InferSchemaType<typeof taskSchema>;

export const Task = model("Task", taskSchema);
