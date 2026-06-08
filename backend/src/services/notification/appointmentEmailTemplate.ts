import {
  appointmentNotificationSubject,
  buildAppointmentNotificationText,
  buildCancelNotificationText,
  buildRescheduleNotificationText,
  cancelNotificationSubject,
  rescheduleNotificationSubject,
  type AppointmentNotificationData,
  type CancelNotificationData,
  type RescheduleNotificationData,
} from "./appointmentNotificationContent";

export type { AppointmentNotificationData, RescheduleNotificationData, CancelNotificationData };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString("en-IN", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });
}

function tableRows(rows: [string, string][]): string {
  return rows
    .map(([label, value]) =>
      `<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb;">${escapeHtml(label)}</td><td style="padding:8px 12px;border:1px solid #e5e7eb;">${escapeHtml(value)}</td></tr>`
    )
    .join("");
}

function wrapHtml(heading: string, subheading: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;color:#111827;line-height:1.5;">
  <h2 style="color:#0B1220;">${escapeHtml(heading)}</h2>
  <p>${escapeHtml(subheading)}</p>
  ${body}
</body>
</html>`;
}

export function buildAppointmentEmailHtml(data: AppointmentNotificationData): string {
  const vehicleLabel = data.vehicleType === "2-wheeler" ? "2 Wheeler" : "4 Wheeler";
  const rows: [string, string][] = [
    ["Booked at", data.bookedAt],
    ["User ID", data.userId],
    ["Full name", data.userName],
    ["Username", data.username],
    ["Contact number", data.userContact],
    ["Email", data.userEmail],
    ["Vehicle type", vehicleLabel],
    ["Training date", fmtDate(data.date)],
    ["Time slot", data.timeSlot],
  ];
  return wrapHtml(
    "New appointment booking — Shreshta Motor Training School",
    "A student has booked a training appointment via the app.",
    `<table style="border-collapse:collapse;width:100%;max-width:640px;">${tableRows(rows)}</table>`
  );
}

export function buildRescheduleEmailHtml(data: RescheduleNotificationData): string {
  const vehicleLabel = data.vehicleType === "2-wheeler" ? "2 Wheeler" : "4 Wheeler";
  const rows: [string, string][] = [
    ["Rescheduled at", data.rescheduledAt],
    ["Appointment ID", data.appointmentId],
    ["User ID", data.userId],
    ["Full name", data.userName],
    ["Username", data.username],
    ["Contact number", data.userContact],
    ["Email", data.userEmail],
    ["Vehicle type", vehicleLabel],
    ["Old date", fmtDate(data.oldDate)],
    ["Old time slot", data.oldTimeSlot],
    ["New date", fmtDate(data.newDate)],
    ["New time slot", data.newTimeSlot],
  ];
  return wrapHtml(
    "Appointment RESCHEDULED — Shreshta Motor Training School",
    "A student has rescheduled their training appointment.",
    `<table style="border-collapse:collapse;width:100%;max-width:640px;">${tableRows(rows)}</table>`
  );
}

export function buildCancelEmailHtml(data: CancelNotificationData): string {
  const vehicleLabel = data.vehicleType === "2-wheeler" ? "2 Wheeler" : "4 Wheeler";
  const rows: [string, string][] = [
    ["Cancelled at", data.cancelledAt],
    ["Appointment ID", data.appointmentId],
    ["User ID", data.userId],
    ["Full name", data.userName],
    ["Username", data.username],
    ["Contact number", data.userContact],
    ["Email", data.userEmail],
    ["Vehicle type", vehicleLabel],
    ["Training date", fmtDate(data.date)],
    ["Time slot", data.timeSlot],
  ];
  return wrapHtml(
    "Appointment CANCELLED — Shreshta Motor Training School",
    "A student has cancelled their training appointment.",
    `<table style="border-collapse:collapse;width:100%;max-width:640px;">${tableRows(rows)}</table>`
  );
}

export const buildAppointmentEmailText = buildAppointmentNotificationText;
export const appointmentEmailSubject = appointmentNotificationSubject;
export const buildRescheduleEmailText = buildRescheduleNotificationText;
export const buildCancelEmailText = buildCancelNotificationText;
export { rescheduleNotificationSubject, cancelNotificationSubject };
