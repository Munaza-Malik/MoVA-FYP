const Contact = require("../models/Contact");
const sgMail = require("@sendgrid/mail");
require("dotenv").config();

// Set SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    console.log(" Incoming data:", req.body);

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Save message in DB (existing functionality)
    const newMessage = new Contact({ name, email, subject, message });
    await newMessage.save();
    console.log(" Message saved to database successfully!");

    // Send email to mova.webservices@gmail.com
const mail = {
  to: process.env.CONTACT_RECEIVER_EMAIL,
  from: process.env.SENDGRID_FROM_EMAIL,
  subject: `New Contact Form Message: ${subject}`,
  html: `
    <h3>You received a new message from MoVA Contact Form</h3>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Message:</strong></p>
    <p>${message}</p>
  `,
};


    await sgMail.send(mail);
    console.log(" Email sent successfully!");

    // Response stays same
    res.status(200).json({ message: "Message stored and sent successfully!" });

  } catch (error) {
    console.error(" Error:", error.response?.body || error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};
