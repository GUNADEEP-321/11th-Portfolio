const path = require("path");
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

/* EMAIL CONFIG */

const transporter = nodemailer.createTransport({

  host: "smtp.gmail.com",
  port: 587,
  secure: false,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }

});

/* RATE LIMIT */

const contactLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5
});

/* ROUTES */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/send", contactLimiter, async (req, res) => {

  const { name, phone, email, message } = req.body;

  try {

    await transporter.sendMail({

      from: process.env.EMAIL_USER,

      to: process.env.EMAIL_USER,

      subject: "New Portfolio Contact Message",

      replyTo: email,

      text: `
Name: ${name}
Phone: ${phone}
Email: ${email}
Message: ${message}
      `
    });

    await transporter.sendMail({

      from: process.env.EMAIL_USER,

      to: email,

      subject: "Thanks for contacting Guna 🚀",

      text: `
Hi ${name},

Your message was received successfully.

I will reply soon.

— Guna
      `
    });

    return res.status(200).json({
      success: true,
      message: "Email sent successfully!"
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to send email."
    });

  }

});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});