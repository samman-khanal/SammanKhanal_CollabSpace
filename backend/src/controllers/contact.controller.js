import * as contactService from "../services/contact.service.js";
import { HTTP } from "../constants/httpStatus.constant.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

//* Controller function for submit contact
export const submitContact = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;
  const data = await contactService.submitContact({
    name,
    email,
    subject,
    message,
  });
  res.status(HTTP.CREATED).json(data);
});
