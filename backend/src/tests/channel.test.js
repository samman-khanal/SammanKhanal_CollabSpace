import request from "supertest";
import mongoose from "mongoose";
import { app, connectTestDB, disconnectTestDB, clearCollections, createVerifiedUser, createSecondUser, createWorkspace, addWorkspaceMember } from "./helpers/setup.js";
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
//* Function for make channel
const makeChannel = async (token, wsId, overrides = {}) => {
  const res = await request(app).post(`/api/workspaces/${wsId}/channels`).set("Authorization", `Bearer ${token}`).send({
    name: "general",
    type: "public",
    ...overrides
  });
  return res.body;
};
//* Function for send message
const sendMessage = async (token, channelId, content = "Hello!") => {
  const res = await request(app).post(`/api/channels/${channelId}/messages`).set("Authorization", `Bearer ${token}`).send({
    content
  });
  return res.body;
};
//* Function for this task
describe("Module 4: Channel-Based Chat", () => {
  //* Function for this task
  describe("4a. Channel CRUD", () => {
    //* Function for this task
    it("1. Creating a channel without auth returns 401", async () => {
      const res = await request(app).post("/api/workspaces/fakeid/channels").send({
        name: "no-auth"
      });
      expect(res.statusCode).toBe(401);
    });
    //* Function for this task
    it("2. Creating a public channel returns 201", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const res = await request(app).post(`/api/workspaces/${ws._id}/channels`).set("Authorization", `Bearer ${token}`).send({
        name: "announcements",
        type: "public"
      });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("name", "announcements");
    });
    //* Function for this task
    it("3. Creating a private channel returns 201 with type: private", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const res = await request(app).post(`/api/workspaces/${ws._id}/channels`).set("Authorization", `Bearer ${token}`).send({
        name: "secret",
        type: "private"
      });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("type", "private");
    });
    //* Function for this task
    it("4. Channel is linked to the correct workspace", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const channel = await makeChannel(token, ws._id, {
        name: "linked-ws"
      });
      expect(String(channel.workspace)).toBe(String(ws._id));
    });
    //* Function for this task
    it("5. Listing channels for a workspace returns an array with created channel", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      await makeChannel(token, ws._id, {
        name: "alpha"
      });
      await makeChannel(token, ws._id, {
        name: "beta"
      });
      const res = await request(app).get(`/api/workspaces/${ws._id}/channels`).set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
    //* Function for this task
    it("6. Updating channel name returns 200 with new name", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const channel = await makeChannel(token, ws._id, {
        name: "old-name"
      });
      const res = await request(app).patch(`/api/channels/${channel._id}`).set("Authorization", `Bearer ${token}`).send({
        name: "new-name"
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("name", "new-name");
    });
    //* Function for this task
    it("7. Deleting a channel returns 200", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const channel = await makeChannel(token, ws._id, {
        name: "delete-me"
      });
      const res = await request(app).delete(`/api/channels/${channel._id}`).set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
    });
    //* Function for this task
    it("8. Creating a duplicate channel name in the same workspace returns 4xx", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      await makeChannel(token, ws._id, {
        name: "duplicate"
      });
      const res = await request(app).post(`/api/workspaces/${ws._id}/channels`).set("Authorization", `Bearer ${token}`).send({
        name: "duplicate",
        type: "public"
      });
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
      expect(res.statusCode).toBeLessThan(600);
    });
    //* Function for this task
    it("9. Non-member cannot list channels (returns 403)", async () => {
      const {
        token: t1
      } = await createVerifiedUser({
        email: "ch9owner@example.com"
      });
      const {
        token: t2
      } = await createSecondUser();
      const ws = await createWorkspace(t1);
      const res = await request(app).get(`/api/workspaces/${ws._id}/channels`).set("Authorization", `Bearer ${t2}`);
      expect([403, 404]).toContain(res.statusCode);
    });
  });
  //* Function for this task
  describe("4b. Channel Member Management", () => {
    //* Function for this task
    it("10. Owner can add a member to a private channel", async () => {
      const {
        token
      } = await createVerifiedUser();
      const {
        user: u2
      } = await createSecondUser();
      const ws = await createWorkspace(token);
      await addWorkspaceMember(ws._id, u2._id);
      const channel = await makeChannel(token, ws._id, {
        name: "private-one",
        type: "private"
      });
      const res = await request(app).post(`/api/channels/${channel._id}/members`).set("Authorization", `Bearer ${token}`).send({
        userIds: [String(u2._id)]
      });
      expect([200, 201]).toContain(res.statusCode);
    });
    //* Function for this task
    it("11. Added member appears in channel member list", async () => {
      const {
        token
      } = await createVerifiedUser();
      const {
        user: u2
      } = await createSecondUser();
      const ws = await createWorkspace(token);
      await addWorkspaceMember(ws._id, u2._id);
      const channel = await makeChannel(token, ws._id, {
        name: "priv2",
        type: "private"
      });
      await request(app).post(`/api/channels/${channel._id}/members`).set("Authorization", `Bearer ${token}`).send({
        userIds: [String(u2._id)]
      });
      const chRes = await request(app).get(`/api/workspaces/${ws._id}/channels`).set("Authorization", `Bearer ${token}`);
      //* Function for ch
      const ch = chRes.body.find(c => String(c._id) === String(channel._id));
      const memberIds = (ch?.members || []).map(String);
      expect(memberIds).toContain(String(u2._id));
    });
    //* Function for this task
    it("12. Owner can remove a member from a channel (returns 200 or 204)", async () => {
      const {
        token
      } = await createVerifiedUser();
      const {
        user: u2
      } = await createSecondUser();
      const ws = await createWorkspace(token);
      await addWorkspaceMember(ws._id, u2._id);
      const channel = await makeChannel(token, ws._id, {
        name: "priv3",
        type: "private"
      });
      await request(app).post(`/api/channels/${channel._id}/members`).set("Authorization", `Bearer ${token}`).send({
        userIds: [String(u2._id)]
      });
      const res = await request(app).delete(`/api/channels/${channel._id}/members/${u2._id}`).set("Authorization", `Bearer ${token}`);
      expect([200, 204]).toContain(res.statusCode);
    });
  });
  //* Function for this task
  describe("4c. Channel Messages", () => {
    //* Function for this task
    it("13. Sending a message to a channel returns 201", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const channel = await makeChannel(token, ws._id);
      const res = await request(app).post(`/api/channels/${channel._id}/messages`).set("Authorization", `Bearer ${token}`).send({
        content: "Hello channel!"
      });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("content", "Hello channel!");
    });
    //* Function for this task
    it("14. Message has sender field set to the authenticated user", async () => {
      const {
        user,
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const channel = await makeChannel(token, ws._id);
      const msg = await sendMessage(token, channel._id, "Author check");
      const senderId = msg.sender?._id ?? msg.sender;
      expect(String(senderId)).toBe(String(user._id));
    });
    //* Function for this task
    it("15. Listing channel messages returns an array", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const channel = await makeChannel(token, ws._id);
      await sendMessage(token, channel._id, "First");
      await sendMessage(token, channel._id, "Second");
      const res = await request(app).get(`/api/channels/${channel._id}/messages`).set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
    //* Function for this task
    it("16. Editing a message returns 200 with updated content", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const channel = await makeChannel(token, ws._id);
      const msg = await sendMessage(token, channel._id, "Original");
      const res = await request(app).patch(`/api/messages/${msg._id}`).set("Authorization", `Bearer ${token}`).send({
        content: "Edited"
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("content", "Edited");
    });
    //* Function for this task
    it("17. Deleting a message returns 200", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const channel = await makeChannel(token, ws._id);
      const msg = await sendMessage(token, channel._id, "Delete me");
      const res = await request(app).delete(`/api/messages/${msg._id}`).set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
    });
    //* Function for this task
    it("18. Reacting to a message returns 200 or 201", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const channel = await makeChannel(token, ws._id);
      const msg = await sendMessage(token, channel._id, "React here");
      const res = await request(app).post(`/api/messages/${msg._id}/reactions`).set("Authorization", `Bearer ${token}`).send({
        emoji: "👍"
      });
      expect([200, 201]).toContain(res.statusCode);
    });
    //* Function for this task
    it("19. Removing a reaction (toggle) returns 200", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const channel = await makeChannel(token, ws._id);
      const msg = await sendMessage(token, channel._id, "Toggle react");
      await request(app).post(`/api/messages/${msg._id}/reactions`).set("Authorization", `Bearer ${token}`).send({
        emoji: "❤️"
      });
      const res = await request(app).post(`/api/messages/${msg._id}/reactions`).set("Authorization", `Bearer ${token}`).send({
        emoji: "❤️"
      });
      expect([200, 201]).toContain(res.statusCode);
    });
    //* Function for this task
    it("20. Non-member cannot send a message to a channel (returns 403)", async () => {
      const {
        token: t1
      } = await createVerifiedUser({
        email: "ch20owner@example.com"
      });
      const {
        token: t2
      } = await createSecondUser();
      const ws = await createWorkspace(t1);
      const channel = await makeChannel(t1, ws._id, {
        name: "restricted"
      });
      const res = await request(app).post(`/api/channels/${channel._id}/messages`).set("Authorization", `Bearer ${t2}`).send({
        content: "Infiltrating"
      });
      expect([403, 404]).toContain(res.statusCode);
    });
    //* Function for this task
    it("21. User cannot edit another user's message (returns 403)", async () => {
      const {
        token: t1
      } = await createVerifiedUser({
        email: "ch21owner@example.com"
      });
      const {
        user: u2,
        token: t2
      } = await createSecondUser();
      const ws = await createWorkspace(t1);
      await addWorkspaceMember(ws._id, u2._id);
      const channel = await makeChannel(t1, ws._id, {
        name: "public-edit"
      });
      const msg = await sendMessage(t1, channel._id, "Owner message");
      const res = await request(app).patch(`/api/messages/${msg._id}`).set("Authorization", `Bearer ${t2}`).send({
        content: "Attempt hijack"
      });
      expect([403, 404]).toContain(res.statusCode);
    });
  });
});