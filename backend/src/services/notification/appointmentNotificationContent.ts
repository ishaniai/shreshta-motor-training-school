import type { AppointmentBody } from "../../validation/appointment";

export interface AppointmentNotificationData extends AppointmentBody {
  userId: string;
  bookedAt: string;
  userName: string;
  userEmail: string;
  userContact: string;
  username: string;
}

export interface RescheduleNotificationData {
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
  rescheduledAt: string;
}

export interface CancelNotificationData {
  appointmentId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userContact: string;
  username: string;
  vehicleType: "2-wheeler" | "4-wheeler";
  date: string;
  timeSlot: string;
  cancelledAt: string;
}

function vehicleLabel(type: "2-wheeler" | "4-wheeler"): string {
  return type === "2-wheeler" ? "2 Wheeler" : "4 Wheeler";
}

export function buildAppointmentNotificationText(data: AppointmentNotificationData): string {
  const dateFormatted = new Date(data.date).toLocaleDateString("en-IN", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });

  return [
    "New appointment booking — Shreshta Motor Training School",
    "=========================================================",
    "",
    `Booked at: ${data.bookedAt}`,
    `User ID: ${data.userId}`,
    "",
    "--- Student details ---",
    `Full name: ${data.userName}`,
    `Username: ${data.username}`,
    `Contact number: ${data.userContact}`,
    `Email: ${data.userEmail}`,
    "",
    "--- Appointment details ---",
    `Vehicle type: ${vehicleLabel(data.vehicleType)}`,
    `Training date: ${dateFormatted}`,
    `Time slot: ${data.timeSlot}`,
  ].join("\n");
}

export function appointmentNotificationSubject(data: AppointmentNotificationData): string {
  return `[Shreshta] New appointment: ${data.userName} — ${vehicleLabel(data.vehicleType)} on ${data.date}`;
}

export function buildRescheduleNotificationText(data: RescheduleNotificationData): string {
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  return [
    "Appointment RESCHEDULED — Shreshta Motor Training School",
    "=========================================================",
    "",
    `Rescheduled at: ${data.rescheduledAt}`,
    `Appointment ID: ${data.appointmentId}`,
    `User ID: ${data.userId}`,
    "",
    "--- Student details ---",
    `Full name: ${data.userName}`,
    `Username: ${data.username}`,
    `Contact number: ${data.userContact}`,
    `Email: ${data.userEmail}`,
    "",
    "--- Updated schedule ---",
    `Vehicle type: ${vehicleLabel(data.vehicleType)}`,
    `Old date: ${fmtDate(data.oldDate)}`,
    `Old time slot: ${data.oldTimeSlot}`,
    `New date: ${fmtDate(data.newDate)}`,
    `New time slot: ${data.newTimeSlot}`,
  ].join("\n");
}

export function rescheduleNotificationSubject(data: RescheduleNotificationData): string {
  return `[Shreshta] Rescheduled: ${data.userName} — ${vehicleLabel(data.vehicleType)} → ${data.newDate} ${data.newTimeSlot}`;
}

export function buildCancelNotificationText(data: CancelNotificationData): string {
  const dateFormatted = new Date(data.date).toLocaleDateString("en-IN", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });

  return [
    "Appointment CANCELLED — Shreshta Motor Training School",
    "=======================================================",
    "",
    `Cancelled at: ${data.cancelledAt}`,
    `Appointment ID: ${data.appointmentId}`,
    `User ID: ${data.userId}`,
    "",
    "--- Student details ---",
    `Full name: ${data.userName}`,
    `Username: ${data.username}`,
    `Contact number: ${data.userContact}`,
    `Email: ${data.userEmail}`,
    "",
    "--- Cancelled appointment ---",
    `Vehicle type: ${vehicleLabel(data.vehicleType)}`,
    `Training date: ${dateFormatted}`,
    `Time slot: ${data.timeSlot}`,
  ].join("\n");
}

export function cancelNotificationSubject(data: CancelNotificationData): string {
  return `[Shreshta] Cancelled: ${data.userName} — ${vehicleLabel(data.vehicleType)} on ${data.date}`;
}
