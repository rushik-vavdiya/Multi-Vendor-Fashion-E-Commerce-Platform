import { Router } from "express";
import {
  changePassword,
  forgotPassword,
  login,
  logout,
  register,
  resendVerification,
  resetPassword,
  verifyEmail,
} from "./auth.controller.js";
import {
  changePasswordSchema,
  emailSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "./auth.validator.js";
import validate from "../../middlewares/validate.middleware.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import createRateLimit from "../../middlewares/rateLimit.middleware.js";
import env from "../../config/env.js";

const router = Router();
const authLimit = createRateLimit(env.rateLimit.authWindowMs, env.rateLimit.authMax);
const otpLimit = createRateLimit(env.rateLimit.otpWindowMs, env.rateLimit.otpMax);

router.post("/register", authLimit, validate(registerSchema), register);
router.post("/login", authLimit, validate(loginSchema), login);
router.post("/forgot-password", otpLimit, validate(emailSchema), forgotPassword);
router.post("/reset-password", otpLimit, validate(resetPasswordSchema), resetPassword);
router.post("/verify-email", otpLimit, validate(verifyEmailSchema), verifyEmail);
router.post("/resend-verification", otpLimit, validate(emailSchema), resendVerification);
router.post("/logout", authMiddleware, logout);
router.patch("/change-password", authMiddleware, validate(changePasswordSchema), changePassword);

export default router;
