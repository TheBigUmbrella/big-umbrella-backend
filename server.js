const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/contact", async (req, res) => {
  const { firstName, lastName, email, phone, message } = req.body;

  if (!firstName || !lastName || !email) {
    return res.status(400).send({ error: "Missing required fields." });
  }

  const transporter = nodemailer.createTransport({
    host: "mail.privateemail.com",
    port: 465,
    secure: true,
    auth: {
      user: "contactus@bigumbrella.tech",
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: "Big Umbrella Contact Form <contactus@bigumbrella.tech>",
    replyTo: `${firstName} ${lastName} <${email}>`,
    to: "contactus@bigumbrella.tech",
    subject: "New Contact Form Submission",
    text: `
First Name: ${firstName}
Last Name: ${lastName}
Email: ${email}
Phone: ${phone || "N/A"}
Message: ${message || "No message provided"}
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.send({ success: true });
  } catch (err) {
    console.error("❌ EMAIL SEND ERROR:", err);
    res.status(500).send({ error: "Error sending email." });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
