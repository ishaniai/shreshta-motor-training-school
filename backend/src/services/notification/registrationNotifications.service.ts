import type { RegisterBody } from "../../validation/registration";
import { sendRegistrationNotification } from "./email.service";
import { sendRegistrationWhatsApp } from "./whatsapp.service";

/**
 * Fire email + WhatsApp admin alerts after registration.
 * Failures are logged; they do not roll back the database insert.
 */
export function notifyAdminOnRegistration(
  body: RegisterBody,
  userId: string
): void {
  console.info("[notify] Starting async notifications for user:", userId);
  
  void Promise.allSettled([
    sendRegistrationNotification(body, userId),
    sendRegistrationWhatsApp(body, userId),
  ]).then((results) => {
    results.forEach((result, index) => {
      const channel = index === 0 ? "email" : "whatsapp";
      if (result.status === "rejected") {
        console.error(`[notify] ${channel} notification failed:`, result.reason);
      } else {
        console.info(`[notify] ${channel} notification completed successfully`);
      }
    });
  });
}
