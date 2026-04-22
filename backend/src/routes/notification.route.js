import { Router } from "express";
import auth from "../middlewares/auth.middleware.js";
import * as controller from "../controllers/notification.controller.js";
const router = Router();

router.get("/", auth, controller.list);
router.patch("/:id/read", auth, controller.read);
router.patch("/read-all", auth, controller.readAll);
router.delete("/read", auth, controller.removeAllRead);
router.delete("/:id", auth, controller.remove);

export default router;
