import { Router } from "express";
import {
  bookAppointment,
  cancelAppointment,
  getMyAppointments,
  rescheduleAppointment,
} from "../controllers/appointment.controller";
import { requireAuth } from "../middleware/auth.middleware";

export const appointmentRouter = Router();

appointmentRouter.post("/book", requireAuth, bookAppointment);
appointmentRouter.get("/my", requireAuth, getMyAppointments);
appointmentRouter.put("/:id/reschedule", requireAuth, rescheduleAppointment);
appointmentRouter.delete("/:id/cancel", requireAuth, cancelAppointment);
