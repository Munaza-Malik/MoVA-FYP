const Contact = require("../models/Contact");

exports.sendContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    console.log(" Incoming data:", req.body);

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newMessage = new Contact({ name, email, subject, message });
    await newMessage.save();

    console.log(" Message saved to database successfully!");
    res.status(200).json({ message: "Message stored successfully!" });
  } catch (error) {
    console.error(" Error saving contact message:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};
