const path = require("path");
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

/* ===== SMTP FIXED CONFIG ===== */

const transporter = nodemailer.createTransport({

  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },

  tls: {
    rejectUnauthorized: false
  },

  family: 4
});

/* ===== RATE LIMITER ===== */

const contactLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5
});

/* ===== ROUTES ===== */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/send", contactLimiter, async (req, res) => {

  console.log("Contact form submission received.");

  const { name, phone, email, message } = req.body;

  try {

    /* Admin Mail */

    await transporter.sendMail({

      from: process.env.EMAIL_USER,

      to: process.env.EMAIL_USER,

      subject: "🚀 New Portfolio Contact Message",

      replyTo: email,

      html: `
        <h2>New Contact Form Submission</h2>

        <p><b>Name:</b> ${name}</p>

        <p><b>Phone:</b> ${phone}</p>

        <p><b>Email:</b> ${email}</p>

        <p><b>Message:</b> ${message}</p>
      `
    });

    /* Auto Reply */

    await transporter.sendMail({

      from: process.env.EMAIL_USER,

      to: email,

      subject: "Thanks for contacting Guna 🚀",

      html: `
        <div style="font-family:Arial;padding:20px">

          <h2>Thanks for contacting Guna 🚀</h2>

          <p>Hi ${name},</p>

          <p>
            Your message was received successfully.
          </p>

          <p>
            I’ll reply soon.
          </p>

          <br>

          <strong>— Guna</strong>

        </div>
      `
    });

    console.log("EMAILS SENT SUCCESSFULLY 🚀");

    return res.status(200).json({
      success: true,
      message: "Email sent successfully!"
    });

  } catch (error) {

    console.error("EMAIL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send email."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});