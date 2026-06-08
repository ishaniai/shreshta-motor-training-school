import twilio from "twilio";
import { env } from "../../config/env";
import type { AppointmentBody } from "../../validation/appointment";
import { dispatchEmail } from "./email.service";
import {
  appointmentEmailSubject,
  buildAppointmentEmailHtml,
  buildAppointmentEmailText,
  buildCancelEmailHtml,
  buildCancelEmailText,
  buildRescheduleEmailHtml,
  buildRescheduleEmailText,
  cancelNotificationSubject,
  rescheduleNotificationSubject,
  type AppointmentNotificationData,
  type CancelNotificationData,
  type RescheduleNotificationData,
} from "./appointmentEmailTemplate";
import {
  buildCancelNotificationText,
  buildRescheduleNotificationText,
} from "./appointmentNotificationContent";
import { toWhatsAppAddress } from "./whatsapp.service";

interface AppointmentNotificationInput extends AppointmentBody {
  userId: string;
  userName: string;
  userEmail: string;
  userContact: string;
  username: string;
}

export interface RescheduleNotificationInput {
  appointmentId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userContact: string;
  username: string;
  vehicleType: "2-wheeler" | "4-wheeler";
  oldDate: string;
  oldTimeSlot: string;
  newDate: string;
  newTimeSlot: string;
}

export interface CancelNotificationInput {
  appointmentId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userContact: string;
  username: string;
  vehicleType: "2-wheeler" | "4-wheeler";
  date: string;
  timeSlot: string;
}

/* ── helpers ─────────────────────────────────────────────── */

async function sendEmail(subject: string, html: string, text: string): Promise<void> {
  if (!env.emailNotificationsEnabled) {
    console.info("[email] Notification disabled (EMAIL_NOTIFICATIONS_ENABLED=false)");
    return;
  }
  await dispatchEmail({ to: env.notifyEmailTo, subject, html, text });
  console.info(`[email] Sent to ${env.notifyEmailTo}`);
}

async function sendWhatsApp(body: string): Promise<void> {
  if (!env.whatsappNotificationsEnabled) {
    console.info("[whatsapp] Notification disabled");
    return;
  }
  if (!env.twilioAccountSid || !env.twilioAuthToken) {
    throw new Error("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required");
  }
  const client = twilio(env.twilioAccountSid, env.twilioAuthToken);
  const from = toWhatsAppAddress(env.twilioWhatsappFrom);
  const to = toWhatsAppAddress(env.notifyWhatsappTo);
  const message = await client.messages.create({ from, to, body });
  console.info(`[whatsapp] Sent to ${to} (SID: ${message.sid})`);
}

function fireAndForget(label: string, tasks: Promise<void>[]): void {
  void Promise.allSettled(tasks).then((results) => {
    results.forEach((result, i) => {
      const channel = i === 0 ? "email" : "whatsapp";
      if (result.status === "rejected") {
        console.error(`[notify] ${label} ${channel} failed:`, result.reason);
      } else {
        console.info(`[notify] ${label} ${channel} completed`);
      }
    });
  });
}

/* ── public API ──────────────────────────────────────────── */

export function notifyAdminOnAppointment(input: AppointmentNotificationInput): void {
  const data: AppointmentNotificationData = { ...input, bookedAt: new Date().toISOString() };
  console.info("[notify] Starting async appointment notifications for user:", input.userId);
  fireAndForget("booking", [
    sendEmail(appointmentEmailSubject(data), buildAppointmentEmailHtml(data), buildAppointmentEmailText(data)),
    sendWhatsApp(buildAppointmentEmailText(data)),
  ]);
}

export function notifyAdminOnReschedule(input: RescheduleNotificationInput): void {
  const data: RescheduleNotificationData = { ...input, rescheduledAt: new Date().toISOString() };
  console.info("[notify] Starting async reschedule notifications for appointment:", input.appointmentId);
  fireAndForget("reschedule", [
    sendEmail(rescheduleNotificationSubject(data), buildRescheduleEmailHtml(data), buildRescheduleEmailText(data)),
    sendWhatsApp(buildRescheduleNotificationText(data)),
  ]);
}

export function notifyAdminOnCancellation(input: CancelNotificationInput): void {
  const data: CancelNotificationData = { ...input, cancelledAt: new Date().toISOString() };
  console.info("[notify] Starting async cancellation notifications for appointment:", input.appointmentId);
  fireAndForget("cancel", [
    sendEmail(cancelNotificationSubject(data), buildCancelEmailHtml(data), buildCancelEmailText(data)),
    sendWhatsApp(buildCancelNotificationText(data)),
  ]);
}
