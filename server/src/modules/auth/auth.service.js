import { comparePassword, hashPassword } from "../../utils/bcrypt.js";
import generateOTP from "../../utils/generateOTP.js";
import createOtpEmail from "../../utils/otpemail.js";
import { UserOTPRepository } from "../user/user.otp.repository.js";
import env from "../../config/env.js";
import { generateToken } from "../../utils/jwt.js";
import { UserRepository } from "../user/user.repository.js";
import { sendEmail } from "../../services/email.service.js";
import { AppError } from "../../utils/AppError.js";

export const createUser = async (userData) => {
  const email = userData.email.trim().toLowerCase();
  const phoneNumber = userData.phoneNumber.trim();
  const existingUser = await UserRepository.findByEmail(email);

  if (existingUser) {
    throw new AppError("User with this email already exists", 409);
  }

  const existingPhone = await UserRepository.findByPhone(phoneNumber);

  if (existingPhone) {
    throw new AppError("User with this phone number already exists", 409);
  }

  const hashedPassword = await hashPassword(userData.password);

  const newUser = await UserRepository.create({
    ...userData,
    email,
    phone: phoneNumber,
    role: "customer",
    status: "active",
    password: hashedPassword,
  });

  let verificationEmailSent = true;
  try {
    await sendVerificationEmail(newUser);
  } catch (error) {
    if (!(error instanceof AppError) || ![502, 503].includes(error.statusCode)) {
      throw error;
    }
    verificationEmailSent = false;
    console.error("Verification email could not be sent:", error);
  }

  return { user: newUser, verificationEmailSent };
};

export const loginUser = async (email, password) => {
  const user = await UserRepository.findByEmail(email.trim().toLowerCase());

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch || user.status !== "active") {
    throw new AppError("Invalid credentials", 401);
  }

  // An unverified email does NOT block sign-in. Verification is offered from the
  // signed-in profile page (/account/profile), so a slow or failing mail server
  // can never lock someone out of an account they already created.
  const token = generateToken(
    {
      id: user._id,
      role: user.role,
      tokenVersion: user.tokenVersion || 0,
    },
    env.jwt.accessSecret,
    env.jwt.accessExpiresIn,
  );

  return {
    user,
    token,
  };
};

const makeOTP = async (userId, field, expiryField, attemptsField, email, subject) => {
  const otp = generateOTP(env.otp.length);
  const hashedOTP = await hashPassword(otp);
  const expiresAt = new Date(Date.now() + env.otp.expiresInMinutes * 60 * 1000);
  await UserOTPRepository.updateOTP(userId, {
    [field]: hashedOTP,
    [expiryField]: expiresAt,
    [attemptsField]: 0,
  });
  await sendEmail({
    to: email,
    subject,
    html: createOtpEmail(otp, env.otp.length, env.otp.expiresInMinutes, subject),
  });
};

const sendVerificationEmail = (user) =>
  makeOTP(
    user._id,
    "verifyEmailOTP",
    "verifyEmailExpiresAt",
    "verifyEmailAttempts",
    user.email,
    "Verify your Rynova email",
  );

export const requestEmailVerification = async (email) => {
  const user = await UserRepository.findByEmail(String(email).trim().toLowerCase());
  if (user && !user.emailVerified) await sendVerificationEmail(user);
  return true;
};

export const confirmEmailVerification = async (email, otp) => {
  const user = await UserRepository.findByEmail(String(email).trim().toLowerCase());
  if (!user) throw new AppError("Invalid or expired verification code", 400);
  const stored = await UserOTPRepository.findOTPByUserId(user._id);
  if (
    !stored?.verifyEmailOTP ||
    !stored.verifyEmailExpiresAt ||
    stored.verifyEmailExpiresAt <= new Date() ||
    stored.verifyEmailAttempts >= 5
  ) {
    throw new AppError("Invalid or expired verification code", 400);
  }
  if (!(await comparePassword(otp, stored.verifyEmailOTP))) {
    await UserOTPRepository.incrementAttempts(user._id, "verifyEmailAttempts");
    throw new AppError("Invalid or expired verification code", 400);
  }
  const consumed = await UserOTPRepository.consumeEmailOTP(
    user._id,
    stored.verifyEmailOTP,
    new Date(),
  );
  if (!consumed) throw new AppError("Invalid or expired verification code", 400);
  await UserRepository.updateUser(user._id, { emailVerified: true });
  return true;
};

export const requestPasswordReset = async (email) => {
  const user = await UserRepository.findByEmail(String(email).trim().toLowerCase());
  if (user) {
    await makeOTP(
      user._id,
      "resetOTP",
      "resetExpiresAt",
      "resetAttempts",
      user.email,
      "Rynova password reset code",
    );
  }
  return true;
};

export const resetPassword = async (email, otp, newPassword) => {
  const user = await UserRepository.findByEmail(String(email).trim().toLowerCase());
  if (!user) throw new AppError("Invalid or expired reset code", 400);
  const stored = await UserOTPRepository.findOTPByUserId(user._id);
  if (
    !stored?.resetOTP ||
    !stored.resetExpiresAt ||
    stored.resetExpiresAt <= new Date() ||
    stored.resetAttempts >= 5
  ) {
    throw new AppError("Invalid or expired reset code", 400);
  }
  if (!(await comparePassword(otp, stored.resetOTP))) {
    await UserOTPRepository.incrementAttempts(user._id, "resetAttempts");
    throw new AppError("Invalid or expired reset code", 400);
  }
  const consumed = await UserOTPRepository.consumeResetOTP(user._id, stored.resetOTP, new Date());
  if (!consumed) throw new AppError("Invalid or expired reset code", 400);
  await UserRepository.updateUser(user._id, {
    password: await hashPassword(newPassword),
    tokenVersion: (user.tokenVersion || 0) + 1,
  });
  return true;
};

export const logoutUser = async (userId) => {
  const user = await UserRepository.findById(userId);
  if (!user) throw new AppError("User not found", 404);
  await UserRepository.updateUser(userId, { tokenVersion: (user.tokenVersion || 0) + 1 });
};

export const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await UserRepository.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const isMatch = await comparePassword(oldPassword, user.password);

  if (!isMatch) {
    throw new AppError("Old password is incorrect", 400);
  }

  const isSamePassword = await comparePassword(newPassword, user.password);

  if (isSamePassword) {
    throw new AppError("New password cannot be the same as the old password", 400);
  }

  const hashedPassword = await hashPassword(newPassword);

  return await UserRepository.updateUser(userId, {
    password: hashedPassword,
    tokenVersion: (user.tokenVersion || 0) + 1,
  });
};
