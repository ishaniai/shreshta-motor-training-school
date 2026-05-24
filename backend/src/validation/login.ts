import { z } from "zod";

export const loginBodySchema = z.object({
  usernameOrEmail: z.string().trim().min(1, "Username or Email ID is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginBody = z.infer<typeof loginBodySchema>;
