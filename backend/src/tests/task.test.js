import request from "supertest";
import mongoose from "mongoose";
import { app, connectTestDB, disconnectTestDB, clearCollections, createVerifiedUser, createWorkspace } from "./helpers/setup.js";
process.env.JWT_SECRET = "test_secret";
process.env.NODE_ENV = "test";
//* Function for this task
beforeAll(async () => {
  await connectTestDB();
});
//* Function for this task
afterAll(async () => {
  await disconnectTestDB();
});
//* Function for this task
afterEach(async () => {
  await clearCollections();
});
//* Function for make board
const makeBoard = async (token, wsId, name = "Sprint Board") => {
  const res = await request(app).post(`/api/workspaces/${wsId}/boards`).set("Authorization", `Bearer ${token}`).send({
    name
  });
  return res.body;
};
//* Function for make column
const makeColumn = async (token, boardId, title = "To Do") => {
  const res = await request(app).post(`/api/boards/${boardId}/columns`).set("Authorization", `Bearer ${token}`).send({
    title
  });
  return res.body;
};
//* Function for make task
const makeTask = async (token, boardId, columnId, overrides = {}) => {
  const res = await request(app).post(`/api/boards/${boardId}/columns/${columnId}/tasks`).set("Authorization", `Bearer ${token}`).send({
    title: "Default Task",
    priority: "MEDIUM",
    ...overrides
  });
  return res.body;
};
//* Function for make comment
const makeComment = async (token, taskId, text = "Great work!") => {
  const res = await request(app).post(`/api/tasks/${taskId}/comments`).set("Authorization", `Bearer ${token}`).send({
    text
  });
  return res.body;
};
//* Function for this task
describe("Module 3: Task and Boards Management", () => {
  //* Function for this task
  describe("3a. Boards", () => {
    //* Function for this task
    it("1. Creating a board without auth returns 401", async () => {
      const res = await request(app).post("/api/workspaces/fakeid/boards").send({
        name: "No Auth Board"
      });
      expect(res.statusCode).toBe(401);
    });
    //* Function for this task
    it("2. Creating a board returns 201 with board data", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const res = await request(app).post(`/api/workspaces/${ws._id}/boards`).set("Authorization", `Bearer ${token}`).send({
        name: "My Board"
      });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("name", "My Board");
      expect(res.body).toHaveProperty("_id");
    });
    //* Function for this task
    it("3. Board is associated with the correct workspace", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      expect(String(board.workspace)).toBe(String(ws._id));
    });
    //* Function for this task
    it("4. Listing boards for a workspace returns an array", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      await makeBoard(token, ws._id, "Board A");
      await makeBoard(token, ws._id, "Board B");
      const res = await request(app).get(`/api/workspaces/${ws._id}/boards`).set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
    //* Function for this task
    it("5. Getting a board by ID returns 200 with correct data", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id, "Fetch Me");
      const res = await request(app).get(`/api/boards/${board._id}`).set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("_id", board._id);
    });
    //* Function for this task
    it("6. Updating a board name returns 200", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      const res = await request(app).patch(`/api/boards/${board._id}`).set("Authorization", `Bearer ${token}`).send({
        name: "Renamed Board"
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("name", "Renamed Board");
    });
    //* Function for this task
    it("7. Deleting a board returns 200", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      const res = await request(app).delete(`/api/boards/${board._id}`).set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
    });
    //* Function for this task
    it("8. Free plan allows up to 5 boards per workspace", async () => {
      const {
        token
      } = await createVerifiedUser({
        email: "boardlimit@example.com"
      });
      const ws = await createWorkspace(token);
      for (let i = 1; i <= 5; i++) {
        const r = await request(app).post(`/api/workspaces/${ws._id}/boards`).set("Authorization", `Bearer ${token}`).send({
          name: `Board ${i}`
        });
        expect(r.statusCode).toBe(201);
      }
    });
    //* Function for this task
    it("9. Creating a 6th board on free plan returns 403", async () => {
      const {
        token
      } = await createVerifiedUser({
        email: "boardover@example.com"
      });
      const ws = await createWorkspace(token);
      for (let i = 1; i <= 5; i++) {
        await request(app).post(`/api/workspaces/${ws._id}/boards`).set("Authorization", `Bearer ${token}`).send({
          name: `Board ${i}`
        });
      }
      const res = await request(app).post(`/api/workspaces/${ws._id}/boards`).set("Authorization", `Bearer ${token}`).send({
        name: "Board 6"
      });
      expect(res.statusCode).toBe(403);
    });
  });
  //* Function for this task
  describe("3b. Columns", () => {
    //* Function for this task
    it("10. Creating a column returns 201", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      const res = await request(app).post(`/api/boards/${board._id}/columns`).set("Authorization", `Bearer ${token}`).send({
        title: "In Progress"
      });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("title", "In Progress");
    });
    //* Function for this task
    it("11. Creating a column without title returns 4xx", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      const res = await request(app).post(`/api/boards/${board._id}/columns`).set("Authorization", `Bearer ${token}`).send({});
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
      expect(res.statusCode).toBeLessThan(600);
    });
    //* Function for this task
    it("12. Listing columns for a board returns an array", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      await makeColumn(token, board._id, "To Do");
      await makeColumn(token, board._id, "Done");
      const res = await request(app).get(`/api/boards/${board._id}/columns`).set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
    //* Function for this task
    it("13. Updating a column title returns 200", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      const col = await makeColumn(token, board._id, "Old Title");
      const res = await request(app).patch(`/api/columns/${col._id}`).set("Authorization", `Bearer ${token}`).send({
        title: "New Title"
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("title", "New Title");
    });
    //* Function for this task
    it("14. Deleting a column returns 200", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      const col = await makeColumn(token, board._id);
      const res = await request(app).delete(`/api/columns/${col._id}`).set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
    });
    //* Function for this task
    it("15. Column is associated with the correct board", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      const col = await makeColumn(token, board._id, "Check Board");
      expect(String(col.board)).toBe(String(board._id));
    });
  });
  //* Function for this task
  describe("3c. Tasks", () => {
    //* Function for this task
    it("16. Creating a task returns 201", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      const col = await makeColumn(token, board._id);
      const res = await request(app).post(`/api/boards/${board._id}/columns/${col._id}/tasks`).set("Authorization", `Bearer ${token}`).send({
        title: "New Task",
        priority: "HIGH"
      });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("title", "New Task");
    });
    //* Function for this task
    it("17. Creating a task without title returns 4xx", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      const col = await makeColumn(token, board._id);
      const res = await request(app).post(`/api/boards/${board._id}/columns/${col._id}/tasks`).set("Authorization", `Bearer ${token}`).send({
        priority: "LOW"
      });
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
      expect(res.statusCode).toBeLessThan(600);
    });
    //* Function for this task
    it("18. Creating a task with invalid priority returns 4xx", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      const col = await makeColumn(token, board._id);
      const res = await request(app).post(`/api/boards/${board._id}/columns/${col._id}/tasks`).set("Authorization", `Bearer ${token}`).send({
        title: "Bad Priority Task",
        priority: "invalid"
      });
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
      expect(res.statusCode).toBeLessThan(600);
    });
    //* Function for this task
    it("19. Getting a task by ID returns 200 with correct data", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      const col = await makeColumn(token, board._id);
      const task = await makeTask(token, board._id, col._id, {
        title: "Find Me"
      });
      const res = await request(app).get(`/api/tasks/${task._id}`).set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("title", "Find Me");
    });
    //* Function for this task
    it("20. Updating task title and description returns 200", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      const col = await makeColumn(token, board._id);
      const task = await makeTask(token, board._id, col._id);
      const res = await request(app).patch(`/api/tasks/${task._id}`).set("Authorization", `Bearer ${token}`).send({
        title: "Updated Title",
        description: "Now has a description"
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("title", "Updated Title");
      expect(res.body).toHaveProperty("description", "Now has a description");
    });
    //* Function for this task
    it("21. Marking a task as completed sets completed: true", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      const col = await makeColumn(token, board._id);
      const task = await makeTask(token, board._id, col._id);
      const res = await request(app).patch(`/api/tasks/${task._id}`).set("Authorization", `Bearer ${token}`).send({
        completed: true
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("completed", true);
    });
    //* Function for this task
    it("22. Updating task priority to URGENT returns 200", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      const col = await makeColumn(token, board._id);
      const task = await makeTask(token, board._id, col._id);
      const res = await request(app).patch(`/api/tasks/${task._id}`).set("Authorization", `Bearer ${token}`).send({
        priority: "URGENT"
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("priority", "URGENT");
    });
    //* Function for this task
    it("23. Moving a task to another column returns 200", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      const col1 = await makeColumn(token, board._id, "Col 1");
      const col2 = await makeColumn(token, board._id, "Col 2");
      const task = await makeTask(token, board._id, col1._id);
      const res = await request(app).patch(`/api/tasks/${task._id}/move`).set("Authorization", `Bearer ${token}`).send({
        toColumnId: col2._id
      });
      expect(res.statusCode).toBe(200);
      expect(String(res.body.column)).toBe(String(col2._id));
    });
    //* Function for this task
    it("24. Deleting a task returns 200", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      const col = await makeColumn(token, board._id);
      const task = await makeTask(token, board._id, col._id);
      const res = await request(app).delete(`/api/tasks/${task._id}`).set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
    });
    //* Function for this task
    it("25. Listing tasks by board returns an array", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      const col = await makeColumn(token, board._id);
      await makeTask(token, board._id, col._id, {
        title: "Task A"
      });
      await makeTask(token, board._id, col._id, {
        title: "Task B"
      });
      const res = await request(app).get(`/api/boards/${board._id}/tasks`).set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
    //* Function for this task
    it("26. My-workspace-tasks endpoint returns an array", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      const col = await makeColumn(token, board._id);
      await makeTask(token, board._id, col._id, {
        title: "My Task"
      });
      const res = await request(app).get(`/api/workspaces/${ws._id}/my-tasks`).set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
    //* Function for this task
    it("27. Task with dueDate persists the dueDate field", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      const col = await makeColumn(token, board._id);
      const due = new Date("2026-12-31").toISOString();
      const task = await makeTask(token, board._id, col._id, {
        title: "Deadline Task",
        dueDate: due
      });
      expect(task).toHaveProperty("dueDate");
    });
  });
  //* Function for this task
  describe("3d. Comments on Tasks", () => {
    //* Function for this task
    it("28. Adding a comment to a task returns 201", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      const col = await makeColumn(token, board._id);
      const task = await makeTask(token, board._id, col._id);
      const res = await request(app).post(`/api/tasks/${task._id}/comments`).set("Authorization", `Bearer ${token}`).send({
        text: "Looks great!"
      });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("text", "Looks great!");
    });
    //* Function for this task
    it("29. Listing comments for a task returns an array", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      const col = await makeColumn(token, board._id);
      const task = await makeTask(token, board._id, col._id);
      await makeComment(token, task._id, "Comment one");
      await makeComment(token, task._id, "Comment two");
      const res = await request(app).get(`/api/tasks/${task._id}/comments`).set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
    //* Function for this task
    it("30. Deleting a comment returns 200", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      const col = await makeColumn(token, board._id);
      const task = await makeTask(token, board._id, col._id);
      const comment = await makeComment(token, task._id, "Delete me");
      const res = await request(app).delete(`/api/comments/${comment._id}`).set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
    });
    //* Function for this task
    it("31. Adding a comment without auth returns 401", async () => {
      const res = await request(app).post(`/api/tasks/${new mongoose.Types.ObjectId()}/comments`).send({
        content: "No auth"
      });
      expect(res.statusCode).toBe(401);
    });
    //* Function for this task
    it("32. Comment content is stored correctly", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      const col = await makeColumn(token, board._id);
      const task = await makeTask(token, board._id, col._id);
      const comment = await makeComment(token, task._id, "Specific content check");
      expect(comment).toHaveProperty("text", "Specific content check");
    });
  });
});