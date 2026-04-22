import { Router } from "express";
import auth from "../middlewares/auth.middleware.js";
import * as commentController from "../controllers/comment.controller.js";
const router = Router();

router.post("/tasks/:taskId/comments", auth, commentController.create);
router.get("/tasks/:taskId/comments", auth, commentController.list);
router.delete("/comments/:commentId", auth, commentController.remove);

export default router;
