import nodemailer from "nodemailer";
import { Resend } from "resend";
import { env } from "../../config/env";
import type { RegisterBody } from "../../validation/registration";
import {
  buildRegistrationEmailHtml,
  buildRegistrationEmailText,
  registrationEmailSubject,
  type RegistrationNotificationData,
} from "./registrationEmailTemplate";

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/** Send via Resend HTTP API */
async function sendWithResend(input: SendEmailInput): Promise<void> {
  if (!env.resendApiKey) {
    console.error("[email] RESEND_API_KEY is not configured");
    throw new Error("RESEND_API_KEY is not configured");
  }

  console.info("[email] Sending via Resend API...", {
    to: input.to,
    subject: input.subject,
  });

  const resend = new Resend(env.resendApiKey);
  const { error, data } = await resend.emails.send({
    from: env.emailFrom,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });

  if (error) {
    console.error("[email] Resend API error:", error);
    throw new Error(`Resend API error: ${error.message}`);
  }

  console.info("[email] Email sent successfully via Resend", {
    to: input.to,
    messageId: data?.id,
  });
}

/** Send via SMTP (Nodemailer) — Gmail, Outlook, custom relay */
async function sendWithSmtp(input: SendEmailInput): Promise<void> {
  if (!env.smtpHost) {
    throw new Error("SMTP_HOST is not configured");
  }

  const transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth:
      env.smtpUser && env.smtpPass
        ? { user: env.smtpUser, pass: env.smtpPass }
        : undefined,
  });

  await transporter.sendMail({
    from: env.emailFrom,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
}

async function dispatchEmail(input: SendEmailInput): Promise<void> {
  const provider = env.emailProvider;

  if (provider === "none") {
    console.info("[email] Skipped (EMAIL_PROVIDER=none)", input.subject);
    return;
  }

  if (provider === "smtp") {
    console.info("[email] Using SMTP provider");
    await sendWithSmtp(input);
    return;
  }

  // Default: Resend
  try {
    console.info("[email] Attempting to send via Resend...");
    await sendWithResend(input);
    console.info("[email] Successfully sent email via Resend");
  } catch (resendError) {
    console.error("[email] Resend failed:", resendError);
    // Fallback to SMTP when both are configured
    if (env.smtpHost) {
      console.warn("[email] Falling back to SMTP...");
      try {
        await sendWithSmtp(input);
        console.info("[email] Successfully sent email via SMTP fallback");
      } catch (smtpError) {
        console.error("[email] SMTP fallback also failed:", smtpError);
        throw smtpError;
      }
      return;
    }
    throw resendError;
  }
}

/**
 * Notify admin when a new user registers.
 * Runs after DB insert; failures are logged but do not fail registration.
 */
export async function sendRegistrationNotification(
  body: RegisterBody,
  userId: string
): Promise<void> {
  if (!env.emailNotificationsEnabled) {
    console.info("[email] Registration notification is disabled (EMAIL_NOTIFICATIONS_ENABLED=false)");
    return;
  }

  console.info("[email] Starting registration notification for user:", userId);

  const data: RegistrationNotificationData = {
    ...body,
    userId,
    registeredAt: new Date().toISOString(),
  };

  try {
    await dispatchEmail({
      to: env.notifyEmailTo,
      subject: registrationEmailSubject(data),
      html: buildRegistrationEmailHtml(data),
      text: buildRegistrationEmailText(data),
    });

    console.info(`[email] Registration notification sent to ${env.notifyEmailTo}`);
  } catch (err) {
    console.error("[email] Failed to send registration notification:", err);
    throw err;
  }
}
