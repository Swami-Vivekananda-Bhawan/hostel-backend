const Contact = require("../models/contact.model");

exports.create = async (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: "Request body cannot be empty!" });
    return;
  }

  const contactMessage = {
    name: req.body.name,
    email: req.body.email,
    message: req.body.message,
  };

  try {
    const data = await Contact.create(contactMessage);
    res.status(201).send({
      message: "Message sent successfully!",
      data: data,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "An error occurred while sending the message.",
    });
  }
};
