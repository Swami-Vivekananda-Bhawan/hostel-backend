const db = require("../config/db.config");
const Complaint = {};

Complaint.create = async (newComplaint) => {
  const [result] = await db.query("INSERT INTO complaints SET ?", newComplaint);
  return { id: result.insertId, ...newComplaint };
};

Complaint.updateStatusById = async (id, status) => {
  await db.query("UPDATE complaints SET status = ? WHERE id = ?", [status, id]);
  const [rows] = await db.query("SELECT * FROM complaints WHERE id = ?", [id]);
  return rows.length > 0 ? rows[0] : null;
};

module.exports = Complaint;
