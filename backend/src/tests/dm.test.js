import request from "supertest";
import mongoose from "mongoose";
import { app, connectTestDB, disconnectTestDB, clearCollections, createVerifiedUser, createSecondUser, createThirdUser, createWorkspace, addWorkspaceMember } from "./helpers/setup.js";
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
//* Function for create or get dm
const createOrGetDM = async (token, wsId, otherUserId) => {
  const res = await request(app).post(`/api/workspaces/${wsId}/dms`).set("Authorization", `Bearer ${token}`).send({
    otherUserId: String(otherUserId)
  });
  return res.body;
};
//* Function for send dmmessage
const sendDMMessage = async (token, dmId, content = "Hey!") => {
  const res = await request(app).post(`/api/dms/${dmId}/messages`).set("Authorization", `Bearer ${token}`).send({
    content
  });
  return res.body;
};
//* Function for this task
describe("Module 5: Direct Messages", () => {
  //* Function for this task
  describe("5a. DM Conversations", () => {
    //* Function for this task
    it("1. Creating a DM without auth returns 401", async () => {
      const res = await request(app).post("/api/workspaces/fakeid/dms").send({
        otherUserId: "123"
      });
      expect(res.statusCode).toBe(401);
    });
    //* Function for this task
    it("2. Creating a DM with a workspace member returns 200 or 201", async () => {
      const {
        token
      } = await createVerifiedUser();
      const {
        user: u2
      } = await createSecondUser();
      const ws = await createWorkspace(token);
      await addWorkspaceMember(ws._id, u2._id);
      const res = await request(app).post(`/api/workspaces/${ws._id}/dms`).set("Authorization", `Bearer ${token}`).send({
        otherUserId: String(u2._id)
      });
      expect([200, 201]).toContain(res.statusCode);
      expect(res.body).toHaveProperty("_id");
    });
    //* Function for this task
    it("3. DM has both users as participants", async () => {
      const {
        user: u1,
        token
      } = await createVerifiedUser();
      const {
        user: u2
      } = await createSecondUser();
      const ws = await createWorkspace(token);
      await addWorkspaceMember(ws._id, u2._id);
      const dm = await createOrGetDM(token, ws._id, u2._id);
      const participantIds = (dm.participants || []).map(String);
      expect(participantIds).toContain(String(u1._id));
      expect(participantIds).toContain(String(u2._id));
    });
    //* Function for this task
    it("4. Creating a DM with the same user is idempotent (returns same ID)", async () => {
      const {
        token
      } = await createVerifiedUser();
      const {
        user: u2
      } = await createSecondUser();
      const ws = await createWorkspace(token);
      await addWorkspaceMember(ws._id, u2._id);
      const dm1 = await createOrGetDM(token, ws._id, u2._id);
      const dm2 = await createOrGetDM(token, ws._id, u2._id);
      expect(dm1._id).toBe(dm2._id);
    });
    //* Function for this task
    it("5. Listing DMs returns an array", async () => {
      const {
        token
      } = await createVerifiedUser();
      const {
        user: u2
      } = await createSecondUser();
      const ws = await createWorkspace(token);
      await addWorkspaceMember(ws._id, u2._id);
      await createOrGetDM(token, ws._id, u2._id);
      const res = await request(app).get(`/api/workspaces/${ws._id}/dms`).set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
    //* Function for this task
    it("6. User who is not a workspace member cannot create DM (returns 403)", async () => {
      const {
        token: t1
      } = await createVerifiedUser({
        email: "dm6owner@example.com"
      });
      const {
        token: t2
      } = await createSecondUser();
      const {
        user: u3
      } = await createThirdUser();
      const ws = await createWorkspace(t1);
      const res = await request(app).post(`/api/workspaces/${ws._id}/dms`).set("Authorization", `Bearer ${t2}`).send({
        otherUserId: String(u3._id)
      });
      expect([403, 404]).toContain(res.statusCode);
    });
  });
  //* Function for this task
  describe("5b. DM Messages", () => {
    //* Function for this task
    it("7. Sending a DM message returns 201 with content", async () => {
      const {
        token
      } = await createVerifiedUser();
      const {
        user: u2
      } = await createSecondUser();
      const ws = await createWorkspace(token);
      await addWorkspaceMember(ws._id, u2._id);
      const dm = await createOrGetDM(token, ws._id, u2._id);
      const res = await request(app).post(`/api/dms/${dm._id}/messages`).set("Authorization", `Bearer ${token}`).send({
        content: "Hello via DM!"
      });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("content", "Hello via DM!");
    });
    //* Function for this task
    it("8. Non-participant cannot send a DM message (returns 403)", async () => {
      const {
        token: t1
      } = await createVerifiedUser({
        email: "dm8a@example.com"
      });
      const {
        user: u2
      } = await createSecondUser();
      const {
        token: t3
      } = await createThirdUser();
      const ws = await createWorkspace(t1);
      await addWorkspaceMember(ws._id, u2._id);
      const dm = await createOrGetDM(t1, ws._id, u2._id);
      const res = await request(app).post(`/api/dms/${dm._id}/messages`).set("Authorization", `Bearer ${t3}`).send({
        content: "Sneak message"
      });
      expect([403, 404]).toContain(res.statusCode);
    });
    //* Function for this task
    it("9. Listing DM messages returns an array", async () => {
      const {
        token
      } = await createVerifiedUser();
      const {
        user: u2
      } = await createSecondUser();
      const ws = await createWorkspace(token);
      await addWorkspaceMember(ws._id, u2._id);
      const dm = await createOrGetDM(token, ws._id, u2._id);
      await sendDMMessage(token, dm._id, "Msg 1");
      await sendDMMessage(token, dm._id, "Msg 2");
      const res = await request(app).get(`/api/dms/${dm._id}/messages`).set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
    //* Function for this task
    it("10. Editing a DM message returns 200 with updated content", async () => {
      const {
        token
      } = await createVerifiedUser();
      const {
        user: u2
      } = await createSecondUser();
      const ws = await createWorkspace(token);
      await addWorkspaceMember(ws._id, u2._id);
      const dm = await createOrGetDM(token, ws._id, u2._id);
      const msg = await sendDMMessage(token, dm._id, "Original DM");
      const res = await request(app).patch(`/api/messages/${msg._id}`).set("Authorization", `Bearer ${token}`).send({
        content: "Edited DM"
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("content", "Edited DM");
    });
    //* Function for this task
    it("11. Deleting a DM message returns 200", async () => {
      const {
        token
      } = await createVerifiedUser();
      const {
        user: u2
      } = await createSecondUser();
      const ws = await createWorkspace(token);
      await addWorkspaceMember(ws._id, u2._id);
      const dm = await createOrGetDM(token, ws._id, u2._id);
      const msg = await sendDMMessage(token, dm._id, "Delete DM msg");
      const res = await request(app).delete(`/api/messages/${msg._id}`).set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
    });
    //* Function for this task
    it("12. Reacting to a DM message returns 200 or 201", async () => {
      const {
        token
      } = await createVerifiedUser();
      const {
        user: u2
      } = await createSecondUser();
      const ws = await createWorkspace(token);
      await addWorkspaceMember(ws._id, u2._id);
      const dm = await createOrGetDM(token, ws._id, u2._id);
      const msg = await sendDMMessage(token, dm._id, "React to DM");
      const res = await request(app).post(`/api/messages/${msg._id}/reactions`).set("Authorization", `Bearer ${token}`).send({
        emoji: "🔥"
      });
      expect([200, 201]).toContain(res.statusCode);
    });
    //* Function for this task
    it("13. Message sender is recorded correctly", async () => {
      const {
        user,
        token
      } = await createVerifiedUser();
      const {
        user: u2
      } = await createSecondUser();
      const ws = await createWorkspace(token);
      await addWorkspaceMember(ws._id, u2._id);
      const dm = await createOrGetDM(token, ws._id, u2._id);
      const msg = await sendDMMessage(token, dm._id, "Sender check");
      const senderId = msg.sender?._id ?? msg.sender;
      expect(String(senderId)).toBe(String(user._id));
    });
    //* Function for this task
    it("14. Both participants can list DM messages", async () => {
      const {
        token: t1
      } = await createVerifiedUser({
        email: "dm14a@example.com"
      });
      const {
        user: u2,
        token: t2
      } = await createSecondUser();
      const ws = await createWorkspace(t1);
      await addWorkspaceMember(ws._id, u2._id);
      const dm = await createOrGetDM(t1, ws._id, u2._id);
      await sendDMMessage(t1, dm._id, "From user 1");
      const res = await request(app).get(`/api/dms/${dm._id}/messages`).set("Authorization", `Bearer ${t2}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});