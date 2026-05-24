import type { Response } from "express";
import { signAccessToken } from "../lib/jwt";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { notifyAdminOnRegistration } from "../services/notification/registrationNotifications.service";
import {
  authenticateUser,
  getUserPublicProfile,
  isUsernameTaken,
  registerUser,
} from "../services/user.service";
import { loginBodySchema } from "../validation/login";
import {
  registerBodySchema,
  usernameQuerySchema,
} from "../validation/registration";

export const INVALID_LOGIN_MESSAGE =
  "Incorrect user/ password combination, try again !";

/** POST /api/auth/login */
export async function login(req: AuthenticatedRequest, res: Response) {
  const parsed = loginBodySchema.safeParse(req.body);
  if (!parsed.success) {
    const firstMessage =
      Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Validation failed";
    return res.status(400).json({ success: false, message: firstMessage });
  }

  try {
    const result = await authenticateUser(parsed.data);

    if (!result.ok) {
      return res.status(401).json({
        success: false,
        message: INVALID_LOGIN_MESSAGE,
      });
    }

    const token = signAccessToken({
      sub: result.user.id,
      username: result.user.username,
    });

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: result.user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again later.",
    });
  }
}

/** GET /api/auth/me — current session user */
export async function me(req: AuthenticatedRequest, res: Response) {
  try {
    const profile = await getUserPublicProfile(req.userId!);
    if (!profile) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    return res.json({
      success: true,
      user: {
        id: profile.id,
        username: profile.username,
        fullName: profile.full_name,
        email: profile.email,
        trainingInterest: profile.training_interest,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Unable to load profile" });
  }
}

/** GET /api/auth/username-available?username=john */
export async function checkUsernameAvailability(req: AuthenticatedRequest, res: Response) {
  console.log("[username-check] Request received:", { username: req.query.username });
  
  const parsed = usernameQuerySchema.safeParse({ username: req.query.username });
  if (!parsed.success) {
    console.log("[username-check] Validation failed:", parsed.error.flatten().fieldErrors);
    return res.status(400).json({
      available: false,
      message: parsed.error.flatten().fieldErrors.username?.[0] ?? "Invalid username",
    });
  }

  try {
    console.log("[username-check] Checking username:", parsed.data.username);
    const taken = await isUsernameTaken(parsed.data.username);
    console.log("[username-check] Result:", { username: parsed.data.username, taken });
    
    return res.json({
      available: !taken,
      message: taken ? "Username already exists !" : "Username is available",
    });
  } catch (err) {
    console.error("[username-check] Error:", err);
    return res.status(500).json({ available: false, message: "Unable to check username" });
  }
}

/** POST /api/auth/register */
export async function register(req: AuthenticatedRequest, res: Response) {
  const parsed = registerBodySchema.safeParse(req.body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstMessage =
      Object.values(fieldErrors).flat()[0] ?? "Validation failed";
    return res.status(400).json({ success: false, message: firstMessage, fieldErrors });
  }

  try {
    const result = await registerUser(parsed.data);

    if (!result.ok) {
      if (result.code === "USERNAME_TAKEN") {
        return res.status(409).json({
          success: false,
          message: "Username already exists !",
          field: "username",
        });
      }
      if (result.code === "EMAIL_TAKEN") {
        return res.status(409).json({
          success: false,
          message: "Email is already registered",
          field: "email",
        });
      }
    }

    // Email + WhatsApp admin alerts (non-blocking)
    notifyAdminOnRegistration(parsed.data, result.user.id);

    return res.status(201).json({
      success: true,
      message: "Registered successfully",
      user: result.user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again later.",
    });
  }
}
