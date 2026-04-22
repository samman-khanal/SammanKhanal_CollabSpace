import request from "supertest";
import mongoose from "mongoose";
import Attachment from "../models/Attachment.model.js";
import cloudinary from "../config/cloudinary.config.js";
import { app, connectTestDB, disconnectTestDB, clearCollections, createVerifiedUser, createSecondUser, createWorkspace } from "./helpers/setup.js";
process.env.JWT_SECRET = "test_secret";
process.env.NODE_ENV = "test";
//* Function for upload stream
cloudinary.uploader.upload_stream = (_opts, cb) => {
  cb(null, {
    secure_url: "https://res.cloudinary.com/test/image/upload/fake.jpg",
    public_id: "collabspace/attachments/fake_test_id"
  });
  return {
    //* Function for end
    end: () => {}
  };
};
//* Function for destroy
cloudinary.uploader.destroy = async () => ({
  result: "ok"
});
//* Function for make board
const makeBoard = async (token, workspaceId, name = "Test Board") => {
  const res = await request(app).post(`/api/workspaces/${workspaceId}/boards`).set("Authorization", `Bearer ${token}`).send({
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
const makeTask = async (token, boardId, columnId, title = "Test Task") => {
  const res = await request(app).post(`/api/boards/${boardId}/columns/${columnId}/tasks`).set("Authorization", `Bearer ${token}`).send({
    title
  });
  return res.body;
};
//* Function for upload file
const uploadFile = (token, taskId, filename = "test.txt", mimetype = "text/plain") => request(app).post(`/api/tasks/${taskId}/attachments`).set("Authorization", `Bearer ${token}`).attach("file", Buffer.from("hello attachment"), {
  filename,
  contentType: mimetype
});
//* Function for seed attachment
const seedAttachment = (taskId, userId, overrides = {}) => Attachment.create({
  task: taskId,
  uploadedBy: userId,
  fileName: "seeded-file.txt",
  mimeType: "text/plain",
  size: 1024,
  url: "https://res.cloudinary.com/test/raw/upload/seeded.txt",
  publicId: "collabspace/attachments/seeded_test_id",
  ...overrides
});
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
//* Function for this task
describe("Module 9: Task Attachments", () => {
  //* Function for this task
  describe("9a. Upload Validation", () => {
    //* Function for this task
    it("1. POST /api/tasks/:taskId/attachments without auth returns 401", async () => {
      const res = await request(app).post("/api/tasks/fakeid/attachments").attach("file", Buffer.from("data"), {
        filename: "f.txt",
        contentType: "text/plain"
      });
      expect(res.statusCode).toBe(401);
    });
    //* Function for this task
    it("2. Uploading with no file returns 400", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      const col = await makeColumn(token, board._id);
      const task = await makeTask(token, board._id, col._id);
      const res = await request(app).post(`/api/tasks/${task._id}/attachments`).set("Authorization", `Bearer ${token}`).send({});
      expect(res.statusCode).toBe(400);
    });
  });
  //* Function for this task
  describe("9b. Successful Upload", () => {
    //* Function for this task
    it("3. Uploading a text file returns 201 with attachment data", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      const col = await makeColumn(token, board._id);
      const task = await makeTask(token, board._id, col._id);
      const res = await uploadFile(token, task._id, "notes.txt", "text/plain");
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("_id");
    });
    //* Function for this task
    it("4. Upload response includes fileName, mimeType, url, and task fields", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      const col = await makeColumn(token, board._id);
      const task = await makeTask(token, board._id, col._id);
      const res = await uploadFile(token, task._id, "notes.txt", "text/plain");
      expect(res.body).toHaveProperty("fileName", "notes.txt");
      expect(res.body).toHaveProperty("mimeType", "text/plain");
      expect(res.body).toHaveProperty("url");
      expect(String(res.body.task)).toBe(String(task._id));
    });
    //* Function for this task
    it("5. Upload response url comes from Cloudinary (mocked)", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      const col = await makeColumn(token, board._id);
      const task = await makeTask(token, board._id, col._id);
      const res = await uploadFile(token, task._id);
      expect(res.body.url).toBe("https://res.cloudinary.com/test/image/upload/fake.jpg");
    });
    //* Function for this task
    it("6. Uploading a PDF file returns 201", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      const col = await makeColumn(token, board._id);
      const task = await makeTask(token, board._id, col._id);
      const res = await uploadFile(token, task._id, "doc.pdf", "application/pdf");
      expect(res.statusCode).toBe(201);
    });
    //* Function for this task
    it("7. Uploading an image file returns 201", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      const col = await makeColumn(token, board._id);
      const task = await makeTask(token, board._id, col._id);
      const res = await uploadFile(token, task._id, "shot.png", "image/png");
      expect(res.statusCode).toBe(201);
    });
    //* Function for this task
    it("8. uploadedBy is set to the authenticated user", async () => {
      const {
        user,
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      const col = await makeColumn(token, board._id);
      const task = await makeTask(token, board._id, col._id);
      const res = await uploadFile(token, task._id);
      const uploadedById = res.body.uploadedBy?._id ?? res.body.uploadedBy;
      expect(String(uploadedById)).toBe(String(user._id));
    });
    //* Function for this task
    it("9. Multiple files can be attached to the same task", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      const col = await makeColumn(token, board._id);
      const task = await makeTask(token, board._id, col._id);
      await uploadFile(token, task._id, "a.txt", "text/plain");
      await uploadFile(token, task._id, "b.txt", "text/plain");
      const list = await request(app).get(`/api/tasks/${task._id}/attachments`).set("Authorization", `Bearer ${token}`);
      expect(list.body.length).toBeGreaterThanOrEqual(2);
    });
  });
  //* Function for this task
  describe("9c. List Attachments", () => {
    //* Function for this task
    it("10. GET /api/tasks/:taskId/attachments without auth returns 401", async () => {
      const res = await request(app).get("/api/tasks/fakeid/attachments");
      expect(res.statusCode).toBe(401);
    });
    //* Function for this task
    it("11. GET returns an empty array when task has no attachments", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      const col = await makeColumn(token, board._id);
      const task = await makeTask(token, board._id, col._id);
      const res = await request(app).get(`/api/tasks/${task._id}/attachments`).set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
    //* Function for this task
    it("12. GET returns seeded attachments for a task", async () => {
      const {
        user,
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      const col = await makeColumn(token, board._id);
      const task = await makeTask(token, board._id, col._id);
      await seedAttachment(task._id, user._id, {
        fileName: "file1.txt"
      });
      await seedAttachment(task._id, user._id, {
        fileName: "file2.txt"
      });
      const res = await request(app).get(`/api/tasks/${task._id}/attachments`).set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
    //* Function for this task
    it("13. Each attachment in list has fileName, mimeType, url, and _id", async () => {
      const {
        user,
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      const col = await makeColumn(token, board._id);
      const task = await makeTask(token, board._id, col._id);
      await seedAttachment(task._id, user._id);
      const res = await request(app).get(`/api/tasks/${task._id}/attachments`).set("Authorization", `Bearer ${token}`);
      const att = res.body[0];
      expect(att).toHaveProperty("_id");
      expect(att).toHaveProperty("fileName");
      expect(att).toHaveProperty("mimeType");
      expect(att).toHaveProperty("url");
    });
  });
  //* Function for this task
  describe("9d. Delete Attachments", () => {
    //* Function for this task
    it("14. DELETE without auth returns 401", async () => {
      const res = await request(app).delete("/api/attachments/fakeid");
      expect(res.statusCode).toBe(401);
    });
    //* Function for this task
    it("15. Uploader can delete their own attachment and receives { deleted: true }", async () => {
      const {
        user,
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      const col = await makeColumn(token, board._id);
      const task = await makeTask(token, board._id, col._id);
      const att = await seedAttachment(task._id, user._id);
      const res = await request(app).delete(`/api/attachments/${att._id}`).set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("deleted", true);
    });
    //* Function for this task
    it("16. After deletion, the attachment is removed from the DB", async () => {
      const {
        user,
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      const col = await makeColumn(token, board._id);
      const task = await makeTask(token, board._id, col._id);
      const att = await seedAttachment(task._id, user._id);
      await request(app).delete(`/api/attachments/${att._id}`).set("Authorization", `Bearer ${token}`);
      expect(await Attachment.findById(att._id)).toBeNull();
    });
    //* Function for this task
    it("17. Another user cannot delete someone else's attachment (returns 403)", async () => {
      const {
        user: u1
      } = await createVerifiedUser();
      const {
        token: t2
      } = await createSecondUser();
      const ws = await createWorkspace(t2);
      const board = await makeBoard(t2, ws._id);
      const col = await makeColumn(t2, board._id);
      const task = await makeTask(t2, board._id, col._id);
      const att = await seedAttachment(task._id, u1._id);
      const res = await request(app).delete(`/api/attachments/${att._id}`).set("Authorization", `Bearer ${t2}`);
      expect(res.statusCode).toBe(403);
    });
    //* Function for this task
    it("18. Deleting a non-existent attachment returns 404", async () => {
      const {
        token
      } = await createVerifiedUser();
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/attachments/${fakeId}`).set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(404);
    });
    //* Function for this task
    it("19. After delete, the attachment no longer appears in the task list", async () => {
      const {
        user,
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const board = await makeBoard(token, ws._id);
      const col = await makeColumn(token, board._id);
      const task = await makeTask(token, board._id, col._id);
      const att = await seedAttachment(task._id, user._id);
      await request(app).delete(`/api/attachments/${att._id}`).set("Authorization", `Bearer ${token}`);
      const list = await request(app).get(`/api/tasks/${task._id}/attachments`).set("Authorization", `Bearer ${token}`);
      //* Function for ids
      const ids = list.body.map(a => String(a._id));
      expect(ids).not.toContain(String(att._id));
    });
  });
});