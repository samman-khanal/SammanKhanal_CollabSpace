import http from "http";
import { io as ioc } from "socket.io-client";
import request from "supertest";
import { app, connectTestDB, disconnectTestDB, clearCollections, signToken, createVerifiedUser, createSecondUser, createThirdUser, createWorkspace, addWorkspaceMember } from "./helpers/setup.js";
import { initSockets } from "../sockets/index.socket.js";
process.env.JWT_SECRET = "test_secret";
process.env.NODE_ENV = "test";
let httpServer;
let serverPort;
//* Function for this task
beforeAll(async () => {
  await connectTestDB();
  httpServer = http.createServer(app);
  initSockets(httpServer, app);
  //* Function for this task
  await new Promise(resolve => httpServer.listen(0, resolve));
  serverPort = httpServer.address().port;
});
//* Function for this task
afterAll(async () => {
  if (httpServer.closeAllConnections) httpServer.closeAllConnections();
  //* Function for this task
  await new Promise(resolve => httpServer.close(resolve));
  await disconnectTestDB();
}, 15000);
//* Function for this task
afterEach(async () => {
  await clearCollections();
});
//* Function for get url
const getURL = () => `http://localhost:${serverPort}`;
//* Function for connect socket
const connectSocket = token => new Promise((resolve, reject) => {
  const socket = ioc(getURL(), {
    auth: token ? {
      token
    } : {},
    transports: ["websocket"],
    forceNew: true
  });
  //* Function for connect socket
  socket.on("connect", () => resolve(socket));
  //* Function for connect socket
  socket.on("connect_error", err => reject(err));
  //* Function for connect socket
  setTimeout(() => reject(new Error("Socket connection timeout")), 4000);
});
//* Function for connect socket expect error
const connectSocketExpectError = token => new Promise(resolve => {
  const socket = ioc(getURL(), {
    auth: token ? {
      token
    } : {},
    transports: ["websocket"],
    forceNew: true
  });
  //* Function for connect socket expect error
  socket.on("connect_error", err => {
    socket.disconnect();
    resolve(err);
  });
  //* Function for connect socket expect error
  socket.on("connect", () => {
    socket.disconnect();
    resolve(null);
  });
  //* Function for connect socket expect error
  setTimeout(() => {
    socket.disconnect();
    resolve(new Error("timeout"));
  }, 4000);
});
//* Function for this task
describe("Module 7: Real-time & WebRTC Calls", () => {
  //* Function for this task
  describe("7a. Socket Authentication", () => {
    //* Function for this task
    it("1. Connection without token is rejected", async () => {
      const err = await connectSocketExpectError(null);
      expect(err).toBeTruthy();
      expect(err.message.toLowerCase()).toMatch(/token|unauthorized|auth/i);
    });
    //* Function for this task
    it("2. Connection with an invalid token string is rejected", async () => {
      const err = await connectSocketExpectError("this.is.not.valid");
      expect(err).toBeTruthy();
    });
    //* Function for this task
    it("3. Connection with a valid JWT is accepted", async () => {
      const {
        user
      } = await createVerifiedUser();
      const token = signToken(user);
      const socket = await connectSocket(token);
      expect(socket.connected).toBe(true);
      socket.disconnect();
    });
  });
  //* Function for this task
  describe("7b. Workspace Presence", () => {
    //* Function for this task
    it("4. Non-member receives ok:false when joining a workspace", async () => {
      const {
        user,
        token
      } = await createVerifiedUser({
        email: "ws4@example.com"
      });
      const fakeWorkspaceId = "000000000000000000000001";
      const socket = await connectSocket(signToken(user));
      //* Function for ack
      const ack = await new Promise(resolve => {
        socket.emit("workspace:join", fakeWorkspaceId, resolve);
      });
      expect(ack.ok).toBe(false);
      socket.disconnect();
    });
    //* Function for this task
    it("5. Workspace member receives ok:true and onlineUsers array on join", async () => {
      const {
        user,
        token
      } = await createVerifiedUser({
        email: "ws5@example.com"
      });
      const ws = await createWorkspace(token);
      const socket = await connectSocket(signToken(user));
      //* Function for ack
      const ack = await new Promise(resolve => {
        socket.emit("workspace:join", String(ws._id), resolve);
      });
      expect(ack.ok).toBe(true);
      expect(Array.isArray(ack.onlineUsers)).toBe(true);
      socket.disconnect();
    });
  });
  //* Function for this task
  describe("7c. WebRTC Call Signaling", () => {
    //* Function for setup call pair
    const setupCallPair = async () => {
      const {
        user: u1,
        token: t1
      } = await createVerifiedUser({
        email: "call_u1@example.com"
      });
      const {
        user: u2,
        token: t2
      } = await createSecondUser();
      const ws = await createWorkspace(t1);
      await addWorkspaceMember(ws._id, u2._id);
      const dmRes = await request(app).post(`/api/workspaces/${ws._id}/dms`).set("Authorization", `Bearer ${t1}`).send({
        otherUserId: String(u2._id)
      });
      const dm = dmRes.body;
      const sock1 = await connectSocket(signToken(u1));
      const sock2 = await connectSocket(signToken(u2));
      return {
        u1,
        u2,
        dm,
        sock1,
        sock2
      };
    };
    //* Function for this task
    it("6. call:offer with valid DM relays to receiver and returns ok:true", async () => {
      const {
        u2,
        dm,
        sock1,
        sock2
      } = await setupCallPair();
      //* Function for received offer
      const receivedOffer = new Promise(resolve => {
        sock2.on("call:offer", resolve);
      });
      //* Function for ack
      const ack = await new Promise(resolve => {
        sock1.emit("call:offer", {
          dmId: String(dm._id),
          toUserId: String(u2._id),
          callId: "call-001",
          type: "video",
          sdp: "v=0"
        }, resolve);
      });
      expect(ack.ok).toBe(true);
      const offer = await receivedOffer;
      expect(offer).toHaveProperty("sdp", "v=0");
      expect(offer).toHaveProperty("callId", "call-001");
      sock1.disconnect();
      sock2.disconnect();
    });
    //* Function for this task
    it("7. call:answer relays sdp to caller and returns ok:true", async () => {
      const {
        u1,
        dm,
        sock1,
        sock2
      } = await setupCallPair();
      //* Function for received answer
      const receivedAnswer = new Promise(resolve => {
        sock1.on("call:answer", resolve);
      });
      //* Function for ack
      const ack = await new Promise(resolve => {
        sock2.emit("call:answer", {
          dmId: String(dm._id),
          toUserId: String(u1._id),
          callId: "call-001",
          sdp: "v=1"
        }, resolve);
      });
      expect(ack.ok).toBe(true);
      const answer = await receivedAnswer;
      expect(answer).toHaveProperty("sdp", "v=1");
      sock1.disconnect();
      sock2.disconnect();
    });
    //* Function for this task
    it("8. call:ice-candidate relays to other party and returns ok:true", async () => {
      const {
        u2,
        dm,
        sock1,
        sock2
      } = await setupCallPair();
      //* Function for received ice
      const receivedIce = new Promise(resolve => {
        sock2.on("call:ice-candidate", resolve);
      });
      //* Function for ack
      const ack = await new Promise(resolve => {
        sock1.emit("call:ice-candidate", {
          dmId: String(dm._id),
          toUserId: String(u2._id),
          callId: "call-001",
          candidate: {
            candidate: "test",
            sdpMid: "0",
            sdpMLineIndex: 0
          }
        }, resolve);
      });
      expect(ack.ok).toBe(true);
      const ice = await receivedIce;
      expect(ice).toHaveProperty("candidate");
      sock1.disconnect();
      sock2.disconnect();
    });
    //* Function for this task
    it("9. call:end relays to other party and returns ok:true", async () => {
      const {
        u2,
        dm,
        sock1,
        sock2
      } = await setupCallPair();
      //* Function for received end
      const receivedEnd = new Promise(resolve => {
        sock2.on("call:end", resolve);
      });
      //* Function for ack
      const ack = await new Promise(resolve => {
        sock1.emit("call:end", {
          dmId: String(dm._id),
          toUserId: String(u2._id),
          callId: "call-001",
          reason: "hangup"
        }, resolve);
      });
      expect(ack.ok).toBe(true);
      const end = await receivedEnd;
      expect(end).toHaveProperty("reason", "hangup");
      sock1.disconnect();
      sock2.disconnect();
    });
    //* Function for this task
    it("10. call:reject relays to other party and returns ok:true", async () => {
      const {
        u1,
        dm,
        sock1,
        sock2
      } = await setupCallPair();
      //* Function for received reject
      const receivedReject = new Promise(resolve => {
        sock1.on("call:reject", resolve);
      });
      //* Function for ack
      const ack = await new Promise(resolve => {
        sock2.emit("call:reject", {
          dmId: String(dm._id),
          toUserId: String(u1._id),
          callId: "call-001",
          reason: "busy"
        }, resolve);
      });
      expect(ack.ok).toBe(true);
      const rej = await receivedReject;
      expect(rej).toHaveProperty("callId", "call-001");
      sock1.disconnect();
      sock2.disconnect();
    });
    //* Function for this task
    it("11. call:busy relays to other party and returns ok:true", async () => {
      const {
        u1,
        dm,
        sock1,
        sock2
      } = await setupCallPair();
      //* Function for received busy
      const receivedBusy = new Promise(resolve => {
        sock1.on("call:busy", resolve);
      });
      //* Function for ack
      const ack = await new Promise(resolve => {
        sock2.emit("call:busy", {
          dmId: String(dm._id),
          toUserId: String(u1._id),
          callId: "call-002"
        }, resolve);
      });
      expect(ack.ok).toBe(true);
      await receivedBusy;
      sock1.disconnect();
      sock2.disconnect();
    });
    //* Function for this task
    it("12. call:offer with wrong dmId returns ok:false", async () => {
      const {
        u2,
        sock1,
        sock2
      } = await setupCallPair();
      //* Function for ack
      const ack = await new Promise(resolve => {
        sock1.emit("call:offer", {
          dmId: "000000000000000000000099",
          toUserId: String(u2._id),
          callId: "call-bad",
          type: "audio",
          sdp: "v=0"
        }, resolve);
      });
      expect(ack.ok).toBe(false);
      expect(ack).toHaveProperty("message");
      sock1.disconnect();
      sock2.disconnect();
    });
    //* Function for this task
    it("13. Non-participant cannot send call:offer (returns ok:false)", async () => {
      const {
        user: u1
      } = await createVerifiedUser({
        email: "cal_outsider@example.com"
      });
      const {
        user: u2
      } = await createSecondUser();
      const {
        user: u3
      } = await createThirdUser();
      const token1 = signToken(u1);
      const t3 = signToken(u3);
      const ws = await createWorkspace(token1);
      await addWorkspaceMember(ws._id, u2._id);
      const dmRes = await request(app).post(`/api/workspaces/${ws._id}/dms`).set("Authorization", `Bearer ${token1}`).send({
        otherUserId: String(u2._id)
      });
      const dm = dmRes.body;
      const sock3 = await connectSocket(t3);
      //* Function for ack
      const ack = await new Promise(resolve => {
        sock3.emit("call:offer", {
          dmId: String(dm._id),
          toUserId: String(u2._id),
          callId: "intruder",
          sdp: "v=0"
        }, resolve);
      });
      expect(ack.ok).toBe(false);
      sock3.disconnect();
    });
  });
});