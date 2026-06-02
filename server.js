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
  .map(origin => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {

    if (
      !origin ||
      allowedOrigins.length === 0 ||
      allowedOrigins.includes(origin)
    ) {
      return callback(null, true);
    }

    return callback(null, false);
  }
};

// ===== FIXED SMTP CONFIG =====
const transporter = nodemailer.createTransport({

  service: "gmail",

  host: "smtp.gmail.com",

  port: 587,

  secure: false,

  requireTLS: true,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },

  tls: {
    rejectUnauthorized: false
  },

  connectionTimeout: 30000,

  greetingTimeout: 30000,

  socketTimeout: 30000
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

  const name =
    typeof formData.name === "string"
      ? formData.name.trim()
      : "";

  const phone =
    typeof formData.phone === "string"
      ? formData.phone.trim()
      : "";

  const email =
    typeof formData.email === "string"
      ? formData.email.trim()
      : "";

  const message =
    typeof formData.message === "string"
      ? formData.message.trim()
      : "";

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
  <div style="font-family:Arial;padding:20px;background:#f5f7fa;">
    <div style="background:#fff;padding:30px;border-radius:12px;max-width:600px;margin:auto;">

      <h2>Thanks for contacting Guna 🚀</h2>

      <p>Hi ${safeName},</p>

      <p>
        Thank you for contacting me through my portfolio website.
      </p>

      <p>
        I successfully received your message and I’ll respond as soon as possible.
      </p>

      <br>

      <p>
        Regards,<br>
        <strong>Guna</strong><br>
        Front-End Developer
      </p>

    </div>
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

    // Admin Email
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

    // Auto Reply
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thanks for contacting Guna 🚀",
      html: buildAutoReplyHtml(name)
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});