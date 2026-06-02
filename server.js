const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { Resend } = require("resend");

require("dotenv").config();

const app = express();

app.set("trust proxy", 1);

const PORT = process.env.PORT || 5000;
const resend = new Resend(process.env.RESEND_API_KEY);

const contactLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later."
  }
});

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "20kb" }));
app.use(express.static(__dirname));

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildAdminEmailHtml({ name, phone, email, message }) {
  return `
    <h2>New Contact Form Submission</h2>
    <p><b>Name:</b> ${escapeHtml(name)}</p>
    <p><b>Phone:</b> ${escapeHtml(phone)}</p>
    <p><b>Email:</b> ${escapeHtml(email)}</p>
    <p><b>Message:</b> ${escapeHtml(message)}</p>
  `;
}

function buildAutoReplyHtml(name) {
  return `
    <div style="margin:0;padding:0;background:#0f172a;font-family:Arial,Helvetica,sans-serif;color:#e5e7eb;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#0f172a;">
        <tr>
          <td align="center" style="padding:32px 16px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;max-width:560px;background:#111827;border:1px solid #243244;border-radius:18px;overflow:hidden;">
              <tr>
                <td style="padding:30px 28px 14px;">
                  <h1 style="margin:0;color:#ffffff;font-size:24px;line-height:1.3;font-weight:700;">Thanks for reaching out</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 28px 30px;">
                  <p style="margin:0 0 18px;color:#e5e7eb;font-size:16px;line-height:1.65;">Hi ${escapeHtml(name)} 👋</p>
                  <p style="margin:0 0 18px;color:#cbd5e1;font-size:16px;line-height:1.65;">
                    Thank you for contacting me through my portfolio website.
                  </p>
                  <p style="margin:0 0 18px;color:#cbd5e1;font-size:16px;line-height:1.65;">
                    I received your message successfully and I'll reply soon.
                  </p>
                  <div style="margin-top:26px;padding-top:20px;border-top:1px solid #243244;">
                    <p style="margin:0;color:#ffffff;font-size:16px;line-height:1.6;font-weight:700;">— Guna</p>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    status: "OK"
  });
});

app.post("/send", contactLimiter, async (req, res) => {
  console.log("CONTACT FORM RECEIVED 🚀");

  const { name, phone, email, message } = req.body || {};

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: ["puligundlagunadeep321@gmail.com"],
      subject: "🚀 Portfolio Contact Message",
      replyTo: email,
      html: buildAdminEmailHtml({ name, phone, email, message })
    });

    console.log("ADMIN EMAIL SENT ✅");

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Thanks for contacting Guna 🚀",
      html: buildAutoReplyHtml(name)
    });

    console.log("AUTO REPLY SENT ✅");

    return res.status(200).json({
      success: true,
      message: "Emails sent successfully!"
    });
  } catch (err) {
    console.error("EMAIL ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to send emails."
    });
  }
});

app.use((error, req, res, next) => {
  if (error.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Request payload too large."
    });
  }

  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON payload."
    });
  }

  console.error("SERVER ERROR:", error);

  return res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
