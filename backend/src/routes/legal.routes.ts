import { Router } from "express";

export const legalRouter = Router();

/**
 * Public privacy policy — use this URL in Google Play Console.
 * Example: https://your-api.onrender.com/privacy
 */
legalRouter.get("/privacy", (_req, res) => {
  res.type("html").send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Privacy Policy — Shreshta Motor Training School</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 720px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; color: #111; }
    h1 { font-size: 1.5rem; } h2 { font-size: 1.1rem; margin-top: 1.5rem; }
  </style>
</head>
<body>
  <h1>Privacy Policy</h1>
  <p><strong>Shreshta Motor Training School</strong> (&quot;we&quot;, &quot;our&quot;) operates the mobile application for driving training registration and appointments.</p>

  <h2>Information we collect</h2>
  <p>When you register, we collect: full name, username, contact number, email, address, date of birth, driving license details (if provided), and training interest (2 Wheeler / 4 Wheeler / Both). Passwords are stored securely using hashing and are never sent by email or messaging.</p>

  <h2>How we use information</h2>
  <ul>
    <li>To create and manage your training account</li>
    <li>To authenticate login sessions</li>
    <li>To notify the training school administrators of new registrations (email and WhatsApp)</li>
  </ul>

  <h2>Data storage</h2>
  <p>Data is stored in Supabase (PostgreSQL) on secure cloud infrastructure. Our API servers process registration and login requests over HTTPS.</p>

  <h2>Third-party services</h2>
  <p>We use Supabase (database), Resend or SMTP (email), and Twilio (WhatsApp notifications to administrators). These providers process data according to their own privacy policies.</p>

  <h2>Data retention</h2>
  <p>We retain registration data for as long as needed to provide training services or as required by law.</p>

  <h2>Your rights</h2>
  <p>You may request access, correction, or deletion of your data by contacting the training school at the email or phone number published on our website or app listing.</p>

  <h2>Contact</h2>
  <p>Shreshta Motor Training School — contact via official school channels listed in the Play Store listing.</p>

  <p><em>Last updated: May 2026</em></p>
</body>
</html>`);
});
