import env from "../config/env.js";
import { verifyToken } from "../utils/jwt.js";
import User from "../modules/user/user.model.js";

// Turns the Bearer token into `req.user`, or returns the reason it did not.
// Both middlewares below share this, so the token rules live in one place.
const readRequestUser = async (req) => {
  const authorization = req.get("authorization");
  if (!authorization) return { status: 401, message: "Authentication required" };

  const [scheme, token] = authorization.split(" ");
  if (scheme !== "Bearer" || !token) {
    return { status: 401, message: "Authentication required" };
  }

  if (!env.jwt.accessSecret) {
    return { error: new Error("JWT access secret is not configured") };
  }

  let tokenUser;
  try {
    tokenUser = verifyToken(token, env.jwt.accessSecret);
  } catch {
    return { status: 401, message: "Invalid or expired access token" };
  }

  const user = await User.findById(tokenUser.id ?? tokenUser._id).select(
    "role status tokenVersion",
  );
  if (
    !user ||
    user.status !== "active" ||
    (tokenUser.tokenVersion ?? 0) !== (user.tokenVersion ?? 0)
  ) {
    return { status: 401, message: "Invalid or expired access token" };
  }

  return { user: { id: user._id.toString(), role: user.role } };
};

// Requires a signed-in user. Every route behind this already declares the roles
// it accepts through roleMiddleware.
export const authMiddleware = async (req, res, next) => {
  const { user, status, message, error } = await readRequestUser(req);
  if (error) return next(error);
  if (!user) return res.status(status).json({ success: false, message });

  req.user = user;
  return next();
};

// Same token check, but a request without one is allowed through as a guest.
// Used by the public product and category lists, which show extra rows to an
// administrator or the vendor that owns them.
export const optionalAuthMiddleware = async (req, res, next) => {
  if (!req.get("authorization")) return next();

  const { user, status, message, error } = await readRequestUser(req);
  if (error) return next(error);
  if (!user) return res.status(status).json({ success: false, message });

  req.user = user;
  return next();
};
