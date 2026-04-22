import request from "supertest";
import mongoose from "mongoose";
import Notification from "../models/Notification.model.js";
import { app, connectTestDB, disconnectTestDB, clearCollections, createVerifiedUser, createSecondUser } from "./helpers/setup.js";
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
//* Function for seed notif
const seedNotif = (userId, overrides = {}) => Notification.create({
  user: userId,
  type: "task_assigned",
  message: "You were assigned a task",
  meta: {
    taskId: new mongoose.Types.ObjectId()
  },
  ...overrides
});
//* Function for this task
describe("Module 8: Notifications", () => {
  //* Function for this task
  describe("8a. List Notifications", () => {
    //* Function for this task
    it("1. GET /api/notifications without auth returns 401", async () => {
      const res = await request(app).get("/api/notifications");
      expect(res.statusCode).toBe(401);
    });
    //* Function for this task
    it("2. GET returns an empty array when user has no notifications", async () => {
      const {
        token
      } = await createVerifiedUser();
      const res = await request(app).get("/api/notifications").set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
    //* Function for this task
    it("3. GET returns all seeded notifications for the user", async () => {
      const {
        user,
        token
      } = await createVerifiedUser();
      await seedNotif(user._id, {
        message: "Notif 1"
      });
      await seedNotif(user._id, {
        message: "Notif 2"
      });
      await seedNotif(user._id, {
        message: "Notif 3"
      });
      const res = await request(app).get("/api/notifications").set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(3);
    });
    //* Function for this task
    it("4. User only receives their own notifications, not other users'", async () => {
      const {
        user: u1,
        token
      } = await createVerifiedUser();
      const {
        user: u2
      } = await createSecondUser();
      await seedNotif(u1._id, {
        message: "For user 1"
      });
      await seedNotif(u2._id, {
        message: "For user 2 — should not appear"
      });
      const res = await request(app).get("/api/notifications").set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].message).toBe("For user 1");
    });
    //* Function for this task
    it("5. Each notification has user, type, message, readAt, and _id fields", async () => {
      const {
        user,
        token
      } = await createVerifiedUser();
      await seedNotif(user._id);
      const res = await request(app).get("/api/notifications").set("Authorization", `Bearer ${token}`);
      const notif = res.body[0];
      expect(notif).toHaveProperty("_id");
      expect(notif).toHaveProperty("type");
      expect(notif).toHaveProperty("message");
      expect(notif).toHaveProperty("readAt");
    });
    //* Function for this task
    it("6. Unread notification has readAt: null by default", async () => {
      const {
        user,
        token
      } = await createVerifiedUser();
      await seedNotif(user._id);
      const res = await request(app).get("/api/notifications").set("Authorization", `Bearer ${token}`);
      expect(res.body[0].readAt).toBeNull();
    });
    //* Function for this task
    it("7. Supports multiple notification types", async () => {
      const {
        user,
        token
      } = await createVerifiedUser();
      await seedNotif(user._id, {
        type: "task_assigned",
        message: "Assigned"
      });
      await seedNotif(user._id, {
        type: "task_comment",
        message: "Commented"
      });
      await seedNotif(user._id, {
        type: "member_joined",
        message: "Joined"
      });
      const res = await request(app).get("/api/notifications").set("Authorization", `Bearer ${token}`);
      //* Function for types
      const types = res.body.map(n => n.type);
      expect(types).toContain("task_assigned");
      expect(types).toContain("task_comment");
      expect(types).toContain("member_joined");
    });
  });
  //* Function for this task
  describe("8b. Mark as Read", () => {
    //* Function for this task
    it("8. PATCH /:id/read without auth returns 401", async () => {
      const res = await request(app).patch("/api/notifications/fakeid/read");
      expect(res.statusCode).toBe(401);
    });
    //* Function for this task
    it("9. PATCH /:id/read marks notification as read and returns { read: true }", async () => {
      const {
        user,
        token
      } = await createVerifiedUser();
      const notif = await seedNotif(user._id);
      const res = await request(app).patch(`/api/notifications/${notif._id}/read`).set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("read", true);
    });
    //* Function for this task
    it("10. After PATCH /:id/read, the notification has a non-null readAt", async () => {
      const {
        user,
        token
      } = await createVerifiedUser();
      const notif = await seedNotif(user._id);
      await request(app).patch(`/api/notifications/${notif._id}/read`).set("Authorization", `Bearer ${token}`);
      const updated = await Notification.findById(notif._id);
      expect(updated.readAt).not.toBeNull();
    });
    //* Function for this task
    it("11. PATCH /:id/read for another user's notification does not error (silent no-op)", async () => {
      const {
        user: u1
      } = await createVerifiedUser();
      const {
        token: t2
      } = await createSecondUser();
      const notif = await seedNotif(u1._id);
      const res = await request(app).patch(`/api/notifications/${notif._id}/read`).set("Authorization", `Bearer ${t2}`);
      expect(res.statusCode).toBe(200);
      const unchanged = await Notification.findById(notif._id);
      expect(unchanged.readAt).toBeNull();
    });
    //* Function for this task
    it("12. PATCH /read-all marks all user notifications as read", async () => {
      const {
        user,
        token
      } = await createVerifiedUser();
      await seedNotif(user._id, {
        message: "N1"
      });
      await seedNotif(user._id, {
        message: "N2"
      });
      await seedNotif(user._id, {
        message: "N3"
      });
      const res = await request(app).patch("/api/notifications/read-all").set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("readAll", true);
    });
    //* Function for this task
    it("13. After PATCH /read-all, all notifications have a non-null readAt", async () => {
      const {
        user,
        token
      } = await createVerifiedUser();
      await seedNotif(user._id, {
        message: "A"
      });
      await seedNotif(user._id, {
        message: "B"
      });
      await request(app).patch("/api/notifications/read-all").set("Authorization", `Bearer ${token}`);
      const all = await Notification.find({
        user: user._id
      });
      //* Function for this task
      all.forEach(n => expect(n.readAt).not.toBeNull());
    });
    //* Function for this task
    it("14. PATCH /read-all without auth returns 401", async () => {
      const res = await request(app).patch("/api/notifications/read-all");
      expect(res.statusCode).toBe(401);
    });
  });
  //* Function for this task
  describe("8c. Delete Notifications", () => {
    //* Function for this task
    it("15. DELETE /:id without auth returns 401", async () => {
      const res = await request(app).delete("/api/notifications/fakeid");
      expect(res.statusCode).toBe(401);
    });
    //* Function for this task
    it("16. DELETE /:id returns { deleted: true }", async () => {
      const {
        user,
        token
      } = await createVerifiedUser();
      const notif = await seedNotif(user._id);
      const res = await request(app).delete(`/api/notifications/${notif._id}`).set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("deleted", true);
    });
    //* Function for this task
    it("17. After DELETE /:id the notification no longer exists in DB", async () => {
      const {
        user,
        token
      } = await createVerifiedUser();
      const notif = await seedNotif(user._id);
      await request(app).delete(`/api/notifications/${notif._id}`).set("Authorization", `Bearer ${token}`);
      const gone = await Notification.findById(notif._id);
      expect(gone).toBeNull();
    });
    //* Function for this task
    it("18. DELETE /read removes all read notifications and returns { deleted: true }", async () => {
      const {
        user,
        token
      } = await createVerifiedUser();
      const readNotif = await Notification.create({
        user: user._id,
        type: "task_assigned",
        message: "Was read",
        readAt: new Date()
      });
      const unreadNotif = await seedNotif(user._id, {
        message: "Still unread"
      });
      const res = await request(app).delete("/api/notifications/read").set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("deleted");
      expect(typeof res.body.deleted).toBe("number");
      expect(await Notification.findById(readNotif._id)).toBeNull();
      expect(await Notification.findById(unreadNotif._id)).not.toBeNull();
    });
    //* Function for this task
    it("19. DELETE /read without auth returns 401", async () => {
      const res = await request(app).delete("/api/notifications/read");
      expect(res.statusCode).toBe(401);
    });
    //* Function for this task
    it("20. Deleting another user's notification does not remove it", async () => {
      const {
        user: u1
      } = await createVerifiedUser();
      const {
        token: t2
      } = await createSecondUser();
      const notif = await seedNotif(u1._id);
      await request(app).delete(`/api/notifications/${notif._id}`).set("Authorization", `Bearer ${t2}`);
      expect(await Notification.findById(notif._id)).not.toBeNull();
    });
  });
});