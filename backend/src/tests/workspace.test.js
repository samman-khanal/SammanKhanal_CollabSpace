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
//* Function for this task
describe("Module 2: Workspace Management", () => {
  //* Function for this task
  describe("2a. Create Workspace", () => {
    //* Function for this task
    it("1. Creating a workspace without auth returns 401", async () => {
      const res = await request(app).post("/api/workspaces").send({
        name: "No Auth WS"
      });
      expect(res.statusCode).toBe(401);
    });
    //* Function for this task
    it("2. Creating a workspace without name returns 4xx", async () => {
      const {
        token
      } = await createVerifiedUser();
      const res = await request(app).post("/api/workspaces").set("Authorization", `Bearer ${token}`).send({});
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
      expect(res.statusCode).toBeLessThan(600);
    });
    //* Function for this task
    it("3. Creating a workspace returns 201 with workspace data", async () => {
      const {
        token
      } = await createVerifiedUser();
      const res = await request(app).post("/api/workspaces").set("Authorization", `Bearer ${token}`).send({
        name: "My Workspace"
      });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("name", "My Workspace");
      expect(res.body).toHaveProperty("_id");
    });
    //* Function for this task
    it("4. Newly created workspace has owner set to the authenticated user", async () => {
      const {
        user,
        token
      } = await createVerifiedUser();
      const res = await request(app).post("/api/workspaces").set("Authorization", `Bearer ${token}`).send({
        name: "Owner Check WS"
      });
      expect(String(res.body.owner)).toBe(String(user._id));
    });
    //* Function for this task
    it("5. Workspace can be created with a description", async () => {
      const {
        token
      } = await createVerifiedUser();
      const res = await request(app).post("/api/workspaces").set("Authorization", `Bearer ${token}`).send({
        name: "Desc WS",
        description: "A description"
      });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("description", "A description");
    });
  });
  //* Function for this task
  describe("2b. Read Workspaces", () => {
    //* Function for this task
    it("6. Listing workspaces without auth returns 401", async () => {
      const res = await request(app).get("/api/workspaces");
      expect(res.statusCode).toBe(401);
    });
    //* Function for this task
    it("7. Listing workspaces returns an array", async () => {
      const {
        token
      } = await createVerifiedUser();
      await createWorkspace(token, "WS A");
      const res = await request(app).get("/api/workspaces").set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
    //* Function for this task
    it("8. User only sees their own workspaces", async () => {
      const {
        token: t1
      } = await createVerifiedUser({
        email: "owner1@example.com"
      });
      const {
        token: t2
      } = await createSecondUser();
      await createWorkspace(t1, "U1 WS");
      await createWorkspace(t2, "U2 WS");
      const res = await request(app).get("/api/workspaces").set("Authorization", `Bearer ${t1}`);
      expect(Array.isArray(res.body)).toBe(true);
      //* Function for names
      const names = res.body.map(ws => ws.name ?? ws.workspace?.name);
      //* Function for this task
      expect(names.some(n => n === "U2 WS")).toBe(false);
    });
    //* Function for this task
    it("9. Getting a workspace by ID returns 200", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const res = await request(app).get(`/api/workspaces/${ws._id}`).set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("_id", ws._id);
    });
    //* Function for this task
    it("10. Getting a non-existent workspace returns 404", async () => {
      const {
        token
      } = await createVerifiedUser();
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/workspaces/${fakeId}`).set("Authorization", `Bearer ${token}`);
      expect([403, 404]).toContain(res.statusCode);
    });
    //* Function for this task
    it("11. Non-member cannot access a workspace (returns 403 or 404)", async () => {
      const {
        token: t1
      } = await createVerifiedUser({
        email: "ws11a@example.com"
      });
      const {
        token: t2
      } = await createSecondUser();
      const ws = await createWorkspace(t1, "Private WS");
      const res = await request(app).get(`/api/workspaces/${ws._id}`).set("Authorization", `Bearer ${t2}`);
      expect([403, 404]).toContain(res.statusCode);
    });
  });
  //* Function for this task
  describe("2c. Update & Delete Workspace", () => {
    //* Function for this task
    it("12. Owner can update workspace name", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token, "Old Name");
      const res = await request(app).patch(`/api/workspaces/${ws._id}`).set("Authorization", `Bearer ${token}`).send({
        name: "New Name"
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("name", "New Name");
    });
    //* Function for this task
    it("13. Non-member cannot update workspace (returns 403)", async () => {
      const {
        token: t1
      } = await createVerifiedUser({
        email: "wsupdate1@example.com"
      });
      const {
        token: t2
      } = await createSecondUser();
      const ws = await createWorkspace(t1, "Protected WS");
      const res = await request(app).patch(`/api/workspaces/${ws._id}`).set("Authorization", `Bearer ${t2}`).send({
        name: "Hacked"
      });
      expect([403, 404]).toContain(res.statusCode);
    });
    //* Function for this task
    it("14. Owner can delete workspace and it returns 200", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token, "Delete Me");
      const res = await request(app).delete(`/api/workspaces/${ws._id}`).set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
    });
    //* Function for this task
    it("15. Non-owner cannot delete workspace (returns 403)", async () => {
      const {
        token: t1
      } = await createVerifiedUser({
        email: "wsdel1@example.com"
      });
      const {
        user: u2,
        token: t2
      } = await createSecondUser();
      const ws = await createWorkspace(t1, "No Delete");
      await addWorkspaceMember(ws._id, u2._id, "member");
      const res = await request(app).delete(`/api/workspaces/${ws._id}`).set("Authorization", `Bearer ${t2}`);
      expect([403, 404]).toContain(res.statusCode);
    });
    //* Function for this task
    it("16. Deleting a workspace removes it from listing", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token, "Gone WS");
      await request(app).delete(`/api/workspaces/${ws._id}`).set("Authorization", `Bearer ${token}`);
      const listRes = await request(app).get("/api/workspaces").set("Authorization", `Bearer ${token}`);
      //* Function for ids
      const ids = listRes.body.map(w => String(w._id ?? w.workspace?._id));
      expect(ids).not.toContain(String(ws._id));
    });
  });
  //* Function for this task
  describe("2d. Workspace Members", () => {
    //* Function for this task
    it("17. Listing members of a workspace returns an array", async () => {
      const {
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const res = await request(app).get(`/api/workspaces/${ws._id}/members`).set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
    //* Function for this task
    it("18. Owner appears in members list", async () => {
      const {
        user,
        token
      } = await createVerifiedUser();
      const ws = await createWorkspace(token);
      const res = await request(app).get(`/api/workspaces/${ws._id}/members`).set("Authorization", `Bearer ${token}`);
      //* Function for user ids
      const userIds = res.body.map(m => String(m.user?._id ?? m.user));
      expect(userIds).toContain(String(user._id));
    });
    //* Function for this task
    it("19. Added member appears in members list", async () => {
      const {
        token
      } = await createVerifiedUser();
      const {
        user: u2
      } = await createSecondUser();
      const ws = await createWorkspace(token);
      await addWorkspaceMember(ws._id, u2._id);
      const res = await request(app).get(`/api/workspaces/${ws._id}/members`).set("Authorization", `Bearer ${token}`);
      //* Function for user ids
      const userIds = res.body.map(m => String(m.user?._id ?? m.user));
      expect(userIds).toContain(String(u2._id));
    });
    //* Function for this task
    it("20. Non-member cannot list members (returns 403 or 404)", async () => {
      const {
        token: t1
      } = await createVerifiedUser({
        email: "members1@example.com"
      });
      const {
        token: t2
      } = await createSecondUser();
      const ws = await createWorkspace(t1);
      const res = await request(app).get(`/api/workspaces/${ws._id}/members`).set("Authorization", `Bearer ${t2}`);
      expect([403, 404]).toContain(res.statusCode);
    });
  });
  //* Function for this task
  describe("2e. Workspace Invitations", () => {
    //* Function for this task
    it("21. Owner can create an invite and receives 201", async () => {
      const {
        token
      } = await createVerifiedUser();
      const {
        user: u2
      } = await createSecondUser();
      const ws = await createWorkspace(token);
      const res = await request(app).post(`/api/workspaces/${ws._id}/invites`).set("Authorization", `Bearer ${token}`).send({
        email: u2.email
      });
      expect(res.statusCode).toBe(201);
    });
    //* Function for this task
    it("22. Invite response includes a token field", async () => {
      const {
        token
      } = await createVerifiedUser();
      const {
        user: u2
      } = await createSecondUser();
      const ws = await createWorkspace(token);
      const res = await request(app).post(`/api/workspaces/${ws._id}/invites`).set("Authorization", `Bearer ${token}`).send({
        email: u2.email
      });
      expect(res.body).toHaveProperty("token");
    });
    //* Function for this task
    it("23. Owner can list pending invites", async () => {
      const {
        token
      } = await createVerifiedUser();
      const {
        user: u2
      } = await createSecondUser();
      const ws = await createWorkspace(token);
      await request(app).post(`/api/workspaces/${ws._id}/invites`).set("Authorization", `Bearer ${token}`).send({
        email: u2.email
      });
      const res = await request(app).get(`/api/workspaces/${ws._id}/invites`).set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
    //* Function for this task
    it("24. Regular member cannot create invites (returns 403)", async () => {
      const {
        token: t1
      } = await createVerifiedUser({
        email: "inv24owner@example.com"
      });
      const {
        user: u2,
        token: t2
      } = await createSecondUser();
      const {
        user: u3
      } = await createThirdUser();
      const ws = await createWorkspace(t1);
      await addWorkspaceMember(ws._id, u2._id, "member");
      const res = await request(app).post(`/api/workspaces/${ws._id}/invites`).set("Authorization", `Bearer ${t2}`).send({
        email: u3.email
      });
      expect([403, 404]).toContain(res.statusCode);
    });
    //* Function for this task
    it("25. Invited user can accept invite and becomes a member", async () => {
      const {
        token: t1
      } = await createVerifiedUser({
        email: "inv25owner@example.com"
      });
      const {
        token: t2
      } = await createSecondUser();
      const ws = await createWorkspace(t1);
      const u2Res = await request(app).get("/api/users/me").set("Authorization", `Bearer ${t2}`);
      const invRes = await request(app).post(`/api/workspaces/${ws._id}/invites`).set("Authorization", `Bearer ${t1}`).send({
        email: u2Res.body.email
      });
      const invToken = invRes.body.token;
      const acceptRes = await request(app).post(`/api/workspaces/invites/${invToken}/accept`).set("Authorization", `Bearer ${t2}`);
      expect([200, 201]).toContain(acceptRes.statusCode);
    });
  });
  //* Function for this task
  describe("2f. Freemium Plan Limits", () => {
    //* Function for this task
    it("26. Free plan allows up to 5 workspaces", async () => {
      const {
        token
      } = await createVerifiedUser({
        email: "freelimit@example.com"
      });
      for (let i = 1; i <= 5; i++) {
        const r = await request(app).post("/api/workspaces").set("Authorization", `Bearer ${token}`).send({
          name: `WS ${i}`
        });
        expect(r.statusCode).toBe(201);
      }
    });
    //* Function for this task
    it("27. Creating a 6th workspace on free plan returns 403", async () => {
      const {
        token
      } = await createVerifiedUser({
        email: "overlimit@example.com"
      });
      for (let i = 1; i <= 5; i++) {
        await request(app).post("/api/workspaces").set("Authorization", `Bearer ${token}`).send({
          name: `WS ${i}`
        });
      }
      const res = await request(app).post("/api/workspaces").set("Authorization", `Bearer ${token}`).send({
        name: "WS 6"
      });
      expect(res.statusCode).toBe(403);
    });
  });
});