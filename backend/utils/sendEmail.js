// utils/sendEmail.js
const sgMail = require("@sendgrid/mail"); // only once
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, text) => {
  try {
    await sgMail.send({
      to,
      from: "munazamalik1111@gmail.com",
      subject,
      text,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("SendGrid error:", error.response?.body || error);
    throw error;
  }
};

module.exports = sendEmail;
