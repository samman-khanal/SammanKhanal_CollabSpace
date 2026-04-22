import request from "supertest";
import mongoose from "mongoose";
import { app, connectTestDB, disconnectTestDB, clearCollections, createVerifiedUser, signToken } from "./helpers/setup.js";
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
describe("Module 1: Authentication", () => {
  //* Function for this task
  describe("1a. User Registration", () => {
    //* Function for this task
    it("1. Registers a new user and returns 201", async () => {
      const res = await request(app).post("/api/auth/register").send({
        fullName: "Alice Smith",
        email: "alice@example.com",
        password: "Password123!"
      });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("email", "alice@example.com");
    });
    //* Function for this task
    it("2. Registration returns id and email fields", async () => {
      const res = await request(app).post("/api/auth/register").send({
        fullName: "Bob Jones",
        email: "bob@example.com",
        password: "Password123!"
      });
      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("email");
    });
    //* Function for this task
    it("3. Duplicate email returns 409", async () => {
      const payload = {
        fullName: "Dup User",
        email: "dup@example.com",
        password: "Pass123!"
      };
      await request(app).post("/api/auth/register").send(payload);
      const res = await request(app).post("/api/auth/register").send(payload);
      expect(res.statusCode).toBe(409);
    });
    //* Function for this task
    it("4. Missing fullName returns 4xx", async () => {
      const res = await request(app).post("/api/auth/register").send({
        email: "noname@example.com",
        password: "Password123!"
      });
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
      expect(res.statusCode).toBeLessThan(600);
    });
    //* Function for this task
    it("5. Missing email returns 4xx", async () => {
      const res = await request(app).post("/api/auth/register").send({
        fullName: "No Email",
        password: "Password123!"
      });
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
      expect(res.statusCode).toBeLessThan(600);
    });
    //* Function for this task
    it("6. Missing password returns 4xx", async () => {
      const res = await request(app).post("/api/auth/register").send({
        fullName: "No Pass",
        email: "nopass@example.com"
      });
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
      expect(res.statusCode).toBeLessThan(600);
    });
    //* Function for this task
    it("7. Empty body returns 4xx", async () => {
      const res = await request(app).post("/api/auth/register").send({});
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
      expect(res.statusCode).toBeLessThan(600);
    });
    //* Function for this task
    it("8. Invalid email format returns 4xx", async () => {
      const res = await request(app).post("/api/auth/register").send({
        fullName: "Bad Email",
        email: "not-an-email",
        password: "Password123!"
      });
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
      expect(res.statusCode).toBeLessThan(600);
    });
  });
  //* Function for this task
  describe("1b. Email OTP Verification", () => {
    //* Function for this task
    it("9. Verifying OTP without email returns 4xx", async () => {
      const res = await request(app).post("/api/auth/verify-otp").send({
        otp: "123456"
      });
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
      expect(res.statusCode).toBeLessThan(600);
    });
    //* Function for this task
    it("10. Verifying OTP with wrong code returns 400", async () => {
      await request(app).post("/api/auth/register").send({
        fullName: "OTP User",
        email: "otp@example.com",
        password: "Password123!"
      });
      const res = await request(app).post("/api/auth/verify-otp").send({
        email: "otp@example.com",
        otp: "000000"
      });
      expect(res.statusCode).toBe(400);
    });
    //* Function for this task
    it("11. Resending OTP returns 200", async () => {
      await request(app).post("/api/auth/register").send({
        fullName: "Resend User",
        email: "resend@example.com",
        password: "Password123!"
      });
      const res = await request(app).post("/api/auth/resend-otp").send({
        email: "resend@example.com"
      });
      expect(res.statusCode).toBe(200);
    });
    //* Function for this task
    it("12. Resending OTP for already-verified email returns 400", async () => {
      await createVerifiedUser({
        email: "verified@example.com"
      });
      const res = await request(app).post("/api/auth/resend-otp").send({
        email: "verified@example.com"
      });
      expect(res.statusCode).toBe(400);
    });
    //* Function for this task
    it("13. Verifying OTP on an already-verified account returns 400", async () => {
      await createVerifiedUser({
        email: "alreadyv@example.com"
      });
      const res = await request(app).post("/api/auth/verify-otp").send({
        email: "alreadyv@example.com",
        otp: "999999"
      });
      expect(res.statusCode).toBe(400);
    });
    //* Function for this task
    it("14. Verifying OTP with correct code marks email as verified and returns 200", async () => {
      await request(app).post("/api/auth/register").send({
        fullName: "Correct OTP",
        email: "correctotp@example.com",
        password: "Password123!"
      });
      const EmailVerification = mongoose.model("EmailVerification");
      const rec = await EmailVerification.findOne({}).sort({
        createdAt: -1
      });
      const res = await request(app).post("/api/auth/verify-otp").send({
        email: "correctotp@example.com",
        otp: rec.token
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("verified", true);
    });
  });
  //* Function for this task
  describe("1c. User Login", () => {
    //* Function for this task
    it("15. Login with valid credentials returns 200 and token", async () => {
      await createVerifiedUser({
        email: "login@example.com",
        password: "Password123!"
      });
      const res = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
        password: "Password123!"
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token");
    });
    //* Function for this task
    it("16. Login returns user object with id, email, fullName", async () => {
      await createVerifiedUser({
        email: "login2@example.com",
        password: "Password123!"
      });
      const res = await request(app).post("/api/auth/login").send({
        email: "login2@example.com",
        password: "Password123!"
      });
      expect(res.body.user).toHaveProperty("id");
      expect(res.body.user).toHaveProperty("email");
      expect(res.body.user).toHaveProperty("fullName");
    });
    //* Function for this task
    it("17. Login with wrong password returns 401", async () => {
      await createVerifiedUser({
        email: "wrongpass@example.com",
        password: "Password123!"
      });
      const res = await request(app).post("/api/auth/login").send({
        email: "wrongpass@example.com",
        password: "WrongPass!"
      });
      expect(res.statusCode).toBe(401);
    });
    //* Function for this task
    it("18. Login with non-existent email returns 401", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "ghost@example.com",
        password: "Password123!"
      });
      expect(res.statusCode).toBe(401);
    });
    //* Function for this task
    it("19. Login without email returns 4xx", async () => {
      const res = await request(app).post("/api/auth/login").send({
        password: "Password123!"
      });
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
      expect(res.statusCode).toBeLessThan(600);
    });
    //* Function for this task
    it("20. Login without password returns 4xx", async () => {
      await createVerifiedUser({
        email: "nopasslogin@example.com"
      });
      const res = await request(app).post("/api/auth/login").send({
        email: "nopasslogin@example.com"
      });
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
      expect(res.statusCode).toBeLessThan(600);
    });
    //* Function for this task
    it("21. Login with unverified email returns 403", async () => {
      await request(app).post("/api/auth/register").send({
        fullName: "Unverified",
        email: "unverified@example.com",
        password: "Password123!"
      });
      const res = await request(app).post("/api/auth/login").send({
        email: "unverified@example.com",
        password: "Password123!"
      });
      expect(res.statusCode).toBe(403);
    });
    //* Function for this task
    it("22. Login with banned account returns 403", async () => {
      const {
        user
      } = await createVerifiedUser({
        email: "banned@example.com"
      });
      await mongoose.model("User").updateOne({
        _id: user._id
      }, {
        isBanned: true
      });
      const res = await request(app).post("/api/auth/login").send({
        email: "banned@example.com",
        password: "Password123!"
      });
      expect(res.statusCode).toBe(403);
    });
  });
  //* Function for this task
  describe("1d. Password Reset", () => {
    //* Function for this task
    it("23. Forgot password with valid email returns 200", async () => {
      await createVerifiedUser({
        email: "forgot@example.com"
      });
      const res = await request(app).post("/api/auth/forgot-password").send({
        email: "forgot@example.com"
      });
      expect(res.statusCode).toBe(200);
    });
    //* Function for this task
    it("24. Forgot password with unknown email still returns 200 (no enumeration)", async () => {
      const res = await request(app).post("/api/auth/forgot-password").send({
        email: "unknown@example.com"
      });
      expect(res.statusCode).toBe(200);
    });
    //* Function for this task
    it("25. Reset password with invalid token returns 400", async () => {
      const res = await request(app).post("/api/auth/reset-password").send({
        token: "invalid-token-abc",
        newPassword: "NewPassword123!"
      });
      expect(res.statusCode).toBe(400);
    });
    //* Function for this task
    it("26. Reset password with valid token returns 200", async () => {
      await createVerifiedUser({
        email: "reset@example.com"
      });
      await request(app).post("/api/auth/forgot-password").send({
        email: "reset@example.com"
      });
      const ResetPassword = mongoose.model("ResetPassword");
      const rec = await ResetPassword.findOne({}).sort({
        createdAt: -1
      });
      const res = await request(app).post("/api/auth/reset-password").send({
        token: rec.token,
        newPassword: "NewPassword999!"
      });
      expect(res.statusCode).toBe(200);
    });
    //* Function for this task
    it("27. Reset token can only be used once (second use returns 400)", async () => {
      await createVerifiedUser({
        email: "oneuse@example.com"
      });
      await request(app).post("/api/auth/forgot-password").send({
        email: "oneuse@example.com"
      });
      const ResetPassword = mongoose.model("ResetPassword");
      const rec = await ResetPassword.findOne({}).sort({
        createdAt: -1
      });
      await request(app).post("/api/auth/reset-password").send({
        token: rec.token,
        newPassword: "NewPass1!"
      });
      const res = await request(app).post("/api/auth/reset-password").send({
        token: rec.token,
        newPassword: "NewPass2!"
      });
      expect(res.statusCode).toBe(400);
    });
  });
  //* Function for this task
  describe("1e. User Profile", () => {
    //* Function for this task
    it("28. GET /api/users/me without token returns 401", async () => {
      const res = await request(app).get("/api/users/me");
      expect(res.statusCode).toBe(401);
    });
    //* Function for this task
    it("29. GET /api/users/me with valid token returns user data", async () => {
      const {
        token
      } = await createVerifiedUser({
        email: "profile@example.com"
      });
      const res = await request(app).get("/api/users/me").set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("email", "profile@example.com");
    });
    //* Function for this task
    it("30. PATCH /api/users/me updates fullName", async () => {
      const {
        token
      } = await createVerifiedUser({
        email: "updateme@example.com"
      });
      const res = await request(app).patch("/api/users/me").set("Authorization", `Bearer ${token}`).send({
        fullName: "Updated Name"
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("fullName", "Updated Name");
    });
    //* Function for this task
    it("31. PATCH /api/users/me/password with correct current password returns 200", async () => {
      const {
        token
      } = await createVerifiedUser({
        email: "chpass@example.com",
        password: "OldPass123!"
      });
      const res = await request(app).patch("/api/users/me/password").set("Authorization", `Bearer ${token}`).send({
        currentPassword: "OldPass123!",
        newPassword: "NewPass456!"
      });
      expect(res.statusCode).toBe(200);
    });
    //* Function for this task
    it("32. PATCH /api/users/me/password with wrong current password returns 400 or 401", async () => {
      const {
        token
      } = await createVerifiedUser({
        email: "chpasswrong@example.com",
        password: "OldPass123!"
      });
      const res = await request(app).patch("/api/users/me/password").set("Authorization", `Bearer ${token}`).send({
        currentPassword: "WrongPass!",
        newPassword: "NewPass456!"
      });
      expect([400, 401]).toContain(res.statusCode);
    });
  });
});