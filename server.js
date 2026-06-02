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

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const contactLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/send", contactLimiter, async (req, res) => {

  console.log("Contact form received 🚀");

  const { name, phone, email, message } = req.body;

  try {
console.log("API KEY EXISTS:", !!process.env.RESEND_API_KEY);

    const result = await resend.emails.send({

      from: "onboarding@resend.dev",

      to: ["puligundlaguna321@gmail.com"],

      subject: "🚀 TEST MAIL FROM PORTFOLIO",

      html: `
        <h2>New Contact Form Submission</h2>

        <p><b>Name:</b> ${name}</p>

        <p><b>Phone:</b> ${phone}</p>

        <p><b>Email:</b> ${email}</p>

        <p><b>Message:</b> ${message}</p>
      `
    });

    console.log("RESEND RESULT:", result);

    console.log("EMAIL SENT SUCCESSFULLY 🚀");

    return res.status(200).json({
      success: true,
      result
    });

  } catch (err) {

    console.error("RESEND ERROR:", err);

    return res.status(500).json({
      success: false,
      error: err.message
    });

  }

});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});