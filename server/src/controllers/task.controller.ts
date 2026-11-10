import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as taskService from "../services/task.service";
import { TaskStatus } from "../types/task";

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.createTask(req.body);

  res.status(201).json({
    success: true,
    message: "Task created successfully",
    data: task
  });
});

export const listTasks = asyncHandler(async (req: Request, res: Response) => {
  const status = req.query.status as TaskStatus | undefined;
  const q = req.query.q as string | undefined;
  const tasks = await taskService.listTasks({ status, q });

  res.status(200).json({
    success: true,
    message: "Tasks retrieved successfully",
    data: tasks
  });
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.updateTask(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "Task updated successfully",
    data: task
  });
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await taskService.deleteTask(id);

  res.status(200).json({
    success: true,
    message: "Task deleted successfully"
  });
});
