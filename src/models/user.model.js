const db = require("../config/db.config");
const User = {};

User.findByEmail = async (email) => {
  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  return rows.length ? rows[0] : null;
};

User.updatePasswordById = async (id, hashedPassword) => {
  const [result] = await db.query(
    "UPDATE users SET password = ? WHERE id = ?",
    [hashedPassword, id]
  );
  return result.affectedRows > 0;
};

User.saveOtp = async (email, otp, expiry) => {
  const [result] = await db.query(
    "UPDATE users SET reset_otp = ?, reset_otp_expires = ? WHERE email = ?",
    [otp, expiry, email]
  );
  return result.affectedRows > 0;
};

User.clearOtp = async (email) => {
  const [result] = await db.query(
    "UPDATE users SET reset_otp = NULL, reset_otp_expires = NULL WHERE email = ?",
    [email]
  );
  return result.affectedRows > 0;
};

User.create = async (newUser) => {
  const [result] = await db.query("INSERT INTO users SET ?", newUser);
  return { id: result.insertId, ...newUser };
};
User.bulkCreate = async (users) => {
  if (users.length === 0) return { success: 0, failed: 0 };
  const query =
    "INSERT IGNORE INTO users (full_name, scholar_number, mobile_number, room_number, role) VALUES ?";
  const values = users.map((u) => [
    u.full_name,
    u.scholar_number,
    u.mobile_number,
    u.room_number,
    "student",
  ]);
  const [result] = await db.query(query, [values]);
  return {
    success: result.affectedRows,
    failed: users.length - result.affectedRows,
  };
};
User.findByEmail = async (email) => {
  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  return rows.length ? rows[0] : null;
};

User.findById = async (id) => {
  const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
  return rows.length ? rows[0] : null;
};

User.getAllStudents = async () => {
  const [rows] = await db.query(
    "SELECT id, full_name, scholar_number, email, mobile_number, room_number, created_at FROM users WHERE role = 'student' ORDER BY full_name ASC"
  );
  return rows;
};

User.updateById = async (id, studentData) => {
  const [result] = await db.query("UPDATE users SET ? WHERE id = ?", [
    studentData,
    id,
  ]);
  if (result.affectedRows === 0) return null;
  return { id: id, ...studentData };
};

User.findByScholarNumber = async (scholarNumber) => {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE scholar_number = ?",
    [scholarNumber]
  );
  return rows.length ? rows[0] : null;
};

User.setupAccount = async (id, email, hashedPassword) => {
  const [result] = await db.query(
    "UPDATE users SET email = ?, password = ? WHERE id = ?",
    [email, hashedPassword, id]
  );
  return result.affectedRows > 0;
};

User.removeById = async (id) => {
  const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

User.updateAdminProfile = async (adminId, profileData) => {
  const [result] = await db.query(
    "UPDATE users SET ? WHERE id = ? AND role = 'admin'",
    [profileData, adminId]
  );
  return result.affectedRows > 0;
};

module.exports = User;
