const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET); // ✅ Stripe integration

const app = express();
app.use(cors());
app.use(express.json());

// 📩 Contact Form Email Route
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

// 💳 Stripe Invest Session Route
app.post("/create-checkout-session", async (req, res) => {
  const { amount, message } = req.body;

  if (!amount || isNaN(amount)) {
    return res.status(400).send({ error: "Invalid amount." });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Big Umbrella Investment",
              description: message || "Supporter Donation",
            },
            unit_amount: Math.round(amount * 100), // convert to cents
          },
          quantity: 1,
        },
      ],
      success_url: "https://bigumbrella.tech/thank-you.html",
      cancel_url: "https://bigumbrella.tech/invest.html",
    });

    res.send({ id: session.id });
  } catch (err) {
    console.error("❌ STRIPE SESSION ERROR:", err);
    res.status(500).send({ error: "Could not create Stripe session" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
