import { z } from "zod";
import env from "../../config/env.js";

const otpPattern = new RegExp(`^\\d{${env.otp.length}}$`);

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name cannot exceed 50 characters"),

    lastName: z
      .string()
      .trim()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name cannot exceed 50 characters"),

    email: z.string().trim().email("Please provide a valid email"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password cannot exceed 100 characters"),

    phoneNumber: z
      .string()
      .trim()
      .regex(/^\+?[0-9]{10,15}$/, "Phone number must contain 10 to 15 digits"),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().trim().email(),
    password: z.string().min(1).max(100),
  })
  .strict();

export const emailSchema = z.object({ email: z.string().trim().email() }).strict();
export const verifyEmailSchema = z
  .object({
    email: z.string().trim().email(),
    otp: z.string().regex(otpPattern, `Code must contain ${env.otp.length} digits`),
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    email: z.string().trim().email(),
    otp: z.string().regex(otpPattern, `Code must contain ${env.otp.length} digits`),
    newPassword: z.string().min(8).max(100),
  })
  .strict();

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1).max(100),
    newPassword: z.string().min(8).max(100),
  })
  .strict();
