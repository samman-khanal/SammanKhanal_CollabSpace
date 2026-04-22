import * as messageService from "../services/message.service.js";
import { HTTP } from "../constants/httpStatus.constant.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

//* Controller function for send to channel
export const sendToChannel = asyncHandler(async (req, res) => {
  const io = req.app.get("io");
  let mentions = [];
  if (req.body.mentions) {
    try {
      mentions = JSON.parse(req.body.mentions);
    } catch {}
  }
  const msg = await messageService.sendChannelMessage({
    channelId: req.params.channelId,
    senderId: req.user._id,
    content: req.body.content,
    file: req.file,
    mentions,
    io,
  });
  res.status(HTTP.CREATED).json(msg);
});

//* Controller function for list channel
export const listChannel = asyncHandler(async (req, res) => {
  const rows = await messageService.listChannelMessages({
    channelId: req.params.channelId,
    userId: req.user._id,
    limit: req.query.limit,
  });
  res.json(rows);
});

//* Controller function for edit
export const edit = asyncHandler(async (req, res) => {
  const io = req.app.get("io");
  const msg = await messageService.editMessage({
    messageId: req.params.messageId,
    userId: req.user._id,
    newContent: req.body.content,
    io,
  });
  res.json(msg);
});

//* Controller function for remove
export const remove = asyncHandler(async (req, res) => {
  const io = req.app.get("io");
  res.json(
    await messageService.deleteMessage({
      messageId: req.params.messageId,
      userId: req.user._id,
      io,
    }),
  );
});

//* Controller function for react
export const react = asyncHandler(async (req, res) => {
  const io = req.app.get("io");
  const msg = await messageService.toggleReaction({
    messageId: req.params.messageId,
    userId: req.user._id,
    emoji: req.body.emoji,
    io,
  });
  res.json(msg);
});

//* Controller function for send to dm
export const sendToDM = asyncHandler(async (req, res) => {
  const io = req.app.get("io");
  let mentions = [];
  if (req.body.mentions) {
    try {
      mentions = JSON.parse(req.body.mentions);
    } catch {}
  }
  const msg = await messageService.sendDMMessage({
    dmId: req.params.dmId,
    senderId: req.user._id,
    content: req.body.content,
    file: req.file,
    mentions,
    io,
  });
  res.status(HTTP.CREATED).json(msg);
});

//* Controller function for list dm
export const listDM = asyncHandler(async (req, res) => {
  const rows = await messageService.listDMMessages({
    dmId: req.params.dmId,
    userId: req.user._id,
    limit: req.query.limit,
  });
  res.json(rows);
});
