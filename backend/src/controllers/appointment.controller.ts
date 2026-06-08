import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import {
  cancelAppointment as dbCancelAppointment,
  createAppointment,
  getAppointmentByIdForUser,
  getUserAppointments,
  rescheduleAppointment as dbRescheduleAppointment,
} from "../services/appointment.service";
import {
  notifyAdminOnAppointment,
  notifyAdminOnCancellation,
  notifyAdminOnReschedule,
} from "../services/notification/appointmentNotifications.service";
import { getUserContactDetails } from "../services/user.service";
import { appointmentBodySchema, rescheduleBodySchema } from "../validation/appointment";

function firstError(err: { flatten: () => { fieldErrors: Record<string, string[]> } }): string {
  return Object.values(err.flatten().fieldErrors).flat()[0] ?? "Validation failed";
}

/** POST /api/appointments/book */
export async function bookAppointment(req: AuthenticatedRequest, res: Response) {
  const parsed = appointmentBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: firstError(parsed.error) });
  }

  try {
    const profile = await getUserContactDetails(req.userId!);
    if (!profile) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    const appointment = await createAppointment(req.userId!, parsed.data);

    notifyAdminOnAppointment({
      ...parsed.data,
      userId: profile.id,
      userName: profile.full_name,
      userEmail: profile.email,
      userContact: profile.contact_number,
      username: profile.username,
    });

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (err) {
    console.error("[appointment] booking error:", err);
    return res.status(500).json({ success: false, message: "Failed to book appointment. Please try again later." });
  }
}

/** GET /api/appointments/my */
export async function getMyAppointments(req: AuthenticatedRequest, res: Response) {
  try {
    const appointments = await getUserAppointments(req.userId!);
    return res.json({ success: true, appointments });
  } catch (err) {
    console.error("[appointment] fetch error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch appointments." });
  }
}

/** PUT /api/appointments/:id/reschedule */
export async function rescheduleAppointment(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const parsed = rescheduleBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: firstError(parsed.error) });
  }

  try {
    const existing = await getAppointmentByIdForUser(id, req.userId!);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }
    if (existing.status === "cancelled") {
      return res.status(400).json({ success: false, message: "Cannot reschedule a cancelled appointment" });
    }

    const updated = await dbRescheduleAppointment(id, req.userId!, parsed.data.date, parsed.data.timeSlot);

    const profile = await getUserContactDetails(req.userId!);
    if (profile) {
      notifyAdminOnReschedule({
        appointmentId: id,
        userId: profile.id,
        userName: profile.full_name,
        userEmail: profile.email,
        userContact: profile.contact_number,
        username: profile.username,
        vehicleType: existing.vehicle_type,
        oldDate: existing.date,
        oldTimeSlot: existing.time_slot,
        newDate: parsed.data.date,
        newTimeSlot: parsed.data.timeSlot,
      });
    }

    return res.json({ success: true, message: "Appointment rescheduled successfully", appointment: updated });
  } catch (err) {
    console.error("[appointment] reschedule error:", err);
    return res.status(500).json({ success: false, message: "Failed to reschedule appointment." });
  }
}

/** DELETE /api/appointments/:id/cancel */
export async function cancelAppointment(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;

  try {
    const existing = await getAppointmentByIdForUser(id, req.userId!);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }
    if (existing.status === "cancelled") {
      return res.status(400).json({ success: false, message: "Appointment is already cancelled" });
    }

    const cancelled = await dbCancelAppointment(id, req.userId!);

    const profile = await getUserContactDetails(req.userId!);
    if (profile) {
      notifyAdminOnCancellation({
        appointmentId: id,
        userId: profile.id,
        userName: profile.full_name,
        userEmail: profile.email,
        userContact: profile.contact_number,
        username: profile.username,
        vehicleType: existing.vehicle_type,
        date: existing.date,
        timeSlot: existing.time_slot,
      });
    }

    return res.json({ success: true, message: "Appointment cancelled successfully", appointment: cancelled });
  } catch (err) {
    console.error("[appointment] cancel error:", err);
    return res.status(500).json({ success: false, message: "Failed to cancel appointment." });
  }
}
