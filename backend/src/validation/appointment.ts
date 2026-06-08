import { z } from "zod";

export const VEHICLE_TYPES = ["2-wheeler", "4-wheeler"] as const;

export const TIME_SLOTS = [
  "8:00 AM - 9:00 AM",
  "9:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 1:00 PM",
  "1:00 PM - 2:00 PM",
  "2:00 PM - 3:00 PM",
  "3:00 PM - 4:00 PM",
  "4:00 PM - 5:00 PM",
] as const;

function isFutureDate(dateStr: string): boolean {
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parsed > today;
}

export const appointmentBodySchema = z.object({
  vehicleType: z.enum(VEHICLE_TYPES, {
    errorMap: () => ({ message: "Vehicle type must be 2-wheeler or 4-wheeler" }),
  }),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .refine(isFutureDate, "Appointment date must be at least 1 day in the future"),
  timeSlot: z.enum(TIME_SLOTS, {
    errorMap: () => ({ message: "Invalid time slot" }),
  }),
});

export const rescheduleBodySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .refine(isFutureDate, "Appointment date must be at least 1 day in the future"),
  timeSlot: z.enum(TIME_SLOTS, {
    errorMap: () => ({ message: "Invalid time slot" }),
  }),
});

export type AppointmentBody = z.infer<typeof appointmentBodySchema>;
export type RescheduleBody = z.infer<typeof rescheduleBodySchema>;
