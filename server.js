const path = require("path");
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  }
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

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
app.use(cors(corsOptions));
app.use(express.json({ limit: "20kb" }));
app.use(express.static(__dirname));

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function validateContactForm(data) {
  const formData = data || {};
  const name = typeof formData.name === "string" ? formData.name.trim() : "";
  const phone = typeof formData.phone === "string" ? formData.phone.trim() : "";
  const email = typeof formData.email === "string" ? formData.email.trim() : "";
  const message = typeof formData.message === "string" ? formData.message.trim() : "";

  const phoneRegex = /^[+\d]?(?:[\d\s().-]){7,20}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    name.length < 2 ||
    !phoneRegex.test(phone) ||
    !emailRegex.test(email) ||
    message.length < 10
  ) {
    return { isValid: false };
  }

  return {
    isValid: true,
    values: {
      name,
      phone,
      email,
      message
    }
  };
}

function buildAutoReplyHtml(name) {
  const safeName = escapeHtml(name);

  return `
    <div style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#172033;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#f4f7fb;">
        <tr>
          <td align="center" style="padding:32px 16px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e6ebf2;">
              <tr>
                <td style="padding:28px 28px 20px;border-bottom:1px solid #edf1f6;">
                  <h1 style="margin:0;font-size:22px;line-height:1.35;color:#111827;font-weight:700;">Thanks for contacting me</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:28px;">
                  <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Hi ${safeName},</p>
                  <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
                    Thank you for contacting me through my portfolio website.
                  </p>
                  <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
                    I have received your message successfully and will respond as soon as possible.
                  </p>
                  <p style="margin:24px 0 0;font-size:16px;line-height:1.6;">
                    Regards,<br>
                    <strong>Guna</strong><br>
                    Front-End Developer
                  </p>
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
  res.status(200).json({
    success: true,
    status: "OK"
  });
});

app.post("/send", contactLimiter, async (req, res) => {

  console.log("Contact form submission received.");

  const validation = validateContactForm(req.body);

  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: "Validation failed."
    });
  }

  const { name, phone, email, message } = validation.values;

  try {

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "🚀 New Portfolio Contact Message",
      replyTo: email,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><b>Name:</b> ${escapeHtml(name)}</p>
        <p><b>Phone:</b> ${escapeHtml(phone)}</p>
        <p><b>Email:</b> ${escapeHtml(email)}</p>
        <p><b>Message:</b> ${escapeHtml(message)}</p>
      `
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thanks for contacting Guna 🚀",
      html: buildAutoReplyHtml(name),
      text: `Hi ${name},

Thank you for contacting me through my portfolio website.

I have received your message successfully and will respond as soon as possible.

Regards,
Guna
Front-End Developer`
    });

    console.log("EMAILS SENT SUCCESSFULLY 🚀");

    res.status(200).json({
      success: true,
      message: "Email sent successfully!"
    });

  } catch (error) {

    console.error("EMAIL ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send email."
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
    message: "Internal server error."
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
