import twilio from "twilio";
import { env } from "../../config/env";
import type { RegisterBody } from "../../validation/registration";
import {
  buildRegistrationNotificationText,
  type RegistrationNotificationData,
} from "./registrationNotificationContent";

/** Twilio WhatsApp addresses must use whatsapp:+E164 format */
export function toWhatsAppAddress(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("whatsapp:")) return trimmed;

  let digits = trimmed.replace(/\D/g, "");
  // Indian 10-digit mobile without country code
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    digits = `91${digits}`;
  }

  return `whatsapp:+${digits}`;
}

function getTwilioClient() {
  if (!env.twilioAccountSid || !env.twilioAuthToken) {
    throw new Error("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required");
  }
  return twilio(env.twilioAccountSid, env.twilioAuthToken);
}

/**
 * Send WhatsApp alert to admin on new registration (Twilio API).
 * Sandbox: join sender with code from Twilio Console; recipient must opt in.
 */
export async function sendRegistrationWhatsApp(
  body: RegisterBody,
  userId: string
): Promise<void> {
  if (!env.whatsappNotificationsEnabled) {
    console.info("[whatsapp] Registration notification disabled");
    return;
  }

  const data: RegistrationNotificationData = {
    ...body,
    userId,
    registeredAt: new Date().toISOString(),
  };

  const messageBody = buildRegistrationNotificationText(data);
  const client = getTwilioClient();

  const from = toWhatsAppAddress(env.twilioWhatsappFrom);
  const to = toWhatsAppAddress(env.notifyWhatsappTo);

  const message = await client.messages.create({
    from,
    to,
    body: messageBody,
  });

  console.info(`[whatsapp] Registration notification sent to ${to} (SID: ${message.sid})`);
}
