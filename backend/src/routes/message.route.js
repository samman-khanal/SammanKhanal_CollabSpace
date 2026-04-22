import { Router } from "express";
import auth from "../middlewares/auth.middleware.js";
import requireChannelMember from "../middlewares/requireChannelMember.middleware.js";
import requireDMParticipant from "../middlewares/requireDMParticipant.middleware.js";
import { upload } from "../utils/fileUpload.util.js";
import * as messageController from "../controllers/message.controller.js";
const router = Router();

router.post(
  "/channels/:channelId/messages",
  auth,
  requireChannelMember,
  upload.single("file"),
  messageController.sendToChannel,
);
router.get(
  "/channels/:channelId/messages",
  auth,
  requireChannelMember,
  messageController.listChannel,
);
router.post(
  "/dms/:dmId/messages",
  auth,
  requireDMParticipant,
  upload.single("file"),
  messageController.sendToDM,
);
router.get(
  "/dms/:dmId/messages",
  auth,
  requireDMParticipant,
  messageController.listDM,
);
router.patch("/messages/:messageId", auth, messageController.edit);
router.delete("/messages/:messageId", auth, messageController.remove);
router.post("/messages/:messageId/reactions", auth, messageController.react);

export default router;
