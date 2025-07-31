const db = require("../config/db.config");

const Contact = {};

Contact.create = async (newContactMessage) => {
  const [result] = await db.query(
    "INSERT INTO contact_messages SET ?",
    newContactMessage
  );
  return { id: result.insertId, ...newContactMessage };
};

module.exports = Contact;
