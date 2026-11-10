import { Router } from "express";
import * as taskController from "../controllers/task.controller";
import { validate } from "../middlewares/validate";
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
  objectIdParamSchema
} from "../validators/task.validators";

const router = Router();

router.post("/", validate(createTaskSchema, "body"), taskController.createTask);
router.get("/", validate(taskQuerySchema, "query"), taskController.listTasks);
router.patch(
  "/:id",
  validate(objectIdParamSchema, "params"),
  validate(updateTaskSchema, "body"),
  taskController.updateTask
);
router.delete("/:id", validate(objectIdParamSchema, "params"), taskController.deleteTask);

export default router;
