import { z } from "zod";
import { INDIAN_STATES_SET } from "../constants/indianStates";
import { TRAINING_INTERESTS } from "../constants/trainingInterests";
import { UN_COUNTRIES_SET } from "../constants/unCountries";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Include at least 1 CAPITAL letter")
  .regex(/[0-9]/, "Include at least 1 number")
  .regex(/[@_#=]/, "Include at least 1 special character from @, _, #, =");

const usernameSchema = z
  .string()
  .trim()
  .min(3)
  .max(30)
  .regex(/^[a-zA-Z0-9_]+$/, "Invalid username format");

function isAtLeast18(dob: string): boolean {
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return false;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age >= 18;
}

/** Registration payload from mobile (camelCase) */
export const registerBodySchema = z
  .object({
    fullName: z.string().trim().min(1, "Full name is required"),
    username: usernameSchema,
    password: passwordSchema,
    contactNumber: z
      .string()
      .transform((v) => v.replace(/\D/g, ""))
      .pipe(z.string().regex(/^[6-9]\d{9}$/, "Invalid contact number")),
    email: z.string().trim().email("Invalid email"),
    addressLine1: z.string().trim().min(1, "Address line 1 is required"),
    addressLine2: z.string().trim().optional().default(""),
    city: z.string().trim().min(1, "City is required"),
    state: z.string().trim(),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    hasDrivingLicense: z.boolean(),
    drivingLicenseNumber: z.string().trim().optional(),
    drivingLicenseCountry: z.string().trim().optional(),
    trainingInterest: z.enum(TRAINING_INTERESTS),
  })
  .superRefine((data, ctx) => {
    if (!INDIAN_STATES_SET.has(data.state)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid state", path: ["state"] });
    }
    if (!isAtLeast18(data.dateOfBirth)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "You must be at least 18 years old to register",
        path: ["dateOfBirth"],
      });
    }
    if (data.hasDrivingLicense) {
      if (!data.drivingLicenseNumber?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Driving license number is required",
          path: ["drivingLicenseNumber"],
        });
      }
      if (!data.drivingLicenseCountry || !UN_COUNTRIES_SET.has(data.drivingLicenseCountry)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid issuing country",
          path: ["drivingLicenseCountry"],
        });
      }
    }
  });

export type RegisterBody = z.infer<typeof registerBodySchema>;

export const usernameQuerySchema = z.object({
  username: usernameSchema,
});
