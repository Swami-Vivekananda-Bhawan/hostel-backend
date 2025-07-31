const db = require("../config/db.config");
const Notification = {};

Notification.create = async (userId, message) => {
  const [result] = await db.query(
    "INSERT INTO notifications (user_id, message) VALUES (?, ?)",
    [userId, message]
  );
  return { id: result.insertId, user_id: userId, message };
};

Notification.getUnreadByUserId = async (userId) => {
  const [rows] = await db.query(
    "SELECT * FROM notifications WHERE user_id = ? AND is_read = 0 ORDER BY created_at DESC",
    [userId]
  );
  return rows;
};

Notification.markAsReadByUserId = async (userId) => {
  await db.query(
    "UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0",
    [userId]
  );
  return true;
};

module.exports = Notification;
