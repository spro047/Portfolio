// Vercel Serverless Function — POST /api/contact
// Handles contact form submissions.
// In production, forward to email service (SendGrid, Resend, etc.)
// via the CONTACT_EMAIL_WEBHOOK environment variable.

export const config = {
  api: {
    bodyParser: true,
  },
};

export default function handler(req, res) {
  // Only accept POST
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { name, email, subject, message } = req.body || {};

  // Validate required fields
  const errors = [];
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push("Name is required (min 2 characters)");
  }
  if (!email || typeof email !== "string" || !email.includes("@")) {
    errors.push("Valid email is required");
  }
  if (!message || typeof message !== "string" || message.trim().length < 10) {
    errors.push("Message is required (min 10 characters)");
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  const submission = {
    id: crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: name.trim(),
    email: email.trim(),
    subject: subject?.trim() || "(no subject)",
    message: message.trim(),
    timestamp: new Date().toISOString(),
    ip: req.headers["x-forwarded-for"] || req.socket?.remoteAddress || null,
  };

  // Log the contact submission (visible in Vercel logs)
  console.log("[CONTACT]", JSON.stringify(submission));

  // If a webhook URL is configured, forward the submission
  const webhook = process.env.CONTACT_EMAIL_WEBHOOK;
  if (webhook) {
    // Fire-and-forget — don't block the response
    fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submission),
    }).catch((err) => console.error("[CONTACT] Webhook failed:", err));
  }

  res.status(200).json({
    success: true,
    message: "Message received. I'll get back to you soon!",
  });
}
