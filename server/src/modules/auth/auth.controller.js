import * as AuthService from "./auth.service.js";

export const register = async (req, res, next) => {
  try {
    const { user, verificationEmailSent } = await AuthService.createUser(req.body);

    return res.status(201).json({
      success: true,
      message: verificationEmailSent
        ? "Account created. A verification code has been sent to your email."
        : "Account created, but the verification email could not be sent. You can sign in now or request another code.",
      data: user,
      verificationEmailSent,
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    // loginSchema guarantees both values are strings by the time we get here.
    const { email, password } = req.body;
    const { user, token } = await AuthService.loginUser(email, password);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: user,
      token,
    });
  } catch (error) {
    return next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    await AuthService.requestPasswordReset(req.body.email);
    return res
      .status(202)
      .json({ success: true, message: "If this email is registered, a reset code has been sent" });
  } catch (error) {
    return next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    await AuthService.resetPassword(req.body.email, req.body.otp, req.body.newPassword);
    return res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    return next(error);
  }
};

export const resendVerification = async (req, res, next) => {
  try {
    await AuthService.requestEmailVerification(req.body.email);
    return res
      .status(202)
      .json({ success: true, message: "If verification is needed, a code has been sent" });
  } catch (error) {
    return next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    await AuthService.confirmEmailVerification(req.body.email, req.body.otp);
    return res.json({ success: true, message: "Email verified" });
  } catch (error) {
    return next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    await AuthService.changePassword(req.user.id, req.body.oldPassword, req.body.newPassword);
    return res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    return next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    await AuthService.logoutUser(req.user.id);
    return res.json({ success: true, message: "Logged out" });
  } catch (error) {
    return next(error);
  }
};
