const db = require("../config/db.config");
const Leave = {};

Leave.create = async (newLeaveRequest) => {
  const [result] = await db.query(
    "INSERT INTO leave_requests SET ?",
    newLeaveRequest
  );
  return { id: result.insertId, ...newLeaveRequest };
};

Leave.updateStatusById = async (id, status) => {
  await db.query("UPDATE leave_requests SET status = ? WHERE id = ?", [
    status,
    id,
  ]);
  const [rows] = await db.query("SELECT * FROM leave_requests WHERE id = ?", [
    id,
  ]);
  return rows.length > 0 ? rows[0] : null;
};

module.exports = Leave;
