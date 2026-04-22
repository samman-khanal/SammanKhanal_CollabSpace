import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import request from "supertest";
import app from "../../app.js";
//* Function for noop
const noop = () => {};
const mockIo = {
  //* Function for to
  to: () => mockIo,
  //* Function for in
  in: () => mockIo,
  //* Function for of
  of: () => mockIo,
  emit: noop,
  sockets: {
    sockets: new Map()
  }
};
app.set("io", mockIo);
let mongod = null;
//* Function for connect test db
export const connectTestDB = async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
};
//* Function for disconnect test db
export const disconnectTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongod) await mongod.stop();
};
//* Function for clear collections
export const clearCollections = async () => {
  const cols = mongoose.connection.collections;
  //* Function for clear collections
  await Promise.all(Object.values(cols).map(c => c.deleteMany({})));
};
//* Function for sign token
export const signToken = user => jwt.sign({
  id: user._id
}, process.env.JWT_SECRET || "test_secret", {
  expiresIn: "1d"
});
//* Function for create verified user
export const createVerifiedUser = async ({
  fullName = "Test User",
  email = "test@example.com",
  password = "Password123!"
} = {}) => {
  await request(app).post("/api/auth/register").send({
    fullName,
    email,
    password
  });
  const User = mongoose.model("User");
  const user = await User.findOneAndUpdate({
    email: email.toLowerCase()
  }, {
    isEmailVerified: true
  }, {
    new: true
  });
  return {
    user,
    token: signToken(user)
  };
};
//* Function for create second user
export const createSecondUser = () => createVerifiedUser({
  fullName: "Second User",
  email: "second@example.com",
  password: "Password456!"
});
//* Function for create third user
export const createThirdUser = () => createVerifiedUser({
  fullName: "Third User",
  email: "third@example.com",
  password: "Password789!"
});
//* Function for create workspace
export const createWorkspace = async (token, name = "Test Workspace") => {
  const res = await request(app).post("/api/workspaces").set("Authorization", `Bearer ${token}`).send({
    name
  });
  return res.body;
};
//* Function for add workspace member
export const addWorkspaceMember = async (workspaceId, userId, role = "member") => {
  const WorkspaceMember = mongoose.model("WorkspaceMember");
  return WorkspaceMember.create({
    workspace: workspaceId,
    user: userId,
    role
  });
};
export { app, request };