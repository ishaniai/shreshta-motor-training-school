import {
  buildRegistrationNotificationText,
  registrationNotificationSubject,
  type RegistrationNotificationData,
} from "./registrationNotificationContent";

export type { RegistrationNotificationData };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** HTML email body for admin notification */
export function buildRegistrationEmailHtml(data: RegistrationNotificationData): string {
  const rows: [string, string][] = [
    ["Registered at", data.registeredAt],
    ["User ID", data.userId],
    ["Full name", data.fullName],
    ["Username", data.username],
    ["Contact number", data.contactNumber],
    ["Email", data.email],
    ["Date of birth", data.dateOfBirth],
    ["Address line 1", data.addressLine1],
    ...(data.addressLine2?.trim()
      ? [["Address line 2", data.addressLine2] as [string, string]]
      : []),
    ["City", data.city],
    ["State", data.state],
    ["Training interest", data.trainingInterest],
    ["Has driving license", data.hasDrivingLicense ? "Yes" : "No"],
  ];

  if (data.hasDrivingLicense) {
    rows.push(
      ["License number", data.drivingLicenseNumber ?? "—"],
      ["Issuing country", data.drivingLicenseCountry ?? "—"]
    );
  }

  const tableRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb;">${escapeHtml(label)}</td><td style="padding:8px 12px;border:1px solid #e5e7eb;">${escapeHtml(value)}</td></tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;color:#111827;line-height:1.5;">
  <h2 style="color:#0B1220;">New registration — Shreshta Motor Training School</h2>
  <p>A new student has registered via the mobile app.</p>
  <table style="border-collapse:collapse;width:100%;max-width:640px;">${tableRows}</table>
  <p style="margin-top:16px;font-size:12px;color:#6b7280;">Password is never included in this notification.</p>
</body>
</html>`;
}

export const buildRegistrationEmailText = buildRegistrationNotificationText;
export const registrationEmailSubject = registrationNotificationSubject;
