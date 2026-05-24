import type { RegisterBody } from "../../validation/registration";

/** Shared payload for email + WhatsApp admin alerts */
export interface RegistrationNotificationData extends RegisterBody {
  userId: string;
  registeredAt: string;
}

function licenseLines(data: RegistrationNotificationData): string[] {
  if (!data.hasDrivingLicense) {
    return ["Has driving license: No"];
  }
  return [
    "Has driving license: Yes",
    `License number: ${data.drivingLicenseNumber ?? "—"}`,
    `Issuing country: ${data.drivingLicenseCountry ?? "—"}`,
  ];
}

/** Plain-text body used for email and WhatsApp */
export function buildRegistrationNotificationText(data: RegistrationNotificationData): string {
  const address2 = data.addressLine2?.trim() ? `\nAddress line 2: ${data.addressLine2}` : "";

  return [
    "New registration — Shreshta Motor Training School",
    "================================================",
    "",
    `Registered at: ${data.registeredAt}`,
    `User ID: ${data.userId}`,
    "",
    "--- Registrant details ---",
    `Full name: ${data.fullName}`,
    `Username: ${data.username}`,
    `Contact number: ${data.contactNumber}`,
    `Email: ${data.email}`,
    `Date of birth: ${data.dateOfBirth}`,
    "",
    "--- Address ---",
    `Address line 1: ${data.addressLine1}${address2}`,
    `City: ${data.city}`,
    `State: ${data.state}`,
    "",
    "--- Vehicle training preference ---",
    `Training interest: ${data.trainingInterest}`,
    "",
    "--- License details ---",
    ...licenseLines(data),
    "",
    "(Password is never included in this notification.)",
  ].join("\n");
}

export function registrationNotificationSubject(data: RegistrationNotificationData): string {
  return `[Shreshta] New registration: ${data.fullName} (${data.trainingInterest})`;
}
