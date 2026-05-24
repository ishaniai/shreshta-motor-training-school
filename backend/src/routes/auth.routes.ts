import { Router } from "express";
import {
  checkUsernameAvailability,
  login,
  me,
  register,
} from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";

export const authRouter = Router();

authRouter.get("/username-available", checkUsernameAvailability);
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/me", requireAuth, me);
