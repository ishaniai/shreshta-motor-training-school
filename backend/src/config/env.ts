import dotenv from "dotenv";

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value?.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  supabaseUrl: requireEnv("SUPABASE_URL"),
  supabaseServiceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  jwtSecret: requireEnv("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN?.trim() || "7d",
  corsOrigins: process.env.CORS_ORIGINS?.split(",").map((o) => o.trim()).filter(Boolean) ?? [],

  // Email notifications (registration)
  emailNotificationsEnabled:
    (process.env.EMAIL_NOTIFICATIONS_ENABLED ?? "true").toLowerCase() === "true",
  /** resend | smtp | none */
  emailProvider: (process.env.EMAIL_PROVIDER ?? "resend").toLowerCase(),
  notifyEmailTo: process.env.NOTIFY_EMAIL_TO?.split(",").map((e) => e.trim()).filter(Boolean) ?? ["sumitdubey182019@gmail.com"],
  emailFrom: process.env.EMAIL_FROM?.trim() || "Shreshta Motor Training <admin@ishaniai.com>",
  resendApiKey: process.env.RESEND_API_KEY?.trim() ?? "",
  smtpHost: process.env.SMTP_HOST?.trim() ?? "",
  smtpPort: Number(process.env.SMTP_PORT ?? 587),
  smtpSecure: (process.env.SMTP_SECURE ?? "false").toLowerCase() === "true",
  smtpUser: process.env.SMTP_USER?.trim() ?? "",
  smtpPass: process.env.SMTP_PASS?.trim() ?? "",

  // WhatsApp (Twilio) notifications on registration
  whatsappNotificationsEnabled:
    (process.env.WHATSAPP_NOTIFICATIONS_ENABLED ?? "true").toLowerCase() === "true",
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID?.trim() ?? "",
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN?.trim() ?? "",
  twilioWhatsappFrom:
    process.env.TWILIO_WHATSAPP_FROM?.trim() || "whatsapp:+14155238886",
  notifyWhatsappTo:
    process.env.NOTIFY_WHATSAPP_TO?.trim() || "whatsapp:+918851127205",
};
