import http from "http";
import { loadEnv } from "./config/env.config.js";
import app from "./app.js";
import { connectDB, disconnectDB } from "./config/db.config.js";
import { initSockets } from "./sockets/index.socket.js";
import {
  startCleanupJob,
  stopCleanupJob,
} from "./services/messageCleanup.service.js";

loadEnv();
await connectDB();
const server = http.createServer(app);
initSockets(server, app);
startCleanupJob(24);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () =>
  console.log(`API running on http://localhost:${PORT}`),
);

const shutdown = async (signal) => {
  console.log(`\n${signal} received — Shutting down the server.`);
  stopCleanupJob();

  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});
