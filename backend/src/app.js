import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { corsOptions } from "./config/cors.config.js";
import apiRoutes from "./routes/index.js";
import notFound from "./middlewares/notFound.middleware.js";
import errorHandler from "./middlewares/error.middleware.js";
const app = express();
const jsonParser = express.json({
  limit: "10mb",
});
const urlencodedParser = express.urlencoded({
  extended: true,
});

//* Function for stripe webhook request
const isStripeWebhookRequest = (req) =>
  req.originalUrl?.startsWith("/api/subscriptions/webhook");

app.use(helmet());
app.use(cors(corsOptions));

app.use((req, res, next) =>
  isStripeWebhookRequest(req) ? next() : jsonParser(req, res, next),
);

app.use((req, res, next) =>
  isStripeWebhookRequest(req) ? next() : urlencodedParser(req, res, next),
);

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get(["/health", "/api/health"], (_req, res) =>
  res.json({
    ok: true,
    name: "CollabSpace API",
  }),
);
app.use("/api", apiRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
