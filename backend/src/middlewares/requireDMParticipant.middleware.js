import DMConversation from "../models/DMConversation.model.js";
import { HTTP } from "../constants/httpStatus.constant.js";

//* Function for require dmparticipant
export default async function requireDMParticipant(req, res, next) {
  try {
    const dmId = req.params.dmId;
    const dm = await DMConversation.findById(dmId);
    if (!dm)
      return res.status(HTTP.NOT_FOUND).json({
        message: "DM not found",
      });
    //* Function for is participant
    const isParticipant = dm.participants.some(
      (id) => String(id) === String(req.user._id),
    );
    if (!isParticipant)
      return res.status(HTTP.FORBIDDEN).json({
        message: "Not a DM participant",
      });
    req.dm = dm;
    next();
  } catch (err) {
    next(err);
  }
}
