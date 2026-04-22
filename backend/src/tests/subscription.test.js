import request from "supertest";
import { app, connectTestDB, disconnectTestDB, clearCollections, createVerifiedUser } from "./helpers/setup.js";
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
describe("Module 6: Subscriptions & Payments", () => {
  //* Function for this task
  describe("6a. Public Plan Info", () => {
    //* Function for this task
    it("1. GET /api/subscriptions/plans requires no auth and returns 200", async () => {
      const res = await request(app).get("/api/subscriptions/plans");
      expect(res.statusCode).toBe(200);
    });
    //* Function for this task
    it("2. Plans response is an array", async () => {
      const res = await request(app).get("/api/subscriptions/plans");
      expect(Array.isArray(res.body)).toBe(true);
    });
    //* Function for this task
    it("3. Plans include a free plan", async () => {
      const res = await request(app).get("/api/subscriptions/plans");
      //* Function for ids
      const ids = res.body.map(p => (p.id ?? p.planId ?? p.name ?? "").toLowerCase());
      //* Function for this task
      expect(ids.some(id => id.includes("free"))).toBe(true);
    });
    //* Function for this task
    it("4. Plans include plus and pro tiers", async () => {
      const res = await request(app).get("/api/subscriptions/plans");
      //* Function for ids
      const ids = res.body.map(p => (p.id ?? p.planId ?? p.name ?? "").toLowerCase());
      //* Function for this task
      expect(ids.some(id => id.includes("plus"))).toBe(true);
      //* Function for this task
      expect(ids.some(id => id.includes("pro"))).toBe(true);
    });
    //* Function for this task
    it("5. Each plan has a price property", async () => {
      const res = await request(app).get("/api/subscriptions/plans");
      //* Function for this task
      res.body.forEach(plan => {
        expect(plan).toHaveProperty("price");
      });
    });
  });
  //* Function for this task
  describe("6b. User Subscription", () => {
    //* Function for this task
    it("6. GET /api/subscriptions/me requires auth (returns 401 without token)", async () => {
      const res = await request(app).get("/api/subscriptions/me");
      expect(res.statusCode).toBe(401);
    });
    //* Function for this task
    it("7. GET /api/subscriptions/me returns subscription data for authenticated user", async () => {
      const {
        token
      } = await createVerifiedUser();
      const res = await request(app).get("/api/subscriptions/me").set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("subscription");
    });
    //* Function for this task
    it("8. New user subscription plan is 'free'", async () => {
      const {
        token
      } = await createVerifiedUser();
      const res = await request(app).get("/api/subscriptions/me").set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      const plan = res.body.subscription?.planId ?? res.body.subscription?.plan;
      expect(plan).toBe("free");
    });
    //* Function for this task
    it("9. Subscription response includes limits object", async () => {
      const {
        token
      } = await createVerifiedUser();
      const res = await request(app).get("/api/subscriptions/me").set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("limits");
    });
    //* Function for this task
    it("10. Free plan allows up to 5 workspaces", async () => {
      const {
        token
      } = await createVerifiedUser();
      const res = await request(app).get("/api/subscriptions/me").set("Authorization", `Bearer ${token}`);
      const limits = res.body.limits;
      expect(limits.maxWorkspaces).toBe(5);
    });
    //* Function for this task
    it("11. Free plan allows up to 5 boards", async () => {
      const {
        token
      } = await createVerifiedUser();
      const res = await request(app).get("/api/subscriptions/me").set("Authorization", `Bearer ${token}`);
      const limits = res.body.limits;
      expect(limits.maxBoards).toBe(5);
    });
  });
  //* Function for this task
  describe("6c. Checkout Session Validation", () => {
    //* Function for this task
    it("12. POST /api/subscriptions/checkout requires auth (returns 401)", async () => {
      const res = await request(app).post("/api/subscriptions/checkout").send({
        planId: "plus",
        successUrl: "http://x.com",
        cancelUrl: "http://x.com"
      });
      expect(res.statusCode).toBe(401);
    });
    //* Function for this task
    it("13. Missing planId returns 400", async () => {
      const {
        token
      } = await createVerifiedUser();
      const res = await request(app).post("/api/subscriptions/checkout").set("Authorization", `Bearer ${token}`).send({
        successUrl: "http://x.com",
        cancelUrl: "http://x.com"
      });
      expect(res.statusCode).toBe(400);
    });
    //* Function for this task
    it("14. Missing successUrl returns 400", async () => {
      const {
        token
      } = await createVerifiedUser();
      const res = await request(app).post("/api/subscriptions/checkout").set("Authorization", `Bearer ${token}`).send({
        planId: "plus",
        cancelUrl: "http://x.com"
      });
      expect(res.statusCode).toBe(400);
    });
    //* Function for this task
    it("15. Missing cancelUrl returns 400", async () => {
      const {
        token
      } = await createVerifiedUser();
      const res = await request(app).post("/api/subscriptions/checkout").set("Authorization", `Bearer ${token}`).send({
        planId: "plus",
        successUrl: "http://x.com"
      });
      expect(res.statusCode).toBe(400);
    });
  });
  //* Function for this task
  describe("6d. Billing Portal Validation", () => {
    //* Function for this task
    it("16. POST /api/subscriptions/billing-portal requires auth", async () => {
      const res = await request(app).post("/api/subscriptions/billing-portal").send({
        returnUrl: "http://x.com"
      });
      expect(res.statusCode).toBe(401);
    });
    //* Function for this task
    it("17. Missing returnUrl returns 400", async () => {
      const {
        token
      } = await createVerifiedUser();
      const res = await request(app).post("/api/subscriptions/billing-portal").set("Authorization", `Bearer ${token}`).send({});
      expect(res.statusCode).toBe(400);
    });
  });
  //* Function for this task
  describe("6e. Payment History", () => {
    //* Function for this task
    it("18. GET /api/subscriptions/payments requires auth", async () => {
      const res = await request(app).get("/api/subscriptions/payments");
      expect(res.statusCode).toBe(401);
    });
    //* Function for this task
    it("19. GET /api/subscriptions/payments returns an array for a user", async () => {
      const {
        token
      } = await createVerifiedUser();
      const res = await request(app).get("/api/subscriptions/payments").set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
  //* Function for this task
  describe("6f. Workspace & Board Limits", () => {
    //* Function for this task
    it("20. GET /api/subscriptions/limits/workspace requires auth", async () => {
      const res = await request(app).get("/api/subscriptions/limits/workspace");
      expect(res.statusCode).toBe(401);
    });
    //* Function for this task
    it("21. GET /api/subscriptions/limits/workspace returns an object with an 'allowed' prop", async () => {
      const {
        token
      } = await createVerifiedUser();
      const res = await request(app).get("/api/subscriptions/limits/workspace").set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("allowed");
    });
    //* Function for this task
    it("22. GET /api/subscriptions/limits/board requires auth", async () => {
      const res = await request(app).get("/api/subscriptions/limits/board");
      expect(res.statusCode).toBe(401);
    });
    //* Function for this task
    it("23. GET /api/subscriptions/limits/board returns an object with an 'allowed' prop", async () => {
      const {
        token
      } = await createVerifiedUser();
      const res = await request(app).get("/api/subscriptions/limits/board").set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("allowed");
    });
    //* Function for this task
    it("24. Fresh user is allowed to create workspace (no workspaces yet)", async () => {
      const {
        token
      } = await createVerifiedUser();
      const res = await request(app).get("/api/subscriptions/limits/workspace").set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.allowed).toBe(true);
    });
  });
  //* Function for this task
  describe("6g. Khalti Public Pricing", () => {
    //* Function for this task
    it("25. GET /api/khalti/prices requires no auth and returns 200", async () => {
      const res = await request(app).get("/api/khalti/prices");
      expect(res.statusCode).toBe(200);
    });
    //* Function for this task
    it("26. Khalti prices response is an object or array", async () => {
      const res = await request(app).get("/api/khalti/prices");
      expect(typeof res.body === "object" && res.body !== null).toBe(true);
    });
    //* Function for this task
    it("27. Khalti prices include plus and pro plans", async () => {
      const res = await request(app).get("/api/khalti/prices");
      const body = res.body;
      const plans = Array.isArray(body) ? body : Object.values(body);
      //* Function for plan ids
      const planIds = plans.map(p => (p.id ?? p.planId ?? "").toLowerCase());
      //* Function for this task
      expect(planIds.some(id => id.includes("plus"))).toBe(true);
      //* Function for this task
      expect(planIds.some(id => id.includes("pro"))).toBe(true);
    });
  });
  //* Function for this task
  describe("6h. Khalti Initiation Validation", () => {
    //* Function for this task
    it("28. POST /api/khalti/initiate requires auth (returns 401)", async () => {
      const res = await request(app).post("/api/khalti/initiate").send({
        planId: "plus",
        returnUrl: "http://x.com",
        websiteUrl: "http://x.com"
      });
      expect(res.statusCode).toBe(401);
    });
    //* Function for this task
    it("29. Missing planId returns 400", async () => {
      const {
        token
      } = await createVerifiedUser();
      const res = await request(app).post("/api/khalti/initiate").set("Authorization", `Bearer ${token}`).send({
        returnUrl: "http://x.com",
        websiteUrl: "http://x.com"
      });
      expect(res.statusCode).toBe(400);
    });
    //* Function for this task
    it("30. Free planId returns 400 (cannot pay for free)", async () => {
      const {
        token
      } = await createVerifiedUser();
      const res = await request(app).post("/api/khalti/initiate").set("Authorization", `Bearer ${token}`).send({
        planId: "free",
        returnUrl: "http://x.com",
        websiteUrl: "http://x.com"
      });
      expect(res.statusCode).toBe(400);
    });
    //* Function for this task
    it("31. Invalid planId returns 400", async () => {
      const {
        token
      } = await createVerifiedUser();
      const res = await request(app).post("/api/khalti/initiate").set("Authorization", `Bearer ${token}`).send({
        planId: "nonexistent",
        returnUrl: "http://x.com",
        websiteUrl: "http://x.com"
      });
      expect(res.statusCode).toBe(400);
    });
    //* Function for this task
    it("32. Missing returnUrl returns 400", async () => {
      const {
        token
      } = await createVerifiedUser();
      const res = await request(app).post("/api/khalti/initiate").set("Authorization", `Bearer ${token}`).send({
        planId: "plus",
        websiteUrl: "http://x.com"
      });
      expect(res.statusCode).toBe(400);
    });
    //* Function for this task
    it("33. Khalti payment history requires auth", async () => {
      const res = await request(app).get("/api/khalti/payments");
      expect(res.statusCode).toBe(401);
    });
    //* Function for this task
    it("34. GET /api/khalti/payments returns an array for authenticated user", async () => {
      const {
        token
      } = await createVerifiedUser();
      const res = await request(app).get("/api/khalti/payments").set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});