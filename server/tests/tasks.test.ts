import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { Task } from "../src/models/Task";
import { setupTestDatabase, teardownTestDatabase, clearTestDatabase } from "./setup";

const app = createApp();
const DUE = "2026-11-10T09:00:00.000Z";

beforeAll(async () => {
  await setupTestDatabase();
});

afterEach(async () => {
  await clearTestDatabase();
});

afterAll(async () => {
  await teardownTestDatabase();
});

describe("POST /tasks", () => {
  it("rejects an empty title and persists nothing", async () => {
    const res = await request(app).post("/tasks").send({ title: "" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toHaveProperty("title");

    const count = await Task.countDocuments();
    expect(count).toBe(0);
  });

  it("rejects a title longer than 100 characters", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({ title: "a".repeat(101), dueAt: DUE });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty("title");
  });

  it("rejects a whitespace-only title", async () => {
    const res = await request(app).post("/tasks").send({ title: "    " });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty("title");
  });

  it("rejects an unexpected field", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({ title: "Valid title", dueAt: DUE, foo: "bar" });

    expect(res.status).toBe(400);
  });

  it("creates a task with defaults applied", async () => {
    const res = await request(app).post("/tasks").send({ title: "Write README", dueAt: DUE });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("TODO");
    expect(res.body.data.priority).toBe("MEDIUM");
    expect(res.body.data.title).toBe("Write README");
  });
});

describe("PATCH /tasks/:id", () => {
  it("updates status to DONE and reflects it in the database", async () => {
    const created = await Task.create({ dueAt: new Date(), title: "Ship feature" });

    const res = await request(app).patch(`/tasks/${created._id}`).send({ status: "DONE" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("DONE");

    const fromDb = await Task.findById(created._id).lean();
    expect(fromDb?.status).toBe("DONE");
  });

  it("rejects an invalid status value", async () => {
    const created = await Task.create({ dueAt: new Date(), title: "Ship feature" });

    const res = await request(app)
      .patch(`/tasks/${created._id}`)
      .send({ status: "NOT_A_STATUS" });

    expect(res.status).toBe(400);
  });

  it("edits title, description, priority and date", async () => {
    const created = await Task.create({ dueAt: new Date(), title: "Ship feature" });

    const res = await request(app)
      .patch(`/tasks/${created._id}`)
      .send({ title: "Changed title", priority: "HIGH", dueAt: DUE });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("Changed title");
    expect(res.body.data.priority).toBe("HIGH");
    expect(new Date(res.body.data.dueAt).toISOString()).toBe(DUE);
  });

  it("rejects unknown fields and empty bodies", async () => {
    const created = await Task.create({ dueAt: new Date(), title: "Ship feature" });
    const a = await request(app).patch(`/tasks/${created._id}`).send({ foo: 1 });
    const b = await request(app).patch(`/tasks/${created._id}`).send({});
    expect(a.status).toBe(400);
    expect(b.status).toBe(400);
  });

  it("returns 400 for an invalid ObjectId", async () => {
    const res = await request(app).patch("/tasks/not-a-valid-id").send({ status: "DONE" });

    expect(res.status).toBe(400);
  });

  it("returns 404 when the task does not exist", async () => {
    const res = await request(app)
      .patch("/tasks/64b8f0f0f0f0f0f0f0f0f0f0")
      .send({ status: "DONE" });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /tasks/:id", () => {
  it("deletes an existing task", async () => {
    const created = await Task.create({ dueAt: new Date(), title: "Temporary task" });

    const res = await request(app).delete(`/tasks/${created._id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const fromDb = await Task.findById(created._id);
    expect(fromDb).toBeNull();
  });

  it("returns 404 when deleting a task that does not exist", async () => {
    const res = await request(app).delete("/tasks/64b8f0f0f0f0f0f0f0f0f0f0");

    expect(res.status).toBe(404);
  });
});

describe("GET /tasks", () => {
  it("filters tasks by status", async () => {
    await Task.create({ dueAt: new Date(), title: "Todo task", status: "TODO" });
    await Task.create({ dueAt: new Date(), title: "Done task", status: "DONE" });

    const res = await request(app).get("/tasks?status=DONE");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe("Done task");
  });

  it("rejects an invalid status filter", async () => {
    const res = await request(app).get("/tasks?status=INVALID");

    expect(res.status).toBe(400);
  });

  it("returns tasks sorted by due date ascending", async () => {
    const later = await Task.create({ title: "Later", dueAt: new Date("2026-12-01T10:00:00Z") });
    const sooner = await Task.create({ title: "Sooner", dueAt: new Date("2026-11-01T10:00:00Z") });

    const res = await request(app).get("/tasks");

    expect(res.status).toBe(200);
    expect(res.body.data[0]._id).toBe(String(sooner._id));
    expect(res.body.data[1]._id).toBe(String(later._id));
  });

  it("searches title and description case-insensitively", async () => {
    await Task.create({ title: "Buy milk", dueAt: new Date() });
    await Task.create({ title: "Call mom", description: "about MILK delivery", dueAt: new Date() });
    await Task.create({ title: "Unrelated", dueAt: new Date() });

    const res = await request(app).get("/tasks?q=milk");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });
});
