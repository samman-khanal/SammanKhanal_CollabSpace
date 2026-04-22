import ContactMessage from "../models/ContactMessage.model.js";
import { sendEmail } from "../utils/sendEmail.util.js";
import { contactThankYouTemplate } from "../utils/email/contactThankYou.email.js";
import { AppError } from "../utils/AppError.util.js";
//* Function for submit contact
export const submitContact = async ({
  name,
  email,
  subject,
  message
}) => {
  if (!name || !email || !subject || !message) {
    throw new AppError("All fields are required.", 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AppError("Please provide a valid email address.", 400);
  }
  if (message.trim().length < 10) {
    throw new AppError("Message must be at least 10 characters.", 400);
  }
  const contact = await ContactMessage.create({
    name,
    email,
    subject,
    message
  });
  await sendEmail({
    to: email,
    subject: "Thanks for reaching out — CollabSpace Support",
    html: contactThankYouTemplate({
      name,
      subject
    })
  });
  return {
    success: true,
    id: contact._id
  };
};