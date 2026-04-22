import * as authService from "../services/auth.service.js";
import { HTTP } from "../constants/httpStatus.constant.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

//* Controller function for user registration
export const register = asyncHandler(async (req, res) => {
  const fullName = req.body?.fullName ?? req.body?.fullname;
  const { email, password } = req.body;
  const data = await authService.register({
    fullName,
    email,
    password,
  });
  res.status(HTTP.CREATED).json(data);
});

//* Controller function for verify otp
export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const data = await authService.verifyOtp({
    email,
    otp,
  });
  res.json(data);
});

//* Controller function for resend otp
export const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const data = await authService.resendOtp({
    email,
  });
  res.json(data);
});

//* Controller function for verify email
export const verifyEmail = asyncHandler(async (req, res) => {
  const token = req.params?.token || req.query?.token || req.body?.token;
  const data = await authService.verifyEmail({
    token,
  });
  res.json(data);
});

//* Controller function for user login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const data = await authService.login({
    email,
    password,
  });
  res.json(data);
});

//* Controller function for forgot password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const data = await authService.forgotPassword({
    email,
  });
  res.json(data);
});

//* Controller function for reset password
export const resetPassword = asyncHandler(async (req, res) => {
  const token = req.params?.token || req.body?.token;
  const { newPassword } = req.body;
  const data = await authService.resetPassword({
    token,
    newPassword,
  });
  res.json(data);
});

//* Controller function for google redirect
export const googleRedirect = (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const backendUrl = process.env.BACKEND_URL || process.env.API_URL;
  if (!clientId || !backendUrl) {
    return res.status(500).json({
      message: "Google OAuth is not configured",
    });
  }
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${backendUrl}/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
};

//* Controller function for google callback
export const googleCallback = async (req, res) => {
  try {
    const { code, error } = req.query;
    const frontendUrl = process.env.FRONTEND_URL;
    if (error || !code) {
      return res.redirect(`${frontendUrl}/login?error=google_cancelled`);
    }
    const data = await authService.googleAuth({
      code,
    });
    const params = new URLSearchParams({
      token: data.token,
      user: JSON.stringify(data.user),
    });
    res.redirect(`${frontendUrl}/auth/google/callback?${params}`);
  } catch (error) {
    const frontendUrl = process.env.FRONTEND_URL;
    res.redirect(`${frontendUrl}/login?error=google_failed`);
  }
};
